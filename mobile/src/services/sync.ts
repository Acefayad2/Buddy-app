/**
 * Offline sync service
 * Queues events when offline and syncs when online
 */

import { supabase } from './supabase'
import * as SQLite from 'react-native-sqlite-storage'
import NetInfo from '@react-native-community/netinfo'
import type { NewProximityEventInput, PendingEvent } from '../../../shared/types'

SQLite.DEBUG(true)
SQLite.enablePromise(true)

const DB_NAME = 'PhoneBuddy.db'
const TABLE_NAME = 'pending_events'

class SyncService {
  private db: SQLite.SQLiteDatabase | null = null
  private isOnline: boolean = true
  private syncInterval: NodeJS.Timeout | null = null

  /**
   * Initialize database
   */
  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: DB_NAME,
        location: 'default',
      })

      // Create pending events table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          id TEXT PRIMARY KEY,
          device_a TEXT NOT NULL,
          device_b TEXT NOT NULL,
          distance_estimate REAL NOT NULL,
          event_type TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          retry_count INTEGER DEFAULT 0
        )
      `)

      // Monitor network status
      NetInfo.addEventListener((state) => {
        this.isOnline = state.isConnected ?? false
        if (this.isOnline) {
          this.syncPendingEvents()
        }
      })

      // Start periodic sync
      this.syncInterval = setInterval(() => {
        if (this.isOnline) {
          this.syncPendingEvents()
        }
      }, 30000) // Sync every 30 seconds

      // Initial sync
      await this.syncPendingEvents()
    } catch (error) {
      console.error('Error initializing sync service:', error)
    }
  }

  /**
   * Queue event for offline sync
   */
  async queueEvent(event: NewProximityEventInput): Promise<void> {
    if (!this.db) {
      await this.initialize()
    }

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const createdAt = Date.now()

    try {
      await this.db!.executeSql(
        `INSERT INTO ${TABLE_NAME} (id, device_a, device_b, distance_estimate, event_type, created_at, retry_count)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [id, event.device_a, event.device_b, event.distance_estimate, event.event_type, createdAt]
      )

      // Try immediate sync if online
      if (this.isOnline) {
        await this.syncPendingEvents()
      }
    } catch (error) {
      console.error('Error queueing event:', error)
    }
  }

  /**
   * Sync pending events to Supabase
   */
  private async syncPendingEvents(): Promise<void> {
    if (!this.db || !this.isOnline) {
      return
    }

    try {
      // Get pending events
      const [results] = await this.db.executeSql(
        `SELECT * FROM ${TABLE_NAME} ORDER BY created_at ASC LIMIT 50`
      )

      const pendingEvents: PendingEvent[] = []
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i)
        pendingEvents.push({
          id: row.id,
          event: {
            device_a: row.device_a,
            device_b: row.device_b,
            distance_estimate: row.distance_estimate,
            event_type: row.event_type,
          },
          createdAt: row.created_at,
          retryCount: row.retry_count,
        })
      }

      // Sync each event
      for (const pendingEvent of pendingEvents) {
        try {
          const { error } = await supabase
            .from('proximity_events')
            .insert(pendingEvent.event)

          if (error) {
            throw error
          }

          // Remove from local DB
          await this.db.executeSql(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [pendingEvent.id])
          console.log(`Synced event ${pendingEvent.id}`)
        } catch (error) {
          // Increment retry count
          const newRetryCount = pendingEvent.retryCount + 1
          await this.db.executeSql(
            `UPDATE ${TABLE_NAME} SET retry_count = ? WHERE id = ?`,
            [newRetryCount, pendingEvent.id]
          )

          // Delete if too many retries
          if (newRetryCount >= 5) {
            await this.db.executeSql(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [pendingEvent.id])
            console.warn(`Deleted event ${pendingEvent.id} after ${newRetryCount} retries`)
          }
        }
      }
    } catch (error) {
      console.error('Error syncing pending events:', error)
    }
  }

  /**
   * Get count of pending events
   */
  async getPendingCount(): Promise<number> {
    if (!this.db) {
      return 0
    }

    try {
      const [results] = await this.db.executeSql(`SELECT COUNT(*) as count FROM ${TABLE_NAME}`)
      return results.rows.item(0).count
    } catch (error) {
      return 0
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    if (this.db) {
      this.db.close()
    }
  }
}

export const syncService = new SyncService()



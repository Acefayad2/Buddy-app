/**
 * Proximity detection and event logging service
 * Calculates distance from RSSI and logs proximity events to Supabase
 */

import { bluetoothService } from './bluetooth'
import { supabase } from './supabase'
import type { Device, ProximityEvent, NewProximityEventInput } from '../../../shared/types'
import { syncService } from './sync'

// RSSI to distance conversion (meters)
// Using free-space path loss formula: d = 10^((TxPower - RSSI) / (10 * N))
// Where N = 2 (free space) to 4 (indoor)
const TX_POWER = -59 // Typical BLE transmit power at 1 meter
const PATH_LOSS_EXPONENT = 2.5 // Indoor/outdoor average

function rssiToDistance(rssi: number): number {
  if (rssi >= 0) return 0.1 // Very close
  const distance = Math.pow(10, (TX_POWER - rssi) / (10 * PATH_LOSS_EXPONENT))
  return Math.max(0.1, Math.min(distance, 100)) // Clamp between 0.1m and 100m
}

// Proximity thresholds
const ENTER_THRESHOLD = 10 // meters - device entered range
const EXIT_THRESHOLD = 15 // meters - device exited range

class ProximityService {
  private devicePairs: Map<string, { deviceA: Device; deviceB: Device; lastDistance: number; lastEvent: 'ENTER' | 'EXIT' | null }> = new Map()
  private monitoringInterval: NodeJS.Timeout | null = null

  /**
   * Start monitoring proximity between registered devices
   */
  async startMonitoring(userDevices: Device[]): Promise<void> {
    this.stopMonitoring()

    // Create device pairs (normalized: device_a < device_b)
    this.devicePairs.clear()
    for (let i = 0; i < userDevices.length; i++) {
      for (let j = i + 1; j < userDevices.length; j++) {
        const deviceA = userDevices[i]
        const deviceB = userDevices[j]
        const pairKey = this.getPairKey(deviceA.device_id, deviceB.device_id)
        
        this.devicePairs.set(pairKey, {
          deviceA,
          deviceB,
          lastDistance: Infinity,
          lastEvent: null,
        })
      }
    }

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkProximity()
    }, 5000) // Check every 5 seconds
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  /**
   * Check proximity for all device pairs
   */
  private async checkProximity(): Promise<void> {
    for (const [pairKey, pair] of this.devicePairs.entries()) {
      try {
        // Get RSSI for both devices
        const rssiA = await bluetoothService.connectAndGetRSSI(pair.deviceA.ble_identifier)
        const rssiB = await bluetoothService.connectAndGetRSSI(pair.deviceB.ble_identifier)
        
        // Use average RSSI
        const avgRSSI = (rssiA + rssiB) / 2
        const distance = rssiToDistance(avgRSSI)

        // Determine if event should be triggered
        let eventType: 'ENTER' | 'EXIT' | null = null

        if (pair.lastEvent === null || pair.lastEvent === 'EXIT') {
          // Device entered range
          if (distance <= ENTER_THRESHOLD) {
            eventType = 'ENTER'
          }
        } else if (pair.lastEvent === 'ENTER') {
          // Device exited range
          if (distance >= EXIT_THRESHOLD) {
            eventType = 'EXIT'
          }
        }

        if (eventType) {
          await this.logProximityEvent(pair.deviceA.device_id, pair.deviceB.device_id, distance, eventType)
          pair.lastEvent = eventType
        }

        pair.lastDistance = distance
      } catch (error) {
        console.error(`Error checking proximity for pair ${pairKey}:`, error)
      }
    }
  }

  /**
   * Log proximity event to Supabase (or queue for offline sync)
   */
  private async logProximityEvent(
    deviceAId: string,
    deviceBId: string,
    distance: number,
    eventType: 'ENTER' | 'EXIT'
  ): Promise<void> {
    // Normalize device pair (always device_a < device_b)
    const [device_a, device_b] = deviceAId < deviceBId 
      ? [deviceAId, deviceBId]
      : [deviceBId, deviceAId]

    const event: NewProximityEventInput = {
      device_a,
      device_b,
      distance_estimate: distance,
      event_type: eventType,
    }

    try {
      // Try to insert directly
      const { error } = await supabase
        .from('proximity_events')
        .insert(event)

      if (error) {
        throw error
      }

      console.log(`Logged ${eventType} event: ${device_a} <-> ${device_b} at ${distance.toFixed(2)}m`)
    } catch (error) {
      console.error('Failed to log proximity event, queuing for sync:', error)
      // Queue for offline sync
      await syncService.queueEvent(event)
    }
  }

  /**
   * Get normalized pair key
   */
  private getPairKey(deviceAId: string, deviceBId: string): string {
    return deviceAId < deviceBId ? `${deviceAId}:${deviceBId}` : `${deviceBId}:${deviceAId}`
  }
}

export const proximityService = new ProximityService()



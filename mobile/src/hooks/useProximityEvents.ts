/**
 * Proximity events hook with realtime updates
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabase'
import type { ProximityEvent } from '../../../shared/types'
import { useAuth } from './useAuth'

export function useProximityEvents(limit: number = 50) {
  const { user } = useAuth()
  const [events, setEvents] = useState<ProximityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEvents = useCallback(async () => {
    if (!user?.id) {
      setEvents([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get user's devices first
      const { data: devices } = await supabase
        .from('devices')
        .select('device_id')
        .eq('user_id', user.id)

      if (!devices || devices.length === 0) {
        setEvents([])
        setLoading(false)
        return
      }

      const deviceIds = devices.map((d) => d.device_id)

      // Get events where user's devices are involved
      const { data, error: fetchError } = await supabase
        .from('proximity_events')
        .select('*')
        .in('device_a', deviceIds)
        .or(`device_b.in.(${deviceIds.join(',')})`)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (fetchError) {
        throw fetchError
      }

      setEvents((data || []) as ProximityEvent[])
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch events')
      setError(error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [user?.id, limit])

  useEffect(() => {
    fetchEvents()

    // Subscribe to realtime updates
    if (user?.id) {
      const subscription = supabase
        .channel('proximity_events_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'proximity_events',
          },
          (payload) => {
            setEvents((prev) => [payload.new as ProximityEvent, ...prev].slice(0, limit))
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [fetchEvents, user?.id, limit])

  return {
    events,
    loading,
    error,
    refreshEvents: fetchEvents,
  }
}



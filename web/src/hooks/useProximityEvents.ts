/**
 * Proximity events hook for web app with realtime updates
 */

import { useState, useEffect, useCallback } from 'react'
import { getProximityEventsForUser, subscribeToProximityEvents } from '../lib/proximity-events'
import type { ProximityEvent } from '../../../shared/types'
import { useAuth } from './useAuth'

export function useProximityEvents(limit: number = 100) {
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
      const { data, error: fetchError } = await getProximityEventsForUser(user.id, limit)
      
      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch events')
      }

      setEvents(data || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
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
      const unsubscribe = subscribeToProximityEvents(user.id, (event) => {
        setEvents((prev) => [event, ...prev].slice(0, limit))
      })

      return () => {
        unsubscribe()
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



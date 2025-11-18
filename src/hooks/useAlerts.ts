"use client"

import { useState, useEffect, useCallback } from 'react'
import { getAlertsForUser, createAlert } from '@/src/lib/alerts'
import type { Alert, NewAlertInput } from '@/src/types/alert'

interface UseAlertsReturn {
  alerts: Alert[]
  loading: boolean
  error: Error | null
  refreshAlerts: () => Promise<void>
  logAlert: (payload: NewAlertInput) => Promise<Alert | null>
}

/**
 * React hook for managing alerts
 * Assumes useAuth() provides the current user id
 */
export function useAlerts(userId: string | null | undefined): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAlerts = useCallback(async () => {
    if (!userId) {
      setAlerts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getAlertsForUser(userId)
      
      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch alerts')
      }

      setAlerts(data || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const refreshAlerts = useCallback(async () => {
    await fetchAlerts()
  }, [fetchAlerts])

  const logAlert = useCallback(async (payload: NewAlertInput): Promise<Alert | null> => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    setError(null)
    try {
      const data = await createAlert(userId, payload)
      setAlerts((prev) => [data, ...prev])
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      throw error
    }
  }, [userId])

  return {
    alerts,
    loading,
    error,
    refreshAlerts,
    logAlert,
  }
}


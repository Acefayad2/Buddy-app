/**
 * Devices hook for React Native
 */

import { useState, useEffect, useCallback } from 'react'
import { getUserDevices, registerCurrentDevice } from '../services/device'
import type { Device, NewDeviceInput } from '../../../shared/types'
import { useAuth } from './useAuth'

export function useDevices() {
  const { user } = useAuth()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDevices = useCallback(async () => {
    if (!user?.id) {
      setDevices([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getUserDevices(user.id)
      setDevices(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch devices')
      setError(error)
      setDevices([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const registerDevice = useCallback(async (deviceName: string): Promise<Device> => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    setError(null)
    try {
      const device = await registerCurrentDevice(user.id, deviceName)
      setDevices((prev) => [device, ...prev])
      return device
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to register device')
      setError(error)
      throw error
    }
  }, [user?.id])

  return {
    devices,
    loading,
    error,
    refreshDevices: fetchDevices,
    registerDevice,
  }
}



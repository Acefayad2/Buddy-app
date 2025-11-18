"use client"

import { useState, useEffect, useCallback } from 'react'
import { getDevicesForUser, createDevice, updateDevice, deleteDevice } from '@/src/lib/devices'
import type { Device, NewDeviceInput } from '@/src/types/device'

interface UseDevicesReturn {
  devices: Device[]
  loading: boolean
  error: Error | null
  refreshDevices: () => Promise<void>
  addDevice: (payload: NewDeviceInput) => Promise<Device | null>
  updateDevice: (id: string, payload: Partial<NewDeviceInput>) => Promise<Device | null>
  removeDevice: (id: string) => Promise<boolean>
}

/**
 * React hook for managing devices
 * Assumes useAuth() provides the current user id
 */
export function useDevices(userId: string | null | undefined): UseDevicesReturn {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDevices = useCallback(async () => {
    if (!userId) {
      setDevices([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getDevicesForUser(userId)
      
      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch devices')
      }

      setDevices(data || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      setDevices([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const refreshDevices = useCallback(async () => {
    await fetchDevices()
  }, [fetchDevices])

  const addDevice = useCallback(async (payload: NewDeviceInput): Promise<Device | null> => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    setError(null)
    try {
      const data = await createDevice(userId, payload)
      setDevices((prev) => [data, ...prev])
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      throw error
    }
  }, [userId])

  const updateDeviceById = useCallback(async (
    id: string,
    payload: Partial<NewDeviceInput>
  ): Promise<Device | null> => {
    setError(null)
    try {
      const data = await updateDevice(id, payload)
      setDevices((prev) =>
        prev.map((device) => (device.id === id ? data : device))
      )
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      throw error
    }
  }, [])

  const removeDeviceById = useCallback(async (id: string): Promise<boolean> => {
    setError(null)
    try {
      await deleteDevice(id)
      setDevices((prev) => prev.filter((device) => device.id !== id))
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)
      throw error
    }
  }, [])

  return {
    devices,
    loading,
    error,
    refreshDevices,
    addDevice,
    updateDevice: updateDeviceById,
    removeDevice: removeDeviceById,
  }
}


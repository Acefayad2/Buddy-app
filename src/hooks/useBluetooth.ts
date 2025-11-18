"use client"

import { useState, useCallback } from 'react'
import { scanForDevices, connectToDevice, disconnectFromDevice } from '@/src/lib/bluetooth'
import type { BluetoothDevice } from '@/src/lib/bluetooth'

interface UseBluetoothReturn {
  isScanning: boolean
  connectedDevice: BluetoothDevice | null
  nearbyDevices: BluetoothDevice[]
  error: Error | null
  startScan: () => Promise<void>
  stopScan: () => void
  connect: (device: BluetoothDevice) => Promise<void>
  disconnect: () => Promise<void>
}

/**
 * React hook for managing Bluetooth connections
 * Uses mock functions from src/lib/bluetooth.ts
 * Easy to swap implementation when real Bluetooth is added
 */
export function useBluetooth(): UseBluetoothReturn {
  const [isScanning, setIsScanning] = useState(false)
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null)
  const [nearbyDevices, setNearbyDevices] = useState<BluetoothDevice[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null)

  const startScan = useCallback(async () => {
    setIsScanning(true)
    setError(null)

    try {
      // Initial scan
      const devices = await scanForDevices()
      setNearbyDevices(devices)

      // Continue scanning periodically (mock behavior)
      const interval = setInterval(async () => {
        try {
          const updatedDevices = await scanForDevices()
          setNearbyDevices(updatedDevices)
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Scan error')
          setError(error)
        }
      }, 5000) // Scan every 5 seconds

      setScanInterval(interval)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start scan')
      setError(error)
      setIsScanning(false)
    }
  }, [])

  const stopScan = useCallback(() => {
    if (scanInterval) {
      clearInterval(scanInterval)
      setScanInterval(null)
    }
    setIsScanning(false)
  }, [scanInterval])

  const connect = useCallback(async (device: BluetoothDevice) => {
    setError(null)
    
    // Disconnect from current device if connected
    if (connectedDevice) {
      try {
        await disconnectFromDevice()
      } catch (err) {
        // Ignore disconnection errors
      }
    }

    try {
      const connected = await connectToDevice(device.id)
      setConnectedDevice(connected)
      setNearbyDevices((prev) =>
        prev.map((d) => (d.id === device.id ? connected : d))
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect to device')
      setError(error)
      throw error
    }
  }, [connectedDevice])

  const disconnect = useCallback(async () => {
    if (!connectedDevice) {
      return
    }

    setError(null)
    try {
      await disconnectFromDevice()
      setConnectedDevice(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to disconnect')
      setError(error)
      throw error
    }
  }, [connectedDevice])

  return {
    isScanning,
    connectedDevice,
    nearbyDevices,
    error,
    startScan,
    stopScan,
    connect,
    disconnect,
  }
}



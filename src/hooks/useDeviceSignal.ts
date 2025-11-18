"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { monitorDeviceSignal, rssiToPercentage, getSignalStrengthLabel } from '@/src/lib/bluetooth-monitoring'
import { calculateRiskLevel, type RiskLevel } from '@/src/lib/distance'
import type { SignalReading } from '@/src/lib/bluetooth-monitoring'

interface UseDeviceSignalReturn {
  rssi: number | null
  riskLevel: RiskLevel | null
  signalPercentage: number | null
  signalLabel: string | null
  isMonitoring: boolean
  startMonitoring: (deviceId: string) => void
  stopMonitoring: () => void
  lastReading: SignalReading | null
}

/**
 * Hook for monitoring Bluetooth device signal strength (RSSI)
 * Automatically calculates risk level and signal strength metrics
 */
export function useDeviceSignal(): UseDeviceSignalReturn {
  const [rssi, setRssi] = useState<number | null>(null)
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastReading, setLastReading] = useState<SignalReading | null>(null)
  const stopMonitoringRef = useRef<(() => void) | null>(null)

  const startMonitoring = useCallback((deviceId: string) => {
    // Stop existing monitoring if any
    if (stopMonitoringRef.current) {
      stopMonitoringRef.current()
    }

    setIsMonitoring(true)
    setRssi(null)
    setRiskLevel(null)

    const stop = monitorDeviceSignal(deviceId, (reading) => {
      setRssi(reading.rssi)
      setRiskLevel(reading.riskLevel)
      setLastReading(reading)
    })

    stopMonitoringRef.current = stop
  }, [])

  const stopMonitoring = useCallback(() => {
    if (stopMonitoringRef.current) {
      stopMonitoringRef.current()
      stopMonitoringRef.current = null
    }
    setIsMonitoring(false)
    setRssi(null)
    setRiskLevel(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopMonitoringRef.current) {
        stopMonitoringRef.current()
      }
    }
  }, [])

  const signalPercentage = rssi !== null ? rssiToPercentage(rssi) : null
  const signalLabel = rssi !== null ? getSignalStrengthLabel(rssi) : null

  return {
    rssi,
    riskLevel,
    signalPercentage,
    signalLabel,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    lastReading,
  }
}


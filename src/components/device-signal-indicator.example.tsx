/**
 * Example component showing how to display device signal strength
 * Use this pattern in your device cards or detail pages
 */

"use client"

import { useDeviceSignal } from '@/src/hooks/useDeviceSignal'
import { useEffect } from 'react'

interface DeviceSignalIndicatorProps {
  deviceId: string
  isConnected: boolean
}

export function DeviceSignalIndicator({ deviceId, isConnected }: DeviceSignalIndicatorProps) {
  const {
    rssi,
    riskLevel,
    signalPercentage,
    signalLabel,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  } = useDeviceSignal()

  useEffect(() => {
    if (isConnected) {
      startMonitoring(deviceId)
    } else {
      stopMonitoring()
    }

    return () => {
      stopMonitoring()
    }
  }, [deviceId, isConnected, startMonitoring, stopMonitoring])

  if (!isConnected || !isMonitoring) {
    return <div className="text-muted-foreground">Not connected</div>
  }

  if (rssi === null) {
    return <div className="text-muted-foreground">Reading signal...</div>
  }

  const riskColors = {
    safe: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${riskColors[riskLevel || 'safe']}`}>
          {signalLabel}
        </span>
        <span className="text-sm text-muted-foreground">
          {rssi} dBm
        </span>
      </div>
      
      {/* Signal strength bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            riskLevel === 'safe' ? 'bg-green-500' :
            riskLevel === 'warning' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${signalPercentage}%` }}
        />
      </div>
      
      <div className="text-xs text-muted-foreground">
        Signal: {signalPercentage}% • Risk: {riskLevel}
      </div>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SignalStrengthIndicator from "./signal-strength-indicator"
import DeviceSettingsModal from "./device-settings-modal"

interface Device {
  id: string
  name: string
  type: "phone" | "keys" | "earbuds" | "laptop"
  signalStrength: number
  isConnected: boolean
  distance: string
  lastSeen: string
}

interface DeviceCardProps {
  device: Device
  onUpdate?: (device: Device) => void
  onDelete?: (deviceId: string) => void
}

export default function DeviceCard({ device, onUpdate, onDelete }: DeviceCardProps) {
  const [showSettings, setShowSettings] = useState(false)

  const getDeviceIcon = (type: string) => {
    const icons: Record<string, string> = {
      phone: "📱",
      keys: "🔑",
      earbuds: "🎧",
      laptop: "💻",
    }
    return icons[type] || "📦"
  }

  return (
    <>
      <Card className="bg-card border-border p-5 hover:bg-card/80 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{getDeviceIcon(device.type)}</div>
            <div>
              <h3 className="font-semibold text-foreground">{device.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">Last: {device.lastSeen}</p>
            </div>
          </div>
          {device.isConnected && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
        </div>

        {/* Signal Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Signal Strength</span>
            <span className="text-xs text-muted-foreground">{device.signalStrength} dBm</span>
          </div>
          <SignalStrengthIndicator rssi={device.signalStrength} />
        </div>

        {/* Distance */}
        <div className="bg-secondary/30 rounded-lg p-3 mb-4 border border-border">
          <p className="text-2xl font-bold text-foreground">{device.distance}</p>
          <p className="text-xs text-muted-foreground">Estimated distance</p>
        </div>

        {/* Status and Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-secondary/20 text-sm h-9 bg-transparent"
          >
            Locate
          </Button>
          <Button
            onClick={() => setShowSettings(true)}
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-secondary/20 text-sm h-9"
          >
            Settings
          </Button>
        </div>
      </Card>

      <DeviceSettingsModal
        device={device}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onUpdate={onUpdate || (() => {})}
        onDelete={onDelete || (() => {})}
      />
    </>
  )
}

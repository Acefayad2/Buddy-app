"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Device {
  id: string
  name: string
  type: "phone" | "keys" | "earbuds" | "laptop"
  signalStrength: number
  isConnected: boolean
  distance: string
  lastSeen: string
}

interface DeviceSettingsModalProps {
  device: Device | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedDevice: Device) => void
  onDelete: (deviceId: string) => void
}

export default function DeviceSettingsModal({ device, isOpen, onClose, onUpdate, onDelete }: DeviceSettingsModalProps) {
  const [editName, setEditName] = useState("")
  const [alertThreshold, setAlertThreshold] = useState(-80)
  const [alertType, setAlertType] = useState("sound")

  const formatTimestamp = (lastSeen: string) => {
    try {
      const date = new Date(lastSeen)
      if (isNaN(date.getTime())) {
        return lastSeen
      }
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return lastSeen
    }
  }

  if (!isOpen || !device) return null

  const handleSave = () => {
    if (editName.trim()) {
      onUpdate({
        ...device,
        name: editName,
      })
      onClose()
    }
  }

  const handleDelete = () => {
    if (confirm(`Delete "${device.name}" from your devices?`)) {
      onDelete(device.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-card border-blue-500 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Device Settings</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              ✕
            </button>
          </div>

          {/* Device Info */}
          <div className="bg-secondary/20 rounded-lg p-4 mb-6 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Device Name</p>
            <p className="text-lg font-semibold text-foreground">{device.name}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Type: {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
            </p>
          </div>

          {/* Settings */}
          <div className="space-y-5 mb-6">
            {/* Name Setting */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rename Device</label>
              <Input
                type="text"
                placeholder="Device name"
                defaultValue={device.name}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-secondary/30 border-border text-foreground"
              />
            </div>

            {/* Alert Threshold */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Alert Distance Threshold</label>
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="range"
                  min="-95"
                  max="-40"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(Number(e.target.value))}
                  className="flex-1 h-2 bg-secondary/50 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-foreground min-w-12">{alertThreshold} dBm</span>
              </div>
              <p className="text-xs text-muted-foreground">Alert when signal drops below threshold</p>
            </div>

            {/* Alert Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Alert Type</label>
              <div className="space-y-2">
                {[
                  { value: "sound", label: "Sound" },
                  { value: "vibration", label: "Vibration" },
                  { value: "notification", label: "Notification" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="alertType"
                      value={option.value}
                      checked={alertType === option.value}
                      onChange={(e) => setAlertType(e.target.value)}
                      className="accent-accent"
                    />
                    <span className="text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Connection Info */}
            <div className="bg-secondary/20 rounded-lg p-3 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Connection Info</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Signal: {device.signalStrength} dBm</p>
                <p>Status: {device.isConnected ? "Connected" : "Disconnected"}</p>
                <p>Last Seen: {formatTimestamp(device.lastSeen)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleSave}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-medium"
            >
              Save Changes
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-border text-foreground hover:bg-secondary/20 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 font-medium"
            >
              Delete Device
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

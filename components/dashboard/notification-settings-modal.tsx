"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Volume2, Vibrate, VolumeX } from "lucide-react"

interface NotificationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  deviceName: string
  onSave?: (settings: NotificationSettings) => void
}

export interface NotificationSettings {
  soundEnabled: boolean
  vibrationEnabled: boolean
  ringtone: string
  volume: number
  notificationTypes: {
    proximity: boolean
    connection: boolean
    battery: boolean
    outOfRange: boolean
  }
}

const RINGTONES = [
  { value: "default", label: "Default" },
  { value: "chime", label: "Chime" },
  { value: "bell", label: "Bell" },
  { value: "digital", label: "Digital" },
  { value: "gentle", label: "Gentle" },
  { value: "alert", label: "Alert" },
  { value: "notification", label: "Notification" },
  { value: "subtle", label: "Subtle" },
]

export default function NotificationSettingsModal({
  isOpen,
  onClose,
  deviceName,
  onSave,
}: NotificationSettingsModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [ringtone, setRingtone] = useState("default")
  const [volume, setVolume] = useState(80)
  const [notificationTypes, setNotificationTypes] = useState({
    proximity: true,
    connection: true,
    battery: true,
    outOfRange: true,
  })

  const handleSave = () => {
    const settings: NotificationSettings = {
      soundEnabled,
      vibrationEnabled,
      ringtone,
      volume,
      notificationTypes,
    }
    onSave?.(settings)
    onClose()
  }

  const toggleNotificationType = (type: keyof typeof notificationTypes) => {
    setNotificationTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-blue-500 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings - {deviceName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sound Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-primary" />
                ) : (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label className="text-base font-semibold">Sound</Label>
                  <p className="text-sm text-muted-foreground">Enable sound notifications</p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>

            {soundEnabled && (
              <div className="pl-8 space-y-3">
                {/* Ringtone Selection */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Ringtone</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {RINGTONES.map((tone) => (
                      <button
                        key={tone.value}
                        onClick={() => setRingtone(tone.value)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                          ringtone === tone.value
                            ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "border-border bg-background hover:bg-accent hover:border-accent-foreground/20 text-foreground"
                        }`}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Volume</Label>
                    <span className="text-sm text-muted-foreground">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-2 bg-secondary/50 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Vibration Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Vibrate className={`h-5 w-5 ${vibrationEnabled ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <Label className="text-base font-semibold">Vibration</Label>
                  <p className="text-sm text-muted-foreground">Enable vibration alerts</p>
                </div>
              </div>
              <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Notification Types */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Notification Types</Label>
            <p className="text-sm text-muted-foreground">Choose which events trigger notifications</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div>
                  <Label className="text-sm font-medium">Proximity Alerts</Label>
                  <p className="text-xs text-muted-foreground">When device comes in/out of range</p>
                </div>
                <Switch
                  checked={notificationTypes.proximity}
                  onCheckedChange={() => toggleNotificationType("proximity")}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div>
                  <Label className="text-sm font-medium">Connection Status</Label>
                  <p className="text-xs text-muted-foreground">When device connects/disconnects</p>
                </div>
                <Switch
                  checked={notificationTypes.connection}
                  onCheckedChange={() => toggleNotificationType("connection")}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div>
                  <Label className="text-sm font-medium">Battery Alerts</Label>
                  <p className="text-xs text-muted-foreground">Low battery warnings</p>
                </div>
                <Switch
                  checked={notificationTypes.battery}
                  onCheckedChange={() => toggleNotificationType("battery")}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div>
                  <Label className="text-sm font-medium">Out of Range</Label>
                  <p className="text-xs text-muted-foreground">Device moves out of range</p>
                </div>
                <Switch
                  checked={notificationTypes.outOfRange}
                  onCheckedChange={() => toggleNotificationType("outOfRange")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-secondary/20 bg-transparent"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ChevronLeft, Trash2, Bell } from "lucide-react"
import Link from "next/link"

interface DeviceSettings {
  id: string
  name: string
  type: string
  alertDistance: number
  enableNotifications: boolean
  enableVibration: boolean
  alertSound: string
}

export default function DeviceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const deviceId = params.id as string
  const [settings, setSettings] = useState<DeviceSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // TODO: Backend - GET /api/devices/{deviceId}
    // Expected response: { device: DeviceSettings }
    console.log("[v0] Fetching device settings:", deviceId)

    const mockSettings: DeviceSettings = {
      id: deviceId,
      name: "My iPhone",
      type: "phone",
      alertDistance: 50,
      enableNotifications: true,
      enableVibration: true,
      alertSound: "default",
    }

    setSettings(mockSettings)
    setIsLoading(false)
  }, [deviceId])

  const saveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      // TODO: Backend - PUT /api/devices/{deviceId}
      // Expected payload: DeviceSettings
      // Expected response: { device: DeviceSettings }
      console.log("[v0] Saving device settings:", settings)

      // Show success feedback
      router.push("/dashboard")
    } catch (err) {
      console.error("Save failed:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteDevice = async () => {
    if (!confirm("Are you sure you want to remove this device?")) return

    try {
      // TODO: Backend - DELETE /api/devices/{deviceId}
      console.log("[v0] Deleting device:", deviceId)

      router.push("/dashboard")
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!settings) {
    return <div className="flex items-center justify-center min-h-screen">Device not found</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{settings.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">{settings.type}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Device Info */}
          <Card>
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Device Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Device Type</Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border border-border rounded-md bg-card"
                  value={settings.type}
                  onChange={(e) => setSettings({ ...settings, type: e.target.value })}
                >
                  <option value="phone">Phone</option>
                  <option value="tablet">Tablet</option>
                  <option value="laptop">Laptop</option>
                  <option value="earbuds">Earbuds</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Alert Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alert Settings
              </CardTitle>
              <CardDescription>Configure how you get notified when your device is out of range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Alert Distance (meters)</Label>
                  <span className="text-lg font-semibold text-primary">{settings.alertDistance}m</span>
                </div>
                <Slider
                  value={[settings.alertDistance]}
                  onValueChange={(value) => setSettings({ ...settings, alertDistance: value[0] })}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  You'll receive an alert when your device goes beyond this distance
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Enable Notifications</span>
                </label>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableVibration}
                    onChange={(e) => setSettings({ ...settings, enableVibration: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Enable Vibration</span>
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sound">Alert Sound</Label>
                <select
                  id="sound"
                  className="w-full px-3 py-2 border border-border rounded-md bg-card"
                  value={settings.alertSound}
                  onChange={(e) => setSettings({ ...settings, alertSound: e.target.value })}
                >
                  <option value="default">Default</option>
                  <option value="bell">Bell</option>
                  <option value="chime">Chime</option>
                  <option value="alarm">Alarm</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={saveSettings} disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={deleteDevice}
              variant="outline"
              size="icon"
              className="text-destructive hover:text-destructive bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

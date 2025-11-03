"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Trash2, Bell, Zap } from "lucide-react"

export default function DeviceSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const [settings, setSettings] = useState({
    enableAlerts: true,
    proximityDistance: 50,
    vibrationAlert: true,
    soundAlert: true,
    soundVolume: 70,
    lowBatteryAlert: true,
    lowBatteryThreshold: 20,
    trackingEnabled: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }))
  }

  const handleSliderChange = (key: keyof typeof settings, value: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleDeleteDevice = () => {
    if (confirm("Are you sure you want to remove this device? This action cannot be undone.")) {
      router.push("/dashboard")
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Device Settings</h1>
        <p className="text-muted-foreground">Configure alerts and tracking for this device</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alert Settings
            </CardTitle>
            <CardDescription>Control how you're notified when devices go out of range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Enable Proximity Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when you move away from this device</p>
              </div>
              <Switch checked={settings.enableAlerts} onCheckedChange={() => handleToggle("enableAlerts")} />
            </div>

            {settings.enableAlerts && (
              <>
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base">Proximity Distance</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[settings.proximityDistance]}
                      onValueChange={(value) => handleSliderChange("proximityDistance", value[0])}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Alert when device is more than {settings.proximityDistance} meters away
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Label className="text-base">Alert Type</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="vibration">Vibration Alert</Label>
                      <Switch
                        id="vibration"
                        checked={settings.vibrationAlert}
                        onCheckedChange={() => handleToggle("vibrationAlert")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound">Sound Alert</Label>
                      <Switch
                        id="sound"
                        checked={settings.soundAlert}
                        onCheckedChange={() => handleToggle("soundAlert")}
                      />
                    </div>
                  </div>
                </div>

                {settings.soundAlert && (
                  <div className="space-y-3 pt-4">
                    <Label className="text-base">Alert Volume</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[settings.soundVolume]}
                        onValueChange={(value) => handleSliderChange("soundVolume", value[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">Volume: {settings.soundVolume}%</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Battery Alerts
            </CardTitle>
            <CardDescription>Get notified when device battery is running low</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Low Battery Alert</Label>
                <p className="text-sm text-muted-foreground">Alert when battery drops below threshold</p>
              </div>
              <Switch checked={settings.lowBatteryAlert} onCheckedChange={() => handleToggle("lowBatteryAlert")} />
            </div>

            {settings.lowBatteryAlert && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base">Battery Threshold</Label>
                <div className="space-y-2">
                  <Slider
                    value={[settings.lowBatteryThreshold]}
                    onValueChange={(value) => handleSliderChange("lowBatteryThreshold", value[0])}
                    min={5}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Alert when battery is below {settings.lowBatteryThreshold}%
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracking</CardTitle>
            <CardDescription>Control device tracking and location services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Enable Tracking</Label>
                <p className="text-sm text-muted-foreground">Track this device's location and status</p>
              </div>
              <Switch checked={settings.trackingEnabled} onCheckedChange={() => handleToggle("trackingEnabled")} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDeleteDevice} className="gap-2 w-full">
              <Trash2 className="w-4 h-4" />
              Remove Device
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Removing this device will stop all tracking and alerts. This action cannot be undone.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" asChild className="flex-1 bg-transparent">
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button className="flex-1">Save Settings</Button>
        </div>
      </div>
    </div>
  )
}

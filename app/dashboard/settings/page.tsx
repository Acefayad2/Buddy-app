"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Moon } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
    dataCollection: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleDeleteAccount = () => {
    if (confirm("Are you sure? This will permanently delete your account and all associated data.")) {
      localStorage.clear()
      router.push("/auth/login")
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how Phone Buddy looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4" />
                <Label className="text-base">Dark Mode</Label>
              </div>
              <Switch checked={settings.darkMode} onCheckedChange={() => handleToggle("darkMode")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <Label className="text-base">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
              </div>
              <Switch checked={settings.pushNotifications} onCheckedChange={() => handleToggle("pushNotifications")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Control your data and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Data Collection</Label>
                <p className="text-sm text-muted-foreground">Allow us to collect usage data to improve Phone Buddy</p>
              </div>
              <Switch checked={settings.dataCollection} onCheckedChange={() => handleToggle("dataCollection")} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
              Delete Account
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  )
}

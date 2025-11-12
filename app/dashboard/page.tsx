"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { DeviceCard } from "@/components/device-card"
import { StreakCard } from "@/components/streak-card"
import { CelebrationModal } from "@/components/celebration-modal"

interface Device {
  id: string
  name: string
  type: "phone" | "tablet" | "watch"
  status: "connected" | "nearby" | "away"
  battery: number
  signal: number
  lastSeen: string
}

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "1",
      name: "My iPhone 15",
      type: "phone",
      status: "connected",
      battery: 87,
      signal: 5,
      lastSeen: "Just now",
    },
    {
      id: "2",
      name: "iPad Pro",
      type: "tablet",
      status: "nearby",
      battery: 65,
      signal: 4,
      lastSeen: "2 minutes ago",
    },
    {
      id: "3",
      name: "Apple Watch",
      type: "watch",
      status: "connected",
      battery: 42,
      signal: 5,
      lastSeen: "Just now",
    },
  ])

  const [daysStreak, setDaysStreak] = useState(23)
  const [bestStreak, setBestStreak] = useState(45)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationDevice, setCelebrationDevice] = useState("")

  const handleFirstDevicePairing = (deviceName: string) => {
    setCelebrationDevice(deviceName)
    setShowCelebration(true)
  }

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Your Devices</h1>
        <p className="text-muted-foreground">Manage and monitor all your connected devices</p>
      </div>

      <StreakCard days={daysStreak} bestStreak={bestStreak} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>

      <Card className="border-dashed dark:bg-secondary/50 dark:border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <Button asChild size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/dashboard/pair-device">
              <Plus className="w-5 h-5" />
              Add New Device
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="dark:bg-secondary dark:border-primary/20">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Overview of your device network</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Connected</p>
            <p className="text-2xl font-bold text-primary">2</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nearby</p>
            <p className="text-2xl font-bold text-primary">1</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Devices</p>
            <p className="text-2xl font-bold text-primary">3</p>
          </div>
        </CardContent>
      </Card>

      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        deviceName={celebrationDevice}
      />
    </div>
  )
}

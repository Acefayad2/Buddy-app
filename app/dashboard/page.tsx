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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-950/20">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="space-y-3 pt-4">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
            Your Devices
          </h1>
          <p className="text-lg text-muted-foreground font-semibold">
            Manage and monitor all your connected devices with Buddy
          </p>
        </div>

        <StreakCard days={daysStreak} bestStreak={bestStreak} />

        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Connected Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        </div>

        <Card className="border-2 border-dashed border-primary/30 dark:border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-purple-950/20 dark:to-pink-950/20 hover:border-primary/50 transition-all duration-300">
          <CardContent className="flex items-center justify-center py-16">
            <Button
              asChild
              size="lg"
              className="gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50 font-bold text-lg px-8 py-6 rounded-xl border-0 hover:scale-105 transition-all"
            >
              <Link href="/dashboard/pair-device">
                <Plus className="w-6 h-6" />
                Add New Device
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
          <CardHeader className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30">
            <CardTitle className="text-2xl font-bold text-foreground">Quick Stats</CardTitle>
            <CardDescription className="text-base font-semibold">Overview of your device network</CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-3 gap-4">
            <div className="space-y-2 p-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Connected</p>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400">2</p>
            </div>
            <div className="space-y-2 p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-xl border border-purple-200/50 dark:border-purple-800/30">
              <p className="text-sm font-bold text-purple-700 dark:text-purple-300">Nearby</p>
              <p className="text-3xl font-black text-purple-600 dark:text-purple-400">1</p>
            </div>
            <div className="space-y-2 p-4 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 rounded-xl border border-orange-200/50 dark:border-orange-800/30">
              <p className="text-sm font-bold text-orange-700 dark:text-orange-300">Total</p>
              <p className="text-3xl font-black text-orange-600 dark:text-orange-400">3</p>
            </div>
          </CardContent>
        </Card>

        <CelebrationModal
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          deviceName={celebrationDevice}
        />
      </div>
    </div>
  )
}

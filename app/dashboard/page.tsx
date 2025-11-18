"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import DeviceCard from "@/components/dashboard/device-card"
import { SafariNotice } from "@/src/components/SafariNotice"
import { Spinner } from "@/components/ui/spinner"

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
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load devices from localStorage or API
    const loadDevices = () => {
      try {
        // For now, use mock data - replace with actual API call
        const mockDevices: Device[] = [
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
        ]
        setDevices(mockDevices)
      } catch (error) {
        console.error("Error loading devices:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDevices()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <SafariNotice />
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Your Devices</h1>
        <p className="text-muted-foreground">Manage and monitor all your connected devices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => (
          <DeviceCard 
            key={device.id} 
            device={{
              id: device.id,
              name: device.name,
              type: device.type === "watch" ? "phone" : device.type, // Map to supported types
              signalStrength: device.signal * -20, // Convert to RSSI-like value
              isConnected: device.status === "connected",
              distance: device.status === "connected" ? "Nearby" : device.status === "nearby" ? "Close" : "Far",
              lastSeen: device.lastSeen,
            }}
            onUpdate={(updated) => {
              setDevices(devices.map(d => d.id === updated.id ? {
                ...d,
                status: updated.isConnected ? "connected" : "away",
                signal: Math.abs(updated.signalStrength) / 20,
              } : d))
            }}
            onDelete={(id) => {
              setDevices(devices.filter(d => d.id !== id))
            }}
          />
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
            <p className="text-2xl font-bold text-primary">
              {devices.filter((d) => d.status === "connected").length}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nearby</p>
            <p className="text-2xl font-bold text-primary">
              {devices.filter((d) => d.status === "nearby").length}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Devices</p>
            <p className="text-2xl font-bold text-primary">{devices.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import DeviceCard from "./device-card"
import PairingModal from "./pairing-modal"
import ActivityLog from "./activity-log"

interface Device {
  id: string
  name: string
  type: "phone" | "keys" | "earbuds" | "laptop"
  signalStrength: number
  isConnected: boolean
  distance: string
  lastSeen: string
}

interface DashboardProps {
  onLogout: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "1",
      name: "iPhone 15 Pro",
      type: "phone",
      signalStrength: -55,
      isConnected: true,
      distance: "5 m",
      lastSeen: "Just now",
    },
    {
      id: "2",
      name: "AirPods Pro",
      type: "earbuds",
      signalStrength: -72,
      isConnected: true,
      distance: "2 m",
      lastSeen: "Just now",
    },
    {
      id: "3",
      name: "House Keys",
      type: "keys",
      signalStrength: -95,
      isConnected: false,
      distance: "Out of range",
      lastSeen: "3 minutes ago",
    },
  ])

  const [showPairingModal, setShowPairingModal] = useState(false)

  const handleDevicePaired = (newDevice: Device) => {
    setDevices([...devices, newDevice])
  }

  const handleDeviceUpdate = (updatedDevice: Device) => {
    setDevices(devices.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)))
  }

  const handleDeviceDelete = (deviceId: string) => {
    setDevices(devices.filter((d) => d.id !== deviceId))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor your connected devices</p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-border text-foreground hover:bg-card bg-transparent"
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Connected Devices</p>
            <p className="text-3xl font-bold text-foreground">{devices.filter((d) => d.isConnected).length}</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Devices</p>
            <p className="text-3xl font-bold text-foreground">{devices.length}</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Alerts Today</p>
            <p className="text-3xl font-bold text-foreground">2</p>
          </Card>
        </div>

        {/* Devices Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Your Devices</h2>
            <Button
              onClick={() => setShowPairingModal(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              + Add Device
            </Button>
          </div>

          {/* Device Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} onUpdate={handleDeviceUpdate} onDelete={handleDeviceDelete} />
            ))}
          </div>
        </div>

        <ActivityLog maxItems={6} />
      </main>

      <PairingModal
        isOpen={showPairingModal}
        onClose={() => setShowPairingModal(false)}
        onDevicePaired={handleDevicePaired}
      />
    </div>
  )
}

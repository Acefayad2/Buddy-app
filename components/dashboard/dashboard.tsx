"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import DeviceCard from "./device-card"
import PairingModal from "./pairing-modal"
import ActivityLog from "./activity-log"
import FindMyMap from "./find-my-map"

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
  // Helper to get timestamp for X minutes ago
  const getTimestampMinutesAgo = (minutes: number) => {
    const date = new Date()
    date.setMinutes(date.getMinutes() - minutes)
    return date.toISOString()
  }

  const [devices, setDevices] = useState<Device[]>([
    {
      id: "1",
      name: "iPhone 15 Pro",
      type: "phone",
      signalStrength: -55,
      isConnected: true,
      distance: "5 m",
      lastSeen: new Date().toISOString(), // Current time
    },
    {
      id: "2",
      name: "AirPods Pro",
      type: "earbuds",
      signalStrength: -72,
      isConnected: true,
      distance: "2 m",
      lastSeen: new Date().toISOString(), // Current time
    },
    {
      id: "3",
      name: "House Keys",
      type: "keys",
      signalStrength: -95,
      isConnected: false,
      distance: "Out of range",
      lastSeen: getTimestampMinutesAgo(3), // 3 minutes ago
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
    <FindMyMap
      devices={devices}
      onDeviceUpdate={handleDeviceUpdate}
      onDeviceDelete={handleDeviceDelete}
      onDevicePaired={handleDevicePaired}
      onLogout={onLogout}
    />
  )
}

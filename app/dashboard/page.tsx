"use client"

import React, { useState, useEffect, useRef } from "react"
import DeviceCard from "@/components/dashboard/device-card"
import { SafariNotice } from "@/src/components/SafariNotice"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import AddDeviceModal from "@/components/dashboard/add-device-modal"
import BluetoothPairingModal from "@/components/dashboard/bluetooth-pairing-modal"
import { useBluetooth } from "@/lib/hooks/use-bluetooth"
import { useAuth } from "@/contexts/auth-context"
import { getDevicesForUser, createDevice, updateDevice, deleteDevice, deviceToUI } from "@/lib/devices"
import { startLocationTracking, getCurrentLocation, updateDeviceLocationInSupabase } from "@/lib/location-tracking"
import { getDeviceConnection, isDeviceConnected } from "@/lib/bluetooth-connection"

interface Device {
  id: string
  name: string
  type: "phone" | "tablet" | "watch"
  status: "connected" | "nearby" | "away"
  battery: number
  signal: number
  lastSeen: string
  location?: { lat: number; lng: number }
  bluetoothDeviceId?: string
  bluetoothDeviceName?: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false)
  const [showPairingModal, setShowPairingModal] = useState(false)
  const [pendingDeviceType, setPendingDeviceType] = useState<"phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop" | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const dropZoneRef = React.useRef<HTMLDivElement>(null)
  const bluetooth = useBluetooth()
  const [bluetoothMessage, setBluetoothMessage] = useState<string | null>(null)
  const locationTrackingCleanups = useRef<Map<string, () => void>>(new Map())
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Load devices from Supabase
  useEffect(() => {
    const loadDevices = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const dbDevices = await getDevicesForUser(user.id)
        const uiDevices: Device[] = dbDevices.map(dbDevice => {
          const uiDevice = deviceToUI(dbDevice, {
            status: 'away', // Default status - would be updated by tracking service
            battery: undefined,
            signal: undefined,
          })
          return {
            id: uiDevice.id,
            name: uiDevice.name,
            type: uiDevice.type,
            status: uiDevice.status,
            battery: uiDevice.battery || 0,
            signal: uiDevice.signal || 0,
            lastSeen: uiDevice.lastSeen,
            location: uiDevice.location, // Include location from database
            bluetoothDeviceId: uiDevice.bluetoothDeviceId,
            bluetoothDeviceName: uiDevice.bluetoothDeviceName,
          }
        })
        setDevices(uiDevices)
      } catch (error) {
        console.error("Error loading devices:", error)
        setDevices([])
      } finally {
        setIsLoading(false)
      }
    }

    loadDevices()
  }, [user])

  // Start location tracking for all devices
  useEffect(() => {
    if (devices.length === 0) return

    // Request location permission and start tracking
    const startTracking = async () => {
      try {
        // Get initial location
        const location = await getCurrentLocation()
        setCurrentLocation({ lat: location.latitude, lng: location.longitude })

        // Start tracking for each device with high accuracy (15 second updates)
        devices.forEach((device) => {
          // Only track if we have a device ID
          if (device.id) {
            const cleanup = startLocationTracking(device.id, 15000) // Update every 15 seconds for maximum accuracy
            locationTrackingCleanups.current.set(device.id, cleanup)
          }
        })
      } catch (error) {
        console.error('Error starting location tracking:', error)
        // Location permission denied or not available - continue without tracking
      }
    }

    startTracking()

    // Cleanup on unmount or when devices change
    return () => {
      locationTrackingCleanups.current.forEach((cleanup) => cleanup())
      locationTrackingCleanups.current.clear()
    }
  }, [devices.length]) // Only restart when device count changes

  // Refresh devices periodically to get updated locations and Bluetooth status
  useEffect(() => {
    if (!user?.id) return

    const interval = setInterval(async () => {
      try {
        const dbDevices = await getDevicesForUser(user.id)
        const uiDevices: Device[] = dbDevices.map(dbDevice => {
          const uiDevice = deviceToUI(dbDevice, {
            status: 'away',
            battery: undefined,
            signal: undefined,
          })
          
          // Check Bluetooth connection status if device has Bluetooth ID
          let deviceStatus = uiDevice.status
          if (uiDevice.bluetoothDeviceId) {
            const isConnected = isDeviceConnected(uiDevice.bluetoothDeviceId)
            const connection = getDeviceConnection(uiDevice.bluetoothDeviceId)
            if (isConnected && connection) {
              deviceStatus = 'connected'
            } else if (connection && !connection.connected) {
              deviceStatus = 'away'
            }
          }
          
          return {
            id: uiDevice.id,
            name: uiDevice.name,
            type: uiDevice.type,
            status: deviceStatus,
            battery: uiDevice.battery || 0,
            signal: uiDevice.signal || 0,
            lastSeen: uiDevice.lastSeen,
            location: uiDevice.location,
            bluetoothDeviceId: uiDevice.bluetoothDeviceId,
            bluetoothDeviceName: uiDevice.bluetoothDeviceName,
          }
        })
        setDevices(uiDevices)
      } catch (error) {
        console.error("Error refreshing devices:", error)
      }
    }, 10000) // Refresh every 10 seconds for real-time accuracy

    return () => clearInterval(interval)
  }, [user])

  // Calculate distance for a device
  const formatDistance = (device: Device): string => {
    if (device.status === "connected") {
      return "< 0.1 mi"
    }
    
    if (device.location && currentLocation) {
      const R = 3959 // Earth's radius in miles
      const dLat = (device.location.lat - currentLocation.lat) * Math.PI / 180
      const dLon = (device.location.lng - currentLocation.lng) * Math.PI / 180
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(currentLocation.lat * Math.PI / 180) * Math.cos(device.location.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distanceMiles = R * c
      
      if (distanceMiles < 0.1) {
        return "< 0.1 mi"
      } else if (distanceMiles < 1) {
        return `${distanceMiles.toFixed(2)} mi`
      } else {
        return `${distanceMiles.toFixed(1)} mi`
      }
    }
    
    return "Unknown"
  }

  const handleRequestBluetooth = async () => {
    setBluetoothMessage(null)
    try {
      // This will trigger the native browser permission prompt
      // The browser will show a device picker dialog - user must select a device to grant permission
      const permitted = await bluetooth.requestBluetoothPermission()
      if (permitted) {
        setBluetoothMessage("Bluetooth permission granted! You can now pair devices.")
        // Clear message after 3 seconds
        setTimeout(() => setBluetoothMessage(null), 3000)
      } else {
        // Check the error message to provide helpful feedback
        if (bluetooth.error) {
          if (bluetooth.error.includes("select a Bluetooth device")) {
            setBluetoothMessage("Please select a Bluetooth device from the picker to grant permission. You can select any device - this just grants permission.")
          } else {
            setBluetoothMessage(bluetooth.error)
          }
        } else {
          setBluetoothMessage("Please select a Bluetooth device from the picker to grant permission.")
        }
      }
    } catch (error: any) {
      setBluetoothMessage(error.message || "Failed to request Bluetooth permission. Please check your browser settings.")
    }
  }

  useEffect(() => {
    // Add global drag event handlers to handle drag across modal overlay
    const handleGlobalDragOver = (e: DragEvent) => {
      if (!dropZoneRef.current) return
      const rect = dropZoneRef.current.getBoundingClientRect()
      const x = e.clientX
      const y = e.clientY
      
      // Check if we're over the drop zone
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(true)
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "move"
        }
      }
    }

    const handleGlobalDragLeave = (e: DragEvent) => {
      if (!dropZoneRef.current) return
      const rect = dropZoneRef.current.getBoundingClientRect()
      const x = e.clientX
      const y = e.clientY
      
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setIsDragOver(false)
      }
    }

    const handleGlobalDrop = (e: DragEvent) => {
      if (!dropZoneRef.current) return
      const rect = dropZoneRef.current.getBoundingClientRect()
      const x = e.clientX
      const y = e.clientY
      
      // Check if we're over the drop zone
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)

        const deviceType = e.dataTransfer?.getData("deviceType")
        if (!deviceType) return

        // Map device type
        let mappedType: "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop" = deviceType as any
        if (!["phone", "tablet", "watch", "keys", "earbuds", "laptop"].includes(deviceType)) {
          mappedType = "phone"
        }

        // Instead of creating device immediately, show pairing modal
        setPendingDeviceType(mappedType)
        setShowAddDeviceModal(false)
        setShowPairingModal(true)
      }
    }

    document.addEventListener("dragover", handleGlobalDragOver)
    document.addEventListener("dragleave", handleGlobalDragLeave)
    document.addEventListener("drop", handleGlobalDrop)

    return () => {
      document.removeEventListener("dragover", handleGlobalDragOver)
      document.removeEventListener("dragleave", handleGlobalDragLeave)
      document.removeEventListener("drop", handleGlobalDrop)
    }
  }, [devices])

  // Local handlers for when modal is closed (backup)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const deviceType = e.dataTransfer.getData("deviceType")
    if (deviceType) {
      setIsDragOver(true)
      e.dataTransfer.dropEffect = "move"
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const deviceType = e.dataTransfer.getData("deviceType")
    if (deviceType) {
      setIsDragOver(true)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const deviceType = e.dataTransfer.getData("deviceType")
    if (!deviceType) return

    // Map device type
    let mappedType: "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop" = deviceType as any
    if (!["phone", "tablet", "watch", "keys", "earbuds", "laptop"].includes(deviceType)) {
      mappedType = "phone"
    }

    // Instead of creating device immediately, show pairing modal
    setPendingDeviceType(mappedType)
    setShowAddDeviceModal(false)
    setShowPairingModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <SafariNotice />
      
      <div className="px-6 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-foreground">Bluetooth Access</p>
                <p className="text-xs text-muted-foreground">
                  {bluetooth.isSupported
                    ? bluetooth.isEnabled
                      ? "Bluetooth is enabled. You can pair and track devices."
                      : "Click 'Enable Bluetooth' to grant permission. Your browser will ask for permission to access Bluetooth devices."
                    : "Web Bluetooth is not available in this browser. Use Chrome/Edge or the Phone Buddy mobile app."}
                </p>
              </div>
              {bluetooth.isSupported && !bluetooth.isEnabled && (
                <Button
                  size="sm"
                  onClick={handleRequestBluetooth}
                  disabled={bluetooth.isRequesting}
                  className="rounded-lg"
                >
                  {bluetooth.isRequesting ? "Requesting..." : "Enable Bluetooth"}
                </Button>
              )}
            </div>
            {(bluetooth.error || bluetoothMessage) && (
              <div
                className={`text-xs font-medium ${
                  bluetooth.error ? "text-destructive" : "text-primary"
                }`}
              >
                {bluetooth.error || bluetoothMessage}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 py-20 px-6 border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 mb-4">
              <span className="text-4xl">📱</span>
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent tracking-tight">
              Buddy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Never leave your devices behind
            </p>
            <Button
              onClick={() => setShowAddDeviceModal(true)}
              className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 px-8 py-6 text-base font-semibold rounded-xl"
            >
              Add Device
            </Button>
          </div>
        </div>
      </section>

      {/* Your Devices Section */}
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="space-y-3">
          <h2 className="text-4xl font-bold text-foreground tracking-tight">Your Devices</h2>
          <p className="text-muted-foreground text-lg">Manage and monitor all your connected devices</p>
        </div>

      <div 
        ref={dropZoneRef}
        className={`flex flex-col gap-6 transition-all duration-300 min-h-[200px] ${
          isDragOver 
            ? "bg-primary/5 border-2 border-primary/40 border-dashed rounded-2xl p-8 shadow-lg shadow-primary/10" 
            : devices.length === 0 
              ? "border-2 border-dashed border-border rounded-2xl p-12 bg-muted/30"
              : ""
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {devices.length === 0 && !isDragOver && (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 relative device-icon-wrapper" data-device-type="phone">
              <span className="text-3xl">📱</span>
            </div>
            <p className="text-xl font-semibold mb-2 text-muted-foreground">No devices yet</p>
            <p className="text-sm text-muted-foreground/80">Drag a device icon from the Help menu to add one</p>
          </div>
        )}
        {devices.map((device) => (
          <DeviceCard 
            key={device.id} 
            device={{
              id: device.id,
              name: device.name,
              type: device.type as "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop",
              signalStrength: device.signal * -20, // Convert to RSSI-like value
              isConnected: device.status === "connected",
              distance: formatDistance(device), // Calculate distance using location
              lastSeen: device.lastSeen,
              battery: device.battery,
              location: device.location, // Pass location to device card
              bluetoothDeviceId: device.bluetoothDeviceId,
              bluetoothDeviceName: device.bluetoothDeviceName,
            }}
            onUpdate={async (updated) => {
              try {
                await updateDevice(updated.id, {
                  device_name: updated.name,
                })
                setDevices(devices.map(d => d.id === updated.id ? {
                  ...d,
                  name: updated.name,
                  status: updated.isConnected ? "connected" : "away",
                  signal: Math.abs(updated.signalStrength) / 20,
                } : d))
              } catch (error) {
                console.error("Error updating device:", error)
              }
            }}
            onDelete={async (id) => {
              try {
                await deleteDevice(id)
                setDevices(devices.filter(d => d.id !== id))
              } catch (error) {
                console.error("Error deleting device:", error)
              }
            }}
          />
        ))}
      </div>

      </div>
      
      <AddDeviceModal 
        isOpen={showAddDeviceModal} 
        onClose={() => setShowAddDeviceModal(false)} 
      />

      {pendingDeviceType && (
        <BluetoothPairingModal
          isOpen={showPairingModal}
          onClose={() => {
            setShowPairingModal(false)
            setPendingDeviceType(null)
          }}
          onDevicePaired={async (pairedDevice) => {
            if (!user?.id) return

            try {
              // Create device in Supabase
              const dbDevice = await createDevice(user.id, {
                device_name: pairedDevice.name,
                device_type: pairedDevice.type === 'phone' ? 'iOS' : 'Android', // Default to iOS for phones
                ble_identifier: pairedDevice.bluetoothDeviceId || `ble-${Date.now()}`,
              })

              // Map to UI format
              const uiDevice = deviceToUI(dbDevice, {
                status: pairedDevice.status || 'away',
                battery: pairedDevice.battery,
                signal: pairedDevice.signal,
                bluetoothDeviceId: pairedDevice.bluetoothDeviceId,
                bluetoothDeviceName: pairedDevice.bluetoothDeviceName,
              })

              const mappedDevice: Device = {
                id: uiDevice.id,
                name: uiDevice.name,
                type: uiDevice.type,
                status: uiDevice.status,
                battery: uiDevice.battery || 0,
                signal: uiDevice.signal || 0,
                lastSeen: uiDevice.lastSeen,
                location: uiDevice.location,
                bluetoothDeviceId: uiDevice.bluetoothDeviceId,
                bluetoothDeviceName: uiDevice.bluetoothDeviceName,
              }

              setDevices(prev => [...prev, mappedDevice])
              setShowPairingModal(false)
              setPendingDeviceType(null)
            } catch (error) {
              console.error("Error adding device:", error)
            }
          }}
          deviceType={pendingDeviceType}
        />
      )}
    </div>
  )
}


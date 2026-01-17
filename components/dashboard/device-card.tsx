"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, Battery, MapPin, Menu, Map, Bluetooth, Navigation, ExternalLink, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import NotificationSettingsModal, { NotificationSettings } from "./notification-settings-modal"

interface Device {
  id: string
  name: string
  type: "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop"
  signalStrength: number
  isConnected: boolean
  distance: string
  lastSeen: string
  battery?: number
  location?: { lat: number; lng: number }
  bluetoothDeviceId?: string
  bluetoothDeviceName?: string
}

interface DeviceCardProps {
  device: Device
  onUpdate?: (device: Device) => void
  onDelete?: (deviceId: string) => void
  onConnect?: (device: Device) => Promise<void>
}

export default function DeviceCard({ device, onUpdate, onDelete, onConnect }: DeviceCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showLocation, setShowLocation] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const getDeviceIcon = (type: string) => {
    const icons: Record<string, string> = {
      phone: "📱",
      tablet: "📱",
      watch: "⌚",
      keys: "🔑",
      earbuds: "🎧",
      laptop: "💻",
    }
    return icons[type] || "📦"
  }

  const getSignalStrength = (rssi: number) => {
    // Convert RSSI to 1-5 scale
    // Handle both RSSI values (negative) and signal scale (1-5)
    if (rssi > 0 && rssi <= 5) {
      // Already in 1-5 scale
      return rssi
    }
    // Convert RSSI (negative) to 1-5 scale
    if (rssi >= -40) return 5
    if (rssi >= -50) return 4
    if (rssi >= -60) return 3
    if (rssi >= -80) return 2
    return 1
  }

  const getBatteryColor = (battery?: number) => {
    if (!battery) return "text-gray-400"
    if (battery >= 50) return "text-green-500"
    if (battery >= 20) return "text-yellow-500"
    return "text-red-500"
  }

  const formatTimestamp = (lastSeen: string) => {
    try {
      const date = new Date(lastSeen)
      if (isNaN(date.getTime())) {
        return lastSeen
      }
      // Format as full timestamp with date and time in user's timezone
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return lastSeen
    }
  }

  // Calculate distance in miles using Haversine formula
  const calculateDistanceInMiles = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting user location:', error)
        }
      )
    }
  }, [])

  // Format distance display using real device location
  const formatDistance = (): string => {
    if (device.isConnected) {
      // When connected, device is very close (within Bluetooth range, typically < 30 meters)
      return "< 0.1 mi"
    }
    
    // If device has location and user has location, calculate distance
    if (device.location && userLocation) {
      const distanceMiles = calculateDistanceInMiles(
        userLocation.lat,
        userLocation.lng,
        device.location.lat,
        device.location.lng
      )
      
      if (distanceMiles < 0.1) {
        return "< 0.1 mi"
      } else if (distanceMiles < 1) {
        return `${distanceMiles.toFixed(2)} mi`
      } else {
        return `${distanceMiles.toFixed(1)} mi`
      }
    }
    
    // Fallback if location not available
    return "Unknown"
  }

  return (
    <>
      <Card className="bg-card border-blue-500 p-6 hover:bg-accent/50 hover:border-blue-600 transition-all duration-300 h-auto shadow-sm hover:shadow-md group">
        <div className="flex items-center justify-between gap-6 h-full">
          {/* Left: Device Icon and Name */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <div 
              className="relative text-5xl cursor-pointer hover:scale-110 transition-transform duration-300 filter drop-shadow-sm device-icon-wrapper"
              data-device-type={device.type}
              onClick={() => setShowMenu(true)}
            >
              {getDeviceIcon(device.type)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-foreground text-xl">{device.name}</h3>
                {/* Connection status indicator - Green when connected, Red when inactive */}
                <div className="relative">
                  {device.isConnected ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
                    </>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                  )}
                </div>
                {device.bluetoothDeviceId && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                    <Bluetooth className="w-3 h-3 text-primary" />
                    <span className="text-xs font-medium text-primary">Paired</span>
                  </div>
                )}
              </div>
              {device.bluetoothDeviceName && (
                <p className="text-xs text-muted-foreground mt-1">
                  Bluetooth: {device.bluetoothDeviceName}
                </p>
              )}
            </div>
          </div>

          {/* Center: Icon Cards for Signal, Battery, Location */}
          <div className="flex items-center gap-4 flex-1">
            {/* Signal Card - Only show when connected */}
            {device.isConnected && (
              <Card className="border-blue-500 p-5 bg-muted/50 hover:bg-muted transition-all duration-300 group-hover:border-blue-600">
                <div className="flex flex-col items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-background/80">
                    <Wifi className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Signal</span>
                  <span className="text-base font-bold text-foreground text-center">
                    {getSignalStrength(device.signalStrength)}/5
                  </span>
                </div>
              </Card>
            )}

            {/* Battery Card - Only show when connected */}
            {device.isConnected && (
              <Card className="border-blue-500 p-5 bg-muted/50 hover:bg-muted transition-all duration-300 group-hover:border-blue-600">
                <div className="flex flex-col items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-background/80">
                    <Battery className={`w-5 h-5 ${getBatteryColor(device.battery)}`} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Battery</span>
                  <span className={`text-base font-bold text-center ${
                    device.battery !== undefined 
                      ? getBatteryColor(device.battery) 
                      : "text-muted-foreground"
                  }`}>
                    {device.battery !== undefined ? `${device.battery}%` : "N/A"}
                  </span>
                </div>
              </Card>
            )}

            {/* Location Card - Always visible */}
            <Card className="border-blue-500 p-5 bg-muted/50 hover:bg-muted transition-all duration-300 group-hover:border-blue-600">
              <div className="flex flex-col items-center gap-2.5">
                <div className="p-2 rounded-lg bg-background/80">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Seen</span>
                <span className="text-base font-bold text-foreground text-center">{formatTimestamp(device.lastSeen)}</span>
              </div>
            </Card>
          </div>

          {/* Right: Locate Button and Menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary text-sm h-10 px-6 bg-background shadow-sm hover:shadow-md transition-all duration-300 font-medium"
              onClick={() => {
                console.log('[DeviceCard] Locate button clicked for device:', device.name, 'Location:', device.location)
                setShowLocation(true)
              }}
            >
              Locate
            </Button>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-accent hover:border-accent-foreground/20 h-10 w-10 p-0 bg-background shadow-sm hover:shadow-md transition-all duration-300"
              onClick={() => setShowMenu(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showMenu} onOpenChange={setShowMenu}>
        <DialogContent className="sm:max-w-md bg-card border-blue-500 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{device.name} Options</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            {/* Connect button - only show if device has Bluetooth ID and is not connected */}
            {device.bluetoothDeviceId && !device.isConnected && (
              <Button
                variant="outline"
                className="justify-start text-left h-auto py-4 px-5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 rounded-lg"
                onClick={async () => {
                  if (!onConnect) return
                  setIsConnecting(true)
                  try {
                    await onConnect(device)
                  } catch (error) {
                    console.error("Failed to connect to device:", error)
                  } finally {
                    setIsConnecting(false)
                    setShowMenu(false)
                  }
                }}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-base font-medium">Connecting...</span>
                  </>
                ) : (
                  <>
                    <Bluetooth className="w-4 h-4 mr-2" />
                    <span className="text-base font-medium">Connect</span>
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              className="justify-start text-left h-auto py-4 px-5 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 rounded-lg"
              onClick={() => {
                setShowMenu(false)
                setShowNotificationSettings(true)
              }}
            >
              <span className="text-base font-medium">Notifications</span>
            </Button>
            <Button
              variant="outline"
              className="justify-start text-left h-auto py-4 px-5 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 rounded-lg"
              onClick={() => {
                setShowMenu(false)
                // Handle rename
              }}
            >
              <span className="text-base font-medium">Rename</span>
            </Button>
            <Button
              variant="outline"
              className="justify-start text-left h-auto py-4 px-5 hover:bg-destructive/10 text-destructive border-destructive/20 hover:border-destructive/40 transition-all duration-200 rounded-lg"
              onClick={() => {
                onDelete?.(device.id)
                setShowMenu(false)
              }}
            >
              <span className="text-base font-medium">Delete</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLocation} onOpenChange={setShowLocation}>
        <DialogContent className="sm:max-w-md bg-card border-blue-500 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 rounded-lg bg-primary/10">
                <Map className="h-5 w-5 text-primary" />
              </div>
              {device.name} Location
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Device Name</p>
                <p className="text-base font-medium text-foreground">{device.name}</p>
              </div>

              {/* Map Section */}
              {device.location ? (
                <>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="relative w-full h-48 bg-muted/30">
                      {/* Calculate bounding box around device location */}
                      {(() => {
                        const lat = device.location.lat
                        const lng = device.location.lng
                        const offset = 0.01 // ~1km
                        const bbox = `${lng - offset},${lat - offset},${lng + offset},${lat + offset}`
                        const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
                        return (
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src={mapUrl}
                            className="w-full h-full"
                            title="Device location map"
                          />
                        )
                      })()}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Coordinates</p>
                    <p className="text-base font-medium text-foreground">
                      {device.location.lat.toFixed(6)}, {device.location.lng.toFixed(6)}
                    </p>
                  </div>

                  {/* Open in Maps Button */}
                  <Button
                    onClick={() => {
                      // Open in native maps app using coordinates
                      const lat = device.location!.lat
                      const lng = device.location!.lng
                      // Try to detect platform and use appropriate map URL
                      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
                      const isAndroid = /Android/.test(navigator.userAgent)
                      
                      if (isIOS) {
                        // Open in Apple Maps
                        window.open(`maps://maps.apple.com/?ll=${lat},${lng}`, '_blank')
                      } else if (isAndroid) {
                        // Open in Google Maps Android
                        window.open(`geo:${lat},${lng}?q=${lat},${lng}`, '_blank')
                      } else {
                        // Fallback to Google Maps web
                        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
                      }
                    }}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Navigation className="h-4 w-4" />
                    Open in Maps
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-muted/50 border border-border text-center">
                  <p className="text-sm text-muted-foreground">Location not available yet</p>
                  <p className="text-xs text-muted-foreground mt-2">Location will appear once the device is tracked</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 px-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Distance: <span className="font-semibold">{formatDistance()}</span>
                </span>
              </div>
              <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground text-center font-medium">
                  Last updated: {formatTimestamp(device.lastSeen)}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NotificationSettingsModal
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
        deviceName={device.name}
        onSave={(settings: NotificationSettings) => {
          // Handle saving notification settings
          // You can store these in localStorage, state, or pass to parent component
          console.log("Notification settings saved:", settings)
          // Optionally update device or call a callback
        }}
      />
    </>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Plus, X, MoreVertical } from "lucide-react"
import DeviceCard from "./device-card"
import PairingModal from "./pairing-modal"

interface Device {
  id: string
  name: string
  type: "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop"
  signalStrength: number
  isConnected: boolean
  distance: string
  lastSeen: string
  latitude?: number
  longitude?: number
  battery?: number
}

interface FindMyMapProps {
  devices: Device[]
  onDeviceUpdate: (device: Device) => void
  onDeviceDelete: (deviceId: string) => void
  onDevicePaired: (device: Device) => void
  onLogout: () => void
}

export default function FindMyMap({
  devices,
  onDeviceUpdate,
  onDeviceDelete,
  onDevicePaired,
  onLogout,
}: FindMyMapProps) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [showPairingModal, setShowPairingModal] = useState(false)
  const [isListExpanded, setIsListExpanded] = useState(false)

  // Device locations (mock coordinates - in production these would come from your data)
  const deviceLocations: Record<string, { lat: number; lng: number }> = {
    "1": { lat: 37.7749, lng: -122.4194 }, // San Francisco
    "2": { lat: 37.7849, lng: -122.4094 }, // Slightly north
    "3": { lat: 37.7649, lng: -122.4294 }, // Slightly south
  }

  const getMapUrl = () => {
    // Calculate bounds to show all devices
    const lats = devices.map((d) => deviceLocations[d.id]?.lat || 37.7749)
    const lngs = devices.map((d) => deviceLocations[d.id]?.lng || -122.4194)
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
    
    // Create bounding box
    const minLat = Math.min(...lats) - 0.01
    const maxLat = Math.max(...lats) + 0.01
    const minLng = Math.min(...lngs) - 0.01
    const maxLng = Math.max(...lngs) + 0.01
    
    // Build markers parameter
    const markers = devices.map((d) => {
      const loc = deviceLocations[d.id]
      if (!loc) return ""
      return `${loc.lat},${loc.lng}`
    }).filter(Boolean).join("|")
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${centerLat},${centerLng}`
  }

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

  return (
    <div className="relative h-screen w-screen bg-white overflow-hidden">
      {/* Map Container - Full Screen */}
      <div className="absolute inset-0">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={getMapUrl()}
          className="w-full h-full"
          title="Device map"
        />
        
        {/* Map Overlay - Device Markers */}
        <div className="absolute inset-0 pointer-events-none">
          {devices.map((device) => {
            const loc = deviceLocations[device.id]
            if (!loc) return null
            
            // Convert lat/lng to pixel position (simplified - in production use proper map projection)
            const latPercent = ((loc.lat - 37.7649) / (37.7849 - 37.7649)) * 100
            const lngPercent = ((loc.lng - (-122.4294)) / (-122.4094 - (-122.4294))) * 100
            
            return (
              <div
                key={device.id}
                className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${lngPercent}%`,
                  top: `${latPercent}%`,
                }}
                onClick={() => setSelectedDevice(device)}
              >
                <div className={`
                  w-12 h-12 rounded-full bg-white border-2 shadow-lg flex items-center justify-center
                  transition-all duration-200 hover:scale-110
                  ${device.isConnected ? "border-green-500" : "border-gray-400"}
                  ${selectedDevice?.id === device.id ? "ring-4 ring-blue-500 ring-opacity-50" : ""}
                `}>
                  <span className="text-2xl">{getDeviceIcon(device.type)}</span>
                </div>
                {device.isConnected && (
                  <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Header - Minimal Find My Style */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-semibold text-gray-900">Devices</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowPairingModal(true)}
              className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Sheet - Device List (Find My Style) */}
      <div className={`
        absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl
        transition-all duration-300 ease-out
        ${isListExpanded ? "h-[85vh]" : "h-[45vh]"}
      `}>
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <button
            onClick={() => setIsListExpanded(!isListExpanded)}
            className="w-12 h-1 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors"
          />
        </div>

        {/* List Header */}
        <div className="px-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {devices.length} {devices.length === 1 ? "Device" : "Devices"}
            </h2>
            {selectedDevice && (
              <Button
                onClick={() => setSelectedDevice(null)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Device List */}
        <div className="overflow-y-auto h-full pb-4" style={{ maxHeight: "calc(100% - 80px)" }}>
          <div className="px-4 pt-4 space-y-3">
            {devices.map((device) => (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                className={`
                  bg-white rounded-2xl border-2 p-4 cursor-pointer
                  transition-all duration-200
                  ${selectedDevice?.id === device.id 
                    ? "border-blue-500 shadow-lg" 
                    : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-14 h-14 rounded-full flex items-center justify-center text-3xl
                    ${device.isConnected ? "bg-green-50 border-2 border-green-500" : "bg-gray-50 border-2 border-gray-300"}
                  `}>
                    {getDeviceIcon(device.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{device.name}</h3>
                      {device.isConnected && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {device.isConnected ? "Connected" : "Offline"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle menu
                    }}
                  >
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pairing Modal */}
      <PairingModal
        isOpen={showPairingModal}
        onClose={() => setShowPairingModal(false)}
        onDevicePaired={onDevicePaired}
      />
    </div>
  )
}

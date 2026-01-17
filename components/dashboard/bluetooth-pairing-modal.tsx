"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Bluetooth, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useBluetooth, BluetoothDevice as BTDevice } from "@/lib/hooks/use-bluetooth"
import { getBrowserInfo, isSafari } from "@/src/lib/browser-detection"

interface BluetoothPairingModalProps {
  isOpen: boolean
  onClose: () => void
  onDevicePaired: (device: {
    id: string
    name: string
    type: "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop"
    status: "connected" | "nearby" | "away"
    battery: number
    signal: number
    lastSeen: string
    bluetoothDeviceId?: string
    bluetoothDeviceName?: string
  }) => void
  deviceType: "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop"
}

export default function BluetoothPairingModal({
  isOpen,
  onClose,
  onDevicePaired,
  deviceType,
}: BluetoothPairingModalProps) {
  const [step, setStep] = useState<"scan" | "results" | "name" | "pairing" | "success">("scan")
  const [scannedDevices, setScannedDevices] = useState<BTDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<BTDevice | null>(null)
  const [deviceName, setDeviceName] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bluetooth = useBluetooth()
  const browserInfo = getBrowserInfo()

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("scan")
      setScannedDevices([]) // Clear all devices - start fresh
      setSelectedDevice(null)
      setDeviceName("")
      setError(null)
      setIsScanning(false)
      console.log("[Bluetooth] Modal opened - cleared device list")
    }
  }, [isOpen])

  const handleStartScan = useCallback(async () => {
    setIsScanning(true)
    setError(null)
    setStep("scan")

    if (!bluetooth.isSupported) {
      if (isSafari()) {
        setError("Safari doesn't support Web Bluetooth. Please use Chrome/Edge or the Phone Buddy mobile app.")
      } else {
        setError("Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.")
      }
      setIsScanning(false)
      return
    }

    try {
      // Web Bluetooth API: requestDevice() immediately shows the browser's device picker
      // The browser will scan for and display available BLE devices
      // User must select a device from the browser's picker dialog
      // IMPORTANT: requestDevice() only returns ONE device - the one you select
      // If you see multiple devices, that's Chrome's picker UI, not our app
      console.log("[Bluetooth] Starting Web Bluetooth scan - Chrome picker will open")
      
      // Phone Buddy service UUID - matches mobile app advertising
      const PHONE_BUDDY_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
      
      // Try to filter for Phone Buddy service first (if iPhone is advertising)
      // Fallback to acceptAllDevices if no Phone Buddy devices found
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [PHONE_BUDDY_SERVICE_UUID] }, // Phone Buddy service
          { name: "Phone Buddy" }, // Or by name
          { namePrefix: "iPhone" }, // Or iPhone devices
        ],
        optionalServices: [
          PHONE_BUDDY_SERVICE_UUID,
          "battery_service", 
          "device_information"
        ],
      }).catch(async (error) => {
        // If filtering fails, try acceptAllDevices as fallback
        if (error.name === 'NotFoundError') {
          console.log("[Bluetooth] No Phone Buddy devices found, scanning all devices...");
          return navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [PHONE_BUDDY_SERVICE_UUID, "battery_service", "device_information"],
          });
        }
        throw error;
      })

      if (device) {
        // User selected a device from the browser picker
        // Web Bluetooth API only returns ONE device at a time
        console.log("[Bluetooth] Device selected from Chrome picker:", device.name, device.id)
        const selectedDevice: BTDevice = {
          id: device.id,
          name: device.name || "Unknown Device",
          rssi: undefined, // RSSI not available via Web Bluetooth API - if you see RSSI values, something is wrong
        }
        
        // Clear any previous devices and set only the one selected
        setScannedDevices([selectedDevice])
        setIsScanning(false)
        setStep("results")
        
        // Update Bluetooth state to reflect permission granted
        localStorage.setItem("bluetoothPermissionGranted", "true")
      } else {
        console.log("[Bluetooth] No device selected")
        setIsScanning(false)
        setError("No device selected")
      }
    } catch (err: any) {
      if (err.name === "NotFoundError") {
        // User cancelled the device picker - this is normal
        setError("No device selected. The browser's device picker will show available Bluetooth devices. Make sure your device is in pairing mode and Bluetooth is enabled.")
      } else if (err.name === "SecurityError") {
        setError("Bluetooth permission denied. Please check your browser settings and allow Bluetooth access.")
      } else if (err.name === "NetworkError") {
        setError("Bluetooth connection failed. Please ensure Bluetooth is enabled on your device and the target device is in pairing mode.")
      } else {
        setError(err.message || "Failed to scan for Bluetooth devices. Make sure Bluetooth is enabled and devices are in pairing mode.")
      }
      setIsScanning(false)
    }
  }, [bluetooth])

  const handleDeviceSelect = (device: BTDevice) => {
    setSelectedDevice(device)
    setDeviceName(device.name)
    setStep("name")
  }

  const handleConfirmPairing = async () => {
    if (!selectedDevice || !deviceName.trim()) return

    setStep("pairing")
    setError(null)

    try {
      // Import Bluetooth connection manager
      const { connectToPairedDevice } = await import("@/lib/bluetooth-connection")
      
      // Actually connect to the Bluetooth device FIRST
      // Only proceed if connection succeeds
      let connection = null
      let isActuallyConnected = false
      try {
        connection = await connectToPairedDevice(
          selectedDevice.id,
          selectedDevice.name
        )
        // Verify connection is actually established
        if (connection && connection.server && connection.server.connected) {
          isActuallyConnected = true
        } else {
          throw new Error("Bluetooth connection not established")
        }
      } catch (connectError: any) {
        // If connection fails, don't save the device - show error and return
        console.error("Bluetooth connection failed:", connectError)
        setError(`Failed to connect to ${selectedDevice.name}. Make sure the device is in pairing mode and Bluetooth is enabled.`)
        setStep("name")
        return
      }

      // Only proceed if connection was actually established
      if (!isActuallyConnected) {
        setError("Failed to establish Bluetooth connection")
        setStep("name")
        return
      }

      // Create the paired device object to pass to parent
      // Only created if Bluetooth connection succeeded
      const pairedDevice = {
        id: selectedDevice.id, // Use the actual Bluetooth device ID
        name: deviceName.trim(),
        type: deviceType, // Pass the actual device type (phone, tablet, watch, etc.)
        status: "connected" as const, // Only set to connected since we verified connection
        battery: undefined, // Will be updated when device connects
        signal: selectedDevice.rssi ? Math.max(1, Math.min(5, Math.floor((selectedDevice.rssi + 100) / 20))) : undefined,
        lastSeen: new Date().toISOString(),
        bluetoothDeviceId: selectedDevice.id,
        bluetoothDeviceName: selectedDevice.name,
      }

      // Store pairing in localStorage for persistence
      const pairings = JSON.parse(localStorage.getItem("devicePairings") || "{}")
      pairings[pairedDevice.id] = {
        bluetoothDeviceId: selectedDevice.id,
        bluetoothDeviceName: selectedDevice.name,
        pairedAt: new Date().toISOString(),
        connected: true, // Always true here since we verified connection
      }
      localStorage.setItem("devicePairings", JSON.stringify(pairings))

      setStep("success")
      
      // Auto-close after showing success
      setTimeout(() => {
        onDevicePaired(pairedDevice)
        resetModal()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to pair device")
      setStep("name")
    }
  }

  const resetModal = () => {
    setStep("scan")
    setSelectedDevice(null)
    setDeviceName("")
    setScannedDevices([])
    setError(null)
    setIsScanning(false)
  }

  const handleClose = () => {
    if (step === "pairing") return // Prevent closing during pairing
    resetModal()
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-blue-500 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bluetooth className="h-5 w-5 text-primary" />
            </div>
            Pair Bluetooth Device
          </DialogTitle>
          <DialogDescription>
            Connect your {deviceType} with a Bluetooth device
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Scanning Step */}
          {step === "scan" && (
            <div className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">{error}</p>
                    {isSafari() && (
                      <p className="text-xs text-destructive/80 mt-1">
                        Use the Phone Buddy mobile app for full Bluetooth functionality.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Bluetooth className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Scan</h3>
                <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
                  Click "Start Scanning" to open Chrome's Bluetooth device picker
                </p>
                <p className="text-xs text-muted-foreground text-center mb-6 max-w-sm px-4">
                  Chrome's picker will show all nearby devices. Select one device, then it will appear in the app. 
                  <strong> Chrome's picker shows real devices - not placeholders.</strong>
                </p>
                <Button
                  onClick={handleStartScan}
                  disabled={isScanning || !bluetooth.isSupported}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    "Start Scanning"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Results Step */}
          {step === "results" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Available Devices</h3>
                  <p className="text-sm text-muted-foreground">
                    Found {scannedDevices.length} device{scannedDevices.length !== 1 ? "s" : ""} from Chrome's Bluetooth scanner
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    These are real nearby Bluetooth devices. If your device isn't listed, make sure it's discoverable.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartScan}
                  className="text-xs"
                >
                  Rescan
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {scannedDevices.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-muted-foreground">No devices found</p>
                    <Button
                      variant="outline"
                      onClick={handleStartScan}
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  scannedDevices.map((device) => (
                    <Card
                      key={device.id}
                      onClick={() => handleDeviceSelect(device)}
                      className="p-4 border-border/50 hover:border-primary/40 hover:bg-accent/50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{device.name}</p>
                          {device.rssi !== undefined ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              Signal: {device.rssi} dBm
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                              Bluetooth device detected
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {device.rssi !== undefined && (
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((bar) => {
                                const signalStrength = Math.max(1, Math.min(5, Math.floor((device.rssi! + 100) / 20)))
                                return (
                                  <div
                                    key={bar}
                                    className={`w-1 h-4 rounded-sm ${
                                      bar <= signalStrength
                                        ? "bg-primary"
                                        : "bg-muted"
                                    }`}
                                  />
                                )
                              })}
                            </div>
                          )}
                          <Button variant="ghost" size="sm" className="ml-2">
                            Select
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              <Button
                onClick={() => setStep("scan")}
                variant="outline"
                className="w-full"
              >
                Back
              </Button>
            </div>
          )}

          {/* Name Step */}
          {step === "name" && selectedDevice && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Selected Device</p>
                <p className="text-base font-semibold text-foreground">{selectedDevice.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Signal: {selectedDevice.rssi} dBm
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Device Name
                </label>
                <Input
                  type="text"
                  placeholder={`My ${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}`}
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && deviceName.trim()) {
                      handleConfirmPairing()
                    }
                  }}
                  className="bg-background border-border text-foreground"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This name will be displayed on your device card
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmPairing}
                  disabled={!deviceName.trim()}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  Pair Device
                </Button>
                <Button
                  onClick={() => setStep("results")}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Pairing Step */}
          {step === "pairing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bluetooth className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Pairing Device...</h3>
              <p className="text-sm text-muted-foreground text-center">
                Please wait while we connect to {selectedDevice?.name}
              </p>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Device Paired!</h3>
              <p className="text-sm text-muted-foreground text-center">
                {deviceName} is now connected
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

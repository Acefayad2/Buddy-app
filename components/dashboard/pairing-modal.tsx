"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface BluetoothDevice {
  id: string
  name: string
  rssi: number
  type: "phone" | "keys" | "earbuds" | "laptop" | "unknown"
}

interface PairingModalProps {
  isOpen: boolean
  onClose: () => void
  onDevicePaired: (device: any) => void
}

export default function PairingModal({ isOpen, onClose, onDevicePaired }: PairingModalProps) {
  const [step, setStep] = useState<"mode" | "scan" | "results" | "name">("mode")
  const [scannedDevices, setScannedDevices] = useState<BluetoothDevice[]>([
    { id: "1", name: "Device_ABCD12", rssi: -65, type: "phone" },
    { id: "2", name: "Device_XYZ789", rssi: -78, type: "earbuds" },
    { id: "3", name: "Device_KEY456", rssi: -85, type: "keys" },
  ])
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null)
  const [deviceName, setDeviceName] = useState("")
  const [isScanning, setIsScanning] = useState(false)

  if (!isOpen) return null

  const handleStartScan = () => {
    setIsScanning(true)
    setStep("scan")
    // Simulate scanning
    setTimeout(() => {
      setIsScanning(false)
      setStep("results")
    }, 2500)
  }

  const handleDeviceSelect = (device: BluetoothDevice) => {
    setSelectedDevice(device)
    setDeviceName(device.name)
    setStep("name")
  }

  const handleConfirmPairing = () => {
    if (selectedDevice && deviceName) {
      onDevicePaired({
        id: Date.now().toString(),
        name: deviceName,
        type: selectedDevice.type,
        signalStrength: selectedDevice.rssi,
        isConnected: true,
        distance: "5 m",
        lastSeen: new Date().toISOString(),
      })
      resetModal()
    }
  }

  const resetModal = () => {
    setStep("mode")
    setSelectedDevice(null)
    setDeviceName("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-card border-blue-500 w-full max-w-md">
        <div className="p-6">
          {/* Mode Selection */}
          {step === "mode" && (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-2">Pair New Device</h2>
              <p className="text-muted-foreground mb-6">Choose how to add a device</p>

              <div className="space-y-3">
                <Button
                  onClick={handleStartScan}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-medium"
                >
                  Scan for Devices
                </Button>
                <Button
                  onClick={() => setStep("name")}
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-secondary/20 h-12"
                >
                  Manual Entry
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-secondary/20 h-12 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {/* Scanning */}
          {step === "scan" && (
            <>
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 mb-4 rounded-lg bg-secondary/30 flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Scanning...</h3>
                <p className="text-sm text-muted-foreground text-center">Make sure your device is in pairing mode</p>
              </div>
            </>
          )}

          {/* Results */}
          {step === "results" && (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-1">Available Devices</h3>
              <p className="text-sm text-muted-foreground mb-4">Found {scannedDevices.length} device(s)</p>

              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {scannedDevices.map((device) => (
                  <div
                    key={device.id}
                    onClick={() => handleDeviceSelect(device)}
                    className="p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{device.name}</p>
                        <p className="text-xs text-muted-foreground">{device.rssi} dBm</p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`w-1 h-3 rounded-sm ${
                              bar <= (device.rssi >= -60 ? 3 : device.rssi >= -75 ? 2 : 1)
                                ? "bg-accent"
                                : "bg-secondary/50"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setStep("mode")}
                variant="outline"
                className="w-full border-border text-foreground hover:bg-secondary/20"
              >
                Back
              </Button>
            </>
          )}

          {/* Name Selection */}
          {step === "name" && (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-1">Name Your Device</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedDevice ? `Connected to ${selectedDevice.name}` : "Enter a device name"}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Device Name</label>
                <Input
                  type="text"
                  placeholder="My iPhone"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="bg-secondary/30 border-border text-foreground"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleConfirmPairing}
                  disabled={!deviceName.trim()}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-medium disabled:opacity-50"
                >
                  Pair Device
                </Button>
                <Button
                  onClick={() => {
                    if (selectedDevice) {
                      setStep("results")
                    } else {
                      setStep("mode")
                    }
                  }}
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-secondary/20"
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bluetooth, Check } from "lucide-react"
import { useBluetooth } from "@/lib/hooks/use-bluetooth"
import { isSafari, getBrowserInfo } from "@/src/lib/browser-detection"
import { Alert, AlertDescription } from "@/components/ui/alert"

type PairingStep = "select" | "scanning" | "confirm" | "complete"

interface DiscoveredDevice {
  id: string
  name: string
  type: "phone" | "tablet" | "watch"
  signal: number
}

export default function PairDevicePage() {
  const router = useRouter()
  const [step, setStep] = useState<PairingStep>("select")
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredDevice | null>(null)
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([])
  const bluetooth = useBluetooth()
  const browserInfo = getBrowserInfo()

  const handleStartPairing = () => {
    if (!bluetooth.isSupported && !isSafari()) {
      return
    }
    
    setStep("scanning")
    // Mock scanning for now
    setTimeout(() => {
      setDiscoveredDevices([
        { id: "1", name: "John's Samsung S24", type: "phone", signal: 5 },
        { id: "2", name: "Work iPad", type: "tablet", signal: 4 },
        { id: "3", name: "Fitness Watch", type: "watch", signal: 3 },
      ])
      setStep("select")
    }, 2000)
  }

  const handleSelectDevice = (device: DiscoveredDevice) => {
    setSelectedDevice(device)
    setStep("confirm")
  }

  const handleConfirmPairing = () => {
    setStep("complete")
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {isSafari() && (
        <Alert className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
            Safari doesn't support Web Bluetooth. You can still add devices manually or use the Phone Buddy mobile app for Bluetooth scanning.
          </AlertDescription>
        </Alert>
      )}

      {step === "select" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Add New Device</h1>
            <p className="text-muted-foreground">Select a device to pair with Phone Buddy</p>
          </div>

          {discoveredDevices.length > 0 ? (
            <div className="grid gap-3">
              {discoveredDevices.map((device) => (
                <Card
                  key={device.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSelectDevice(device)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {device.type === "phone" && "📱"}
                        {device.type === "tablet" && "📱"}
                        {device.type === "watch" && "⌚"}
                      </div>
                      <div>
                        <p className="font-semibold">{device.name}</p>
                        <p className="text-sm text-muted-foreground">Signal: {device.signal}/5</p>
                      </div>
                    </div>
                    <Badge variant="outline">Select</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          <Card className="border-dashed">
            <CardContent className="p-6 text-center space-y-4">
              <Bluetooth className="w-8 h-8 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium">Don't see your device?</p>
                <p className="text-sm text-muted-foreground">
                  {isSafari() 
                    ? "Use the Phone Buddy mobile app for Bluetooth scanning, or add devices manually."
                    : "Make sure Bluetooth is enabled on your device"}
                </p>
              </div>
              {!isSafari() && bluetooth.isSupported && (
                <Button variant="outline" onClick={handleStartPairing} className="w-full bg-transparent">
                  Scan for Devices
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === "scanning" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin"></div>
                  <Bluetooth className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-lg">Scanning for devices...</p>
                <p className="text-sm text-muted-foreground">Please wait a moment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "confirm" && selectedDevice && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Confirm Pairing</h1>
            <p className="text-muted-foreground">Ready to pair with {selectedDevice.name}</p>
          </div>

          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-5xl">
                {selectedDevice.type === "phone" && "📱"}
                {selectedDevice.type === "tablet" && "📱"}
                {selectedDevice.type === "watch" && "⌚"}
              </div>
              <div>
                <p className="font-semibold text-xl">{selectedDevice.name}</p>
                <p className="text-sm text-muted-foreground">Signal strength: {selectedDevice.signal}/5</p>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <p className="text-sm">
                  Once confirmed, this device will be added to your Phone Buddy network and receive proximity alerts.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirmPairing} className="flex-1">
              Confirm & Pair
            </Button>
          </div>
        </div>
      )}

      {step === "complete" && selectedDevice && (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-500 p-3 rounded-full">
                  <Check className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-lg text-green-900 dark:text-green-100">Device Successfully Paired!</p>
                <p className="text-sm text-green-700 dark:text-green-200 mt-2">
                  {selectedDevice.name} is now connected to your Phone Buddy network
                </p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleFinish} className="w-full" size="lg">
            Go to Dashboard
          </Button>
        </div>
      )}
    </div>
  )
}


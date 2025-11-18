"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Smartphone, Wifi, Bell, Star, Bluetooth } from "lucide-react"
import { useBluetooth } from "@/lib/hooks/use-bluetooth"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function IntroPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [bluetoothGranted, setBluetoothGranted] = useState(false)
  const bluetooth = useBluetooth()

  const steps = [
    {
      title: "Welcome to Phone Buddy! 👋",
      description: "Buddy will keep you connected",
      emoji: "😊",
      icon: Smartphone,
      message: "Hey there! I'm Phone Buddy, your super friendly guide! I'm here to help you never lose your devices again!",
    },
    {
      title: "Enable Bluetooth 📶",
      description: "Connect to your devices",
      emoji: "📶",
      icon: Bluetooth,
      message: "To track your devices, I need access to Bluetooth! This lets me find and connect to your phones, tablets, and watches. Please enable Bluetooth in your device settings and grant permission when prompted!",
      requiresBluetooth: true,
    },
    {
      title: "Track Your Devices 📱",
      description: "See all your devices in one place",
      emoji: "📱",
      icon: Wifi,
      message: "Keep an eye on all your phones, tablets, and watches! I'll show you exactly where they are and how they're doing!",
    },
    {
      title: "Get Smart Alerts 🔔",
      description: "Never lose a device again",
      emoji: "🔔",
      icon: Bell,
      message: "I'll alert you when you move away from your devices! No more lost phones or forgotten tablets!",
    },
    {
      title: "Ready to Start? 🎉",
      description: "Let's get you connected!",
      emoji: "✨",
      icon: Sparkles,
      message: "Awesome! You're all set! Let's dive into the app and I'll show you around!",
    },
  ]

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 600)
    return () => clearTimeout(timer)
  }, [currentStep])

  // Check if Bluetooth was already granted
  useEffect(() => {
    if (typeof window !== "undefined") {
      const wasGranted = localStorage.getItem("bluetoothPermissionGranted") === "true"
      if (wasGranted) {
        setBluetoothGranted(true)
      }
    }
  }, [])

  const handleRequestBluetooth = async () => {
    const granted = await bluetooth.requestBluetoothPermission()
    if (granted) {
      setBluetoothGranted(true)
      // Save Bluetooth permission status
      if (typeof window !== "undefined") {
        localStorage.setItem("bluetoothPermissionGranted", "true")
      }
    }
  }

  const handleNext = () => {
    const currentStepData = steps[currentStep]
    
    // If this step requires Bluetooth and it's not granted, don't proceed
    if (currentStepData.requiresBluetooth && !bluetoothGranted && !bluetooth.isEnabled) {
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Mark that we've completed intro and set checking flag
      // This allows navigation to dashboard
      if (typeof window !== "undefined") {
        sessionStorage.setItem("introCompleted", "true")
        sessionStorage.setItem("checkingIntro", "true")
      }
      router.push("/dashboard")
    }
  }

  const handleSkip = () => {
    // Mark that we've skipped intro and set checking flag
    // This allows navigation to dashboard
    if (typeof window !== "undefined") {
      sessionStorage.setItem("introCompleted", "true")
      sessionStorage.setItem("checkingIntro", "true")
    }
    router.push("/dashboard")
  }

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 flex items-center justify-center p-6">
      {/* Floating sparkles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0s" }} />
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 right-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "1.5s" }} />
      </div>

      <Card className={`w-full max-w-md shadow-2xl border-4 border-white/50 bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-900/70 backdrop-blur-sm rounded-3xl overflow-hidden ${
        isAnimating ? "animate-[bounceIn_0.6s_ease-out]" : ""
      }`}>
        <div className="p-8 space-y-6">
          {/* Phone Buddy Character */}
          <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl border-4 border-white flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                  <span className="text-6xl relative z-10 animate-[bounce_2s_ease-in-out_infinite]">
                    {currentStepData.emoji}
                  </span>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0s" }} />
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                </div>
                <Star className="absolute -top-4 -left-4 w-6 h-6 text-blue-400 animate-spin" style={{ animationDuration: "3s" }} />
                <Star className="absolute -bottom-4 -right-4 w-5 h-5 text-blue-300 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }} />
              </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-2xl shadow-lg">
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {currentStepData.title}
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              {currentStepData.description}
            </p>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 border-2 border-white/50 shadow-lg mt-4">
              <p className="text-sm text-foreground leading-relaxed">
                {currentStepData.message}
              </p>
            </div>
            
            {/* Bluetooth Permission Section */}
            {currentStepData.requiresBluetooth && (
              <div className="mt-4 space-y-3">
                {!bluetooth.isSupported && (
                  <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                    <AlertDescription className="text-sm text-yellow-900 dark:text-yellow-100">
                      Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera for the best experience.
                    </AlertDescription>
                  </Alert>
                )}
                
                {bluetooth.error && (
                  <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                    <AlertDescription className="text-sm text-red-900 dark:text-red-100">
                      {bluetooth.error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {bluetoothGranted || bluetooth.isEnabled ? (
                  <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <AlertDescription className="text-sm text-green-900 dark:text-green-100 flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      Bluetooth permission granted! You can now connect to your devices.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Button
                    onClick={handleRequestBluetooth}
                    disabled={bluetooth.isRequesting || !bluetooth.isSupported}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg border-2 border-white/30"
                    size="lg"
                  >
                    {bluetooth.isRequesting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Requesting Permission...
                      </>
                    ) : (
                      <>
                        <Bluetooth className="w-4 h-4 mr-2" />
                        Enable Bluetooth Access
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 w-8"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleNext}
              disabled={currentStepData.requiresBluetooth && !bluetoothGranted && !bluetooth.isEnabled}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg border-2 border-white/30 text-lg font-semibold py-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {currentStep === steps.length - 1 ? "Get Started! 🎉" : "Next →"}
            </Button>
            {currentStep < steps.length - 1 && (
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Skip Intro
              </Button>
            )}
          </div>
        </div>
      </Card>

      <style jsx>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.3) translateY(50px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }
      `}</style>
    </div>
  )
}


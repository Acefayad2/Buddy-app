"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { X, Sparkles, Star, ArrowRight, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface TourStep {
  id: string
  target?: string // CSS selector for element to highlight
  title: string
  message: string
  emoji: string
  expression: string
  position?: "top" | "bottom" | "left" | "right" | "center"
}

const tourSteps: Record<string, TourStep[]> = {
  "/dashboard": [
    {
      id: "welcome",
      title: "Welcome! 👋",
      message: "Hey there, superstar! I'm Phone Buddy, your friendly guide! Let me show you around this amazing app! Ready for a tour? 🎉",
      emoji: "👋",
      expression: "😊",
      position: "center",
    },
    {
      id: "devices",
      target: "[data-tour='devices']",
      title: "Your Devices 📱",
      message: "Look at all these awesome devices! Each card shows your device's status, battery, and connection. Pretty cool, right? ✨",
      emoji: "📱",
      expression: "🤩",
      position: "top",
    },
    {
      id: "add-device",
      target: "[data-tour='add-device']",
      title: "Add New Device 🎯",
      message: "Want to add a new device? Just tap this sparkly button! I'll help you pair it in no time! 🔗",
      emoji: "➕",
      expression: "😄",
      position: "top",
    },
    {
      id: "stats",
      target: "[data-tour='stats']",
      title: "Quick Stats 📊",
      message: "Check out these stats! See how many devices are connected, nearby, and your total count. Super handy! 📈",
      emoji: "📊",
      expression: "😎",
      position: "top",
    },
  ],
  "/dashboard/pair-device": [
    {
      id: "pairing",
      title: "Pairing Time! 🔗",
      message: "Oh wow, this is exciting! Let's pair a new device together! Make sure Bluetooth is on and we'll get you connected super fast! 🎊",
      emoji: "🔗",
      expression: "🤩",
      position: "center",
    },
  ],
}

export function PhoneBuddyTour() {
  const pathname = usePathname()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const tourCompletedKey = "phoneBuddyTourCompleted"
  const tourStepsForPath = tourSteps[pathname] || []

  useEffect(() => {
    // Check if tour was already completed
    const wasCompleted = sessionStorage.getItem(`${tourCompletedKey}_${pathname}`)
    if (wasCompleted === "true") {
      setIsVisible(false)
      return
    }

    // Show tour after a short delay
    const timer = setTimeout(() => {
      if (tourStepsForPath.length > 0) {
        setIsVisible(true)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 600)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    if (!isVisible || tourStepsForPath.length === 0) return

    const step = tourStepsForPath[currentStep]
    if (step?.target) {
      const element = document.querySelector(step.target) as HTMLElement
      if (element) {
        setHighlightedElement(element)
        // Scroll element into view
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    } else {
      setHighlightedElement(null)
    }
  }, [currentStep, isVisible, tourStepsForPath])

  const handleNext = () => {
    if (currentStep < tourStepsForPath.length - 1) {
      setIsAnimating(true)
      setCurrentStep(currentStep + 1)
      setTimeout(() => setIsAnimating(false), 600)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    sessionStorage.setItem(`${tourCompletedKey}_${pathname}`, "true")
    setIsVisible(false)
    setHighlightedElement(null)
  }

  if (!isVisible || tourStepsForPath.length === 0) return null

  const step = tourStepsForPath[currentStep]
  if (!step) return null

  // Calculate position based on highlighted element
  let position = step.position || "bottom"
  let top = "auto"
  let bottom = "6rem"
  let left = "auto"
  let right = "1.5rem"

  if (highlightedElement) {
    const rect = highlightedElement.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth
    const cardHeight = 300 // Approximate card height
    const cardWidth = 384 // Max width

    // Position Phone Buddy near the highlighted element
    if (rect.bottom + cardHeight + 40 < windowHeight) {
      // Show below element
      top = `${rect.bottom + 20}px`
      bottom = "auto"
      left = `${Math.max(16, Math.min(rect.left, windowWidth - cardWidth - 16))}px`
      right = "auto"
    } else if (rect.top - cardHeight - 40 > 0) {
      // Show above element
      top = "auto"
      bottom = `${windowHeight - rect.top + 20}px`
      left = `${Math.max(16, Math.min(rect.left, windowWidth - cardWidth - 16))}px`
      right = "auto"
    } else {
      // Center on screen if can't fit above/below
      top = "50%"
      bottom = "auto"
      left = "50%"
      right = "auto"
      position = "center"
    }
  }

  return (
    <>
      {/* Overlay with highlight */}
      {highlightedElement && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute border-4 border-blue-500 rounded-2xl shadow-2xl animate-pulse"
            style={{
              top: `${highlightedElement.getBoundingClientRect().top - 8}px`,
              left: `${highlightedElement.getBoundingClientRect().left - 8}px`,
              width: `${highlightedElement.getBoundingClientRect().width + 16}px`,
              height: `${highlightedElement.getBoundingClientRect().height + 16}px`,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.8)",
            }}
          />
        </div>
      )}

      {/* Phone Buddy */}
      <Card
        data-tour-active="true"
        className={`fixed z-50 w-80 sm:w-96 shadow-2xl border-4 border-white/50 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 backdrop-blur-sm rounded-3xl overflow-hidden phone-buddy-tour ${
          isAnimating ? "animate-[bounceIn_0.6s_ease-out]" : ""
        }`}
        style={{
          top: position === "center" ? "50%" : top,
          bottom: position === "center" ? "auto" : bottom === "6rem" ? "6rem" : bottom,
          left: position === "center" ? "50%" : left,
          right: position === "center" ? "auto" : right,
          transform: position === "center" ? "translate(-50%, -50%)" : "none",
        }}
      >
        <div className="p-5 space-y-4">
          {/* Header with Character */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Candy Crush Style Character Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl border-4 border-white flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                  {/* Character emoji - always thumbs up */}
                  <span className="text-4xl relative z-10 animate-[bounce_2s_ease-in-out_infinite]">
                    👍
                  </span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0s" }} />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                </div>
                <Star className="absolute -top-2 -left-2 w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: "3s" }} />
                <Star className="absolute -bottom-2 -right-2 w-3 h-3 text-blue-300 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }} />
              </div>

              <div className="pt-1">
                <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Phone Buddy
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Step {currentStep + 1} of {tourStepsForPath.length}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0 rounded-full hover:bg-white/50 border-2 border-white/30"
              aria-label="Skip Tour"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Speech Bubble */}
          <div className="relative bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 border-2 border-white/50 shadow-lg backdrop-blur-sm">
            <div className="absolute top-2 right-3">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {step.title}
              </h4>
              <div className="flex items-start gap-3 pr-6">
                <span className="text-3xl flex-shrink-0 animate-[wiggle_1.5s_ease-in-out_infinite]">
                  {step.emoji}
                </span>
                <p className="text-sm text-foreground leading-relaxed flex-1 font-medium">
                  {step.message}
                </p>
              </div>
            </div>

            <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white/90 dark:bg-gray-900/90 border-2 border-white/50 transform rotate-45 shadow-lg" />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsAnimating(true)
                  setCurrentStep(currentStep - 1)
                  setTimeout(() => setIsAnimating(false), 600)
                }}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg"
            >
              {currentStep < tourStepsForPath.length - 1 ? (
                <>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Got it! <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
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

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(10deg) scale(1.1);
          }
          75% {
            transform: rotate(-10deg) scale(1.1);
          }
        }
      `}</style>
    </>
  )
}


"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { X, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Message {
  text: string
  emoji?: string
  expression?: string
}

const contextualMessages: Record<string, Message> = {
  "/dashboard": {
    text: "Hey there, superstar! 👋 Welcome to your amazing device dashboard! Look at all those devices - awesome! Want to add a new one? Just tap that sparkly button below! ✨",
    emoji: "📱",
    expression: "😊",
  },
  "/dashboard/pair-device": {
    text: "Oh wow, this is so exciting! 🎉 Let's pair a new device together! Turn on Bluetooth and we'll get you connected in a flash! I'm here cheering you on! 🎊",
    emoji: "🔗",
    expression: "🤩",
  },
  "/dashboard/settings": {
    text: "Settings time! ⚙️ This is where the magic happens - alerts, notifications, all the cool stuff! Let's make it perfect together! 🌟",
    emoji: "⚙️",
    expression: "😎",
  },
}

// Match device detail pages
const getMessageForPath = (pathname: string): Message => {
  // Exact matches
  if (contextualMessages[pathname]) {
    return contextualMessages[pathname]
  }

  // Device detail pages
  if (pathname.match(/^\/dashboard\/device\/.+/)) {
    return {
      text: "Device settings! 🎯 Perfect spot to configure alerts, distance, and notifications! Need any help? I'm right here for you! 🌟",
      emoji: "⚙️",
      expression: "🤓",
    }
  }

  // Device settings pages
  if (pathname.match(/^\/dashboard\/device\/.+\/settings/)) {
    return {
      text: "Awesome! You're in the device settings! 🎨 Customize your alerts and notifications here. I've got your back if you need anything! 💫",
      emoji: "🎯",
      expression: "😄",
    }
  }

  return defaultMessage
}

const defaultMessage: Message = {
  text: "Hi there, friend! I'm Phone Buddy, your super cheerful guide! 🎉 Buddy will keep you connected - I'm here to help you navigate the app and keep track of all your devices. Let's make this fun! ✨",
  emoji: "👋",
  expression: "😊",
}

export function PhoneBuddy() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<Message>(defaultMessage)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isTourActive, setIsTourActive] = useState(false)

  useEffect(() => {
    // Check if tour is active by checking if tour was completed for this path
    // Tour paths: /dashboard, /dashboard/pair-device
    const tourPaths = ["/dashboard", "/dashboard/pair-device"]
    const hasTour = tourPaths.includes(pathname)
    const tourCompleted = sessionStorage.getItem(`phoneBuddyTourCompleted_${pathname}`)
    // If tour exists for this path and hasn't been completed, hide Phone Buddy
    setIsTourActive(hasTour && !tourCompleted)
  }, [pathname])

  useEffect(() => {
    // Check if user dismissed PhoneBuddy before
    const wasDismissed = localStorage.getItem("phoneBuddyDismissed")
    if (wasDismissed === "true") {
      setIsDismissed(true)
      setIsVisible(false)
    }
  }, [])

  useEffect(() => {
    if (isDismissed) return

    // Get contextual message for current path
    const message = getMessageForPath(pathname)
    setCurrentMessage(message)

    // Show PhoneBuddy with a fun entrance animation
    setIsAnimating(true)
    setIsVisible(true)
    setTimeout(() => setIsAnimating(false), 1000)
  }, [pathname, isDismissed])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    localStorage.setItem("phoneBuddyDismissed", "true")
  }

  const handleShowAgain = () => {
    setIsDismissed(false)
    setIsVisible(true)
    localStorage.removeItem("phoneBuddyDismissed")
  }

  if (isDismissed && !isVisible) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleShowAgain}
          size="lg"
          className="rounded-full w-20 h-20 p-0 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-2xl border-4 border-white/50 animate-bounce"
          aria-label="Show Phone Buddy"
        >
          <div className="relative">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
          </div>
        </Button>
      </div>
    )
  }

  // Hide Phone Buddy if tour is active
  if (!isVisible || isTourActive) return null

  return (
    <>
      {/* Sparkle effects */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
        <div className="absolute -top-4 -left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0s" }} />
        <div className="absolute -top-8 -right-2 w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
        <div className="absolute -bottom-2 -left-8 w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: "1s" }} />
      </div>

      <Card className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 shadow-2xl border-4 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 backdrop-blur-sm rounded-3xl overflow-hidden ${
        isAnimating ? "animate-[bounceIn_0.6s_ease-out]" : ""
      }`}>
        <div className="p-5 space-y-4">
          {/* Header with Character */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Candy Crush Style Character Avatar */}
              <div className="relative">
                {/* Main character circle - Logo colors */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl border-4 border-white flex items-center justify-center relative overflow-hidden">
                  {/* Sparkle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                  
                  {/* Character emoji - always thumbs up */}
                  <span className="text-4xl relative z-10 animate-[bounce_2s_ease-in-out_infinite]">
                    👍
                  </span>
                  
                  {/* Floating particles - Blue tones */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0s" }} />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                </div>
                
                {/* Decorative sparkles around character - Blue tones */}
                <Star className="absolute -top-2 -left-2 w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: "3s" }} />
                <Star className="absolute -bottom-2 -right-2 w-3 h-3 text-blue-300 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }} />
              </div>
              
              <div className="pt-1">
                <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Phone Buddy
                </h3>
                <p className="text-xs text-muted-foreground font-medium">Your cheerful guide ✨</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0 rounded-full hover:bg-white/50 border-2 border-white/30"
              aria-label="Dismiss Phone Buddy"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Speech Bubble with Candy Crush Style */}
          <div className="relative bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 border-2 border-white/50 shadow-lg backdrop-blur-sm">
            {/* Sparkle decoration */}
            <div className="absolute top-2 right-3">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            </div>
            
            <div className="flex items-start gap-3 pr-6">
              {currentMessage.emoji && (
                <span className="text-3xl flex-shrink-0 animate-[wiggle_1.5s_ease-in-out_infinite]">
                  {currentMessage.emoji}
                </span>
              )}
              <p className="text-sm text-foreground leading-relaxed flex-1 font-medium">
                {currentMessage.text}
              </p>
            </div>
            
            {/* Speech bubble tail - Candy Crush style */}
            <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white/90 dark:bg-gray-900/90 border-2 border-white/50 transform rotate-45 shadow-lg" />
          </div>
        </div>
      </Card>

      <style jsx>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.3) translateY(100px);
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

"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ConfettiExplosion } from "./confetti"
import { Sparkles, Trophy, Heart } from "lucide-react"

interface CelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  deviceName: string
}

export function CelebrationModal({ isOpen, onClose, deviceName }: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <>
      {showConfetti && <ConfettiExplosion />}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="border-0 shadow-2xl overflow-hidden p-0">
          <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 text-white">
            <div className="text-center space-y-6 py-12 px-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
                  <Trophy className="w-20 h-20 animate-bounce relative z-10 drop-shadow-lg" />
                  <Sparkles className="w-10 h-10 absolute -top-3 -right-1 text-yellow-300 animate-spin drop-shadow-lg" />
                  <Heart className="w-8 h-8 absolute -bottom-2 -left-2 text-rose-300 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-4xl font-black drop-shadow-lg">Awesome!</h2>
                <p className="text-xl font-bold drop-shadow-md">You've paired your first device!</p>
                <p className="text-lg font-semibold bg-white/20 backdrop-blur rounded-lg py-2 px-4 inline-block">
                  {deviceName}
                </p>
                <p className="text-base opacity-95">Your journey to never losing an item has begun!</p>
              </div>

              <div className="bg-white/25 backdrop-blur-md rounded-2xl p-5 space-y-2 border border-white/30">
                <p className="font-bold text-lg">Keep it up!</p>
                <p className="text-sm opacity-95">
                  Pair more devices to build your connected ecosystem and unlock amazing achievements
                </p>
              </div>

              <Button
                onClick={onClose}
                className="bg-white text-purple-600 hover:bg-blue-50 font-bold text-lg py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Let's Go!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ConfettiExplosion } from "./confetti"
import { Sparkles, Trophy } from "lucide-react"

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
        <DialogContent className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 border-0 text-white shadow-2xl">
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="relative">
                <Trophy className="w-16 h-16 animate-bounce" />
                <Sparkles className="w-8 h-8 absolute -top-2 -right-2 text-yellow-300 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Awesome!</h2>
              <p className="text-lg opacity-90">
                You've paired your first device: <span className="font-semibold">{deviceName}</span>
              </p>
              <p className="text-sm opacity-75">Your journey to never losing an item has begun!</p>
            </div>

            <div className="bg-white/20 backdrop-blur rounded-lg p-4 space-y-2">
              <p className="font-semibold">Keep it up!</p>
              <p className="text-sm opacity-90">
                Pair more devices to build your connected ecosystem and unlock achievements
              </p>
            </div>

            <Button onClick={onClose} className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
              Let's Go!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

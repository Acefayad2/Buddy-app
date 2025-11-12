"use client"

import { useEffect, useRef } from "react"

interface Confetti {
  id: number
  left: number
  delay: number
  duration: number
  color: string
}

export function ConfettiExplosion() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const colors = ["#4F46E5", "#7C3AED", "#06B6D4", "#0EA5E9", "#3B82F6"]
    const confettiPieces: Confetti[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 2 + Math.random() * 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    return () => {
      // Cleanup animation
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none">
      {/* Confetti pieces will be rendered here */}
    </div>
  )
}

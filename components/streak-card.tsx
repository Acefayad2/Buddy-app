"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Flame, Star, Trophy } from "lucide-react"

interface StreakCardProps {
  days: number
  bestStreak?: number
}

export function StreakCard({ days, bestStreak = 7 }: StreakCardProps) {
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400" />
      <CardContent className="p-8 bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50 dark:from-orange-950/30 dark:via-rose-950/30 dark:to-pink-950/30">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500 animate-bounce drop-shadow-lg" />
              <span className="font-bold text-base text-foreground">Days Without Missing an Item</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-black bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                {days}
              </span>
              <span className="text-lg font-semibold text-muted-foreground">day streak</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((days / 30) * 100, 100)}%` }}
              />
            </div>
          </div>

          {bestStreak > 0 && (
            <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-black/20 rounded-xl border-2 border-amber-200/50 dark:border-amber-800/50 backdrop-blur">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-bold text-amber-700 dark:text-amber-300">Personal Best</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">{bestStreak} days</p>
              </div>
              <Star className="w-4 h-4 text-amber-400 ml-auto animate-pulse" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

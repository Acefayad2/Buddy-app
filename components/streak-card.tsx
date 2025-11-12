"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Flame, Star } from "lucide-react"

interface StreakCardProps {
  days: number
  bestStreak?: number
}

export function StreakCard({ days, bestStreak = 7 }: StreakCardProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200/50 dark:border-orange-800/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500 animate-bounce" />
              <span className="text-sm font-medium text-muted-foreground">Days Without Missing an Item</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">{days}</span>
            <span className="text-sm text-muted-foreground">day streak</span>
          </div>

          {bestStreak > 0 && (
            <div className="flex items-center gap-2 text-sm pt-2 border-t border-orange-200/50">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-muted-foreground">Personal best: {bestStreak} days</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card } from "@/components/ui/card"

interface ActivityEvent {
  id: string
  timestamp: string
  type: "connected" | "disconnected" | "alert" | "pairing"
  deviceName: string
  description: string
}

interface ActivityLogProps {
  maxItems?: number
}

export default function ActivityLog({ maxItems = 10 }: ActivityLogProps) {
  const activities: ActivityEvent[] = [
    {
      id: "1",
      timestamp: "2 minutes ago",
      type: "alert",
      deviceName: "House Keys",
      description: "Out of range alert triggered",
    },
    {
      id: "2",
      timestamp: "15 minutes ago",
      type: "connected",
      deviceName: "iPhone 15 Pro",
      description: "Device connected successfully",
    },
    {
      id: "3",
      timestamp: "45 minutes ago",
      type: "disconnected",
      deviceName: "AirPods Pro",
      description: "Device connection lost",
    },
    {
      id: "4",
      timestamp: "1 hour ago",
      type: "pairing",
      deviceName: "Apple Watch",
      description: "New device paired",
    },
    {
      id: "5",
      timestamp: "2 hours ago",
      type: "connected",
      deviceName: "House Keys",
      description: "Device back in range",
    },
    {
      id: "6",
      timestamp: "3 hours ago",
      type: "alert",
      deviceName: "iPhone 15 Pro",
      description: "Out of range alert triggered",
    },
  ]

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      connected: "🔗",
      disconnected: "🔌",
      alert: "⚠️",
      pairing: "➕",
    }
    return icons[type] || "📋"
  }

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      connected: "text-green-500",
      disconnected: "text-yellow-500",
      alert: "text-red-500",
      pairing: "text-blue-500",
    }
    return colors[type] || "text-muted-foreground"
  }

  return (
    <Card className="bg-card border-blue-500 p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Activity Log</h2>

      <div className="space-y-3">
        {activities.slice(0, maxItems).map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
            <div className={`text-lg mt-1 ${getActivityColor(activity.type)}`}>{getActivityIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.deviceName}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">{activity.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 text-sm font-medium text-accent hover:text-accent/80 transition-colors">
        View All Activity
      </button>
    </Card>
  )
}

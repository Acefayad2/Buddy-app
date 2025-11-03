"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Signal, Battery, MapPin, Settings2 } from "lucide-react"

interface Device {
  id: string
  name: string
  type: "phone" | "tablet" | "watch"
  status: "connected" | "nearby" | "away"
  battery: number
  signal: number
  lastSeen: string
}

const statusColors = {
  connected: "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary",
  nearby: "bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
  away: "bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400",
}

const deviceIcons = {
  phone: "📱",
  tablet: "📱",
  watch: "⌚",
}

export function DeviceCard({ device }: { device: Device }) {
  return (
    <Card className="hover:shadow-lg transition-shadow dark:bg-secondary border dark:border-primary/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{deviceIcons[device.type]}</span>
                <div>
                  <h3 className="font-semibold text-lg">{device.name}</h3>
                  <Badge className={statusColors[device.status]}>
                    {device.status === "connected" ? "Connected" : device.status === "nearby" ? "Nearby" : "Away"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="hover:text-primary">
              <Link href={`/dashboard/device/${device.id}/settings`}>
                <Settings2 className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Battery className="w-4 h-4" />
                <span>Battery</span>
              </div>
              <p className="font-semibold text-base">{device.battery}%</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Signal className="w-4 h-4" />
                <span>Signal</span>
              </div>
              <p className="font-semibold text-base">{device.signal}/5</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Last Seen</span>
              </div>
              <p className="font-semibold text-base text-xs">{device.lastSeen}</p>
            </div>
          </div>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Locate Device</Button>
        </div>
      </CardContent>
    </Card>
  )
}

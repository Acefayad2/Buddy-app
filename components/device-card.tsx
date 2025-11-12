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
  connected: "bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary",
  nearby: "bg-accent/15 text-accent dark:bg-accent/25 dark:text-accent",
  away: "bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-400",
}

const deviceIcons = {
  phone: "📱",
  tablet: "📊",
  watch: "⌚",
}

export function DeviceCard({ device }: { device: Device }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/30 bg-gradient-to-br from-white to-blue-50/40 dark:from-slate-800 dark:to-slate-900 hover:scale-[1.02] hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl transition-transform duration-300 hover:scale-110">
                  {deviceIcons[device.type]}
                </span>
                <div>
                  <h3 className="font-semibold text-lg">{device.name}</h3>
                  <Badge className={`${statusColors[device.status]} border-none`}>
                    {device.status === "connected" ? "Connected" : device.status === "nearby" ? "Nearby" : "Away"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="hover:text-primary hover:bg-primary/10">
              <Link href={`/dashboard/device/${device.id}/settings`}>
                <Settings2 className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="space-y-1 p-2 rounded-lg bg-primary/5 dark:bg-primary/10 transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Battery className="w-4 h-4" />
                <span>Battery</span>
              </div>
              <p className="font-semibold text-base text-primary dark:text-primary">{device.battery}%</p>
            </div>
            <div className="space-y-1 p-2 rounded-lg bg-accent/5 dark:bg-accent/10 transition-all duration-200 hover:bg-accent/10 dark:hover:bg-accent/20">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Signal className="w-4 h-4" />
                <span>Signal</span>
              </div>
              <p className="font-semibold text-base text-accent dark:text-accent">{device.signal}/5</p>
            </div>
            <div className="space-y-1 p-2 rounded-lg bg-secondary/10 dark:bg-secondary/20 transition-all duration-200 hover:bg-secondary/20 dark:hover:bg-secondary/30">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Seen</span>
              </div>
              <p className="font-semibold text-base text-xs">{device.lastSeen}</p>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-md hover:to-accent transition-all duration-300 hover:scale-[1.02]">
            Locate Device
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

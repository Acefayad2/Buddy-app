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
  connected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  nearby: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  away: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
}

const deviceGradients = {
  phone: "from-blue-400 to-cyan-300",
  tablet: "from-purple-400 to-pink-300",
  watch: "from-orange-400 to-rose-300",
}

const deviceIcons = {
  phone: "📱",
  tablet: "📊",
  watch: "⌚",
}

export function DeviceCard({ device }: { device: Device }) {
  return (
    <Card className="hover:shadow-playful transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/40 hover:scale-105 hover:-translate-y-2 border-2 overflow-hidden group">
      <div className={`h-1 bg-gradient-to-r ${deviceGradients[device.type]}`} />
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-5xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                  {deviceIcons[device.type]}
                </span>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{device.name}</h3>
                  <Badge className={`${statusColors[device.status]} border-0 font-semibold`}>
                    {device.status === "connected" ? "Connected" : device.status === "nearby" ? "Nearby" : "Away"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="hover:text-primary hover:bg-primary/15 rounded-full">
              <Link href={`/dashboard/device/${device.id}/settings`}>
                <Settings2 className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="space-y-1 p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 transition-all duration-200 hover:shadow-md border border-blue-200/50 dark:border-blue-800/30">
              <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold">
                <Battery className="w-4 h-4" />
                <span>Battery</span>
              </div>
              <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{device.battery}%</p>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 transition-all duration-200 hover:shadow-md border border-purple-200/50 dark:border-purple-800/30">
              <div className="flex items-center gap-1 text-purple-700 dark:text-purple-300 font-semibold">
                <Signal className="w-4 h-4" />
                <span>Signal</span>
              </div>
              <p className="font-bold text-lg text-purple-600 dark:text-purple-400">{device.signal}/5</p>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 transition-all duration-200 hover:shadow-md border border-orange-200/50 dark:border-orange-800/30">
              <div className="flex items-center gap-1 text-orange-700 dark:text-orange-300 font-semibold">
                <MapPin className="w-4 h-4" />
                <span>Seen</span>
              </div>
              <p className="font-bold text-sm text-orange-600 dark:text-orange-400">{device.lastSeen}</p>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50 font-bold transition-all duration-300 hover:scale-105 border-0">
            Locate Device
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

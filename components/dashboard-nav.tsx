"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Smartphone, Settings } from "lucide-react"

export function DashboardNav() {
  return (
    <nav className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-4 font-semibold text-lg group">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-2.5 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
            <Smartphone className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-foreground font-bold text-lg">Phone Buddy</span>
            <span className="text-xs text-muted-foreground font-normal">Buddy will keep you connected</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg">
            <Link href="/dashboard/settings" className="gap-2 font-medium">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}

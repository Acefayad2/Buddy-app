"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Smartphone, Settings, LogOut } from "lucide-react"

export function DashboardNav() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    router.push("/auth/login")
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <div className="bg-primary rounded p-2">
            <Smartphone className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-foreground">Phone Buddy</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}

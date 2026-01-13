"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { useAuth } from "@/contexts/auth-context"
import { Spinner } from "@/components/ui/spinner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signIn } = useAuth()
  const router = useRouter()

  // Auto-login with hardcoded credentials
  useEffect(() => {
    if (!loading && !user) {
      // Auto-login with acefayad@gmail.com
      signIn("acefayad@gmail.com", "abcd1234").catch((error) => {
        console.error("Auto-login failed:", error)
        // If auto-login fails, redirect to login page
        router.push("/auth/login")
      })
    }
  }, [loading, user, signIn, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="flex-1 bg-background">{children}</main>
    </div>
  )
}


"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { DashboardNav } from "@/components/dashboard-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const hasAuth = localStorage.getItem("authToken")
    if (!hasAuth) {
      router.push("/auth/login")
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}

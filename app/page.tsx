"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Backend - Check if user is authenticated
    // For now, redirect to login if no auth token exists
    const hasAuth = localStorage.getItem("authToken")

    if (hasAuth) {
      router.push("/dashboard")
    } else {
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

  return null
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  // Redirect to dashboard (login disabled)
  useEffect(() => {
    router.push("/dashboard")
  }, [router])

  return null
}

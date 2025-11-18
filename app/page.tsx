"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Always show intro on home page (refresh or first visit)
    router.push("/intro")
  }, [router])

  return null
}

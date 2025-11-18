"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

interface UseAuthReturn {
  user: { id: string } | null
  loading: boolean
}

interface RequireAuthProps {
  children: React.ReactNode
  useAuth: () => UseAuthReturn
}

/**
 * Auth guard component that protects routes requiring authentication
 * Shows spinner while loading, redirects to login if no user, renders children if authenticated
 */
export function RequireAuth({ children, useAuth }: RequireAuthProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}



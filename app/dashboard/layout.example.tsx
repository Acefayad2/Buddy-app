"use client"

import { RequireAuth } from '@/src/components/auth/RequireAuth'
import { DashboardNav } from '@/components/dashboard-nav'

// Example: How to wrap dashboard layout with RequireAuth
// Replace this with your actual useAuth hook import
// import { useAuth } from '@/src/hooks/useAuth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Example useAuth hook - replace with your actual implementation
  const useAuth = () => {
    // This is a placeholder - replace with your actual useAuth hook
    return {
      user: { id: 'user-id' }, // Replace with actual user from your auth context
      loading: false,
    }
  }

  return (
    <RequireAuth useAuth={useAuth}>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="flex-1">{children}</main>
      </div>
    </RequireAuth>
  )
}



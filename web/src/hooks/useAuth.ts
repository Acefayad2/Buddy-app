/**
 * Authentication hook for Next.js web app
 */

import { useState, useEffect } from 'react'
import { supabaseClient } from '../lib/supabase-client'
import type { AuthUser } from '../../../shared/types'
import type { Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user as AuthUser | null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user as AuthUser | null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email,
        },
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabaseClient.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }
}



import { supabaseClient } from './supabaseClient'
import { safeSupabaseCall } from './errors'
import type { Alert, NewAlertInput } from '@/src/types/alert'

/**
 * Get all alerts for a specific user
 */
export async function getAlertsForUser(userId: string) {
  const { data, error } = await supabaseClient
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: data as Alert[] | null, error }
}

/**
 * Create a new alert
 */
export async function createAlert(userId: string, payload: NewAlertInput) {
  return safeSupabaseCall<Alert>(
    supabaseClient
      .from('alerts')
      .insert({
        ...payload,
        user_id: userId,
      })
      .select()
      .single()
      .then((result) => ({ data: result.data as Alert | null, error: result.error })),
    `Create alert for user: ${userId}`
  )
}


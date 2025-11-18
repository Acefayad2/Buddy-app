/**
 * Proximity events service for web app
 */

import { supabaseClient } from './supabase-client'
import type { ProximityEvent } from '../../../shared/types'

export async function getProximityEventsForUser(userId: string, limit: number = 100) {
  // Get user's devices first
  const { data: devices } = await supabaseClient
    .from('devices')
    .select('device_id')
    .eq('user_id', userId)

  if (!devices || devices.length === 0) {
    return { data: [], error: null }
  }

  const deviceIds = devices.map((d) => d.device_id)

  // Get events where user's devices are involved
  const { data, error } = await supabaseClient
    .from('proximity_events')
    .select('*')
    .in('device_a', deviceIds)
    .or(`device_b.in.(${deviceIds.join(',')})`)
    .order('timestamp', { ascending: false })
    .limit(limit)

  return { data: data as ProximityEvent[] | null, error }
}

export async function subscribeToProximityEvents(
  userId: string,
  callback: (event: ProximityEvent) => void
) {
  // Get user's devices
  const { data: devices } = await supabaseClient
    .from('devices')
    .select('device_id')
    .eq('user_id', userId)

  if (!devices || devices.length === 0) {
    return () => {}
  }

  const deviceIds = devices.map((d) => d.device_id)

  const subscription = supabaseClient
    .channel('proximity_events_realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'proximity_events',
        filter: `device_a=in.(${deviceIds.join(',')})`,
      },
      (payload) => {
        callback(payload.new as ProximityEvent)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'proximity_events',
        filter: `device_b=in.(${deviceIds.join(',')})`,
      },
      (payload) => {
        callback(payload.new as ProximityEvent)
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}



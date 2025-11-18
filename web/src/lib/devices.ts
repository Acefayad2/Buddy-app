/**
 * Device service for web app (updated for new schema)
 */

import { supabaseClient } from './supabase-client'
import { safeSupabaseCall } from './errors'
import type { Device, NewDeviceInput } from '../../../shared/types'

export async function getDevicesForUser(userId: string) {
  const { data, error } = await supabaseClient
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: data as Device[] | null, error }
}

export async function getDeviceById(id: string) {
  return safeSupabaseCall<Device>(
    supabaseClient
      .from('devices')
      .select('*')
      .eq('device_id', id)
      .single()
      .then((result) => ({ data: result.data as Device | null, error: result.error })),
    `Get device by ID: ${id}`
  )
}

export async function createDevice(userId: string, payload: NewDeviceInput) {
  return safeSupabaseCall<Device>(
    supabaseClient
      .from('devices')
      .insert({
        ...payload,
        user_id: userId,
      })
      .select()
      .single()
      .then((result) => ({ data: result.data as Device | null, error: result.error })),
    `Create device for user: ${userId}`
  )
}

export async function updateDevice(id: string, payload: Partial<NewDeviceInput>) {
  return safeSupabaseCall<Device>(
    supabaseClient
      .from('devices')
      .update(payload)
      .eq('device_id', id)
      .select()
      .single()
      .then((result) => ({ data: result.data as Device | null, error: result.error })),
    `Update device: ${id}`
  )
}

export async function deleteDevice(id: string) {
  return safeSupabaseCall<Device>(
    supabaseClient
      .from('devices')
      .delete()
      .eq('device_id', id)
      .select()
      .single()
      .then((result) => ({ data: result.data as Device | null, error: result.error })),
    `Delete device: ${id}`
  )
}



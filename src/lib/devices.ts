import { supabaseClient } from './supabaseClient'
import { safeSupabaseCall } from './errors'
import type { Device, NewDeviceInput } from '@/src/types/device'

/**
 * Get all devices for a specific user
 */
export async function getDevicesForUser(userId: string) {
  const { data, error } = await supabaseClient
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: data as Device[] | null, error }
}

/**
 * Get a single device by ID
 */
export async function getDeviceById(id: string) {
  return safeSupabaseCall<Device>(
    supabaseClient
      .from('devices')
      .select('*')
      .eq('id', id)
      .single()
      .then((result) => ({ data: result.data as Device | null, error: result.error })),
    `Get device by ID: ${id}`
  )
}

/**
 * Create a new device
 */
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

/**
 * Update an existing device
 */
export async function updateDevice(id: string, payload: Partial<NewDeviceInput>) {
  return safeSupabaseCall<Device>(
    supabaseClient
      .from('devices')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
      .then((result) => ({ data: result.data as Device | null, error: result.error })),
    `Update device: ${id}`
  )
}

/**
 * Delete a device
 */
export async function deleteDevice(id: string) {
  return safeSupabaseCall<Device>(
    supabaseClient
      .from('devices')
      .delete()
      .eq('id', id)
      .select()
      .single()
      .then((result) => ({ data: result.data as Device | null, error: result.error })),
    `Delete device: ${id}`
  )
}


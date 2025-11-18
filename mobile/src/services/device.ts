/**
 * Device management service
 * Handles device registration and fetching from Supabase
 */

import { supabase } from './supabase'
import { safeSupabaseCall } from '../lib/errors'
import type { Device, NewDeviceInput } from '../../../shared/types'
import * as DeviceInfo from 'expo-device'

/**
 * Register current device with Supabase
 */
export async function registerCurrentDevice(userId: string, deviceName: string): Promise<Device> {
  // Get device identifier (unique per device)
  const deviceType = DeviceInfo.osName === 'iOS' ? 'iOS' : 'Android'
  const bleIdentifier = await getDeviceBLEIdentifier()

  const newDevice: NewDeviceInput = {
    user_id: userId,
    device_name: deviceName,
    device_type: deviceType,
    ble_identifier: bleIdentifier,
  }

  return safeSupabaseCall<Device>(
    supabase
      .from('devices')
      .insert(newDevice)
      .select()
      .single()
      .then((result) => ({ data: result.data as Device | null, error: result.error })),
    `Register device for user: ${userId}`
  )
}

/**
 * Get all devices for current user
 */
export async function getUserDevices(userId: string): Promise<Device[]> {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch devices: ${error.message}`)
  }

  return (data || []) as Device[]
}

/**
 * Get device BLE identifier (unique per device)
 * Uses device ID or generates a stable identifier
 */
async function getDeviceBLEIdentifier(): Promise<string> {
  // Use device ID if available, otherwise generate stable ID
  const deviceId = DeviceInfo.deviceId || DeviceInfo.modelId || 'unknown'
  return `device-${deviceId}`
}


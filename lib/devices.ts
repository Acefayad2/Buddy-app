/**
 * Device service functions for Next.js app
 * Works with Supabase database schema
 */

import { supabase } from './supabase'
import type { Device } from '@/shared/types'

export interface DeviceWithUI {
  id: string // device_id
  name: string // device_name
  type: "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop"
  status: "connected" | "nearby" | "away"
  battery?: number
  signal?: number
  lastSeen: string
  distance?: number
  location?: { lat: number; lng: number }
  bluetoothDeviceId?: string
  bluetoothDeviceName?: string
}

/**
 * Get all devices for the current user
 */
export async function getDevicesForUser(userId: string): Promise<Device[]> {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching devices:', error)
    throw error
  }

  return (data || []) as Device[]
}

/**
 * Get a single device by ID
 */
export async function getDeviceById(deviceId: string): Promise<Device | null> {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('device_id', deviceId)
    .single()

  if (error) {
    console.error('Error fetching device:', error)
    return null
  }

  return data as Device
}

/**
 * Create a new device
 */
export async function createDevice(userId: string, deviceData: {
  device_name: string
  device_type: 'iOS' | 'Android'
  ble_identifier: string
}): Promise<Device> {
  const { data, error } = await supabase
    .from('devices')
    .insert({
      user_id: userId,
      ...deviceData,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating device:', error)
    throw error
  }

  return data as Device
}

/**
 * Update a device
 */
export async function updateDevice(deviceId: string, updates: Partial<{
  device_name: string
  device_type: 'iOS' | 'Android'
  ble_identifier: string
}>): Promise<Device> {
  const { data, error } = await supabase
    .from('devices')
    .update(updates)
    .eq('device_id', deviceId)
    .select()
    .single()

  if (error) {
    console.error('Error updating device:', error)
    throw error
  }

  return data as Device
}

/**
 * Delete a device
 */
export async function deleteDevice(deviceId: string): Promise<void> {
  const { error } = await supabase
    .from('devices')
    .delete()
    .eq('device_id', deviceId)

  if (error) {
    console.error('Error deleting device:', error)
    throw error
  }
}

/**
 * Update device location
 */
export async function updateDeviceLocation(
  deviceId: string, 
  location: {
    latitude: number
    longitude: number
    accuracy?: number
  }
): Promise<Device> {
  const { data, error } = await supabase
    .from('devices')
    .update({
      latitude: location.latitude,
      longitude: location.longitude,
      last_location_update: new Date().toISOString(),
      location_accuracy: location.accuracy || null,
    })
    .eq('device_id', deviceId)
    .select()
    .single()

  if (error) {
    console.error('Error updating device location:', error)
    throw error
  }

  return data as Device
}

/**
 * Convert database Device to UI Device format
 */
export function deviceToUI(device: Device, additionalData?: {
  status?: "connected" | "nearby" | "away"
  battery?: number
  signal?: number
  distance?: number
  location?: { lat: number; lng: number }
  bluetoothDeviceId?: string
  bluetoothDeviceName?: string
}): DeviceWithUI {
  // Map device_type to UI type
  const typeMap: Record<string, "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop"> = {
    'iOS': 'phone',
    'Android': 'phone',
  }

  // Use location from database if available, otherwise use additionalData
  const location = (device.latitude != null && device.longitude != null)
    ? { lat: device.latitude, lng: device.longitude }
    : additionalData?.location

  // Use last_location_update if available, otherwise use created_at
  const lastSeen = device.last_location_update || device.created_at

  return {
    id: device.device_id,
    name: device.device_name,
    type: typeMap[device.device_type] || 'phone',
    status: additionalData?.status || 'away',
    battery: additionalData?.battery,
    signal: additionalData?.signal,
    lastSeen: lastSeen,
    distance: additionalData?.distance,
    location: location,
    bluetoothDeviceId: additionalData?.bluetoothDeviceId,
    bluetoothDeviceName: additionalData?.bluetoothDeviceName,
  }
}

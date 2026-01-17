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
  type?: "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop"
  bluetoothDeviceId?: string
  bluetoothDeviceName?: string
}): DeviceWithUI {
  // Map device_type to UI type
  // Since database only stores 'iOS' or 'Android', we need to infer the actual device type
  // If additionalData provides a type (from when device was created), use that
  // Otherwise, default to 'phone' for both iOS and Android
  const typeMap: Record<string, "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop"> = {
    'iOS': 'phone',
    'Android': 'phone',
  }
  
  // If additionalData provides a type, use it (for devices we just created)
  // Otherwise, try to infer from device name or default to phone
  let inferredType: "phone" | "tablet" | "watch" | "keys" | "earbuds" | "laptop" = additionalData?.type || 'phone'
  
  // Try to infer from device name if type not provided
  if (!additionalData?.type) {
    const name = device.device_name.toLowerCase()
    if (name.includes('ipad') || name.includes('tablet')) inferredType = 'tablet'
    else if (name.includes('watch')) inferredType = 'watch'
    else if (name.includes('key')) inferredType = 'keys'
    else if (name.includes('airpod') || name.includes('earbud') || name.includes('headphone')) inferredType = 'earbuds'
    else if (name.includes('laptop') || name.includes('macbook')) inferredType = 'laptop'
    else inferredType = typeMap[device.device_type] || 'phone'
  }

  // Use location from database if available, otherwise use additionalData
  const location = (device.latitude != null && device.longitude != null)
    ? { lat: device.latitude, lng: device.longitude }
    : additionalData?.location

  // Use last_location_update if available, otherwise use created_at
  const lastSeen = device.last_location_update || device.created_at

  // Get Bluetooth ID from database (ble_identifier) or additionalData
  // The database stores it as ble_identifier, but we expose it as bluetoothDeviceId to the UI
  const bluetoothDeviceId = device.ble_identifier || additionalData?.bluetoothDeviceId || null
  const bluetoothDeviceName = additionalData?.bluetoothDeviceName || null

  // Debug logging to verify Bluetooth ID is being read
  if (bluetoothDeviceId) {
    console.log(`[deviceToUI] Device ${device.device_name} has Bluetooth ID: ${bluetoothDeviceId}`)
  }

  return {
    id: device.device_id,
    name: device.device_name,
    type: inferredType,
    status: additionalData?.status || 'away',
    battery: additionalData?.battery,
    signal: additionalData?.signal,
    lastSeen: lastSeen,
    distance: additionalData?.distance,
    location: location,
    bluetoothDeviceId: bluetoothDeviceId || undefined, // Convert null to undefined
    bluetoothDeviceName: bluetoothDeviceName || undefined, // Convert null to undefined
  }
}

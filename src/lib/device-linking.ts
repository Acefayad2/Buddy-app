import { supabaseClient } from './supabaseClient'
import { safeSupabaseCall } from './errors'
import type { Device, NewDeviceInput } from '@/src/types/device'

/**
 * Link a Bluetooth-scanned device to the logged-in user and save it in the devices table
 * @param userId - The ID of the logged-in user (from useAuth)
 * @param bluetoothId - The Bluetooth ID from the scanned device
 * @param deviceName - Optional name for the device (defaults to bluetoothId if not provided)
 * @param icon - Optional icon identifier for the device
 * @returns The created device
 */
export async function linkBluetoothDevice(
  userId: string,
  bluetoothId: string,
  deviceName?: string,
  icon?: string | null
): Promise<Device> {
  const payload: NewDeviceInput = {
    user_id: userId,
    bluetooth_id: bluetoothId,
    name: deviceName || bluetoothId,
    icon: icon || null,
    is_active: true,
  }

  return safeSupabaseCall<Device>(
    supabaseClient
      .from('devices')
      .insert(payload)
      .select()
      .single()
      .then((result) => ({ data: result.data as Device | null, error: result.error })),
    `Link Bluetooth device ${bluetoothId} to user ${userId}`
  )
}



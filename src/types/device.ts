/**
 * Device type matching Supabase devices table schema
 */
export interface Device {
  id: string
  user_id: string
  name: string
  bluetooth_id: string
  icon: string | null
  is_active: boolean
  created_at: string
}

/**
 * Input type for creating a new device
 * Excludes id and created_at as these are auto-generated
 */
export type NewDeviceInput = Omit<Device, 'id' | 'created_at'>



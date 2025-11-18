/**
 * Alert type matching Supabase alerts table schema
 */
export interface Alert {
  id: string
  user_id: string
  device_id: string
  type: string
  message: string
  created_at: string
}

/**
 * Input type for creating a new alert
 * Excludes id and created_at as these are auto-generated
 */
export type NewAlertInput = Omit<Alert, 'id' | 'created_at'>



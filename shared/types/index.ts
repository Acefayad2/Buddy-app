/**
 * Shared TypeScript types for Phone Buddy
 * Used by both mobile (React Native) and web (Next.js) apps
 */

// ============================================================================
// Profile Types
// ============================================================================

export interface Profile {
  user_id: string
  name: string
  created_at: string
}

// ============================================================================
// Device Types (matching new schema)
// ============================================================================

export interface Device {
  device_id: string
  user_id: string
  device_name: string
  device_type: 'iOS' | 'Android'
  ble_identifier: string
  created_at: string
  updated_at?: string
  // Location tracking fields
  latitude?: number | null
  longitude?: number | null
  last_location_update?: string | null
  location_accuracy?: number | null
}

export type NewDeviceInput = Omit<Device, 'device_id' | 'created_at'>

// ============================================================================
// Proximity Event Types
// ============================================================================

export type ProximityEventType = 'ENTER' | 'EXIT'

export interface ProximityEvent {
  event_id: string
  device_a: string // device_id
  device_b: string // device_id
  timestamp: string
  distance_estimate: number // in meters
  event_type: ProximityEventType
}

export type NewProximityEventInput = Omit<ProximityEvent, 'event_id' | 'timestamp'>

// ============================================================================
// Bluetooth Types
// ============================================================================

export interface BluetoothDevice {
  id: string
  name: string
  rssi: number
  advertisementData?: Record<string, any>
}

export interface DevicePair {
  deviceA: string // device_id
  deviceB: string // device_id
}

// ============================================================================
// Sync Types
// ============================================================================

export interface PendingEvent {
  id: string
  event: NewProximityEventInput
  createdAt: number
  retryCount: number
}

// ============================================================================
// Auth Types
// ============================================================================

export interface AuthUser {
  id: string
  email: string
  user_metadata?: {
    name?: string
  }
}



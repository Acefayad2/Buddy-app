// Backend API Types - Share these with your brother!

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Device {
  id: string
  userId: string
  name: string
  type: "phone" | "tablet" | "laptop" | "earbuds"
  bluetoothMac: string
  rssi: number
  isConnected: boolean
  lastSeen: string
  alertDistance: number
  enableNotifications: boolean
  enableVibration: boolean
  alertSound: string
  createdAt: string
  updatedAt: string
}

export interface AuthPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, unknown>
}

// API Endpoints your brother should implement:
/**
 * POST /api/auth/login
 * POST /api/auth/signup
 *
 * GET /api/devices
 * GET /api/devices/{id}
 * POST /api/devices
 * PUT /api/devices/{id}
 * DELETE /api/devices/{id}
 *
 * GET /api/devices/scan
 * POST /api/devices/pair
 *
 * WebSocket: /ws/devices (for real-time proximity updates)
 */

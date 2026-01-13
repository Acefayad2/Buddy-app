/**
 * Location tracking service for web app
 * Uses browser Geolocation API to track device locations
 */

import { updateDeviceLocation } from './devices'

export interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: number
}

/**
 * Get current location using browser Geolocation API
 */
export function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        })
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: true, // Use GPS if available for maximum accuracy
        timeout: 15000, // Increased timeout for better accuracy
        maximumAge: 0, // Always get fresh location - no cache
      }
    )
  })
}

/**
 * Watch position and call callback on updates
 */
export function watchPosition(
  onLocationUpdate: (location: LocationData) => void,
  onError?: (error: Error) => void
): number | null {
  if (!navigator.geolocation) {
    onError?.(new Error('Geolocation is not supported by this browser'))
    return null
  }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        onLocationUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        })
      },
      (error) => {
        onError?.(new Error(`Geolocation error: ${error.message}`))
      },
      {
        enableHighAccuracy: true, // Use GPS for maximum accuracy
        timeout: 15000, // Increased timeout for better accuracy
        maximumAge: 1000, // Only accept locations less than 1 second old for maximum accuracy
      }
    )

  return watchId
}

/**
 * Stop watching position
 */
export function clearWatch(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
 * Update device location in Supabase
 */
export async function updateDeviceLocationInSupabase(
  deviceId: string,
  location: LocationData
): Promise<void> {
  try {
    await updateDeviceLocation(deviceId, {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
    })
    console.log(`Location updated for device ${deviceId}`)
  } catch (error) {
    console.error('Failed to update device location:', error)
    throw error
  }
}

/**
 * Start periodic location tracking for a device
 * Updates location immediately, then at specified interval
 * Uses maximum accuracy settings for precise tracking
 */
export function startLocationTracking(
  deviceId: string,
  intervalMs: number = 15000 // Default: 15 seconds for high accuracy
): () => void {
  let watchId: number | null = null
  let intervalId: NodeJS.Timeout | null = null

  // Update immediately
  getCurrentLocation()
    .then((location) => {
      updateDeviceLocationInSupabase(deviceId, location).catch((error) => {
        console.error('Error updating location:', error)
      })
    })
    .catch((error) => {
      console.error('Error getting initial location:', error)
    })

  // Watch for position changes
  watchId = watchPosition(
    (location) => {
      updateDeviceLocationInSupabase(deviceId, location).catch((error) => {
        console.error('Error updating location:', error)
      })
    },
    (error) => {
      console.error('Location watch error:', error)
    }
  )

  // Also update periodically as backup
  intervalId = setInterval(() => {
    getCurrentLocation()
      .then((location) => {
        updateDeviceLocationInSupabase(deviceId, location).catch((error) => {
          console.error('Error updating location:', error)
        })
      })
      .catch((error) => {
        console.error('Error getting location:', error)
      })
  }, intervalMs)

  // Return cleanup function
  return () => {
    if (watchId !== null) {
      clearWatch(watchId)
    }
    if (intervalId !== null) {
      clearInterval(intervalId)
    }
  }
}

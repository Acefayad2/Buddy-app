/**
 * Bluetooth signal strength monitoring utilities
 * For tracking RSSI (Received Signal Strength Indicator) of connected devices
 */

import type { BluetoothDevice } from './bluetooth'
import { calculateRiskLevel, shouldTriggerAlert, type RiskLevel } from './distance'

export interface SignalReading {
  rssi: number
  riskLevel: RiskLevel
  timestamp: number
}

/**
 * Get current RSSI from a connected Bluetooth device
 * 
 * IMPORTANT: Web Bluetooth API does NOT directly support RSSI reading.
 * This is a limitation of the browser API, not our implementation.
 * 
 * Options for real RSSI:
 * 1. Native mobile app (iOS/Android) - Full RSSI support
 * 2. Custom BLE characteristic - Device sends its own RSSI
 * 3. Advertising data - Experimental, browser-dependent
 * 
 * Current implementation uses mock values for testing.
 * TODO: Replace with native app API or custom BLE service when available.
 */
export async function getDeviceRSSI(deviceId: string): Promise<number> {
  // Mock implementation - simulates varying signal strength
  // In production, this would call:
  // - Native app API (if using hybrid approach)
  // - Custom BLE characteristic (if device supports it)
  // - Web Bluetooth advertising data (experimental)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate RSSI values between -40 (very close) and -90 (far/disconnected)
      const baseRSSI = -50
      const variation = Math.random() * 20 - 10 // ±10 dBm variation
      const rssi = Math.round(baseRSSI + variation)
      resolve(rssi)
    }, 100)
  })
}

/**
 * Monitor device signal strength continuously
 * Returns a function to stop monitoring
 */
export function monitorDeviceSignal(
  deviceId: string,
  onReading: (reading: SignalReading) => void,
  intervalMs: number = 2000
): () => void {
  let previousRiskLevel: RiskLevel | null = null
  let isMonitoring = true

  const checkSignal = async () => {
    if (!isMonitoring) return

    try {
      const rssi = await getDeviceRSSI(deviceId)
      const riskLevel = calculateRiskLevel(rssi)
      
      const reading: SignalReading = {
        rssi,
        riskLevel,
        timestamp: Date.now(),
      }

      // Check if we should trigger an alert
      if (shouldTriggerAlert(previousRiskLevel, riskLevel)) {
        // Risk level increased - could trigger alert here
        console.warn(`Device ${deviceId} risk level changed: ${previousRiskLevel} → ${riskLevel} (RSSI: ${rssi})`)
      }

      previousRiskLevel = riskLevel
      onReading(reading)
    } catch (error) {
      console.error('Error reading device RSSI:', error)
    }

    if (isMonitoring) {
      setTimeout(checkSignal, intervalMs)
    }
  }

  // Start monitoring
  checkSignal()

  // Return stop function
  return () => {
    isMonitoring = false
  }
}

/**
 * Convert RSSI to signal strength percentage (0-100%)
 * RSSI ranges: -30 (excellent) to -100 (poor/disconnected)
 */
export function rssiToPercentage(rssi: number): number {
  // Clamp RSSI to reasonable range
  const minRSSI = -100
  const maxRSSI = -30
  
  if (rssi >= maxRSSI) return 100
  if (rssi <= minRSSI) return 0
  
  // Linear mapping
  return Math.round(((rssi - minRSSI) / (maxRSSI - minRSSI)) * 100)
}

/**
 * Get human-readable signal strength description
 */
export function getSignalStrengthLabel(rssi: number): string {
  if (rssi >= -50) return 'Excellent'
  if (rssi >= -60) return 'Very Good'
  if (rssi >= -70) return 'Good'
  if (rssi >= -80) return 'Fair'
  if (rssi >= -90) return 'Poor'
  return 'Very Poor'
}


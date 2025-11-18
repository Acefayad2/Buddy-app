"use client"

import { useState, useEffect, useCallback } from "react"
import { isSafari, getBrowserInfo, supportsWebBluetooth } from "@/src/lib/browser-detection"

export interface BluetoothDevice {
  id: string
  name: string
  rssi?: number
}

export interface BluetoothState {
  isSupported: boolean
  isAvailable: boolean
  isRequesting: boolean
  isEnabled: boolean
  error: string | null
  devices: BluetoothDevice[]
  browserInfo: {
    name: string
    supportsBluetooth: boolean
    isMobile: boolean
  }
}

export function useBluetooth() {
  const [state, setState] = useState<BluetoothState>({
    isSupported: false,
    isAvailable: false,
    isRequesting: false,
    isEnabled: false,
    error: null,
    devices: [],
    browserInfo: {
      name: 'unknown',
      supportsBluetooth: false,
      isMobile: false,
    },
  })

  // Check if Web Bluetooth is supported
  useEffect(() => {
    const browserInfo = getBrowserInfo()
    
    if (typeof window !== "undefined" && supportsWebBluetooth()) {
      setState((prev) => ({
        ...prev,
        isSupported: true,
        isAvailable: true,
        browserInfo,
        error: null,
      }))
    } else if (isSafari()) {
      // Safari doesn't support Web Bluetooth - provide helpful message
      setState((prev) => ({
        ...prev,
        isSupported: false,
        isAvailable: false,
        browserInfo,
        error: "Safari doesn't support Web Bluetooth. For Bluetooth features, please use the Phone Buddy mobile app, or use Chrome/Edge on desktop. The web app can still manage devices and view proximity events.",
      }))
    } else {
      setState((prev) => ({
        ...prev,
        isSupported: false,
        isAvailable: false,
        browserInfo,
        error: "Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera, or use the Phone Buddy mobile app.",
      }))
    }
  }, [])

  // Request Bluetooth permission and scan for devices
  const requestBluetoothPermission = useCallback(async () => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: "Bluetooth is not supported in this browser",
      }))
      return false
    }

    setState((prev) => ({
      ...prev,
      isRequesting: true,
      error: null,
    }))

    try {
      // Request Bluetooth device access
      // This will prompt the user for permission
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service", "device_information"],
      })

      if (device) {
        setState((prev) => ({
          ...prev,
          isEnabled: true,
          isRequesting: false,
          error: null,
        }))
        return true
      }

      return false
    } catch (error: any) {
      let errorMessage = "Failed to access Bluetooth"
      
      if (error.name === "NotFoundError") {
        errorMessage = "No Bluetooth device selected"
      } else if (error.name === "SecurityError") {
        errorMessage = "Bluetooth permission denied. Please enable Bluetooth in your device settings."
      } else if (error.name === "NetworkError") {
        errorMessage = "Bluetooth connection failed"
      } else if (error.message) {
        errorMessage = error.message
      }

      setState((prev) => ({
        ...prev,
        isRequesting: false,
        isEnabled: false,
        error: errorMessage,
      }))
      return false
    }
  }, [state.isSupported])

  // Check if Bluetooth is available (simplified check)
  const checkBluetoothAvailability = useCallback(async () => {
    if (!state.isSupported) {
      return false
    }

    try {
      // Try to get availability (this is a simplified check)
      // Note: Web Bluetooth API doesn't have a direct way to check if Bluetooth is enabled
      // We can only know when we try to request a device
      return true
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Bluetooth is not available on this device",
      }))
      return false
    }
  }, [state.isSupported])

  return {
    ...state,
    requestBluetoothPermission,
    checkBluetoothAvailability,
  }
}


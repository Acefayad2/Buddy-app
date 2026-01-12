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
      // Check if permission was previously granted
      const wasGranted = localStorage.getItem("bluetoothPermissionGranted") === "true"
      setState((prev) => ({
        ...prev,
        isSupported: true,
        isAvailable: true,
        isEnabled: wasGranted,
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

  // Request Bluetooth permission - triggers browser's native permission dialog
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
      // This will trigger the browser's native device picker/permission dialog
      // The user must select a device to grant permission
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service", "device_information"],
      })

      if (device) {
        // Permission granted - user selected a device
        // Store that Bluetooth is now enabled
        setState((prev) => ({
          ...prev,
          isEnabled: true,
          isRequesting: false,
          error: null,
        }))
        // Store permission status in localStorage
        localStorage.setItem("bluetoothPermissionGranted", "true")
        return true
      }

      return false
    } catch (error: any) {
      let errorMessage = "Failed to access Bluetooth"
      let permissionGranted = false
      
      if (error.name === "NotFoundError") {
        // User cancelled the device picker - this is okay, not a denial
        // Check if we've previously granted permission
        const wasGranted = localStorage.getItem("bluetoothPermissionGranted") === "true"
        if (wasGranted) {
          // Permission was previously granted, just user cancelled this time
          permissionGranted = true
          errorMessage = null
        } else {
          errorMessage = "Please select a Bluetooth device to grant permission. You can cancel and try again later."
        }
      } else if (error.name === "SecurityError") {
        errorMessage = "Bluetooth permission denied. Please check your browser settings and allow Bluetooth access."
        localStorage.removeItem("bluetoothPermissionGranted")
      } else if (error.name === "NetworkError") {
        errorMessage = "Bluetooth connection failed. Please ensure Bluetooth is enabled on your device."
      } else if (error.message) {
        errorMessage = error.message
      }

      setState((prev) => ({
        ...prev,
        isRequesting: false,
        isEnabled: permissionGranted,
        error: errorMessage,
      }))
      return permissionGranted
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


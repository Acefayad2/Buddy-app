/**
 * Example: Real RSSI Implementation (When Available)
 * 
 * This shows how RSSI would be implemented with:
 * 1. Web Bluetooth advertising data (experimental)
 * 2. Custom BLE characteristic (if device supports it)
 * 3. Native app API call (hybrid approach)
 */

/**
 * Method 1: Using Web Bluetooth Advertising Data (Experimental)
 * Note: RSSI in advertising data is browser-dependent and not reliable
 */
export async function getRSSIFromAdvertising(deviceId: string): Promise<number | null> {
  try {
    const scan = await navigator.bluetooth.requestLEScan({
      acceptAllAdvertisements: true,
    })

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        scan.stop()
        resolve(null) // Timeout - RSSI not available
      }, 5000)

      scan.addEventListener('advertisementreceived', (event) => {
        if (event.device.id === deviceId) {
          // @ts-ignore - RSSI may be available but not in TypeScript definitions
          const rssi = event.rssi
          if (rssi !== undefined) {
            clearTimeout(timeout)
            scan.stop()
            resolve(rssi)
          }
        }
      })
    })
  } catch (error) {
    console.error('RSSI from advertising not available:', error)
    return null
  }
}

/**
 * Method 2: Custom BLE Characteristic
 * Requires device firmware to send RSSI via custom service
 */
export async function getRSSIFromCharacteristic(
  device: BluetoothDevice,
  serviceUUID: string = '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service (example)
  characteristicUUID: string = '00002a19-0000-1000-8000-00805f9b34fb' // Custom RSSI characteristic
): Promise<number | null> {
  try {
    const server = await device.gatt.connect()
    const service = await server.getPrimaryService(serviceUUID)
    const characteristic = await service.getCharacteristic(characteristicUUID)
    
    const value = await characteristic.readValue()
    const rssi = new DataView(value.buffer).getInt8(0) // Assuming RSSI is single byte
    
    return rssi
  } catch (error) {
    console.error('Failed to read RSSI from characteristic:', error)
    return null
  }
}

/**
 * Method 3: Native App API (Hybrid Approach)
 * Call native app via postMessage or fetch API
 */
export async function getRSSIFromNativeApp(deviceId: string): Promise<number | null> {
  try {
    // If native app is available (PWA or hybrid)
    if (window.nativeApp && window.nativeApp.getRSSI) {
      return await window.nativeApp.getRSSI(deviceId)
    }

    // Or via API endpoint (native app sends to backend)
    const response = await fetch(`/api/bluetooth/rssi/${deviceId}`)
    if (response.ok) {
      const data = await response.json()
      return data.rssi
    }

    return null
  } catch (error) {
    console.error('Failed to get RSSI from native app:', error)
    return null
  }
}

/**
 * Combined approach: Try multiple methods
 */
export async function getDeviceRSSIReal(deviceId: string): Promise<number | null> {
  // Try Method 1: Advertising data
  const rssi1 = await getRSSIFromAdvertising(deviceId)
  if (rssi1 !== null) return rssi1

  // Try Method 3: Native app
  const rssi3 = await getRSSIFromNativeApp(deviceId)
  if (rssi3 !== null) return rssi3

  // Fallback: Return null (no RSSI available)
  return null
}


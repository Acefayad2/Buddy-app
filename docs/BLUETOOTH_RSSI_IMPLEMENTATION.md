# Bluetooth RSSI (Signal Strength) Implementation Guide

## Can Signal Strength Be Tracked Through Bluetooth?

**Yes, but with important limitations depending on the platform:**

### ✅ Native Apps (iOS/Android)
- **Full RSSI support** - Can read signal strength directly
- **Real-time monitoring** - Continuous RSSI updates
- **Background monitoring** - Can track even when app is backgrounded

### ⚠️ Web Bluetooth API (Browser)
- **Limited RSSI support** - Not directly available in Web Bluetooth API
- **Chrome/Edge only** - Web Bluetooth only works in Chromium browsers
- **Workarounds needed** - Must use alternative methods

## Web Bluetooth RSSI Limitations

The Web Bluetooth API **does not directly expose RSSI** values. However, there are workarounds:

### Method 1: Using Bluetooth Advertising Data (Best for Web)
```typescript
// When scanning for devices, some browsers provide RSSI in advertising data
navigator.bluetooth.requestLEScan({
  acceptAllAdvertisements: true,
}).then((scan) => {
  scan.addEventListener('advertisementreceived', (event) => {
    // RSSI might be available here (browser-dependent)
    const rssi = event.rssi // May be undefined
    console.log('RSSI:', rssi)
  })
})
```

**Note**: This is experimental and not widely supported.

### Method 2: Using Custom BLE Characteristics
If you control the device firmware, you can:
1. Create a custom BLE service/characteristic
2. Have the device send its own RSSI measurements
3. Read this characteristic from the web app

### Method 3: Native App Required
For reliable RSSI tracking, you'll need:
- **iOS**: Use Core Bluetooth framework
- **Android**: Use BluetoothAdapter.getRemoteDevice().getRssi()

## Current Implementation Status

Our current code uses **mock RSSI values** because:

1. **Web Bluetooth doesn't reliably provide RSSI**
2. **Preparing for native app implementation**
3. **Testing the UI/UX flow**

## Real Implementation Paths

### Option A: Progressive Web App (PWA) with Native Features
```typescript
// When Web Bluetooth API adds RSSI support
async function getRealRSSI(device: BluetoothDevice) {
  // Future Web Bluetooth API (not yet available)
  const rssi = await device.gatt.getRemoteRSSI()
  return rssi
}
```

### Option B: Native Mobile App
```typescript
// iOS (Swift/SwiftUI)
import CoreBluetooth

func peripheral(_ peripheral: CBPeripheral, didReadRSSI RSSI: NSNumber, error: Error?) {
    let rssiValue = RSSI.intValue
    // Use RSSI value
}

// Android (Kotlin/Java)
BluetoothAdapter.getDefaultAdapter().getRemoteDevice(address).getRssi()
```

### Option C: Hybrid Approach
1. **Web app** for device management UI
2. **Native companion app** for Bluetooth scanning/monitoring
3. **Sync via API** - Native app sends RSSI data to web backend

## Recommended Architecture

For Phone Buddy to work reliably with hundreds of users:

### Phase 1: Web App (Current)
- ✅ Device pairing via Web Bluetooth
- ✅ Device management UI
- ⚠️ Mock RSSI (for testing)

### Phase 2: Native Companion App
- ✅ Real RSSI tracking
- ✅ Background monitoring
- ✅ Push notifications
- ✅ Sync with web app via Supabase

### Phase 3: Hybrid Solution
- Web app: Management, settings, dashboard
- Native app: Real-time proximity monitoring
- Shared database: Supabase syncs both

## Implementation Example (When Available)

```typescript
// src/lib/bluetooth-monitoring.ts - Real implementation
export async function getDeviceRSSI(deviceId: string): Promise<number> {
  try {
    // Method 1: Try Web Bluetooth (if supported)
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['battery_service'] }]
    })
    
    // This API doesn't exist yet, but this is what it would look like:
    // const rssi = await device.gatt.getRemoteRSSI()
    
    // Method 2: Use advertising data (experimental)
    const scan = await navigator.bluetooth.requestLEScan({
      acceptAllAdvertisements: true
    })
    
    // Wait for advertisement with RSSI
    return new Promise((resolve) => {
      scan.addEventListener('advertisementreceived', (event) => {
        if (event.device.id === deviceId && event.rssi !== undefined) {
          resolve(event.rssi)
          scan.stop()
        }
      })
    })
  } catch (error) {
    console.error('RSSI not available via Web Bluetooth:', error)
    // Fallback to mock or API call to native app
    return getMockRSSI(deviceId)
  }
}
```

## Current Workaround: Mock Implementation

Our current mock implementation:
- ✅ Tests the UI/UX flow
- ✅ Validates risk level calculations
- ✅ Prepares code structure for real RSSI
- ⚠️ Uses simulated values

## Next Steps

1. **For Web App**: Keep mock implementation, add note in UI that RSSI is simulated
2. **For Production**: Build native iOS/Android companion app for real RSSI
3. **For MVP**: Use proximity alerts based on connection status (connected/disconnected)

## Browser Compatibility

| Browser | Web Bluetooth | RSSI Support |
|---------|---------------|--------------|
| Chrome/Edge | ✅ Yes | ❌ No (not in API) |
| Safari | ❌ No | ❌ No |
| Firefox | ❌ No | ❌ No |
| Mobile Safari | ❌ No | ❌ No |
| Chrome Mobile | ✅ Yes | ❌ No (not in API) |

**Conclusion**: For reliable RSSI tracking, a native mobile app is recommended.


# BLE Peripheral Setup for iPhone-to-Laptop Connection

## Overview

This enables the iPhone to advertise as a BLE peripheral so it can be discovered and connected to by the laptop's web app using Web Bluetooth.

## Installation Steps

### 1. Install react-native-peripheral

```bash
cd mobile
npm install react-native-peripheral
```

### 2. iOS Setup (Already Done)

- ✅ `NSBluetoothPeripheralUsageDescription` in Info.plist
- ✅ `bluetooth-peripheral` background mode added
- ✅ Permissions configured

### 3. Android Setup (Already Done)

- ✅ `BLUETOOTH_ADVERTISE` permission already in AndroidManifest
- ✅ Permissions configured

### 4. Link Native Modules

After installing the package:

```bash
cd mobile
npx pod-install  # For iOS
```

For Expo managed workflow, you may need to:
```bash
npx expo prebuild
```

## Usage

The peripheral service is implemented in `src/ble/blePeripheral.ts`. Once `react-native-peripheral` is installed, uncomment the TODO sections.

### Start Advertising

```typescript
import { phoneBuddyPeripheral } from './src/ble/blePeripheral';

// Start advertising so laptop can discover iPhone
await phoneBuddyPeripheral.startAdvertising({
  deviceName: 'My iPhone',
  enableAdvertising: true
});
```

### Stop Advertising

```typescript
await phoneBuddyPeripheral.stopAdvertising();
```

## Web App Configuration

The web app needs to filter for the Phone Buddy service UUID when scanning:

```typescript
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: [PHONE_BUDDY_SERVICE_UUID] }],
  // Or use acceptAllDevices: true and filter by name
});
```

## Service UUID

- **Phone Buddy Service**: `12345678-1234-1234-1234-123456789abc`

This UUID should be registered if you plan to publish the app.

## Testing

1. Start advertising on iPhone
2. Open web app on laptop (Chrome/Edge)
3. Click "Add Device" → Select device type
4. Chrome's device picker should show the iPhone
5. Connect and test communication

## Current Status

⚠️ **Implementation structure created, but requires:**
- Installing `react-native-peripheral` package
- Uncommenting TODO sections in `blePeripheral.ts`
- Testing on physical devices

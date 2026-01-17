# Mobile App Setup for Watch & iPhone-to-Laptop Connection

## Current Status

The mobile app currently supports:
- ✅ BLE Central mode (scanning for and connecting to devices)
- ✅ Device discovery and RSSI monitoring
- ✅ Background scanning support
- ❌ BLE Peripheral mode (advertising - needed for iPhone-to-laptop)
- ⚠️ Apple Watch support (partial - needs scanning adjustments)

## What Needs to Be Added

### 1. Apple Watch Support
- Update scanning to detect Apple Watches (they may not always advertise with names)
- Handle Watch-specific BLE characteristics
- Add Watch device type detection

### 2. BLE Peripheral Mode (iPhone-to-Laptop)
- Implement BLE advertising so iPhone can be discovered by laptop
- Add GATT server with Phone Buddy service
- Export location/battery info via BLE characteristics

## Next Steps

1. **Add Apple Watch scanning** - Update `bleManager.ts` to better detect Watches
2. **Implement BLE Peripheral mode** - Add advertising capability to mobile app
3. **Update device type detection** - Better identify Watches vs other devices
4. **Test connections** - Verify iPhone can connect to laptop via Web Bluetooth

## Files to Update

- `mobile/src/ble/bleManager.ts` - Add Watch scanning improvements
- `mobile/src/services/bluetooth.ts` - Add peripheral advertising (may need new file)
- `mobile/app.json` - Ensure peripheral permissions are configured (already done ✅)

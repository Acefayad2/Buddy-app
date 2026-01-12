/**
 * Bluetooth permissions handler for iOS and Android
 * Uses react-native-permissions for iOS and PermissionsAndroid for Android
 */

import { Platform, PermissionsAndroid } from "react-native";
import DeviceInfo from "react-native-device-info";
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from "react-native-permissions";

export type PermissionResult = {
  granted: boolean;
  reason?: string;
  canOpenSettings?: boolean;
};

async function requestIOSBluetooth(): Promise<PermissionResult> {
  // iOS shows the real Bluetooth prompt when you actually start scanning/connecting.
  // react-native-permissions can still be used to check state.
  const status = await check(PERMISSIONS.IOS.BLUETOOTH);

  if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
    return { granted: true };
  }

  const req = await request(PERMISSIONS.IOS.BLUETOOTH);
  if (req === RESULTS.GRANTED || req === RESULTS.LIMITED) return { granted: true };

  if (req === RESULTS.BLOCKED) {
    return {
      granted: false,
      reason: "Bluetooth permission is blocked. Enable it in Settings.",
      canOpenSettings: true,
    };
  }

  return { granted: false, reason: "Bluetooth permission was not granted." };
}

async function requestAndroidBluetooth(): Promise<PermissionResult> {
  const apiLevel = await DeviceInfo.getApiLevel();

  if (apiLevel >= 31) {
    const scan = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Bluetooth Permission",
        message: "Phone Buddy needs Bluetooth to scan and connect to devices.",
        buttonPositive: "Allow",
        buttonNegative: "Deny",
      }
    );

    const connect = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth Permission",
        message: "Phone Buddy needs Bluetooth to connect to devices.",
        buttonPositive: "Allow",
        buttonNegative: "Deny",
      }
    );

    const ok = scan === PermissionsAndroid.RESULTS.GRANTED &&
               connect === PermissionsAndroid.RESULTS.GRANTED;

    return ok
      ? { granted: true }
      : { granted: false, reason: "Bluetooth permissions not granted." };
  }

  // Older Android: location permission is typically required to scan for BLE devices.
  const fine = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: "Location Permission",
      message:
        "Android requires location permission to scan for Bluetooth devices. Phone Buddy only uses location when a device disconnects.",
      buttonPositive: "Allow",
      buttonNegative: "Deny",
    }
  );

  return fine === PermissionsAndroid.RESULTS.GRANTED
    ? { granted: true }
    : { granted: false, reason: "Location permission not granted for BLE scan." };
}

export async function requestBluetoothPermission(): Promise<PermissionResult> {
  if (Platform.OS === "ios") return requestIOSBluetooth();
  if (Platform.OS === "android") return requestAndroidBluetooth();
  return { granted: false, reason: "Unsupported platform." };
}

export async function goToSettings() {
  await openSettings();
}

// Legacy compatibility - keep the class-based API for existing code
class BluetoothPermissions {
  async checkPermission(): Promise<{ granted: boolean; status: string; message?: string }> {
    if (Platform.OS === "ios") {
      const status = await check(PERMISSIONS.IOS.BLUETOOTH);
      return {
        granted: status === RESULTS.GRANTED || status === RESULTS.LIMITED,
        status: status === RESULTS.GRANTED || status === RESULTS.LIMITED ? 'granted' : 'denied',
      };
    }
    // For Android, we'd need to check multiple permissions - simplified for now
    return { granted: false, status: 'unknown' };
  }

  async requestPermission(): Promise<{ granted: boolean; status: string; message?: string }> {
    const result = await requestBluetoothPermission();
    return {
      granted: result.granted,
      status: result.granted ? 'granted' : 'denied',
      message: result.reason,
    };
  }

  async requestAllPermissions() {
    return this.requestPermission();
  }
}

export const bluetoothPermissions = new BluetoothPermissions();

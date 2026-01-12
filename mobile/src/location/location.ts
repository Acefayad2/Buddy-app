/**
 * Location service for capturing last known location
 * Uses react-native-geolocation-service for better Android support
 */

import { Platform } from "react-native";
import Geolocation, { GeoPosition } from "react-native-geolocation-service";
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from "react-native-permissions";

export type LastLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
};

async function ensureLocationPermissionIOS(): Promise<boolean> {
  const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
  if (status === RESULTS.GRANTED) return true;

  const req = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
  return req === RESULTS.GRANTED;
}

async function ensureLocationPermissionAndroid(): Promise<boolean> {
  const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  if (status === RESULTS.GRANTED) return true;

  const req = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  return req === RESULTS.GRANTED;
}

export async function getLastKnownLocationOnce(): Promise<LastLocation | null> {
  const ok =
    Platform.OS === "ios"
      ? await ensureLocationPermissionIOS()
      : await ensureLocationPermissionAndroid();

  if (!ok) return null;

  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (pos: GeoPosition) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? undefined,
          timestamp: pos.timestamp ?? Date.now(),
        });
      },
      (_err) => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 5000,
      }
    );
  });
}

// Legacy compatibility - keep the class-based API for existing code
class LocationService {
  /**
   * Log location (for disconnect events)
   * This is called when a device disconnects to capture the last known location ONCE
   */
  async logLocation(deviceId: string, deviceName: string): Promise<void> {
    const location = await getLastKnownLocationOnce();
    
    if (location) {
      const logEntry = {
        deviceId,
        deviceName,
        location,
        timestamp: new Date().toISOString(),
        disconnectedAt: new Date().toISOString(),
      };
      
      console.log('Device disconnected - Last known location:', JSON.stringify(logEntry, null, 2));
      
      // TODO: Store in AsyncStorage or send to backend
      // await AsyncStorage.setItem(`disconnect_${deviceId}`, JSON.stringify(logEntry));
    } else {
      console.warn(`Failed to capture location for ${deviceName}: Permission denied or location unavailable`);
    }
  }
}

export const locationService = new LocationService();

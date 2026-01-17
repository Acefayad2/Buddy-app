# Location Tracking Setup for Cursor

This document contains all information needed to implement device location tracking in the Phone Buddy app.

## 🎯 Goal

Add real-time location tracking so users can:
- See device locations on a map
- Track device movements over time
- View last known location of devices
- Calculate distances between devices

## 📋 Current Status

**What's Working:**
- ✅ Device management (create, read, update, delete)
- ✅ User authentication
- ✅ Database integration with Supabase
- ✅ Device storage in `devices` table

**What's Missing:**
- ❌ Location fields in database schema
- ❌ Location update service
- ❌ Real-time location tracking
- ❌ Map display with actual device locations

## 🔧 Step 1: Update Database Schema

### Add Location Fields to Devices Table

The `devices` table needs location columns. Create a new migration file or add to existing:

**SQL Migration to Add Location Fields:**

```sql
-- Add location fields to devices table
ALTER TABLE public.devices 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS location_accuracy DOUBLE PRECISION;

-- Add index for location queries
CREATE INDEX IF NOT EXISTS idx_devices_location ON public.devices(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add index for location update queries
CREATE INDEX IF NOT EXISTS idx_devices_last_location_update ON public.devices(last_location_update DESC)
WHERE last_location_update IS NOT NULL;
```

**Location:** Add this SQL to a new migration file: `supabase/migrations/007_add_location_tracking.sql`

**File to Create:** `supabase/migrations/007_add_location_tracking.sql`

## 🔧 Step 2: Update TypeScript Types

### Update Shared Types

**File:** `shared/types/index.ts`

**Add location fields to Device interface:**

```typescript
export interface Device {
  device_id: string
  user_id: string
  device_name: string
  device_type: 'iOS' | 'Android'
  ble_identifier: string
  created_at: string
  updated_at?: string
  // Add location fields:
  latitude?: number | null
  longitude?: number | null
  last_location_update?: string | null
  location_accuracy?: number | null
}
```

## 🔧 Step 3: Update Device Service Functions

### Update Device Service

**File:** `lib/devices.ts`

**Add location update function:**

```typescript
/**
 * Update device location
 */
export async function updateDeviceLocation(
  deviceId: string, 
  location: {
    latitude: number
    longitude: number
    accuracy?: number
  }
): Promise<Device> {
  const { data, error } = await supabase
    .from('devices')
    .update({
      latitude: location.latitude,
      longitude: location.longitude,
      last_location_update: new Date().toISOString(),
      location_accuracy: location.accuracy || null,
    })
    .eq('device_id', deviceId)
    .select()
    .single()

  if (error) {
    console.error('Error updating device location:', error)
    throw error
  }

  return data as Device
}
```

**Update `deviceToUI` function to include location:**

```typescript
export function deviceToUI(device: Device, additionalData?: {
  status?: "connected" | "nearby" | "away"
  battery?: number
  signal?: number
  distance?: number
  location?: { lat: number; lng: number }
  bluetoothDeviceId?: string
  bluetoothDeviceName?: string
}): DeviceWithUI {
  // ... existing code ...
  
  return {
    id: device.device_id,
    name: device.device_name,
    type: typeMap[device.device_type] || 'phone',
    status: additionalData?.status || 'away',
    battery: additionalData?.battery,
    signal: additionalData?.signal,
    lastSeen: device.last_location_update || device.created_at,
    distance: additionalData?.distance,
    // Use database location if available, otherwise use additionalData
    location: device.latitude && device.longitude 
      ? { lat: device.latitude, lng: device.longitude }
      : additionalData?.location,
    bluetoothDeviceId: additionalData?.bluetoothDeviceId,
    bluetoothDeviceName: additionalData?.bluetoothDeviceName,
  }
}
```

## 🔧 Step 4: Update Dashboard to Fetch Locations

### Update Dashboard Page

**File:** `app/dashboard/page.tsx`

**Update device loading to include location data:**

The `loadDevices` function should already work, but ensure devices with location are displayed correctly. The `deviceToUI` function should handle location conversion.

**No major changes needed** - the dashboard should automatically show location data once devices have `latitude` and `longitude` values.

## 🔧 Step 5: Update Find My Map Component

### Update Map Component to Use Real Locations

**File:** `components/dashboard/find-my-map.tsx`

**Replace mock locations with real device locations:**

```typescript
// Find the device location map function
const getDeviceLocations = () => {
  const locations: Record<string, { lat: number; lng: number }> = {}
  devices.forEach(device => {
    // Check if device has location data
    // You'll need to pass location data from parent component
    // For now, this assumes devices have location property
    if (device.location) {
      locations[device.id] = device.location
    }
  })
  return locations
}

// Update getMapUrl to use real locations
const getMapUrl = () => {
  const deviceLocations = getDeviceLocations()
  if (Object.keys(deviceLocations).length === 0) {
    // Default to San Francisco if no locations
    return `https://www.openstreetmap.org/export/embed.html?bbox=-122.5,37.7,-122.3,37.8&layer=mapnik&marker=37.7749,-122.4194`
  }
  
  // Calculate bounds from real locations
  const lats = Object.values(deviceLocations).map(loc => loc.lat)
  const lngs = Object.values(deviceLocations).map(loc => loc.lng)
  const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length
  const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
  
  const minLat = Math.min(...lats) - 0.01
  maxLat = Math.max(...lats) + 0.01
  const minLng = Math.min(...lngs) - 0.01
  const maxLng = Math.max(...lngs) + 0.01
  
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${centerLat},${centerLng}`
}
```

**Note:** The component needs to receive location data from the parent. Make sure devices passed to `FindMyMap` include location data.

## 🔧 Step 6: Create Location Update Service (For Mobile App)

### Mobile App Location Service

**File:** `mobile/src/services/location-tracking.ts` (create new file)

```typescript
/**
 * Location tracking service for mobile app
 * Sends device location updates to Supabase
 */

import { supabase } from './supabase'
import { getLastKnownLocationOnce } from '../location/location'
import * as DeviceInfo from 'expo-device'

/**
 * Update device location in Supabase
 */
export async function updateDeviceLocationInSupabase(
  deviceId: string,
  userId: string
): Promise<void> {
  try {
    const location = await getLastKnownLocationOnce()
    if (!location) {
      console.log('No location available')
      return
    }

    const { error } = await supabase
      .from('devices')
      .update({
        latitude: location.lat,
        longitude: location.lng,
        last_location_update: new Date(location.timestamp).toISOString(),
        location_accuracy: location.accuracy || null,
      })
      .eq('device_id', deviceId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating device location:', error)
      throw error
    }

    console.log(`Location updated for device ${deviceId}`)
  } catch (error) {
    console.error('Failed to update device location:', error)
  }
}

/**
 * Start periodic location updates
 * Call this when app starts or when device tracking begins
 */
export function startLocationTracking(
  deviceId: string,
  userId: string,
  intervalMs: number = 60000 // Default: 1 minute
): () => void {
  // Update immediately
  updateDeviceLocationInSupabase(deviceId, userId)

  // Then update periodically
  const intervalId = setInterval(() => {
    updateDeviceLocationInSupabase(deviceId, userId)
  }, intervalMs)

  // Return cleanup function
  return () => {
    clearInterval(intervalId)
  }
}
```

## 🔧 Step 7: Update Device Card to Show Real Location

### Update Device Card Component

**File:** `components/dashboard/device-card.tsx`

**Update location display to use real coordinates:**

The device card already has location display logic. Ensure it uses `device.location` from the database instead of mock data.

## 📝 Implementation Checklist

### Database Changes:
- [ ] Create migration file `supabase/migrations/007_add_location_tracking.sql`
- [ ] Add `latitude`, `longitude`, `last_location_update`, `location_accuracy` columns
- [ ] Add indexes for location queries
- [ ] Run migration in Supabase SQL Editor

### TypeScript Types:
- [ ] Update `Device` interface in `shared/types/index.ts`
- [ ] Add location fields to type definitions

### Service Functions:
- [ ] Add `updateDeviceLocation` function to `lib/devices.ts`
- [ ] Update `deviceToUI` to handle location data
- [ ] Create location tracking service for mobile app

### Frontend Components:
- [ ] Update `find-my-map.tsx` to use real device locations
- [ ] Ensure device cards display location data
- [ ] Update dashboard to pass location data to map

### Mobile App (Optional):
- [ ] Create location tracking service
- [ ] Implement periodic location updates
- [ ] Integrate with device registration

## 🧪 Testing Steps

After implementation:

1. **Test Database Schema:**
   - Verify location columns exist in `devices` table
   - Check indexes are created

2. **Test Location Updates:**
   - Manually update a device location in Supabase
   - Verify location appears in dashboard
   - Check map shows device location

3. **Test Map Display:**
   - Add device with location
   - Verify device appears on map
   - Check map bounds adjust to show devices

4. **Test Mobile App (if implemented):**
   - Register device from mobile app
   - Verify location updates are sent
   - Check location appears in web dashboard

## ⚠️ Important Notes

1. **Privacy:** Location data is sensitive. Ensure RLS policies protect user data.

2. **Permissions:** Mobile app needs location permissions to track devices.

3. **Battery Usage:** Continuous location tracking can drain battery. Consider:
   - Update intervals (e.g., every 1-5 minutes)
   - Only track when app is active
   - Use low-power location modes

4. **RLS Policies:** Current RLS policies should already work - users can only update their own devices.

5. **Null Handling:** Devices may not have locations initially. Handle null/undefined gracefully in UI.

## 🔍 Files to Modify/Create

**Files to Create:**
- `supabase/migrations/007_add_location_tracking.sql`
- `mobile/src/services/location-tracking.ts` (optional, for mobile app)

**Files to Modify:**
- `shared/types/index.ts` - Add location fields to Device interface
- `lib/devices.ts` - Add location update function
- `components/dashboard/find-my-map.tsx` - Use real locations
- `app/dashboard/page.tsx` - Ensure location data is passed through

## 📊 Database Schema After Changes

```sql
CREATE TABLE public.devices (
  device_id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  ble_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- NEW: Location fields
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  last_location_update TIMESTAMPTZ,
  location_accuracy DOUBLE PRECISION,
  UNIQUE(user_id, ble_identifier)
);
```

## ✅ Success Criteria

After implementation, the app should:
- ✅ Store device locations in database
- ✅ Display devices on map with real coordinates
- ✅ Update device locations (via API or mobile app)
- ✅ Show last known location for each device
- ✅ Calculate distances between devices
- ✅ Handle devices without locations gracefully

---

**Status:** Ready for implementation. All required information is provided above.

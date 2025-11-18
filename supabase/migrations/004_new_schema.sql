-- Phone Buddy New Schema Migration
-- Updates existing schema to match new architecture requirements
-- Run this AFTER existing migrations (001, 002, 003)

-- Drop old tables if they exist (be careful in production!)
-- Uncomment only if you want to reset:
-- DROP TABLE IF EXISTS public.alerts CASCADE;
-- DROP TABLE IF EXISTS public.devices CASCADE;

-- ============================================================================
-- Profiles Table (extends auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Devices Table (new schema)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.devices (
  device_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('iOS', 'Android')),
  ble_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure unique BLE identifier per user
  UNIQUE(user_id, ble_identifier)
);

-- ============================================================================
-- ProximityEvents Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.proximity_events (
  event_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_a UUID REFERENCES public.devices(device_id) ON DELETE CASCADE NOT NULL,
  device_b UUID REFERENCES public.devices(device_id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  distance_estimate FLOAT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('ENTER', 'EXIT')),
  -- Ensure device_a < device_b to avoid duplicate pairs
  CHECK (device_a < device_b)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_ble_identifier ON public.devices(ble_identifier);
CREATE INDEX IF NOT EXISTS idx_proximity_events_device_a ON public.proximity_events(device_a);
CREATE INDEX IF NOT EXISTS idx_proximity_events_device_b ON public.proximity_events(device_b);
CREATE INDEX IF NOT EXISTS idx_proximity_events_timestamp ON public.proximity_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_proximity_events_device_pair ON public.proximity_events(device_a, device_b, timestamp DESC);

-- ============================================================================
-- Function to automatically create profile on user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Function to normalize device pair (always device_a < device_b)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.normalize_device_pair(
  device1 UUID,
  device2 UUID
) RETURNS TABLE(device_a UUID, device_b UUID) AS $$
BEGIN
  IF device1 < device2 THEN
    RETURN QUERY SELECT device1, device2;
  ELSE
    RETURN QUERY SELECT device2, device1;
  END IF;
END;
$$ LANGUAGE plpgsql;



-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS public.proximity_events CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.devices CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- Profiles Table (extends auth.users)
-- ============================================================================

CREATE TABLE public.profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- Devices Table
-- ============================================================================

CREATE TABLE public.devices (
  device_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('iOS', 'Android')),
  ble_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, ble_identifier)
);

-- ============================================================================
-- Proximity Events Table
-- ============================================================================

CREATE TABLE public.proximity_events (
  event_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_a UUID REFERENCES public.devices(device_id) ON DELETE CASCADE NOT NULL,
  device_b UUID REFERENCES public.devices(device_id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  distance_estimate FLOAT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('ENTER', 'EXIT')),
  CHECK (device_a < device_b)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX idx_devices_user_id ON public.devices(user_id);
CREATE INDEX idx_devices_ble_identifier ON public.devices(ble_identifier);
CREATE INDEX idx_proximity_events_device_a ON public.proximity_events(device_a);
CREATE INDEX idx_proximity_events_device_b ON public.proximity_events(device_b);
CREATE INDEX idx_proximity_events_timestamp ON public.proximity_events(timestamp DESC);
CREATE INDEX idx_proximity_events_device_pair ON public.proximity_events(device_a, device_b, timestamp DESC);

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
-- Function to update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for devices updated_at
DROP TRIGGER IF EXISTS update_devices_updated_at ON public.devices;
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- Enable Row Level Security
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proximity_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for Profiles
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies for Devices
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own devices" ON public.devices;
CREATE POLICY "Users can view own devices"
  ON public.devices
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own devices" ON public.devices;
CREATE POLICY "Users can insert own devices"
  ON public.devices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own devices" ON public.devices;
CREATE POLICY "Users can update own devices"
  ON public.devices
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own devices" ON public.devices;
CREATE POLICY "Users can delete own devices"
  ON public.devices
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies for Proximity Events
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own proximity events" ON public.proximity_events;
CREATE POLICY "Users can view own proximity events"
  ON public.proximity_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.devices d
      WHERE (d.device_id = proximity_events.device_a OR d.device_id = proximity_events.device_b)
      AND d.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own proximity events" ON public.proximity_events;
CREATE POLICY "Users can insert own proximity events"
  ON public.proximity_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.devices d
      WHERE (d.device_id = proximity_events.device_a OR d.device_id = proximity_events.device_b)
      AND d.user_id = auth.uid()
    )
  );

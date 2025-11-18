-- Row Level Security (RLS) Policies for New Schema
-- Run after 004_new_schema.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proximity_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own devices" ON public.devices;
DROP POLICY IF EXISTS "Users can insert own devices" ON public.devices;
DROP POLICY IF EXISTS "Users can update own devices" ON public.devices;
DROP POLICY IF EXISTS "Users can delete own devices" ON public.devices;

-- ============================================================================
-- Profiles Policies
-- ============================================================================

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Devices Policies
-- ============================================================================

CREATE POLICY "Users can view own devices"
  ON public.devices
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON public.devices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON public.devices
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON public.devices
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Proximity Events Policies
-- Users can only see events involving their own devices
-- ============================================================================

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

-- Users typically don't need to update/delete events, but add if needed:
-- CREATE POLICY "Users can delete own proximity events"
--   ON public.proximity_events
--   FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.devices d
--       WHERE (d.device_id = proximity_events.device_a OR d.device_id = proximity_events.device_b)
--       AND d.user_id = auth.uid()
--     )
--   );



-- Row Level Security (RLS) Policies for Phone Buddy
-- These policies ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Devices policies
-- Users can view their own devices
CREATE POLICY "Users can view own devices"
  ON public.devices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own devices
CREATE POLICY "Users can insert own devices"
  ON public.devices
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own devices
CREATE POLICY "Users can update own devices"
  ON public.devices
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own devices
CREATE POLICY "Users can delete own devices"
  ON public.devices
  FOR DELETE
  USING (auth.uid() = user_id);

-- Alerts policies
-- Users can view their own alerts
CREATE POLICY "Users can view own alerts"
  ON public.alerts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own alerts
CREATE POLICY "Users can insert own alerts"
  ON public.alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own alerts
CREATE POLICY "Users can delete own alerts"
  ON public.alerts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Optional: Allow users to update alerts (if needed)
-- CREATE POLICY "Users can update own alerts"
--   ON public.alerts
--   FOR UPDATE
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);



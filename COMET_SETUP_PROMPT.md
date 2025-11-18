# Comet Setup Prompt for Phone Buddy Supabase

Copy and paste this entire prompt to Comet:

---

I need you to help me set up Supabase for my Phone Buddy app - a multi-user Next.js application that will scale to hundreds of users. Please follow these steps:

## Task Overview
Set up a complete Supabase database with proper schema, Row Level Security (RLS), and performance optimizations for a multi-tenant application.

## Step 1: Create the Database Schema

Run this SQL in the Supabase SQL Editor (in order):

### Migration 1: Initial Schema
```sql
-- Phone Buddy Database Schema
-- Multi-user application with Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
-- This table stores additional user profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Devices table
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  bluetooth_id TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure unique bluetooth_id per user (same device can't be added twice)
  UNIQUE(user_id, bluetooth_id)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance (important for hundreds of users)
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_bluetooth_id ON public.devices(bluetooth_id);
CREATE INDEX IF NOT EXISTS idx_devices_is_active ON public.devices(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON public.alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_devices
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Migration 2: Row Level Security Policies
```sql
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
```

### Migration 3: Performance Indexes
```sql
-- Additional performance indexes for scaling to hundreds of users
-- These indexes optimize common query patterns

-- Composite index for common device queries (user + active status)
CREATE INDEX IF NOT EXISTS idx_devices_user_active 
  ON public.devices(user_id, is_active) 
  WHERE is_active = true;

-- Index for recent alerts (common query pattern)
CREATE INDEX IF NOT EXISTS idx_alerts_user_recent 
  ON public.alerts(user_id, created_at DESC);

-- Index for device alerts lookup
CREATE INDEX IF NOT EXISTS idx_alerts_device_created 
  ON public.alerts(device_id, created_at DESC);

-- Full text search index for device names (if you want search functionality)
CREATE INDEX IF NOT EXISTS idx_devices_name_search 
  ON public.devices USING gin(to_tsvector('english', name));

-- Partial index for active devices only (saves space)
CREATE INDEX IF NOT EXISTS idx_devices_active_only 
  ON public.devices(user_id, created_at DESC) 
  WHERE is_active = true;
```

## Step 2: Configure Authentication Settings

Please guide me through or configure:
1. Go to Authentication → Settings
2. Enable Email Signup: ON
3. Enable Confirm Email: ON (for production)
4. Enable Secure Email Change: ON
5. Set Site URL to: `http://localhost:3232` (for development)
6. Add Redirect URLs:
   - `http://localhost:3232/**`
   - `https://localhost:3232/**`

## Step 3: Get Environment Variables

Please provide me with:
1. Project URL (from Settings → API)
2. Anon/Public Key (from Settings → API)
3. Service Role Key (from Settings → API - keep this secret!)

I need these to create my `.env.local` file.

## Step 4: Verify Setup

After running the migrations, please:
1. Verify RLS is enabled on all tables (profiles, devices, alerts)
2. Check that indexes were created successfully
3. Confirm the trigger function `handle_new_user` exists
4. Test that a new user signup automatically creates a profile

## Step 5: Create Environment File Template

Create a `.env.local` file with this structure:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Important Notes:
- This is a multi-user application that needs to scale to hundreds of users
- Row Level Security (RLS) is critical - users must only see their own data
- All tables have proper indexes for performance
- The setup includes automatic profile creation on user signup
- Foreign key constraints ensure data integrity
- Unique constraints prevent duplicate device links per user

Please execute these migrations in order and confirm each step is completed successfully. Let me know if you encounter any errors or need clarification.

---


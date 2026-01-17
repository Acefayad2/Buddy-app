# Supabase Setup Information for Comet

This document contains all information needed to complete the Supabase backend setup for the Phone Buddy app.

## ✅ Current Status

The app is **fully integrated with Supabase** on the frontend:
- ✅ Authentication system (signup/login) 
- ✅ Device CRUD operations (create, read, update, delete)
- ✅ User session management
- ✅ Protected routes

## 📋 What Needs to be Done

### 1. Run Database Migration

The complete database schema is in: `supabase/migrations/006_complete_schema.sql`

**Action Required:**
- Copy the contents of `supabase/migrations/006_complete_schema.sql`
- Run it in the Supabase SQL Editor
- This will create all tables, indexes, triggers, and RLS policies

### 2. Verify Tables Created

After running the migration, verify these tables exist in Supabase:
- ✅ `public.profiles`
- ✅ `public.devices`
- ✅ `public.proximity_events`

Each table should have:
- Row Level Security (RLS) enabled
- Proper indexes
- Foreign key constraints

## 🔑 Environment Variables

The app expects these environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://taiaaatoixymiajxqhjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaWFhYXRvaXh5bWlhanhxaGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODM4MzEsImV4cCI6MjA3ODY1OTgzMX0.5lMLN5mIAJCEtp3c1UamYHFpNHP_E3UmgmXrwhZT2uU

# Service role key (for server-side scripts, optional)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaWFhYXRvaXh5bWlhanhxaGpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA4MzgzMSwiZXhwIjoyMDc4NjU5ODMxfQ.LYASsDI9pnsgASIGWCgYXA2TsIVP3Guw8btQTRRo9yw

# Mobile App Configuration (optional)
EXPO_PUBLIC_SUPABASE_URL=https://taiaaatoixymiajxqhjo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaWFhYXRvaXh5bWlhanhxaGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODM4MzEsImV4cCI6MjA3ODY1OTgzMX0.5lMLN5mIAJCEtp3c1UamYHFpNHP_E3UmgmXrwhZT2uU
```

**Note:** The `.env.local` file should already exist with these values. Verify it's configured correctly.

## 📊 Database Schema Overview

### Tables Created:

1. **`public.profiles`**
   - Extends `auth.users`
   - Fields: `user_id` (PK), `name`, `created_at`, `updated_at`
   - Auto-created when user signs up (via trigger)

2. **`public.devices`**
   - Stores user devices
   - Fields: `device_id` (PK), `user_id` (FK), `device_name`, `device_type` ('iOS'/'Android'), `ble_identifier`, `created_at`, `updated_at`
   - Unique constraint: `(user_id, ble_identifier)`

3. **`public.proximity_events`**
   - Tracks device proximity events
   - Fields: `event_id` (PK), `device_a` (FK), `device_b` (FK), `timestamp`, `distance_estimate`, `event_type` ('ENTER'/'EXIT')
   - Constraint: `device_a < device_b` (prevents duplicate pairs)

### Security (RLS Policies):

All tables have Row Level Security enabled with policies:
- Users can only SELECT/INSERT/UPDATE/DELETE their own data
- Based on `auth.uid() = user_id` matching

### Triggers:

1. **`handle_new_user`** - Auto-creates profile when user signs up
2. **`handle_updated_at`** - Auto-updates `updated_at` timestamp on profile/device updates

## 🧪 Testing the Setup

After migration is complete:

1. **Test Authentication:**
   - Go to `/auth/signup`
   - Create a new account
   - Verify profile is auto-created in `public.profiles` table

2. **Test Device Management:**
   - Log in to dashboard
   - Add a device (via pairing modal)
   - Verify device appears in `public.devices` table
   - Update/delete a device and verify changes persist

3. **Verify RLS:**
   - Create two test users
   - Each user should only see their own devices
   - Users cannot access each other's data

## 🔍 SQL Migration File Location

The complete migration SQL is at:
```
supabase/migrations/006_complete_schema.sql
```

**Important:** This migration:
- ✅ Drops old tables first (to avoid conflicts)
- ✅ Creates all tables fresh
- ✅ Sets up indexes for performance
- ✅ Enables RLS and creates policies
- ✅ Creates triggers for auto-profile creation and updated_at timestamps

## 🚀 Next Steps (After Migration)

Once the database is set up:

1. ✅ The app is ready to use
2. Users can sign up/login
3. Users can add/manage devices
4. All data persists in Supabase

## ⚠️ Important Notes

1. **Migration Safety:** The migration drops existing tables first. This is safe for new projects but would delete existing data in production.

2. **RLS:** All tables are protected by Row Level Security. Users can only access their own data.

3. **Environment Variables:** Make sure `.env.local` exists with the correct values (it should already be set up).

4. **Profile Auto-Creation:** When a user signs up via Supabase Auth, a profile is automatically created via the `handle_new_user` trigger.

## 📝 Quick Reference

- **Supabase Project URL:** https://taiaaatoixymiajxqhjo.supabase.co
- **Migration File:** `supabase/migrations/006_complete_schema.sql`
- **Environment Template:** `.env.local.example`
- **Current Environment:** `.env.local` (should already exist)

## ✅ Checklist for Comet

- [ ] Run SQL migration from `supabase/migrations/006_complete_schema.sql` in Supabase SQL Editor
- [ ] Verify all 3 tables exist (`profiles`, `devices`, `proximity_events`)
- [ ] Verify RLS is enabled on all tables
- [ ] Verify `.env.local` file exists with correct environment variables
- [ ] Test user signup (should auto-create profile)
- [ ] Test device creation (should persist to database)
- [ ] Test RLS (users can only see their own data)

---

**Status:** Frontend is fully integrated. Only the database migration needs to be run to complete the setup.

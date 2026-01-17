# Prompt for Comet: Create Supabase User Account

## Task
Create a user account in Supabase for the Phone Buddy app with the following credentials:
- **Email:** `acefayad@gmail.com`
- **Password:** `abcd1234`

## Supabase Project Details
- **Project URL:** `https://taiaaatoixymiajxqhjo.supabase.co`
- **Project Reference:** `taiaaatoixymiajxqhjo`

## Steps to Complete

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to the Supabase Dashboard: https://supabase.com/dashboard
2. Select the project: `taiaaatoixymiajxqhjo`
3. Navigate to **Authentication** → **Users** in the left sidebar
4. Click the **"Add User"** button (or **"Create new user"**)
5. In the user creation form:
   - **Email:** Enter `acefayad@gmail.com`
   - **Password:** Enter `abcd1234`
   - **Auto Confirm User:** ✅ Check this box (IMPORTANT - this allows immediate login without email verification)
   - **Send Magic Link:** Leave unchecked
6. Click **"Create User"** or **"Add User"**

### Option 2: Using Supabase SQL Editor

If you prefer using SQL, run this in the Supabase SQL Editor:

```sql
-- Create user account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'acefayad@gmail.com',
  crypt('abcd1234', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Ace Fayad"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO NOTHING;
```

**Note:** The SQL method requires the `pgcrypto` extension. The Dashboard method is simpler and recommended.

## Verification Steps

After creating the user:

1. **Verify User Exists:**
   - Go to Authentication → Users
   - You should see `acefayad@gmail.com` in the list
   - Status should show as "Confirmed" or "Active"

2. **Verify Profile Created:**
   - Go to Table Editor → `profiles` table
   - You should see a profile row with `user_id` matching the user's ID
   - The profile should have `name` field (auto-created by trigger)

3. **Test Login:**
   - The app will automatically try to log in with these credentials
   - If successful, you'll see the dashboard
   - If it fails, check the browser console for errors

## Expected Result

- ✅ User account created in `auth.users` table
- ✅ Profile automatically created in `public.profiles` table (via trigger)
- ✅ User can log in immediately (no email verification needed)
- ✅ App will auto-login on dashboard load

## Troubleshooting

**If user creation fails:**
- Check that email format is correct: `acefayad@gmail.com`
- Ensure password meets requirements (usually min 6 characters)
- Verify you're in the correct Supabase project

**If profile not created:**
- Check that migration `006_complete_schema.sql` was run (creates the trigger)
- Verify the `handle_new_user()` trigger exists
- Manually create profile if needed (not recommended)

**If auto-login fails:**
- Check browser console for error messages
- Verify user exists in Supabase
- Check that "Auto Confirm User" was checked during creation
- Try manual login at `/auth/login` to test credentials

## Important Notes

- The password is stored encrypted in Supabase (secure)
- The user will be automatically confirmed (no email verification needed)
- A profile will be auto-created via database trigger
- The app expects this exact email/password combination for auto-login

---

**Once complete, the Phone Buddy app will automatically log in with these credentials and all database operations will work properly!**

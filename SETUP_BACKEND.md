# How to Set Up Supabase Backend (For AI Assistant)

This guide explains how to set me (your AI assistant) up so I can automatically configure your Supabase backend.

## Quick Setup Steps

### Step 1: Get Your Supabase Credentials

1. **Create a Supabase Project** (if you haven't already):
   - Go to [app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Fill in your project details
   - Wait for the project to be created

2. **Get Your Project Credentials**:
   - Go to your project dashboard
   - Navigate to **Project Settings** → **API**
   - You'll need these three values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon/public key** (a long string)
     - **service_role key** (a long string - keep this secret!)

3. **Get Your Project Reference ID**:
   - In your project settings, find your **Project Reference ID**
   - Or extract it from your URL: `https://[PROJECT_REF].supabase.co`

### Step 2: Share Credentials with AI

You can share your credentials in one of two ways:

#### Option A: Create `.env.local` File (Recommended)

Create a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Then tell me: **"I've created the .env.local file with my Supabase credentials"**

#### Option B: Share Directly in Chat

You can share the credentials directly in our conversation. I'll help you set everything up. Example:

**"Here are my Supabase credentials:**
- **URL**: https://xxxxx.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Project Ref**: xxxxx"

### Step 3: I'll Set Everything Up

Once I have the credentials, I can:

1. ✅ **Verify your credentials** are correct
2. ✅ **Run database migrations** to create all tables
3. ✅ **Set up Row Level Security (RLS)** policies
4. ✅ **Configure authentication** settings
5. ✅ **Test the connection** and verify everything works
6. ✅ **Seed development data** (optional)

## What Gets Set Up

### Database Schema

The following tables will be created:

- **`profiles`** - User profiles (linked to auth.users)
- **`devices`** - Bluetooth devices for proximity tracking
- **`proximity_events`** - Events when devices come in/out of range

### Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Automatic profile creation when users sign up

### Features

- Multi-user support
- Device pairing and management
- Proximity event tracking
- Secure authentication

## Setup Methods

### Method 1: Using Supabase CLI (Recommended)

I can use the Supabase CLI to automatically apply migrations:

```bash
# I'll run these commands for you:
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### Method 2: Using Supabase Dashboard

I'll guide you through running SQL migrations in the Supabase dashboard if CLI isn't available.

### Method 3: Direct SQL Execution

If you give me access to your Supabase project via the service role key, I can execute migrations directly using the Supabase JS client.

## After Setup

Once everything is set up, you can:

1. **Start your app**: `npm run dev`
2. **Test authentication**: Sign up/login
3. **Add devices**: Pair Bluetooth devices
4. **Monitor events**: View proximity events in real-time

## Troubleshooting

### "Invalid API key"
- Double-check your keys are correct
- Make sure there are no extra spaces or newlines
- Verify the keys match your project

### "Relation does not exist"
- Migrations haven't been run yet
- I'll help you run them

### "Row Level Security policy violation"
- RLS policies need to be set up
- I'll configure them during setup

## Security Notes

⚠️ **Important**:
- The **service_role key** has admin privileges and bypasses RLS
- Never commit `.env.local` to git (it's already in .gitignore)
- Never expose the service_role key in client-side code
- Only share credentials in a secure environment

## Next Steps

Once you've shared your credentials (via `.env.local` or directly), just say:

**"Set up the Supabase backend"** or **"Run the database migrations"**

And I'll take care of everything! 🚀

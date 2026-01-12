# Next Steps: Set Up Your Supabase Database

Your `.env.local` file is configured! Now you need to run the database migrations.

## Step 1: Open Supabase Dashboard

1. Go to: **https://app.supabase.com/project/taiaaatoixymiajxqhjo**
2. Make sure you're logged in

## Step 2: Run the Migration

1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"** button (top right)
3. Copy the entire contents of: `supabase/migrations/006_complete_schema.sql`
4. Paste it into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. Wait for it to complete (you should see "Success. No rows returned")

## Step 3: Verify Setup

After running the migration, verify everything is set up:

1. Click **"Table Editor"** in the left sidebar
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `devices`
   - ✅ `proximity_events`
3. Click on each table and verify:
   - **RLS Enabled** shows a green checkmark ✓
   - The columns look correct

## Step 4: Configure Authentication (Optional but Recommended)

1. Click **"Authentication"** → **"Settings"** in the left sidebar
2. Under **"Site URL"**, set it to: `http://localhost:3232` (for local dev)
3. Under **"Redirect URLs"**, add:
   - `http://localhost:3232/**`
   - (Add your production URL when you deploy)

## You're Done! 🎉

Your Supabase backend is now set up. You can:
- Start using authentication in your app
- Store and retrieve devices
- Track proximity events
- Everything will work with Row Level Security (users can only see their own data)

## Testing (Optional)

To test everything works:
1. Try signing up a user in your app
2. Check **Authentication** → **Users** in Supabase - you should see the new user
3. Check **Table Editor** → **profiles** - a profile should be automatically created
4. Start adding devices and tracking events!

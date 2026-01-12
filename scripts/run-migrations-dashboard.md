# Run Migrations via Supabase Dashboard

Since you prefer not to share the service role key, here's how to set up the database manually using the Supabase Dashboard SQL Editor.

## Step-by-Step Instructions

### 1. Open Your Supabase Project
1. Go to: https://app.supabase.com/project/taiaaatoixymiajxqhjo
2. Navigate to **SQL Editor** (in the left sidebar)

### 2. Run Migration 1: Create Tables
1. Click **"New query"** in SQL Editor
2. Copy the entire contents of: `supabase/migrations/004_new_schema.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** (or press Ctrl/Cmd + Enter)
5. Wait for it to complete successfully

### 3. Run Migration 2: Set Up Security Policies
1. Click **"New query"** again
2. Copy the entire contents of: `supabase/migrations/005_new_rls_policies.sql`
3. Paste it into the SQL Editor
4. Click **"Run"**
5. Wait for it to complete successfully

### 4. Verify Setup
1. Go to **Table Editor** (in the left sidebar)
2. You should see these tables:
   - `profiles`
   - `devices`
   - `proximity_events`
3. Click on each table and verify **"RLS Enabled"** shows a green checkmark

### 5. Test Authentication
1. Go to **Authentication** → **Users**
2. Try creating a test user (or sign up through your app)
3. Check **Table Editor** → `profiles` table - a profile should be automatically created

## Troubleshooting

If you see errors:
- **"relation already exists"** - Some tables may already exist, that's okay
- **"permission denied"** - Make sure you're using the SQL Editor (you have admin access there)
- **Syntax errors** - Copy the entire file content, make sure nothing was truncated

## Next Steps After Migrations

Once migrations are complete:
1. Your `.env.local` is already configured
2. You can test the app connection
3. Start using authentication and device tracking features

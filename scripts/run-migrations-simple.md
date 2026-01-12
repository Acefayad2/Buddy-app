# Quick Guide: Run Supabase Migrations

## Option 1: Supabase Dashboard (Easiest - No CLI needed)

1. **Go to your Supabase Dashboard:**
   - https://app.supabase.com/project/taiaaatoixymiajxqhjo

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar

3. **Run Migration 1:**
   - Click "New query"
   - Copy the ENTIRE contents of: `supabase/migrations/004_new_schema.sql`
   - Paste into SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for success message

4. **Run Migration 2:**
   - Click "New query" again
   - Copy the ENTIRE contents of: `supabase/migrations/005_new_rls_policies.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Wait for success message

5. **Verify:**
   - Go to "Table Editor" in left sidebar
   - You should see: `profiles`, `devices`, `proximity_events`
   - Each should show "RLS Enabled" ✓

## Option 2: Supabase CLI (If you want automation)

```bash
# Install/use Supabase CLI
npx supabase login
npx supabase link --project-ref taiaaatoixymiajxqhjo
npx supabase db push
```

The CLI will automatically run all migrations in `supabase/migrations/` folder.

# Supabase Setup Guide for Phone Buddy

This guide will help you set up Supabase for a multi-user Phone Buddy application that can scale to hundreds of users.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Step 1: Create Your Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: Phone Buddy (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier, upgrade as needed

## Step 2: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**
5. Repeat for `supabase/migrations/002_rls_policies.sql`
6. Repeat for `supabase/migrations/003_performance_indexes.sql`

### Option B: Using Supabase CLI (Recommended for production)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 3: Configure Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure the following:

### Email Auth Settings
- **Enable Email Signup**: ON
- **Confirm Email**: ON (recommended for production)
- **Secure Email Change**: ON

### Site URL
- Set to your production URL (e.g., `https://yourdomain.com`)
- For local development: `http://localhost:3232`

### Redirect URLs
Add these redirect URLs:
- `http://localhost:3232/**` (for local dev)
- `https://yourdomain.com/**` (for production)

## Step 4: Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (ONLY for server-side scripts, NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Where to Find These Values:

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 5: Verify Row Level Security (RLS)

RLS is critical for multi-user security. Verify it's enabled:

1. Go to **Table Editor** in Supabase dashboard
2. Check each table (`profiles`, `devices`, `alerts`)
3. Ensure **RLS Enabled** shows a green checkmark

## Step 6: Test the Setup

### Test Database Connection

Run the seed script to verify everything works:

```bash
# Make sure your .env.local has SUPABASE_SERVICE_ROLE_KEY
npx ts-node scripts/seed-dev-data.ts
```

### Test Authentication

1. Try signing up a new user in your app
2. Check **Authentication** → **Users** in Supabase dashboard
3. Verify a profile was automatically created in the `profiles` table

### Test RLS Policies

1. Sign in as User A
2. Try to access User B's data (should fail)
3. Verify you can only see your own devices/alerts

## Step 7: Production Considerations

### Database Backups

1. Go to **Settings** → **Database**
2. Enable **Point-in-time Recovery** (available on paid plans)
3. Set up automated daily backups

### Monitoring

1. Set up **Database** → **Logs** monitoring
2. Monitor query performance in **Database** → **Reports**
3. Set up alerts for:
   - High database CPU usage
   - Slow queries
   - Connection pool exhaustion

### Scaling Considerations

For hundreds of users:

1. **Connection Pooling**: Enable Supabase connection pooling
   - Use the pooler URL: `https://your-project-ref.pooler.supabase.com`
   - Update `supabaseClient.ts` to use pooler in production

2. **Database Indexes**: Already included in migrations
   - Indexes on `user_id`, `bluetooth_id`, `created_at` optimize queries

3. **Query Optimization**:
   - Use pagination for large result sets
   - Limit queries to recent data when possible
   - Use `select()` to only fetch needed columns

4. **Caching**: Consider adding Redis for frequently accessed data

## Step 8: Security Checklist

- [ ] RLS enabled on all tables
- [ ] Service role key never exposed to client
- [ ] Environment variables in `.env.local` (not committed to git)
- [ ] Email confirmation enabled
- [ ] Strong password requirements configured
- [ ] Rate limiting enabled (Supabase handles this automatically)
- [ ] HTTPS enabled in production

## Troubleshooting

### "Row Level Security policy violation"
- Check that RLS policies are correctly applied
- Verify user is authenticated (`auth.uid()` is not null)
- Check that `user_id` matches `auth.uid()`

### "Foreign key constraint violation"
- Ensure referenced records exist
- Check cascade delete settings

### "Connection pool exhausted"
- Enable connection pooling
- Optimize queries to use fewer connections
- Consider upgrading database plan

## Next Steps

1. Set up your `useAuth` hook to use Supabase Auth
2. Test device linking functionality
3. Set up monitoring and alerts
4. Plan for production deployment

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)



# Quick Setup Guide - Supabase Backend

## 🚀 Quick Start

### Option 1: Give Me Your Credentials (Easiest)

1. **Get your Supabase credentials**:
   - Go to [app.supabase.com](https://app.supabase.com) → Your Project → Settings → API
   - Copy: Project URL, anon key, service_role key

2. **Share with me** (choose one):
   - **Option A**: Create `.env.local` file with your credentials, then say: *"I've added my Supabase credentials to .env.local"*
   - **Option B**: Share directly: *"My Supabase URL is X, anon key is Y, service role key is Z"*

3. **I'll set everything up**: Just say *"Set up the Supabase backend"* and I'll:
   - Verify credentials
   - Run database migrations
   - Configure security policies
   - Test the connection

### Option 2: Run Setup Script Yourself

```bash
# 1. Create .env.local from template
cp .env.local.example .env.local

# 2. Edit .env.local and add your Supabase credentials

# 3. Run the setup script
npm run setup:supabase

# 4. Run migrations (choose one method):

# Method A: Using Supabase CLI (recommended)
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push

# Method B: Using Supabase Dashboard
# - Go to SQL Editor in your Supabase dashboard
# - Copy/paste contents of supabase/migrations/004_new_schema.sql
# - Run it
# - Repeat for 005_new_rls_policies.sql
```

## 📋 What You Need

- ✅ Supabase account (free tier works)
- ✅ New Supabase project created
- ✅ Project URL, anon key, and service_role key

## 🎯 What Gets Set Up

- ✅ Database tables (profiles, devices, proximity_events)
- ✅ Row Level Security (RLS) policies
- ✅ Automatic profile creation on signup
- ✅ Multi-user security

## 📚 More Details

- See `SETUP_BACKEND.md` for comprehensive instructions
- See `SUPABASE_SETUP.md` for detailed configuration options

## 💡 Next Steps After Setup

1. Test your app: `npm run dev`
2. Seed dev data (optional): `npm run seed:dev`
3. Start building! 🎉

# Phone Buddy Deployment Guide

## Supabase Configuration

### 1. Run Database Migrations

In Supabase SQL Editor, run in order:
1. `supabase/migrations/004_new_schema.sql`
2. `supabase/migrations/005_new_rls_policies.sql`

### 2. Enable Realtime

1. Go to **Database** → **Replication** in Supabase dashboard
2. Enable replication for:
   - `proximity_events` table
   - `devices` table (optional)

### 3. Configure CORS

1. Go to **Settings** → **API** in Supabase dashboard
2. Add your web domain to **Allowed CORS origins**:
   - `http://localhost:3232` (development)
   - `https://yourdomain.com` (production)

### 4. Authentication Settings

1. Go to **Authentication** → **Settings**
2. Set **Site URL**: `https://yourdomain.com`
3. Add **Redirect URLs**:
   - `https://yourdomain.com/**`
   - `http://localhost:3232/**` (for dev)

## Mobile App Deployment

### iOS

1. Update `mobile/app.json`:
   - Set `ios.bundleIdentifier` to your app ID
   - Configure background modes

2. Build:
```bash
cd mobile
eas build --platform ios
```

3. Submit to App Store:
```bash
eas submit --platform ios
```

### Android

1. Update `mobile/app.json`:
   - Set `android.package` to your package name

2. Build:
```bash
cd mobile
eas build --platform android
```

3. Submit to Play Store:
```bash
eas submit --platform android
```

## Web App Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

### Other Platforms

Set environment variables in your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Environment Variables Checklist

### Mobile (`.env` in `mobile/` folder)
- [ ] `EXPO_PUBLIC_SUPABASE_URL`
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Web (`.env.local` in root)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Production Checklist

- [ ] Run database migrations
- [ ] Enable RLS on all tables
- [ ] Enable Realtime subscriptions
- [ ] Configure CORS
- [ ] Set up authentication redirects
- [ ] Test mobile app permissions
- [ ] Test offline sync
- [ ] Test realtime updates on web
- [ ] Monitor Supabase dashboard for errors



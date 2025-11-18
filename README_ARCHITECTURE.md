# Phone Buddy - Full Architecture Setup

This document explains the complete architecture connecting mobile and web apps to Supabase.

## 🏗️ Architecture Overview

Phone Buddy uses a **unified Supabase backend** with:
- **Mobile App** (React Native) - Bluetooth scanning & proximity detection
- **Web App** (Next.js) - Dashboard & device management
- **Shared Types** - TypeScript types used by both apps

## 📁 Project Structure

```
phone-buddy-app/
├── mobile/                    # React Native mobile app
│   ├── src/
│   │   ├── services/         # Core business logic
│   │   ├── hooks/            # React hooks
│   │   └── lib/              # Utilities
│   ├── app.json              # Expo config
│   └── package.json
│
├── web/                       # Next.js web app (your existing app)
│   ├── src/
│   │   ├── lib/              # Services (updated)
│   │   ├── hooks/            # Hooks (updated)
│   │   └── components/
│   └── .env.local
│
├── shared/                    # Shared TypeScript types
│   └── types/
│       └── index.ts
│
└── supabase/                 # Database migrations
    └── migrations/
        ├── 004_new_schema.sql
        └── 005_new_rls_policies.sql
```

## 🗄️ Database Schema

### New Tables (Run Migrations 004 & 005)

1. **profiles** - User profiles
2. **devices** - Registered devices (new schema)
   - `device_id`, `user_id`, `device_name`, `device_type`, `ble_identifier`
3. **proximity_events** - Proximity detection events
   - `event_id`, `device_a`, `device_b`, `timestamp`, `distance_estimate`, `event_type`

## 🚀 Setup Instructions

### 1. Run Database Migrations

In Supabase SQL Editor, run in order:
1. `supabase/migrations/004_new_schema.sql`
2. `supabase/migrations/005_new_rls_policies.sql`

### 2. Mobile App Setup

```bash
cd mobile
npm install
```

Create `mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://taiaaatoixymiajxqhjo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Web App Setup

Your existing web app is in the root. Update it to use new services:

- Use `web/src/lib/supabase-client.ts` (updated)
- Use `web/src/lib/devices.ts` (updated for new schema)
- Use `web/src/lib/proximity-events.ts` (new)
- Use `web/src/hooks/useAuth.ts` (unified)
- Use `web/src/hooks/useProximityEvents.ts` (new)

### 4. Environment Variables

**Mobile** (`mobile/.env`):
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

**Web** (`.env.local` in root):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 🔑 Key Features

### Mobile App
- ✅ Background Bluetooth scanning
- ✅ RSSI to distance calculation
- ✅ Device registration
- ✅ Proximity event logging
- ✅ Offline sync queue
- ✅ Secure token storage

### Web App
- ✅ Device management
- ✅ Proximity event timeline
- ✅ Realtime updates via Supabase
- ✅ Authentication

### Shared
- ✅ Unified auth (Supabase)
- ✅ Shared TypeScript types
- ✅ RLS policies per user

## 📱 Mobile App Services

1. **BluetoothService** - BLE scanning with RSSI
2. **ProximityService** - Distance calculation & event logging
3. **SyncService** - Offline queue & sync
4. **DeviceService** - Device registration

## 🌐 Web App Services

1. **DevicesService** - CRUD operations (updated schema)
2. **ProximityEventsService** - Fetch & realtime subscribe

## 🔒 Security

- Row Level Security (RLS) on all tables
- Users can only access their own data
- Secure token storage (mobile: SecureStore, web: cookies)

## 📊 Data Flow

1. **Mobile**: Scans BLE → Calculates distance → Logs event → Syncs to Supabase
2. **Web**: Subscribes to realtime → Displays events → Manages devices

## 🛠️ Development

### Mobile
```bash
cd mobile
npm start
# Then press 'i' for iOS or 'a' for Android
```

### Web
```bash
npm run dev
# Runs on http://localhost:3232
```

## 📝 Next Steps

1. ✅ Run migrations in Supabase
2. ✅ Set up mobile app environment
3. ✅ Update web app to use new services
4. ✅ Test authentication on both platforms
5. ✅ Test device registration from mobile
6. ✅ Test proximity event logging
7. ✅ Test realtime updates on web

## 🐛 Troubleshooting

- **RLS errors**: Check that user is authenticated
- **Bluetooth not working**: Check permissions in app.json
- **Offline sync not working**: Check SQLite setup
- **Realtime not updating**: Check Supabase realtime is enabled

See `ARCHITECTURE.md` for detailed technical documentation.



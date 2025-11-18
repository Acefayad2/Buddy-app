# Phone Buddy Architecture

## Overview

Phone Buddy is a full-stack proximity tracking application with:
- **Mobile App** (React Native/Expo) - Handles Bluetooth scanning and proximity detection
- **Web App** (Next.js) - Dashboard for viewing and managing devices/events
- **Backend** (Supabase) - Unified database, auth, and realtime sync

## Architecture Diagram

```
┌─────────────────┐         ┌─────────────────┐
│   Mobile App    │         │    Web App      │
│  (React Native) │         │   (Next.js)     │
└────────┬────────┘         └────────┬────────┘
         │                            │
         │                            │
         └────────────┬───────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   Supabase    │
              │   Backend     │
              └───────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │  Auth   │  │  DB     │  │ Realtime│
    │ (GoTrue)│  │ (Postgres)│ │ (PubSub)│
    └─────────┘  └─────────┘  └─────────┘
```

## Data Flow

### Mobile App Flow
1. User authenticates via Supabase Auth
2. App registers device in `devices` table
3. Background service scans for BLE devices
4. Calculates proximity from RSSI
5. Logs events to `proximity_events` table (or queues if offline)
6. Syncs queued events when online

### Web App Flow
1. User authenticates via Supabase Auth
2. Fetches user's devices from `devices` table
3. Subscribes to realtime `proximity_events` updates
4. Displays timeline of proximity events
5. Allows device management (rename, delete)

## Folder Structure

```
phone-buddy-app/
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── services/      # Business logic
│   │   │   ├── supabase.ts
│   │   │   ├── bluetooth.ts
│   │   │   ├── proximity.ts
│   │   │   ├── device.ts
│   │   │   └── sync.ts
│   │   ├── hooks/          # React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useDevices.ts
│   │   │   └── useProximityEvents.ts
│   │   └── lib/
│   ├── app.json
│   └── package.json
│
├── web/                    # Next.js web app
│   ├── src/
│   │   ├── lib/           # Services
│   │   │   ├── supabase-client.ts
│   │   │   ├── devices.ts
│   │   │   └── proximity-events.ts
│   │   ├── hooks/          # React hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useProximityEvents.ts
│   │   └── components/
│   └── .env.local
│
├── shared/                 # Shared TypeScript types
│   └── types/
│       └── index.ts
│
└── supabase/              # Database migrations
    └── migrations/
        ├── 004_new_schema.sql
        └── 005_new_rls_policies.sql
```

## Database Schema

### Tables

1. **profiles** - User profiles (extends auth.users)
   - `user_id` (PK, FK → auth.users)
   - `name`
   - `created_at`

2. **devices** - Registered devices
   - `device_id` (PK)
   - `user_id` (FK → auth.users)
   - `device_name`
   - `device_type` ('iOS' | 'Android')
   - `ble_identifier` (unique per user)
   - `created_at`

3. **proximity_events** - Proximity detection events
   - `event_id` (PK)
   - `device_a` (FK → devices.device_id)
   - `device_b` (FK → devices.device_id)
   - `timestamp`
   - `distance_estimate` (meters)
   - `event_type` ('ENTER' | 'EXIT')

### Row Level Security (RLS)

- Users can only see their own devices
- Users can only see events involving their devices
- All inserts/updates enforce user ownership

## Key Services

### Mobile Services

1. **BluetoothService** - BLE scanning and RSSI reading
2. **ProximityService** - Distance calculation and event logging
3. **SyncService** - Offline queue and sync
4. **DeviceService** - Device registration

### Web Services

1. **DevicesService** - CRUD operations
2. **ProximityEventsService** - Fetch and subscribe to events

## Authentication

- Unified Supabase Auth across mobile + web
- Mobile: Secure token storage (Expo SecureStore)
- Web: Session storage (cookies/localStorage)
- Automatic token refresh

## Offline Support (Mobile)

- SQLite database for pending events
- Queue events when offline
- Automatic sync when online
- Retry logic with max attempts

## Deployment

### Environment Variables

**Mobile (.env)**
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

**Web (.env.local)**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Supabase Configuration

1. Run migrations (004, 005)
2. Enable RLS on all tables
3. Configure CORS for web domain
4. Set up realtime subscriptions

## Development

### Mobile
```bash
cd mobile
npm install
npm start
```

### Web
```bash
cd web
npm install
npm run dev
```

## Production Considerations

- Mobile: Background scanning requires proper permissions
- Web: PWA support for offline read-only mode
- Database: Indexes optimized for user-based queries
- Realtime: Efficient subscription filters



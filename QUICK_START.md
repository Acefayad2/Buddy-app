# Phone Buddy - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Run Database Migrations

1. Open Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/004_new_schema.sql`
3. Run `supabase/migrations/005_new_rls_policies.sql`

### Step 2: Set Environment Variables

**Mobile** (`mobile/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://taiaaatoixymiajxqhjo.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Web** (`.env.local` in root):
```env
NEXT_PUBLIC_SUPABASE_URL=https://taiaaatoixymiajxqhjo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Install Dependencies

**Mobile:**
```bash
cd mobile
npm install
```

**Web:**
```bash
npm install
```

### Step 4: Start Development

**Mobile:**
```bash
cd mobile
npm start
# Press 'i' for iOS simulator or 'a' for Android
```

**Web:**
```bash
npm run dev
# Opens on http://localhost:3232
```

## 📱 Mobile App Setup

### Install Additional Packages

```bash
cd mobile
npx expo install expo-device expo-secure-store @react-native-community/netinfo
```

### iOS Setup

1. Install Xcode
2. Run: `npm run ios`

### Android Setup

1. Install Android Studio
2. Run: `npm run android`

## 🌐 Web App Integration

Your existing web app is ready! Just update imports:

**Old:**
```typescript
import { useDevices } from '@/src/hooks/useDevices'
```

**New:**
```typescript
import { useDevices } from '@/web/src/hooks/useDevices'
// Or update your existing hooks to use new services
```

## ✅ Test the Setup

1. **Mobile**: Sign in → Register device → Start scanning
2. **Web**: Sign in → View devices → See realtime events

## 🐛 Common Issues

- **"Module not found"**: Run `npm install` in mobile/ and root
- **"RLS policy violation"**: Check user is authenticated
- **"Bluetooth not working"**: Check permissions in app.json

## 📚 Next Steps

- Read `ARCHITECTURE.md` for detailed docs
- Read `DEPLOYMENT.md` for production setup
- Check `README_ARCHITECTURE.md` for overview



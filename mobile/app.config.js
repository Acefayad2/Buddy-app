/**
 * Expo app configuration
 * Environment variables are injected here
 */

export default {
  expo: {
    name: 'Phone Buddy',
    slug: 'phone-buddy-mobile',
    version: '1.0.0',
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
}



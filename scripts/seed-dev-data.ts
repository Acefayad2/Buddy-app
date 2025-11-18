/**
 * Seed script for Phone Buddy development database
 * 
 * WARNING: This script uses the Supabase service role key which has admin privileges.
 * NEVER commit this key to version control or expose it in client-side code.
 * Only use this script in local development environments.
 * 
 * Usage:
 *   ts-node scripts/seed-dev-data.ts
 *   or
 *   npm run seed (if configured in package.json)
 */

import { createClient } from '@supabase/supabase-js'

// WARNING: Service role key bypasses Row Level Security (RLS)
// Only use this in server-side scripts, never in client code
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedData() {
  try {
    console.log('🌱 Starting database seed...')

    // Create a test user
    console.log('Creating test user...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@phonebuddy.com',
      password: 'testpassword123',
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('Test user already exists, skipping creation')
      } else {
        throw authError
      }
    }

    const userId = authUser?.user?.id
    if (!userId) {
      throw new Error('Failed to get user ID')
    }

    console.log(`✅ Test user created: ${userId}`)

    // Create test devices
    console.log('Creating test devices...')
    const devices = [
      {
        user_id: userId,
        name: 'My iPhone 14 Pro',
        bluetooth_id: 'bt-iphone-001',
        icon: '📱',
        is_active: true,
      },
      {
        user_id: userId,
        name: 'Work iPad',
        bluetooth_id: 'bt-ipad-002',
        icon: '📱',
        is_active: true,
      },
      {
        user_id: userId,
        name: 'AirPods Pro',
        bluetooth_id: 'bt-airpods-003',
        icon: '🎧',
        is_active: false,
      },
    ]

    const { data: insertedDevices, error: devicesError } = await supabase
      .from('devices')
      .insert(devices)
      .select()

    if (devicesError) {
      throw devicesError
    }

    console.log(`✅ Created ${insertedDevices?.length || 0} devices`)

    // Create test alerts
    if (insertedDevices && insertedDevices.length > 0) {
      console.log('Creating test alerts...')
      const alerts = [
        {
          user_id: userId,
          device_id: insertedDevices[0].id,
          type: 'proximity',
          message: 'Device moved out of range',
        },
        {
          user_id: userId,
          device_id: insertedDevices[0].id,
          type: 'battery',
          message: 'Device battery is low',
        },
        {
          user_id: userId,
          device_id: insertedDevices[1]?.id || insertedDevices[0].id,
          type: 'connection',
          message: 'Device disconnected',
        },
      ]

      const { data: insertedAlerts, error: alertsError } = await supabase
        .from('alerts')
        .insert(alerts)
        .select()

      if (alertsError) {
        throw alertsError
      }

      console.log(`✅ Created ${insertedAlerts?.length || 0} alerts`)
    }

    console.log('🎉 Database seed completed successfully!')
    console.log('\nTest credentials:')
    console.log('  Email: test@phonebuddy.com')
    console.log('  Password: testpassword123')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seedData()



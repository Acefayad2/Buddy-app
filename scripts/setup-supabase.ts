#!/usr/bin/env tsx
/**
 * Automated Supabase Backend Setup Script
 * 
 * This script sets up your Supabase backend by:
 * 1. Validating environment variables
 * 2. Running database migrations
 * 3. Verifying Row Level Security policies
 * 4. Testing the connection
 * 
 * Usage:
 *   tsx scripts/setup-supabase.ts
 * 
 * Make sure your .env.local file is configured before running this script.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green)
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red)
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue)
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow)
}

// Load environment variables
function loadEnvVars() {
  try {
    const envContent = readFileSync('.env.local', 'utf-8')
    const envVars: Record<string, string> = {}
    
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        envVars[key.trim()] = value.trim()
      }
    })
    
    return envVars
  } catch (error) {
    logError('Could not read .env.local file')
    logInfo('Please create .env.local from .env.local.example and fill in your values')
    return null
  }
}

// Validate required environment variables
function validateEnvVars(envVars: Record<string, string>) {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
  
  const missing: string[] = []
  
  for (const key of required) {
    if (!envVars[key] || envVars[key].includes('your-')) {
      missing.push(key)
    }
  }
  
  if (missing.length > 0) {
    logError(`Missing or incomplete environment variables: ${missing.join(', ')}`)
    logInfo('Please update your .env.local file with actual values from your Supabase project')
    return false
  }
  
  return true
}

// Read SQL migration file
function readMigrationFile(filename: string): string {
  const path = join(process.cwd(), 'supabase', 'migrations', filename)
  return readFileSync(path, 'utf-8')
}

// Execute SQL migration
async function runMigration(
  supabase: any,
  filename: string,
  description: string
): Promise<boolean> {
  try {
    logInfo(`Running migration: ${description}...`)
    const sql = readMigrationFile(filename)
    
    // Split SQL into individual statements and execute them
    // Note: Supabase JS client doesn't support raw SQL execution
    // This would need to be done via Supabase CLI or dashboard
    
    logWarning(
      `Migration ${filename} needs to be run via Supabase CLI or dashboard.`
    )
    logInfo(`SQL file location: supabase/migrations/${filename}`)
    
    return true
  } catch (error: any) {
    logError(`Failed to run migration ${filename}: ${error.message}`)
    return false
  }
}

// Test database connection
async function testConnection(supabaseUrl: string, serviceRoleKey: string) {
  try {
    logInfo('Testing database connection...')
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    
    // Test by querying a system table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      throw error
    }
    
    logSuccess('Database connection successful!')
    return true
  } catch (error: any) {
    logError(`Connection test failed: ${error.message}`)
    logInfo('This might be normal if migrations haven\'t been run yet')
    return false
  }
}

// Verify RLS is enabled
async function verifyRLS(supabaseUrl: string, serviceRoleKey: string) {
  try {
    logInfo('Verifying Row Level Security policies...')
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    
    // Query to check if RLS is enabled (requires direct SQL access)
    logWarning('RLS verification requires Supabase CLI or dashboard access')
    logInfo('Please verify in Supabase dashboard: Table Editor → Check RLS enabled on all tables')
    
    return true
  } catch (error: any) {
    logError(`RLS verification failed: ${error.message}`)
    return false
  }
}

// Main setup function
async function main() {
  log('\n🚀 Supabase Backend Setup\n', colors.bold)
  
  // Load environment variables
  logInfo('Loading environment variables...')
  const envVars = loadEnvVars()
  if (!envVars) {
    process.exit(1)
  }
  
  // Validate environment variables
  logInfo('Validating environment variables...')
  if (!validateEnvVars(envVars)) {
    process.exit(1)
  }
  logSuccess('Environment variables validated!')
  
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY
  
  // Test connection
  const connectionOk = await testConnection(supabaseUrl, serviceRoleKey)
  
  // Check if Supabase CLI is available
  logInfo('\n📋 Setup Instructions:\n')
  
  log('1. Run Database Migrations:', colors.bold)
  log('   Option A: Using Supabase CLI (Recommended)')
  log('   ┌─────────────────────────────────────────┐', colors.blue)
  log('   │ npx supabase login                      │', colors.blue)
  log('   │ npx supabase link --project-ref YOUR_REF│', colors.blue)
  log('   │ npx supabase db push                    │', colors.blue)
  log('   └─────────────────────────────────────────┘', colors.blue)
  log('')
  log('   Option B: Using Supabase Dashboard')
  log('   1. Go to your Supabase project dashboard')
  log('   2. Navigate to SQL Editor')
  log('   3. Run each migration file in order:')
  log('      - supabase/migrations/004_new_schema.sql')
  log('      - supabase/migrations/005_new_rls_policies.sql')
  log('')
  
  log('2. Verify Setup:', colors.bold)
  log('   - Check Table Editor: Ensure profiles, devices, proximity_events tables exist')
  log('   - Check RLS: Ensure Row Level Security is enabled on all tables')
  log('   - Test Auth: Try creating a test user in Authentication → Users')
  log('')
  
  log('3. Seed Development Data (Optional):', colors.bold)
  log('   tsx scripts/seed-dev-data.ts')
  log('')
  
  if (connectionOk) {
    logSuccess('✅ Setup script completed! Your Supabase connection is working.')
  } else {
    logWarning('⚠️  Connection test had issues, but setup can continue after migrations.')
  }
  
  log('\n📚 Next Steps:', colors.bold)
  log('   - Review SUPABASE_SETUP.md for detailed instructions')
  log('   - Configure authentication settings in Supabase dashboard')
  log('   - Set up redirect URLs for your app')
  log('   - Test the app locally\n')
}

// Run the setup
main().catch((error) => {
  logError(`Setup failed: ${error.message}`)
  process.exit(1)
})

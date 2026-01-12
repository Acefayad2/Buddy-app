#!/usr/bin/env tsx
/**
 * Run Supabase Database Migrations
 * 
 * This script can run migrations in two ways:
 * 1. Via Supabase CLI (if installed and linked)
 * 2. Via direct SQL execution through the service role key
 * 
 * Usage:
 *   tsx scripts/run-migrations.ts [--method=cli|sql]
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

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
function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value || value.includes('your-')) {
    throw new Error(`Missing or invalid environment variable: ${key}`)
  }
  return value
}

// Check if Supabase CLI is available
function hasSupabaseCLI(): boolean {
  try {
    execSync('npx supabase --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Run migrations via Supabase CLI
async function runMigrationsCLI() {
  log('\n📦 Running migrations via Supabase CLI...\n', colors.bold)
  
  try {
    // Check if project is linked
    try {
      execSync('npx supabase status', { stdio: 'ignore' })
    } catch {
      logWarning('Project not linked. Attempting to link...')
      const projectRef = new URL(getEnvVar('NEXT_PUBLIC_SUPABASE_URL')).hostname.split('.')[0]
      logInfo(`Linking to project: ${projectRef}`)
      logWarning('You may need to authenticate: npx supabase login')
      logWarning('Then run: npx supabase link --project-ref ' + projectRef)
      throw new Error('Project not linked. Please link first.')
    }
    
    // Push migrations
    logInfo('Pushing migrations to Supabase...')
    execSync('npx supabase db push', { stdio: 'inherit' })
    logSuccess('Migrations applied successfully via CLI!')
    return true
  } catch (error: any) {
    logError(`CLI migration failed: ${error.message}`)
    return false
  }
}

// Read SQL file
function readSQLFile(filename: string): string {
  const path = join(process.cwd(), 'supabase', 'migrations', filename)
  return readFileSync(path, 'utf-8')
}

// Execute SQL via Supabase REST API (using RPC if available)
async function runMigrationsSQL() {
  log('\n💾 Running migrations via SQL execution...\n', colors.bold)
  
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  
  // Migration files in order
  const migrations = [
    '004_new_schema.sql',
    '005_new_rls_policies.sql',
  ]
  
  logWarning('Direct SQL execution via JS client is limited.')
  logInfo('Supabase JS client cannot execute raw SQL directly.')
  logInfo('Please use one of these methods:\n')
  
  log('Method 1: Supabase CLI (Recommended)', colors.bold)
  log('  npx supabase login')
  log('  npx supabase link --project-ref YOUR_PROJECT_REF')
  log('  npx supabase db push\n')
  
  log('Method 2: Supabase Dashboard', colors.bold)
  log('  1. Go to your Supabase project dashboard')
  log('  2. Navigate to SQL Editor')
  log('  3. Run each migration file in order:')
  migrations.forEach((migration) => {
    log(`     - supabase/migrations/${migration}`)
  })
  log('')
  
  // We can't actually execute raw SQL via the JS client
  // But we can provide the SQL content
  log('Migration SQL files:', colors.bold)
  for (const migration of migrations) {
    try {
      const sql = readSQLFile(migration)
      const lines = sql.split('\n').length
      logInfo(`  ✓ ${migration} (${lines} lines)`)
    } catch (error: any) {
      logError(`  ✗ ${migration} - ${error.message}`)
    }
  }
  
  return false
}

// Main function
async function main() {
  const method = process.argv.find(arg => arg.startsWith('--method='))?.split('=')[1] || 'auto'
  
  log('\n🚀 Supabase Database Migration Runner\n', colors.bold)
  
  // Validate environment
  try {
    getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
    getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
    logSuccess('Environment variables validated')
  } catch (error: any) {
    logError(error.message)
    logInfo('Please set up your .env.local file first')
    process.exit(1)
  }
  
  let success = false
  
  if (method === 'cli' || (method === 'auto' && hasSupabaseCLI())) {
    success = await runMigrationsCLI()
  } else if (method === 'sql') {
    success = await runMigrationsSQL()
  } else {
    logInfo('Checking available methods...')
    if (hasSupabaseCLI()) {
      success = await runMigrationsCLI()
    } else {
      logWarning('Supabase CLI not found. Showing manual instructions...')
      await runMigrationsSQL()
    }
  }
  
  if (success) {
    log('\n✅ All migrations completed successfully!\n', colors.bold + colors.green)
    log('Next steps:', colors.bold)
    log('  - Verify tables in Supabase dashboard')
    log('  - Check RLS policies are enabled')
    log('  - Test authentication flow\n')
  } else {
    log('\n⚠️  Please run migrations manually using one of the methods above.\n', colors.yellow)
  }
}

main().catch((error) => {
  logError(`Migration failed: ${error.message}`)
  process.exit(1)
})

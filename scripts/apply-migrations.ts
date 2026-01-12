#!/usr/bin/env tsx
/**
 * Apply Supabase Migrations via SQL Editor API
 * 
 * Note: The Supabase JS client doesn't support raw SQL execution directly.
 * This script prepares the migrations for you to run in the Supabase Dashboard.
 * 
 * For direct execution, use Supabase CLI or the Dashboard SQL Editor.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

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

// Read SQL file
function readSQLFile(filename: string): string {
  const path = join(process.cwd(), 'supabase', 'migrations', filename)
  return readFileSync(path, 'utf-8')
}

async function main() {
  log('\n🚀 Supabase Migration Helper\n', colors.bold)
  
  // Validate environment
  try {
    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
    const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
    logSuccess('Environment variables validated')
    
    // Test connection
    logInfo('Testing Supabase connection...')
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    
    // Test connection by checking if we can access the auth schema
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      logError(`Connection test failed: ${authError.message}`)
      logInfo('But we can still prepare migrations for you to run manually')
    } else {
      logSuccess(`Connected successfully! Found ${authData?.users?.length || 0} users`)
    }
    
  } catch (error: any) {
    logError(error.message)
    process.exit(1)
  }
  
  // Prepare migrations
  log('\n📋 Migration Files Ready:\n', colors.bold)
  
  const migrations = [
    { file: '004_new_schema.sql', description: 'Create tables (profiles, devices, proximity_events)' },
    { file: '005_new_rls_policies.sql', description: 'Set up Row Level Security policies' },
  ]
  
  for (const migration of migrations) {
    try {
      const sql = readSQLFile(migration.file)
      const lines = sql.split('\n').length
      logInfo(`✓ ${migration.file} (${lines} lines)`)
      log(`   ${migration.description}`)
    } catch (error: any) {
      logError(`✗ ${migration.file} - ${error.message}`)
    }
  }
  
  log('\n💡 To Apply Migrations:\n', colors.bold)
  log('Option 1: Supabase Dashboard (Recommended)', colors.bold)
  log('  1. Go to: https://app.supabase.com/project/taiaaatoixymiajxqhjo')
  log('  2. Navigate to SQL Editor')
  log('  3. Copy/paste each migration file and click Run')
  log('')
  log('Option 2: Supabase CLI', colors.bold)
  log('  npx supabase login')
  log('  npx supabase link --project-ref taiaaatoixymiajxqhjo')
  log('  npx supabase db push')
  log('')
  
  logSuccess('Migrations are ready to be applied!')
  logInfo('See scripts/run-migrations-dashboard.md for detailed instructions\n')
}

main().catch((error) => {
  logError(`Error: ${error.message}`)
  process.exit(1)
})

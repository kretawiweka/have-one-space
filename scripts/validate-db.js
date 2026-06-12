#!/usr/bin/env node
/**
 * Validate DATABASE_URL for Supabase connection
 * Run: node scripts/validate-db.js
 */

const url = process.env.DATABASE_URL
const directUrl = process.env.DIRECT_URL

if (!url) {
  console.error('❌ DATABASE_URL is not set')
  process.exit(1)
}

try {
  const parsed = new URL(url)
  const host = parsed.hostname
  const port = parsed.port || '5432'
  const isSupabase = host.includes('.supabase.co')
  const hasSSL = parsed.searchParams.get('sslmode') === 'require'
  const usesPooler = port === '6543'
  const hasPgbouncerFlag = parsed.searchParams.get('pgbouncer') === 'true'

  console.log('✓ DATABASE_URL is set')
  console.log('  Host:', host)
  console.log('  Port:', port)
  console.log('  Database:', parsed.pathname.slice(1))
  console.log('  Is Supabase:', isSupabase ? 'Yes' : 'No')
  console.log('  Uses pooler:', usesPooler ? 'Yes' : 'No')
  console.log('  Has SSL mode require:', hasSSL ? 'Yes' : 'No')

  if (!hasSSL) {
    console.warn('⚠ Warning: Add ?sslmode=require for secure connection')
  }

  if (usesPooler && !hasPgbouncerFlag) {
    console.warn('⚠ Warning: Pooler URL should include pgbouncer=true for Prisma')
  }

  if (usesPooler && !directUrl) {
    console.warn('⚠ Warning: Set DIRECT_URL to Supabase direct connection (port 5432)')
  }

  if (isSupabase && port === '5432') {
    console.log('✓ Using direct Supabase connection (port 5432)')
  }

  if (isSupabase && usesPooler && hasPgbouncerFlag) {
    console.log('✓ Pooler URL is configured for Prisma')
  }

  process.exit(0)
} catch (err) {
  console.error('❌ Invalid DATABASE_URL format:', err.message)
  process.exit(1)
}

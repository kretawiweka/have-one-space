#!/usr/bin/env node
/**
 * Validate DATABASE_URL for Supabase connection
 * Run: node scripts/validate-db.js
 */

const url = process.env.DATABASE_URL

if (!url) {
  console.error('❌ DATABASE_URL is not set')
  process.exit(1)
}

try {
  const parsed = new URL(url)
  const host = parsed.hostname
  const port = parsed.port
  const isSupabase = host.includes('.supabase.co')
  const hasSSL = parsed.searchParams.has('sslmode')

  console.log('✓ DATABASE_URL is set')
  console.log('  Host:', host)
  console.log('  Port:', port || '5432')
  console.log('  Database:', parsed.pathname.slice(1))
  console.log('  Is Supabase:', isSupabase ? 'Yes' : 'No')
  console.log('  Has SSL mode:', hasSSL ? 'Yes' : 'No')

  if (isSupabase && port !== '5432' && port !== '') {
    console.warn('⚠ Warning: Supabase usually uses port 5432 for direct connections')
    console.warn('  If using connection pooler, port 6543 is correct')
  }

  if (!hasSSL) {
    console.warn('⚠ Warning: Add ?sslmode=require for secure connection')
  }

  if (isSupabase && port === '5432') {
    console.log('✓ Using direct connection (port 5432) — good for Prisma migrations')
  }

  process.exit(0)
} catch (err) {
  console.error('❌ Invalid DATABASE_URL format:', err.message)
  process.exit(1)
}

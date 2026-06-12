import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function isBuildPhase(): boolean {
  if (process.env.NEXT_PHASE === 'phase-production-build') return true
  // Fallback for Next.js 13 where NEXT_PHASE might not be set at module load time
  const args = process.argv.join(' ')
  if (args.includes('next') && args.includes('build')) return true
  return false
}

function buildPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) return new PrismaClient()

  const separator = url.includes('?') ? '&' : '?'
  // pgbouncer=true disables prepared statements (protocol s0, s1, etc.)
  // which fixes the "42P05 prepared statement already exists" error
  // during Next.js static generation where multiple queries run concurrently.
  const buildUrl = `${url}${separator}pgbouncer=true`

  return new PrismaClient({
    datasources: {
      db: {
        url: buildUrl,
      },
    },
  })
}

const isBuild = isBuildPhase()

export const prisma = isBuild ? buildPrismaClient() : globalForPrisma.prisma ?? new PrismaClient()

if (!isBuild && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

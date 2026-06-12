import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) return new PrismaClient()

  // Railway (and most cloud providers) use a connection pooler where
  // prepared statements get lost between pooled connections. This causes:
  // - "42P05 prepared statement already exists" during next build
  // - "26000 prepared statement does not exist" at runtime
  // pgbouncer=true disables prepared statements in the query engine.
  if (process.env.NODE_ENV === 'production') {
    const urlObj = new URL(url)
    if (!urlObj.searchParams.has('pgbouncer')) {
      urlObj.searchParams.set('pgbouncer', 'true')
    }
    return new PrismaClient({
      datasources: {
        db: {
          url: urlObj.toString(),
        },
      },
    })
  }

  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

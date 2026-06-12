import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function buildConnectionUrl(baseUrl: string | undefined): string | undefined {
  if (!baseUrl) return undefined
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}connection_limit=1`
}

function getPrismaClient() {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

  if (isBuild) {
    return new PrismaClient({
      datasources: {
        db: {
          url: buildConnectionUrl(process.env.DATABASE_URL),
        },
      },
    })
  }

  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

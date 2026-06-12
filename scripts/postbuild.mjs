import { PrismaClient } from '@prisma/client'
import rss from './rss.mjs'
import sitemap from './sitemap.mjs'
import search from './search.mjs'

function buildUrl() {
  const raw = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL or DIRECT_URL must be set')
  const url = new URL(raw)
  url.searchParams.set('pgbouncer', 'true')
  url.searchParams.set('connection_limit', '1')
  return url.toString()
}

async function postbuild() {
  const prisma = new PrismaClient({
    datasources: { db: { url: buildUrl() } },
  })
  try {
    await rss(prisma)
    await sitemap(prisma)
    await search(prisma)
  } finally {
    await prisma.$disconnect()
  }
}

postbuild()

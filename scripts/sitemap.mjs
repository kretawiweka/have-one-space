import { writeFileSync } from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import siteMetadata from '../data/siteMetadata.js'

const prisma = new PrismaClient()

const sitemap = async () => {
  const posts = await prisma.post.findMany({
    where: { draft: false },
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, updatedAt: true },
  })

  const pages = [
    '',
    '/blog',
    '/tags',
    '/projects',
    ...posts.map((p) => `/blog/${p.slug}`),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((page) => {
    const post = posts.find((p) => `/blog/${p.slug}` === page)
    const lastmod = post ? post.updatedAt.toISOString() : new Date().toISOString()
    return `  <url>
    <loc>${siteMetadata.siteUrl}${page}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
  })
  .join('\n')}
</urlset>`

  writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), xml)
  await prisma.$disconnect()
  console.log('Sitemap generated...')
}

export default sitemap

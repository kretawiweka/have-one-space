import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import siteMetadata from '../data/siteMetadata.js'

const prisma = new PrismaClient()

function escapeXml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateFeed(posts, feedTitle, feedUrl) {
  const items = posts
    .map((post) => {
      const link = `${siteMetadata.siteUrl}/blog/${post.slug}`
      const pubDate = new Date(post.publishedAt ?? post.createdAt).toUTCString()
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.summary ?? '')}</description>
      ${(post.tags ?? []).map((t) => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${siteMetadata.siteUrl}</link>
    <description>${escapeXml(siteMetadata.description)}</description>
    <language>${siteMetadata.language}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`
}

const rss = async () => {
  const posts = await prisma.post.findMany({
    where: { draft: false },
    orderBy: { publishedAt: 'desc' },
  })

  // Global RSS
  const feedXml = generateFeed(posts, siteMetadata.title, `${siteMetadata.siteUrl}/feed.xml`)
  writeFileSync(path.join(process.cwd(), 'public', 'feed.xml'), feedXml)

  // Per-tag RSS
  const tagMap = {}
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      if (!tagMap[tag]) tagMap[tag] = []
      tagMap[tag].push(post)
    }
  }

  for (const [tag, tagPosts] of Object.entries(tagMap)) {
    const tagDir = path.join(process.cwd(), 'public', 'tags', tag)
    mkdirSync(tagDir, { recursive: true })
    const tagFeedUrl = `${siteMetadata.siteUrl}/tags/${tag}/feed.xml`
    const tagFeedXml = generateFeed(tagPosts, `${tag} - ${siteMetadata.title}`, tagFeedUrl)
    writeFileSync(path.join(tagDir, 'feed.xml'), tagFeedXml)
  }

  await prisma.$disconnect()
  console.log('RSS feed generated...')
}

export default rss

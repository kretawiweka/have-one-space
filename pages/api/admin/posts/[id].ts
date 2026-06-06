import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query as { id: string }

  if (req.method === 'GET') {
    try {
      const post = await prisma.post.findUnique({ where: { id } })
      if (!post) return res.status(404).json({ error: 'Post not found' })
      return res.status(200).json(post)
    } catch {
      return res.status(500).json({ error: 'Failed to fetch post' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { title, slug, content, tags, summary, draft } = req.body
      const existing = await prisma.post.findUnique({ where: { id } })
      if (!existing) return res.status(404).json({ error: 'Post not found' })

      // Set publishedAt when first publishing
      let publishedAt = existing.publishedAt
      if (draft === false && !existing.publishedAt) {
        publishedAt = new Date()
      }
      if (draft === true) {
        publishedAt = null
      }

      const post = await prisma.post.update({
        where: { id },
        data: {
          title,
          slug,
          content,
          tags: tags ?? [],
          summary: summary ?? null,
          draft: draft ?? existing.draft,
          publishedAt,
        },
      })
      return res.status(200).json(post)
    } catch (error: unknown) {
      const e = error as { code?: string }
      if (e?.code === 'P2002') {
        return res.status(409).json({ error: 'A post with this slug already exists' })
      }
      return res.status(500).json({ error: 'Failed to update post' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.post.delete({ where: { id } })
      return res.status(204).end()
    } catch {
      return res.status(500).json({ error: 'Failed to delete post' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

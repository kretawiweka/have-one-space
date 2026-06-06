import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          tags: true,
          summary: true,
          draft: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      return res.status(200).json(posts)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch posts' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, slug, content, tags, summary, draft } = req.body

      if (!title || !slug || !content) {
        return res.status(400).json({ error: 'title, slug, and content are required' })
      }

      const post = await prisma.post.create({
        data: {
          title,
          slug,
          content,
          tags: tags ?? [],
          summary: summary ?? null,
          draft: draft ?? true,
          publishedAt: draft === false ? new Date() : null,
        },
      })
      return res.status(201).json(post)
    } catch (error: unknown) {
      const e = error as { code?: string }
      if (e?.code === 'P2002') {
        return res.status(409).json({ error: 'A post with this slug already exists' })
      }
      return res.status(500).json({ error: 'Failed to create post' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

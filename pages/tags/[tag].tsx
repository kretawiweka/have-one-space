import { TagSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { kebabCase } from 'pliny/utils/kebabCase'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { prisma } from '@/lib/prisma'
import type { BlogPost } from '@/types/blog'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    where: { draft: false },
    select: { tags: true },
  })

  const tagSet = new Set<string>()
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(kebabCase(tag))
    }
  }

  return {
    paths: Array.from(tagSet).map((tag) => ({ params: { tag } })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tag = params?.tag as string

  const allPosts = await prisma.post.findMany({
    where: { draft: false },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      tags: true,
      summary: true,
      draft: true,
      publishedAt: true,
      createdAt: true,
    },
  })

  const filteredPosts = allPosts.filter((p) => p.tags.map((t) => kebabCase(t)).includes(tag))

  const posts: BlogPost[] = filteredPosts.map((p) => ({
    id: p.id,
    path: `blog/${p.slug}`,
    slug: p.slug,
    title: p.title,
    date: (p.publishedAt ?? p.createdAt).toISOString(),
    tags: p.tags,
    summary: p.summary,
    draft: p.draft,
  }))

  return { props: { posts, tag }, revalidate: 60 }
}

export default function TagPage({ posts, tag }: InferGetStaticPropsType<typeof getStaticProps>) {
  const title = tag[0].toUpperCase() + tag.split(' ').join('-').slice(1)
  return (
    <>
      <TagSEO
        title={`${tag} - ${siteMetadata.title}`}
        description={`${tag} tags - ${siteMetadata.author}`}
      />
      <ListLayout posts={posts} title={title} />
    </>
  )
}

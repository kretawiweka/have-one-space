import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { prisma } from '@/lib/prisma'
import type { BlogPost } from '@/types/blog'

export const POSTS_PER_PAGE = 5

export const getStaticProps: GetStaticProps = async () => {
  const dbPosts = await prisma.post.findMany({
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

  const posts: BlogPost[] = dbPosts.map((p) => ({
    id: p.id,
    path: `blog/${p.slug}`,
    slug: p.slug,
    title: p.title,
    date: (p.publishedAt ?? p.createdAt).toISOString(),
    tags: p.tags,
    summary: p.summary,
    draft: p.draft,
  }))

  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return {
    props: { initialDisplayPosts, posts, pagination },
    revalidate: 60,
  }
}

export default function BlogPage({
  posts,
  initialDisplayPosts,
  pagination,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO title={`Blog - ${siteMetadata.author}`} description={siteMetadata.description} />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title="All Posts"
      />
    </>
  )
}

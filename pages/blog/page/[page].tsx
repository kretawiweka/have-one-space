import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { POSTS_PER_PAGE } from '../index'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { prisma } from '@/lib/prisma'
import type { BlogPost } from '@/types/blog'

export const getStaticPaths: GetStaticPaths = async () => {
  const total = await prisma.post.count({ where: { draft: false } })
  const totalPages = Math.ceil(total / POSTS_PER_PAGE)
  const paths = Array.from({ length: totalPages }, (_, i) => ({
    params: { page: (i + 1).toString() },
  }))

  return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const pageNumber = parseInt(params?.page as string)

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

  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return {
    props: { initialDisplayPosts, posts, pagination },
    revalidate: 60,
  }
}

export default function PostPage({
  posts,
  initialDisplayPosts,
  pagination,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title="All Posts"
      />
    </>
  )
}

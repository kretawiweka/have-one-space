import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import PageTitle from '@/components/PageTitle'
import { MDXComponents } from '@/components/MDXComponents'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { prisma } from '@/lib/prisma'
import { compileMDX } from '@/lib/mdx'
import type { BlogPost, AuthorDetails } from '@/types/blog'
import { DEFAULT_AUTHOR } from '@/types/blog'
import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import { ReactNode } from 'react'

const DEFAULT_LAYOUT = 'PostLayout'

interface LayoutComponentProps {
  content: BlogPost
  authorDetails: AuthorDetails[]
  next?: { path: string; title: string } | null
  prev?: { path: string; title: string } | null
  children: ReactNode
}

const layouts: Record<string, React.ComponentType<LayoutComponentProps>> = {
  PostLayout,
  PostSimple,
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    where: { draft: false },
    select: { slug: true },
  })
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug.split('/') } })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = (params?.slug as string[]).join('/')

  const allPosts = await prisma.post.findMany({
    where: { draft: false },
    orderBy: { publishedAt: 'desc' },
  })

  const postIndex = allPosts.findIndex((p) => p.slug === slug)
  const dbPost = allPosts[postIndex]

  if (!dbPost) {
    return { notFound: true }
  }

  const mdxSource = await compileMDX(dbPost.content)

  const prev = allPosts[postIndex + 1]
    ? { path: `blog/${allPosts[postIndex + 1].slug}`, title: allPosts[postIndex + 1].title }
    : null
  const next = allPosts[postIndex - 1]
    ? { path: `blog/${allPosts[postIndex - 1].slug}`, title: allPosts[postIndex - 1].title }
    : null

  const post: BlogPost = {
    id: dbPost.id,
    path: `blog/${dbPost.slug}`,
    slug: dbPost.slug,
    title: dbPost.title,
    date: (dbPost.publishedAt ?? dbPost.createdAt).toISOString(),
    tags: dbPost.tags,
    summary: dbPost.summary,
    draft: dbPost.draft,
  }

  const authorDetails: AuthorDetails[] = [DEFAULT_AUTHOR]

  return {
    props: { post, mdxSource, authorDetails, prev, next },
    revalidate: 60,
  }
}

// Omit wrapper since we handle the layout manually
const { wrapper: _unusedWrapper, ...BlogMDXComponents } = MDXComponents
void _unusedWrapper // suppress unused var

export default function BlogPostPage({
  post,
  mdxSource,
  authorDetails,
  prev,
  next,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const Layout = layouts[DEFAULT_LAYOUT]

  return (
    <>
      {post.draft === true ? (
        <div className="mt-24 text-center">
          <PageTitle>
            Under Construction{' '}
            <span role="img" aria-label="roadwork sign">
              🚧
            </span>
          </PageTitle>
        </div>
      ) : (
        <Layout content={post} authorDetails={authorDetails} prev={prev} next={next}>
          <MDXRemote {...(mdxSource as MDXRemoteSerializeResult)} components={BlogMDXComponents} />
        </Layout>
      )}
    </>
  )
}

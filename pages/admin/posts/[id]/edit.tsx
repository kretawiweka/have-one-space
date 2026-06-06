import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import PostForm from '@/components/admin/PostForm'

interface PostData {
  id: string
  title: string
  slug: string
  content: string
  tags: string
  summary: string
  draft: boolean
}

export const getServerSideProps: GetServerSideProps<PostData> = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } }
  }

  const { id } = ctx.params as { id: string }
  const post = await prisma.post.findUnique({ where: { id } })

  if (!post) {
    return { notFound: true }
  }

  return {
    props: {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      tags: post.tags.join(', '),
      summary: post.summary ?? '',
      draft: post.draft,
    },
  }
}

export default function EditPostPage({
  id,
  title,
  slug,
  content,
  tags,
  summary,
  draft,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <AdminLayout title="Edit Post">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800">
        <PostForm
          mode="edit"
          postId={id}
          initialData={{ title, slug, content, tags, summary, draft }}
        />
      </div>
    </AdminLayout>
  )
}

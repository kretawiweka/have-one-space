import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

interface Stats {
  total: number
  published: number
  drafts: number
  recentPosts: { id: string; title: string; slug: string; draft: boolean; createdAt: string }[]
}

export const getServerSideProps: GetServerSideProps<Stats> = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } }
  }

  const [total, published, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { draft: false } }),
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, slug: true, draft: true, createdAt: true },
    }),
  ])

  return {
    props: {
      total,
      published,
      drafts: total - published,
      recentPosts: recentPosts.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
    },
  }
}

export default function AdminDashboard({
  total,
  published,
  drafts,
  recentPosts,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Posts', value: total, color: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Published', value: published, color: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Drafts', value: drafts, color: 'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-6 ${stat.color}`}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8 flex gap-3">
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          + New Post
        </Link>
        <Link
          href="/admin/posts"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          View All Posts
        </Link>
      </div>

      {/* Recent posts */}
      <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Posts</h2>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentPosts.length === 0 && (
            <li className="px-6 py-4 text-sm text-gray-500">No posts yet.</li>
          )}
          {recentPosts.map((post) => (
            <li key={post.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{post.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    post.draft
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  }`}
                >
                  {post.draft ? 'Draft' : 'Published'}
                </span>
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  )
}

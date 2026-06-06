import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import AdminLayout from '@/components/admin/AdminLayout'
import PostForm from '@/components/admin/PostForm'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) {
    return { redirect: { destination: '/admin/login', permanent: false } }
  }
  return { props: {} }
}

export default function NewPostPage() {
  return (
    <AdminLayout title="New Post">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800">
        <PostForm mode="create" />
      </div>
    </AdminLayout>
  )
}

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/posts', label: 'Posts', icon: '◉' },
  { href: '/admin/posts/new', label: 'New Post', icon: '+' },
]

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col bg-white shadow-md dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Back to site
          </Link>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-100">CMS Admin</div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          {session?.user && (
            <p className="mb-2 truncate text-xs text-gray-500 dark:text-gray-400">
              {session.user.email}
            </p>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {title && (
          <header className="border-b border-gray-200 bg-white px-8 py-5 dark:border-gray-700 dark:bg-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          </header>
        )}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}

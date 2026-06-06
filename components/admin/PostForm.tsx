import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

// Disable SSR for the markdown editor
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface PostFormData {
  title: string
  slug: string
  content: string
  tags: string
  summary: string
  draft: boolean
}

interface PostFormProps {
  initialData?: Partial<PostFormData>
  postId?: string
  mode: 'create' | 'edit'
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function PostForm({ initialData, postId, mode }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [tags, setTags] = useState(initialData?.tags ?? '')
  const [summary, setSummary] = useState(initialData?.summary ?? '')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Auto-generate slug from title when creating
  useEffect(() => {
    if (!slugManuallyEdited && mode === 'create') {
      setSlug(slugify(title))
    }
  }, [title, slugManuallyEdited, mode])

  const handleSubmit = async (isDraft: boolean) => {
    setError('')
    setSaving(true)

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      summary: summary.trim() || null,
      draft: isDraft,
    }

    const url = mode === 'create' ? '/api/admin/posts' : `/api/admin/posts/${postId}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSaving(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      return
    }

    router.push('/admin/posts')
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="post-title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="post-slug"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          id="post-slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugManuallyEdited(true)
          }}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
        <p className="mt-1 text-xs text-gray-400">URL: /blog/{slug || '…'}</p>
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="post-tags"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Tags <span className="text-xs font-normal text-gray-400">(comma-separated)</span>
        </label>
        <input
          id="post-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="javascript, nextjs, algorithm"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Summary */}
      <div>
        <label
          htmlFor="post-summary"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Summary <span className="text-xs font-normal text-gray-400">(shown in list view)</span>
        </label>
        <textarea
          id="post-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Content Editor */}
      <div>
        <p className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content <span className="text-red-500">*</span>
        </p>
        <div data-color-mode="light">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? '')}
            height={500}
            preview="edit"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving || !title || !slug || !content}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {saving ? 'Saving…' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={saving || !title || !slug || !content}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}

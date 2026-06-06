export interface BlogPost {
  id: string
  path: string
  slug: string
  title: string
  date: string
  tags: string[]
  summary?: string | null
  draft: boolean
  canonicalUrl?: string | null
  lastmod?: string | null
  images?: string[]
}

export interface AuthorDetails {
  name: string
  avatar?: string | null
  twitter?: string | null
  linkedin?: string | null
  github?: string | null
  email?: string | null
}

// The hardcoded default author derived from data/authors/default.mdx
export const DEFAULT_AUTHOR: AuthorDetails = {
  name: 'Kretawiweka Nuraga Sani',
  avatar: '/static/images/k-logo.png',
  twitter: 'https://twitter.com/kretawiweka_ns',
  linkedin: 'https://www.linkedin.com/in/kretawiweka',
  github: 'https://github.com/kretawiweka',
  email: 'ekanuraga@gmail.com',
}

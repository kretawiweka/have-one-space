import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { readFile } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from '@/lib/mdx'
import { MDXComponents } from '@/components/MDXComponents'
import AuthorLayout from '@/layouts/AuthorLayout'

interface AuthorData {
  name: string
  avatar?: string
  occupation?: string
  company?: string
  email?: string
  twitter?: string
  linkedin?: string
  github?: string
}

export const getStaticProps: GetStaticProps = async () => {
  const authorPath = path.join(process.cwd(), 'data', 'authors', 'default.mdx')
  const raw = await readFile(authorPath, 'utf-8')
  const { data: frontmatter, content } = matter(raw)
  const mdxSource = await compileMDX(content)

  return {
    props: {
      author: frontmatter as AuthorData,
      mdxSource,
    },
  }
}

export default function About({
  author,
  mdxSource,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <AuthorLayout content={author}>
      <MDXRemote {...(mdxSource as MDXRemoteSerializeResult)} components={MDXComponents} />
    </AuthorLayout>
  )
}

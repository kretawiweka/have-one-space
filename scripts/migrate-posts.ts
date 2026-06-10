/**
 * One-time migration script: imports all .mdx files from data/blog/ into the database.
 * Run with: npx ts-node --project tsconfig.recipe.json scripts/migrate-posts.ts
 */
import { PrismaClient } from '@prisma/client'
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

const prisma = new PrismaClient()

async function main() {
  const blogDir = path.join(process.cwd(), 'data', 'blog')
  const files = (await readdir(blogDir)).filter((f) => f.endsWith('.mdx'))

  console.log(`Found ${files.length} MDX files to migrate`)

  for (const file of files) {
    const raw = await readFile(path.join(blogDir, file), 'utf-8')
    const { data: frontmatter, content } = matter(raw)

    const slug = path.basename(file, '.mdx')
    const title = frontmatter.title as string
    const tags: string[] = frontmatter.tags ?? []
    const summary: string | null = frontmatter.summary ?? null
    const draft: boolean = frontmatter.draft ?? false
    const dateStr: string | undefined = frontmatter.date
    const publishedAt = !draft && dateStr ? new Date(dateStr) : null

    try {
      const post = await prisma.post.upsert({
        where: { slug },
        create: {
          title,
          slug,
          content: content.trim(),
          tags,
          summary,
          draft,
          publishedAt,
        },
        update: {
          title,
          content: content.trim(),
          tags,
          summary,
          draft,
          publishedAt,
        },
      })
      console.log(`  ✓ Migrated: ${post.slug}`)
    } catch (err) {
      console.error(`  ✗ Failed: ${slug}`, err)
    }
  }

  console.log('Migration complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

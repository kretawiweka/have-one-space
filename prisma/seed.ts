/**
 * Creates the admin user.
 * Run with: npx ts-node --project tsconfig.recipe.json prisma/seed.ts
 * 
 * Required env vars: ADMIN_EMAIL, ADMIN_PASSWORD
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME ?? 'Admin'

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, password: passwordHash, name },
    update: { password: passwordHash, name },
  })

  console.log(`Admin user created/updated: ${user.email}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

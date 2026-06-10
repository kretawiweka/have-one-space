# Have One Space

A personal blog built with Next.js, TypeScript, Tailwind CSS, and a custom CMS backed by PostgreSQL.

## Stack

- **Framework**: Next.js 13 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + `@tailwindcss/typography`
- **Database**: PostgreSQL (via Prisma v5)
- **Auth**: NextAuth.js v4 — Credentials provider, JWT sessions
- **MDX rendering**: `next-mdx-remote` v4
- **Editor**: `@uiw/react-md-editor`

## Prerequisites

- Node.js 20.x
- Yarn
- PostgreSQL (local via Docker or hosted, e.g. Railway)

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/kretawiweka/have-one-space
cd have-one-space
yarn --ignore-engines
```

### 2. Start a local Postgres container

```bash
docker run --name haveone-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=haveone \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Set up environment variables

Create `.env` (read by Prisma CLI) and `.env.local` (read by Next.js):

**`.env`**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/haveone"
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD="your-strong-password"
ADMIN_NAME="Your Name"
```

**`.env.local`**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/haveone"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD="your-strong-password"
ADMIN_NAME="Your Name"
```

See `.env.example` for all available variables.

### 4. Set up the database

```bash
# Create tables
npx prisma migrate dev --name init

# Create admin user (reads ADMIN_* vars from .env)
yarn --ignore-engines db:seed

# Import existing MDX posts into the DB (one-time)
yarn --ignore-engines db:migrate-posts
```

### 5. Start the dev server

```bash
yarn --ignore-engines dev
```

Site is running at `http://localhost:3000`.

## Admin panel

The CMS is available at `/admin`.

| Route | Description |
|---|---|
| `/admin/login` | Sign in with your admin credentials |
| `/admin` | Dashboard — post counts and recent posts |
| `/admin/posts` | List, edit, delete posts |
| `/admin/posts/new` | Create a new post with the Markdown editor |
| `/admin/posts/[id]/edit` | Edit an existing post |

## Database scripts

| Script | Description |
|---|---|
| `yarn db:migrate` | Run Prisma migrations |
| `yarn db:push` | Push schema changes without a migration file |
| `yarn db:seed` | Create/update the admin user |
| `yarn db:migrate-posts` | Import MDX files from `data/blog/` into the DB |
| `yarn db:studio` | Open Prisma Studio (DB browser) |

## Deployment (Railway + Supabase)

### Option A: Railway + Supabase (Recommended)

Deploy the app to **Railway** and the database to **Supabase**.

1. **Supabase**: Create a project at [supabase.com](https://supabase.com). Copy the connection string from **Settings > Database**:
   ```
   postgresql://postgres:password@db.xxxxxx.supabase.co:5432/postgres?sslmode=require
   ```

2. **Railway**: Create a new project from your GitHub repo. Railway will auto-detect `railway.json`.

3. **Environment Variables** in Railway dashboard:
   ```
   DATABASE_URL        postgresql://postgres:password@db.xxxxxx.supabase.co:5432/postgres?sslmode=require
   NEXTAUTH_URL      https://your-app.railway.app
   NEXTAUTH_SECRET   openssl rand -base64 32
   ADMIN_EMAIL       your@email.com
   ADMIN_PASSWORD    your-strong-password
   ADMIN_NAME        Your Name
   ```

4. **First deploy** — Run in Railway Shell:
   ```bash
   npx prisma migrate deploy
   yarn db:seed
   yarn db:migrate-posts
   ```

See `DEPLOYMENT.md` for full details.

### Option B: Railway Postgres (Legacy)

1. Create a Railway project and add a **PostgreSQL** plugin.
2. Add a service pointing to this repo.
3. Set environment variables (Railway provides `DATABASE_URL`).
4. After first deploy, run `yarn db:seed` and `yarn db:migrate-posts` in Railway Shell.

# Deployment Guide

## Railway + Supabase

This guide deploys the app to **Railway** and the database to **Supabase**.

### 1. Supabase (Database)

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready
3. Go to **Settings > Database** in the Supabase dashboard
4. Copy both connection strings:
   - Direct (port `5432`) for migrations
   - Pooler (port `6543`) for runtime

### 2. Railway (App)

1. Go to [https://railway.app](https://railway.app) and create an account
2. Click **New Project** > **Deploy from GitHub repo**
3. Select your `have-one-space` repository
4. Railway will detect the `railway.json` configuration and build the app

### 3. Environment Variables

In the Railway dashboard, go to your project **Variables** tab and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:...@aws-...pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` | Runtime DB URL via pooler |
| `DIRECT_URL` | `postgresql://postgres:...@db.<project-ref>.supabase.co:5432/postgres?sslmode=require` | Direct DB URL for Prisma migrations |
| `NEXTAUTH_URL` | `https://your-app-name.railway.app` | Your Railway app URL |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Generate a secure secret |
| `ADMIN_EMAIL` | `your@email.com` | Admin login email |
| `ADMIN_PASSWORD` | `strong-password` | Admin login password |
| `ADMIN_NAME` | `Your Name` | Admin display name |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | *(optional)* | Google Analytics ID |

### 4. Database Setup

After the first deployment, open the Railway **Shell** tab and run:

```bash
npx prisma migrate deploy
yarn db:seed
yarn db:migrate-posts
```

### 5. Custom Domain (Optional)

In Railway dashboard:
1. Go to your service **Settings**
2. Click **+ Custom Domain**
3. Add your domain and follow the DNS instructions
4. Update `NEXTAUTH_URL` to your custom domain

### 6. Deployment Notes

- **Node.js version**: Uses `.nvmrc` (Node 20)
- **Build**: `yarn build` (includes Next.js build + postbuild scripts)
- **Start**: `yarn start` (production Next.js server)
- **Prisma**: `postinstall` script auto-generates the client after `yarn install`
- **Migrations**: Run `prisma migrate deploy` after first deploy (not `migrate dev`)
- **Health check**: Railway pings `/` to verify the app is running

### 7. Troubleshooting

**Build fails?**
- Check Railway logs in the **Deployments** tab
- Ensure `DATABASE_URL` and `DIRECT_URL` are set correctly
- Verify `NEXTAUTH_SECRET` is set

**Database connection errors?**
- If using pooler (`6543`), include `pgbouncer=true`
- Keep `DIRECT_URL` on direct host (`5432`) for migrations
- Ensure `sslmode=require`

**Admin panel not working?**
- Run `yarn db:seed` in Railway shell to create the admin user
- Verify `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` are set

### 8. Railway Config Files

- `railway.json` — Railway deployment configuration
- `railway.toml` — Alternative Railway config (Nixpacks)
- `package.json` — Build scripts (`build`, `start`, `postinstall`)

# Deployment Guide

## Railway + Supabase

This guide deploys the app to **Railway** and the database to **Supabase**.

### 1. Supabase (Database)

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready
3. Go to **Settings > Database** in the Supabase dashboard
4. Copy the **Connection string** (URI format):
   ```
   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```
5. Replace `[password]` with your database password
6. Add `?sslmode=require` at the end for secure connection:
   ```
   postgresql://postgres:yourpassword@db.xxxxxx.supabase.co:5432/postgres?sslmode=require
   ```

### 2. Railway (App)

1. Go to [https://railway.app](https://railway.app) and create an account
2. Click **New Project** > **Deploy from GitHub repo**
3. Select your `have-one-space` repository
4. Railway will detect the `railway.json` configuration and build the app

### 3. Environment Variables

In the Railway dashboard, go to your project **Variables** tab and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:...supabase.co:5432/postgres?sslmode=require` | Supabase connection string |
| `NEXTAUTH_URL` | `https://your-app-name.railway.app` | Your Railway app URL |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Generate a secure secret |
| `ADMIN_EMAIL` | `your@email.com` | Admin login email |
| `ADMIN_PASSWORD` | `strong-password` | Admin login password |
| `ADMIN_NAME` | `Your Name` | Admin display name |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | *(optional)* | Google Analytics ID |

### 4. Database Setup

After the first deployment, open the Railway **Shell** tab and run:

```bash
# Apply migrations
npx prisma migrate deploy

# Create admin user
yarn db:seed

# Import existing MDX posts (optional)
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
- Ensure `DATABASE_URL` is set correctly
- Verify `NEXTAUTH_SECRET` is set

**Database connection errors?**
- Confirm Supabase connection string uses port `5432` (not `6543` pooler)
- Ensure `?sslmode=require` is added
- Check if your IP is allowed in Supabase **Database > IPv4** settings

**Admin panel not working?**
- Run `yarn db:seed` in Railway shell to create the admin user
- Verify `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` are set

### 8. Railway Config Files

- `railway.json` — Railway deployment configuration
- `railway.toml` — Alternative Railway config (Nixpacks)
- `package.json` — Build scripts (`build`, `start`, `postinstall`)

### 9. SSL with Supabase

Supabase requires SSL/TLS connections. The connection string must include:
```
?sslmode=require
```

If you get SSL errors, try with the full SSL mode:
```
?sslmode=require&connection_limit=10&pool_timeout=10
```

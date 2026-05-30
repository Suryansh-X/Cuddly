# Vercel Deployment Guide — Vijay Electronics

Deploy this full-stack store (React frontend + Express API + PostgreSQL) on Vercel in 5 steps.

---

## Step 1 — Set up a free PostgreSQL database

Vercel doesn't include a database, so you need one externally (free options):

| Provider | Free tier | Sign-up link |
|----------|-----------|-------------|
| **Neon** (recommended) | 512 MB, 1 project | https://neon.tech |
| Supabase | 500 MB, 2 projects | https://supabase.com |
| Railway | 500 MB / $5 credit | https://railway.app |

After creating a database, copy the **connection string** — it looks like:
```
postgresql://user:password@ep-xxx.ap-south-1.aws.neon.tech/vijayelectronics?sslmode=require
```

---

## Step 2 — Push to GitHub

1. Create a new **private** repo on GitHub (e.g. `vijay-electronics`)
2. Extract the `.tar.gz` archive and push the folder contents:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/vijay-electronics.git
   git push -u origin main
   ```

---

## Step 3 — Import project on Vercel

1. Go to https://vercel.com → **Add New → Project**
2. Import the GitHub repo you just created
3. Vercel will auto-detect the settings from `vercel.json` — no changes needed
4. Click **"Environment Variables"** and add:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Neon/Supabase connection string |
   | `ADMIN_PASSWORD` | `vijay@admin2024` (or change it) |
   | `SESSION_SECRET` | Any long random string |

5. Click **Deploy**

---

## Step 4 — Run database migrations (one-time)

After first deploy, set up the database schema:

```bash
# On your local machine (with DATABASE_URL set in .env):
pnpm --filter @workspace/db run push
```

Or use Neon's SQL editor to run the schema manually (find the schema in `lib/db/src/schema/`).

---

## Step 5 — Add custom domain (optional)

1. In Vercel project → **Settings → Domains**
2. Add your domain (e.g. `vijayelectronics.in`)
3. Copy the CNAME value Vercel shows (e.g. `cname.vercel-dns.com`)
4. Add a CNAME record at your domain registrar pointing to that value
5. Wait 5–30 minutes for DNS to update

---

## Notes

- **Image uploads**: Vercel's filesystem is read-only. Images uploaded via the admin panel won't persist after redeployment. For persistent image hosting, set up Cloudinary (free tier) and update the upload endpoint in `artifacts/api-server/src/routes/admin.ts`.
- **Auto-redeploy**: Every `git push` to the `main` branch automatically triggers a new Vercel deployment.
- **Build command**: `pnpm run build:vercel` (set in `vercel.json` and `package.json`)

---

## Local development

```bash
pnpm install
cp .env.example .env   # fill in your DATABASE_URL
pnpm --filter @workspace/db run push   # create DB tables
# Start both servers:
pnpm --filter @workspace/api-server run dev    # API on :8080
pnpm --filter @workspace/vijay-electronics run dev   # Frontend on :18659
```

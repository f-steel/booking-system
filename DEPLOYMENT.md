# Deployment Guide for FK Trainers Booking System

This guide will walk you through deploying your booking system to Vercel.

## Prerequisites

1. A GitHub account
2. A Vercel account (sign up at [vercel.com](https://vercel.com))
3. A PostgreSQL database (we'll use Vercel Postgres or you can use another provider)

## Step 1: Prepare Your Code

### 1.1 Push to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/booking-system.git
git branch -M main
git push -u origin main
```

### 1.2 Switch to PostgreSQL

SQLite won't work on Vercel (it's file-based and won't persist). You need to switch to PostgreSQL.

**Update `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

**Install PostgreSQL client (if not already installed):**

```bash
npm install @prisma/client
```

## Step 2: Set Up Database

### Option A: Neon (Recommended - Easiest)

1. In your Vercel project, go to the **"Storage"** tab
2. Find **"Neon"** in the Marketplace Database Providers list
3. Click the **"Create"** button next to Neon
4. Follow the setup wizard (it will create a Neon account if needed)
5. After creation, you'll see your database connection string
6. **Copy the connection string** - it looks like: `postgresql://user:password@host/database?sslmode=require`
7. This connection string will automatically be added as `DATABASE_URL` in your Vercel environment variables

**Note:** Neon has a generous free tier that's perfect for getting started!

### Option B: Supabase (Alternative)

1. In your Vercel project, go to the **"Storage"** tab
2. Find **"Supabase"** in the list
3. Click **"Create"** and follow the setup
4. Copy the connection string from Supabase dashboard
5. Add it as `DATABASE_URL` in Vercel environment variables

### Option C: Other Providers

- **Supabase** (Free tier available): [supabase.com](https://supabase.com)
- **Railway** (Free tier available): [railway.app](https://railway.app)
- **Neon** (Free tier available): [neon.tech](https://neon.tech)

Get your PostgreSQL connection string from your provider.

## Step 3: Deploy to Vercel

### 3.1 Import Your Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3.2 Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### Required Variables:

```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### Optional (for Email Functionality):

If you want password reset emails to work, add one of these:

**Option 1: Resend (Recommended - Easy Setup)**
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=FK Trainers <noreply@yourdomain.com>
```

Get Resend API key from [resend.com](https://resend.com)

**Option 2: SMTP**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=FK Trainers <your-email@gmail.com>
```

### 3.3 Configure Build Settings

Vercel should auto-detect Next.js, but verify these settings:

- **Framework Preset:** Next.js
- **Build Command:** `prisma generate && prisma migrate deploy && next build`
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install`

### 3.4 Deploy

Click "Deploy" and wait for the build to complete.

## Step 4: Run Database Migrations

After the first deployment, you need to run migrations:

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Run migrations
npx prisma migrate deploy
```

### Option 2: Using Prisma Studio (Alternative)

1. Set your `DATABASE_URL` locally to point to production database
2. Run: `npx prisma migrate deploy`
3. Or use Prisma Studio: `npx prisma studio`

## Step 5: Create Your First Admin User

After deployment, you need to create an admin user. You can do this by:

1. Register a new account on your deployed site
2. Use the make-admin script locally (pointing to production DB):

```bash
# Set DATABASE_URL to production
export DATABASE_URL="your-production-database-url"

# Run the script
npx tsx scripts/make-admin.ts your-email@example.com
```

Or manually update the database using Prisma Studio or your database provider's interface.

## Step 6: Configure File Uploads (Optional)

If you're using file uploads for photos, you'll need to configure storage:

### Option A: Vercel Blob Storage (Recommended)

1. Add Vercel Blob Storage in your Vercel project
2. Update your upload code to use Vercel Blob

### Option B: AWS S3 / Cloudinary

Configure external storage and update your upload handlers.

**Note:** The current setup saves files to `public/uploads/` which won't persist on Vercel. You'll need to use external storage for production.

## Troubleshooting

### Build Fails

- Check that `DATABASE_URL` is set correctly
- Ensure `NEXTAUTH_SECRET` is set
- Check build logs in Vercel dashboard

### Database Connection Issues

- Verify your `DATABASE_URL` connection string
- Check if your database allows connections from Vercel IPs
- Ensure SSL is enabled (add `?sslmode=require` to connection string)

### Email Not Working

- Verify email service credentials are set
- Check that `EMAIL_FROM` matches your verified domain (for Resend)
- Check Vercel function logs for email errors

### Migrations Not Running

- Run migrations manually using Vercel CLI
- Or use your database provider's SQL editor to run migrations

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables set
- [ ] First admin user created
- [ ] Email service configured (if needed)
- [ ] File upload storage configured (if using photos)
- [ ] Test registration and login
- [ ] Test booking creation
- [ ] Test password reset (if email configured)
- [ ] Verify admin dashboard works

## Updating Your Deployment

After making changes:

1. Push to GitHub
2. Vercel will automatically redeploy
3. If you changed the database schema, run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Need Help?

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Prisma Docs: [prisma.io/docs](https://www.prisma.io/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)


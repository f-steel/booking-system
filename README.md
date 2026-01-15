# FK Trainers - Booking System

A modern booking management system for FK Trainers shoe cleaning business, built with Next.js, TypeScript, Tailwind CSS, and Prisma.

## Features

- 🔐 User authentication with NextAuth.js
- 📅 Booking management (create, view, edit, delete)
- 👥 Admin dashboard for user and booking management
- 🛡️ Admin role system with protected routes
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 💾 SQLite database (can be easily switched to PostgreSQL for production)
- 📱 Responsive design
- ⚡ Built with Next.js App Router

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Authentication**: NextAuth.js v5
- **Database**: Prisma ORM with SQLite (development)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.19+ (or 22.12+, 24.0+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd booking-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

Generate a secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Creating Your First User

1. Navigate to `/register` to create an account
2. Fill in your name, email, and password
3. Log in at `/login`

## Setting Up Admin Access

To make a user an admin, you can use the provided script:

```bash
npx tsx scripts/make-admin.ts your-email@example.com
```

Or you can use the admin dashboard (if you're already an admin) to toggle admin status for any user.

## Project Structure

```
booking-system/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── bookings/          # Booking pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Prisma client
│   └── utils.ts         # Utility functions
├── prisma/              # Prisma schema and migrations
└── public/              # Static assets
```

## Deployment to Vercel

### Option 1: Deploy with SQLite (Not Recommended for Production)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (for SQLite, use a file path - note: this won't persist on Vercel)
   - `NEXTAUTH_URL` (your Vercel deployment URL)
   - `NEXTAUTH_SECRET` (generate a secure random string)

### Option 2: Deploy with PostgreSQL (Recommended)

1. Create a PostgreSQL database (Vercel Postgres, Supabase, or Railway)
2. Update your `DATABASE_URL` in Prisma schema to use PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Update your `.env` with the PostgreSQL connection string
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
5. Deploy to Vercel with the PostgreSQL `DATABASE_URL` environment variable

### Vercel Configuration

The project includes a `vercel.json` file that:
- Runs Prisma generate and migrations during build
- Configures the Next.js framework

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `NEXTAUTH_URL` | Base URL of your application | Yes |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Yes |

## Database Schema

- **User**: User accounts with authentication
- **Booking**: Shoe cleaning bookings with customer details, service type, and status
- **Account/Session**: NextAuth.js authentication tables

## Features in Detail

### Booking Management

- Create new bookings with customer information
- View all bookings in a card-based layout
- Edit existing bookings
- Delete bookings with confirmation
- Filter by status (pending, in_progress, completed, cancelled)

### Authentication

- Email/password authentication
- Secure password hashing with bcrypt
- Session management with NextAuth.js
- Protected routes

### Admin Features

- Admin dashboard with system statistics
- User management (view all users, toggle admin status)
- View all bookings across all users
- Search and filter users
- Protected admin routes

## Development

### Run Prisma Studio

View and edit your database:
```bash
npx prisma studio
```

### Generate Prisma Client

After schema changes:
```bash
npx prisma generate
```

### Create a Migration

```bash
npx prisma migrate dev --name migration-name
```

## License

ISC

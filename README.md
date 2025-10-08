# Safety Management System

A modular, enterprise-grade safety management system built with Next.js, TypeScript, and Supabase.

## Features

- **Modular Architecture**: Plugin-based safety modules using the Safety Framework
- **Incident Reporting**: Track and manage safety incidents with persistent database storage
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Type-Safe**: Full TypeScript coverage with Drizzle ORM for database operations

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project ([supabase.com](https://supabase.com))
- PostgreSQL database access (provided by Supabase)

## Database Setup

This project uses Supabase PostgreSQL for data persistence with Drizzle ORM.

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your database to be provisioned
3. Navigate to **Settings** > **Database**
4. Copy your **Connection string** (URI format)

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase database URL:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

   Replace:
   - `[YOUR-PASSWORD]` with your database password
   - `[YOUR-PROJECT-REF]` with your Supabase project reference

### 3. Run Database Migrations

Apply the database schema to your Supabase database:

```bash
npx drizzle-kit push
```

This will create the `incidents` table and all necessary schema.

### 4. (Optional) Seed Demo Data

To add sample incidents to your database, you can use the Supabase SQL editor or create a seed script.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up database** (see Database Setup above)

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                      # Next.js 15 App Router pages
│   ├── dashboard/           # Dashboard layouts and module pages
│   └── page.tsx             # Home page
├── components/              # Reusable UI components
│   ├── ui/                  # shadcn/ui components
│   └── dashboard/           # Dashboard-specific components
├── lib/
│   ├── db/                  # Database layer
│   │   ├── schema/          # Drizzle schema definitions
│   │   ├── repositories/    # Data access repositories
│   │   ├── client.ts        # Database client
│   │   └── types.ts         # TypeScript types
│   ├── modules/             # Safety modules
│   │   └── incident-reporting/  # Incident reporting module
│   └── safety-framework/    # Module registry and lifecycle
├── drizzle/                 # Database migrations
└── openspec/                # OpenSpec proposals and specs
```

## Database Commands

- **Generate migration**: `npx drizzle-kit generate`
- **Push schema to database**: `npx drizzle-kit push`
- **Open Drizzle Studio**: `npx drizzle-kit studio`

## Development

- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type check**: `npx tsc --noEmit`

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Architecture**: OpenSpec-driven development

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your `DATABASE_URL` environment variable in project settings
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Safety Management System

A modular, enterprise-grade safety management system built with Next.js, TypeScript, and Supabase.

## Features

- **Modular Architecture**: Plugin-based safety modules using the Safety Framework
- **Authentication & Authorization**: Supabase-based auth with 4-tier role system (viewer, employee, manager, admin)
- **User Management**: Admin dashboard for managing users and roles
- **Incident Reporting**: Track and manage safety incidents with persistent database storage
- **Document Management**: Secure document storage with role-based access
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Type-Safe**: Full TypeScript coverage with Drizzle ORM for database operations

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project ([supabase.com](https://supabase.com))
- PostgreSQL database access (provided by Supabase)
- Local Supabase CLI (optional, for local development)

## Quick Start

1. **Install dependencies**: `npm install`
2. **Set up environment variables**: Copy `.env.local.example` to `.env.local` and configure
3. **Run database migrations**: `npx drizzle-kit push`
4. **Start local Supabase** (optional): `supabase start`
5. **Create initial admin**: `npm run setup:admin` (see Authentication Setup below)
6. **Run dev server**: `npm run dev`
7. **Login**: Navigate to [http://localhost:3000/login](http://localhost:3000/login)

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

## Authentication Setup

This application uses Supabase Auth with a role-based authorization system.

### Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"  # For admin operations

# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client. It's used only for server-side admin operations.

### Create Initial Admin User

After setting up Supabase, you need to create your first admin user:

#### Option 1: Using the Admin Script

1. Create a user account through the signup page at `/signup`
2. Run the admin setup script:
   ```bash
   npm run setup:admin
   ```
   Or directly with ts-node:
   ```bash
   npx ts-node scripts/set-admin-role.ts
   ```
3. Enter your email when prompted
4. The script will assign the admin role to your account
5. Logout and login again to refresh your session

#### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Find your user and click to edit
4. In the **User Metadata** section, add:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save and logout/login to refresh your token

### Role System

The application uses a 4-tier role hierarchy:

| Role | Level | Description | Permissions |
|------|-------|-------------|-------------|
| **Viewer** | 0 | Read-only access | View data only, cannot create/edit |
| **Employee** | 1 | Standard user | Create and view own incidents/documents |
| **Manager** | 2 | Elevated permissions | View all data, manage incidents |
| **Admin** | 3 | Full system access | User management, all features |

**Default Role:** New signups are assigned the `employee` role by default.

### Managing Users

Admins can manage users through the admin dashboard:

1. Login with an admin account
2. Navigate to **Dashboard** > **Admin** > **User Management**
3. View all users, change roles, or delete users
4. **Note:** You cannot modify your own admin account (self-protection)

### Authentication Features

- ✅ Email/password authentication
- ✅ Secure session management
- ✅ Global logout (all devices)
- ✅ Role-based route protection
- ✅ Server-side permission checks
- ✅ Read-only mode for viewers
- ✅ Self-protection for admin accounts

### Testing Authentication

See `AUTHENTICATION_TESTING_FINAL_REPORT.md` for comprehensive testing documentation.

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

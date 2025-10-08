## Why

The current incident reporting module uses in-memory data storage which is lost on server restart and cannot be shared across users or sessions. A persistent database is essential for a production safety management system to store incident reports, track historical data, enable multi-user collaboration, and provide data integrity and backup capabilities.

## What Changes

- Install and configure Drizzle ORM with Supabase PostgreSQL driver
- Set up environment variable configuration (.env) for Supabase credentials
- Create database schema for incidents table with proper types and constraints
- Implement database migrations system for schema versioning
- Create data access layer with CRUD operations for incidents
- Migrate incident-reporting module from in-memory storage to database persistence
- Add database connection pooling and error handling
- Implement proper TypeScript types derived from database schema
- Add database utilities for common operations (transactions, queries)

## Impact

- Affected specs: `database-connection`, `incident-persistence`, `data-access-layer`
- Affected code:
  - New: `lib/db/` - Database configuration, schema, and client
  - New: `drizzle/` - Migration files and Drizzle config
  - Modified: `lib/modules/incident-reporting/data.ts` - Replace in-memory with database queries
  - Modified: `lib/modules/incident-reporting/` components - Add async data fetching
  - New: `.env.local.example` - Environment variable template
  - New: `.gitignore` updates - Ensure .env files are not committed
- New dependencies: drizzle-orm, drizzle-kit, @supabase/supabase-js, postgres
- **BREAKING**: Data is no longer stored in memory; requires database setup
- **BREAKING**: Functions become async; components need to handle promises

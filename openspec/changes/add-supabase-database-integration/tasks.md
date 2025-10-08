## 1. Database Setup
- [x] 1.1 Install Drizzle ORM dependencies (drizzle-orm, drizzle-kit, postgres)
- [x] 1.2 Create database schema file for incidents table (lib/db/schema/incidents.ts)
- [x] 1.3 Set up Drizzle configuration file (drizzle.config.ts)
- [x] 1.4 Create database client with connection pooling (lib/db/client.ts)
- [x] 1.5 Create TypeScript types from schema (lib/db/types.ts)
- [x] 1.6 Create and test initial migration

## 2. Data Access Layer
- [x] 2.1 Create repository structure (lib/db/repositories/)
- [x] 2.2 Implement incident repository with CRUD operations (lib/db/repositories/incidents.ts)
- [x] 2.3 Add error handling and validation in repository layer
- [x] 2.4 Export repository functions (lib/db/repositories/index.ts)

## 3. Module Migration
- [x] 3.1 Update incident data layer to use repository (lib/modules/incident-reporting/data.ts)
- [x] 3.2 Convert incident list component to async Server Component
- [x] 3.3 Update incident detail component for async data fetching
- [x] 3.4 Update incident widget for async data fetching
- [x] 3.5 Add loading states and error boundaries

## 4. Configuration & Documentation
- [x] 4.1 Create .env.local.example template with Supabase variables
- [x] 4.2 Update .gitignore to exclude .env files (already configured)
- [x] 4.3 Add environment variable validation at startup
- [x] 4.4 Document database setup in README
- [x] 4.5 Verify TypeScript compilation and type safety

## 5. Validation
- [x] 5.1 Verify type safety across all database operations (TypeScript check passed)
- [x] 5.2 Verify repository pattern implementation
- [x] 5.3 Verify migration generation works correctly
- [x] 5.4 Run openspec validation (passed)
- [x] 5.5 All linter checks passed


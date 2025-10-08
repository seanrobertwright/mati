## Context

The safety management system currently stores all data in memory, which is suitable for development but inadequate for production use. Users need persistent storage that survives server restarts, supports multiple concurrent users, provides data integrity guarantees, and enables future features like user authentication, audit logs, and reporting.

**Constraints:**
- Supabase instance is self-hosted and managed externally (outside project scope)
- Must support local development with environment variables
- Must maintain type safety end-to-end (TypeScript)
- Cannot increase bundle size significantly
- Must work with Next.js 15 App Router and React Server Components

**Stakeholders:**
- End users need reliable data persistence
- Developers need type-safe database access
- System administrators need secure credential management

## Goals / Non-Goals

**Goals:**
- Install Drizzle ORM for optimal performance and type safety
- Configure Supabase connection via environment variables
- Create incidents table with proper schema
- Implement migration system for schema evolution
- Migrate incident module to use database
- Maintain full TypeScript type safety
- Provide clear error handling for database operations

**Non-Goals:**
- User authentication (defer to future change)
- Database administration/hosting (external)
- Data seeding beyond initial migration
- Complex query optimization (start simple)
- Real-time subscriptions (Supabase feature, defer)

## Decisions

### Decision 1: Use Drizzle ORM
**What:** Use Drizzle ORM as the database layer for Supabase PostgreSQL.

**Why:**
- **Speed**: Zero runtime overhead, generates minimal SQL, fastest ORM for TypeScript
- **Accuracy**: Full type inference from schema, compile-time query validation
- **Efficiency**: Lightweight (~7kb), no query engine, SQL-like syntax
- **Supabase**: First-class PostgreSQL support, perfect for Supabase

**Alternatives considered:**
- Prisma: Popular but slower (query engine overhead), larger bundle, less efficient
- Supabase JS only: No ORM benefits, manual type management, more boilerplate
- Kysely: Good but less type inference, more verbose

### Decision 2: Environment Variables in .env
**What:** Store Supabase credentials in `.env.local` file (gitignored), provide `.env.local.example` template.

**Why:**
- Standard Next.js convention
- Keeps secrets out of version control
- Easy to configure per environment (dev, staging, prod)
- Next.js automatically loads .env files

**Configuration:**
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Decision 3: Schema-First Approach
**What:** Define database schema in TypeScript using Drizzle's schema builder, generate migrations from schema changes.

**Why:**
- Type safety: Schema is source of truth for TypeScript types
- Version control: Schema is code, tracked in git
- Migration safety: Drizzle generates migrations, less error-prone
- Developer experience: IntelliSense for all database operations

**Schema Structure:**
```typescript
// lib/db/schema/incidents.ts
export const incidents = pgTable('incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
  status: text('status', { enum: ['open', 'investigating', 'resolved', 'closed'] }).notNull(),
  reportedBy: text('reported_by').notNull(),
  reportedAt: timestamp('reported_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Decision 4: Data Access Layer Pattern
**What:** Create repository pattern with dedicated files for each entity's database operations.

**Why:**
- Separation of concerns: Business logic separate from data access
- Testability: Easy to mock data layer
- Reusability: Common operations in one place
- Maintainability: Schema changes impact one file

**Structure:**
```
lib/db/
  schema/
    incidents.ts       # Schema definition
    index.ts           # Export all schemas
  repositories/
    incidents.ts       # Incident CRUD operations
    index.ts           # Export all repositories
  client.ts            # Drizzle client instance
  types.ts             # Inferred TypeScript types
drizzle.config.ts      # Drizzle configuration
drizzle/
  migrations/          # Generated migration SQL files
```

### Decision 5: Async Data Fetching Pattern
**What:** Use React Server Components for data fetching, keep client components for interactivity.

**Why:**
- Next.js 15 best practice: Fetch data on server
- Better performance: Reduce client bundle, faster initial load
- SEO: Data is server-rendered
- Security: Database queries run on server only

**Pattern:**
```typescript
// Server Component (default)
async function IncidentList() {
  const incidents = await getIncidents(); // Direct DB query
  return <IncidentTable incidents={incidents} />;
}

// Client Component (interactive)
'use client';
function IncidentTable({ incidents }) {
  // Handle sorting, filtering, UI state
}
```

## Architecture

### Database Connection Flow

```
Next.js Server → Drizzle Client → Connection Pool → Supabase PostgreSQL
     ↓
Environment Variables (.env.local)
```

### Data Access Pattern

```
Component (Server)
    ↓
Repository Function (lib/db/repositories/incidents.ts)
    ↓
Drizzle Query Builder
    ↓
PostgreSQL (Supabase)
```

### Type Safety Flow

```
Schema Definition (schema/incidents.ts)
    ↓
Drizzle Infer Types
    ↓
TypeScript Types (exported)
    ↓
Components & Functions (fully typed)
```

## Risks / Trade-offs

**Risk:** Database connection failures
- **Mitigation:** Implement retry logic, connection pooling, graceful error messages

**Risk:** Migration failures
- **Mitigation:** Test migrations in development, keep migrations small and reversible

**Risk:** Performance with large datasets
- **Mitigation:** Start simple, add indexes when needed, implement pagination

**Risk:** Environment variable misconfiguration
- **Mitigation:** Provide clear .env.example, validate env vars at startup

**Trade-off:** Complexity vs. Persistence
- **Decision:** Accept added complexity for production-ready persistence

**Trade-off:** Async data fetching changes component signatures
- **Decision:** Follow Next.js 15 patterns, provides better performance

## Migration Plan

### Phase 1: Database Setup
1. Install Drizzle ORM and dependencies
2. Create database schema for incidents
3. Set up Drizzle configuration and migrations
4. Create database client with connection pooling

### Phase 2: Data Access Layer
1. Create repository pattern structure
2. Implement CRUD operations for incidents
3. Add TypeScript types from schema
4. Test database operations

### Phase 3: Module Migration
1. Update incident-reporting data layer
2. Migrate components to async data fetching
3. Update server/client component boundaries
4. Test end-to-end functionality

### Phase 4: Documentation & Validation
1. Create .env.local.example template
2. Update README with database setup instructions
3. Document repository pattern for future modules
4. Run production build and verify

## Open Questions

1. **Connection pooling:** Should we use Supabase's built-in pooling or configure our own? → Use Supabase's pgBouncer for connection pooling
2. **Seed data:** Should we migrate the 3 demo incidents to the database? → Yes, create seed migration for development
3. **Error handling:** Should database errors show technical details or user-friendly messages? → User-friendly messages in UI, technical details in server logs
4. **Soft deletes:** Should we implement soft deletes (isDeleted flag) or hard deletes? → Start with hard deletes, add soft deletes in future change if needed

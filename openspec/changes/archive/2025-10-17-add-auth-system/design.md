## Context

The application is a Next.js 15 App Router application with Supabase PostgreSQL database (via Drizzle ORM). We need to add authentication and authorization without disrupting the existing modular architecture. Users need to log in to access the dashboard, and different users should have different permission levels for viewing and modifying safety data.

## Goals / Non-Goals

**Goals:**
- Secure all dashboard routes behind authentication
- Implement role-based access control with clear permission boundaries
- Use Supabase Auth (already integrated) for minimal new dependencies
- Maintain compatibility with existing module system
- Support email/password authentication initially
- Enable future expansion (OAuth, SSO) without major refactoring

**Non-Goals:**
- Complex permission system (permissions per field/record) - use simple RBAC
- OAuth providers in initial implementation (defer to future)
- Multi-factor authentication (defer to future)
- User self-service password reset UI (use Supabase built-in for now)
- Advanced features like session recording, device management

## Decisions

### Decision 1: Use Supabase Auth
**Rationale:** Already using Supabase for database; adding Supabase Auth provides:
- Seamless integration with existing Supabase setup
- Row-level security (RLS) capabilities for future use
- Built-in password hashing, session management, email verification
- Reduced complexity vs. adding NextAuth.js

**Alternatives considered:**
- NextAuth.js v5: More flexible but adds complexity; would need separate session storage
- Clerk: Fastest setup but external dependency and cost; less control

**Trade-offs:** Tied to Supabase ecosystem, but we're already committed to Supabase for database.

### Decision 2: Simple Role-Based Access Control (RBAC)
**Rationale:** Four predefined roles cover common safety management scenarios:
- **Admin**: Full system access, user management, module configuration
- **Safety Manager**: Create/edit/delete incidents, view all incidents, access reports
- **Employee**: Create incidents, view own incidents, basic dashboard access
- **Viewer**: Read-only access to incidents and reports

**Alternatives considered:**
- Permission-based system: More flexible but adds UI/UX complexity for role management
- Module-level only: Too coarse-grained; can't differentiate between managers and employees

**Trade-offs:** Less flexible than granular permissions, but easier to understand and manage.

### Decision 3: Store roles in Supabase Auth metadata
**Rationale:**
- Supabase Auth supports `user_metadata` and `app_metadata` for custom fields
- Roles stored in `app_metadata` (admin-only, not user-editable)
- Accessible in auth session without extra DB query
- Can use in Row-Level Security policies

**Alternatives considered:**
- Separate `user_roles` table: Requires join on every auth check; more complex
- User `public.users` table with role column: Still requires separate query

**Trade-offs:** Metadata has size limits, but roles are small; works well for RBAC.

### Decision 4: Middleware for route protection
**Rationale:**
- Next.js middleware runs before page renders, efficient for auth checks
- Can redirect unauthenticated users to login before loading protected pages
- Centralized auth logic vs. per-page checks

**Implementation:**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { supabase, response } = await createMiddlewareClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect unauthenticated users from /dashboard to /login
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}
```

### Decision 5: Module-level permission flags
**Rationale:**
- Each SafetyModule can specify `minRole` for access control
- Dashboard checks user role against module requirements
- Modules not meeting role requirements are hidden from navigation/dashboard

**Example:**
```typescript
const incidentModule: SafetyModule = {
  id: 'incident-reporting',
  minRole: 'employee', // Only employee+ can access
  // ... rest of config
};
```

**Trade-offs:** Simple but less granular; can't have different permissions for read vs. write within a module (defer to future enhancement).

## Architecture

### Auth Flow
```
User → Login Page → Supabase Auth → Session Created → Dashboard
                                   ↓
                             User Metadata (role)
```

### Route Protection
```
Request → Middleware → Check Session → Allow/Deny
                          ↓
                    Get User Role → Check Module Permissions
```

### Components
- `lib/auth/client.ts` - Supabase client for browser
- `lib/auth/server.ts` - Supabase client for server components
- `lib/auth/middleware.ts` - Auth helpers for middleware
- `lib/auth/permissions.ts` - Role definitions and permission checks
- `app/(auth)/login/page.tsx` - Login UI
- `app/(auth)/signup/page.tsx` - Signup UI
- `components/auth/LoginForm.tsx` - Reusable login form
- `components/auth/UserMenu.tsx` - User dropdown with logout

## Risks / Trade-offs

**Risk: Existing incident data has no owner**
- **Mitigation:** Migration script assigns existing incidents to first admin user or a "system" user

**Risk: Role changes require admin UI**
- **Mitigation:** Provide simple admin panel for role assignment; initial admin created via Supabase dashboard

**Risk: Middleware performance on every request**
- **Mitigation:** Supabase session is cached; middleware is fast; monitor performance

**Trade-off: Supabase vendor lock-in**
- **Mitigation:** Abstract auth logic behind interfaces; could migrate to different provider later if needed

## Migration Plan

### Phase 1: Setup (No breaking changes)
1. Install Supabase Auth packages
2. Configure Supabase Auth in project
3. Add auth helper functions
4. Create auth UI components (not yet required)

### Phase 2: Database migration
1. Add `user_id` column to `incidents` table (nullable initially)
2. Create migration to assign existing incidents to system user
3. Make `user_id` NOT NULL after migration

### Phase 3: Enable auth (Breaking change)
1. Add middleware for route protection
2. Update dashboard layout to require auth
3. Add user menu and logout
4. Deploy with announcement to users

### Rollback
- If critical issues, temporarily disable middleware
- Database migration can be rolled back (remove `user_id` column)

## Open Questions

- ~~Which auth provider?~~ → Supabase Auth
- ~~Role model complexity?~~ → Simple RBAC with 4 roles
- Should employees see other employees' incidents? → **Decision needed**: Start with "own incidents only", add team/org visibility later
- Email verification required on signup? → **Decision needed**: Recommend yes for production, optional for dev


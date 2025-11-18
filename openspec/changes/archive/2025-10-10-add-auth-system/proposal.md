## Why

The safety management application currently has no authentication or authorization system, meaning anyone can access the dashboard and all modules without login. For a production system handling sensitive safety data, we need to:
- Secure the application with user authentication
- Control access based on user roles and permissions
- Track who creates/modifies safety records (audit trail)
- Enable multi-user collaboration with appropriate access controls

## What Changes

- Integrate Supabase Auth for user authentication and session management
- Implement email/password login with secure password hashing
- Add role-based access control (RBAC) with four roles: Admin, Manager, Employee, Viewer
- Create authentication UI components (login, signup, logout)
- Protect dashboard routes requiring authentication
- Add middleware for route protection and role checking
- Implement user management UI for admins to assign roles
- Update database schema to link records to authenticated users
- Add user session management and auth state handling
- Update incident module to respect user permissions

## Impact

- Affected specs: `authentication` (new), `authorization` (new), `user-management` (new), `dashboard-core` (modified), `incident-persistence` (modified)
- Affected code:
  - New: `lib/auth/` - Auth configuration, helpers, and middleware
  - New: `app/(auth)/` - Login/signup routes and components
  - New: `components/auth/` - Auth UI components
  - Modified: `app/dashboard/layout.tsx` - Add auth protection
  - Modified: `lib/db/schema/` - Add users table and user relationships
  - Modified: `lib/modules/incident-reporting/` - Add user ownership and permissions
  - New: `middleware.ts` - Route protection middleware
- New dependencies: `@supabase/ssr`, `@supabase/auth-helpers-nextjs`
- **BREAKING**: Dashboard now requires authentication; existing incident data needs migration to associate with users


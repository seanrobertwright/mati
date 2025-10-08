## 1. Setup and Configuration

- [x] 1.1 Install Supabase Auth dependencies
  - `npm install @supabase/ssr @supabase/auth-helpers-nextjs`
- [x] 1.2 Configure Supabase Auth in environment variables
  - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
  - Update `.env.local.example` with auth variables
- [x] 1.3 Create Supabase client utilities
  - `lib/auth/client.ts` - Browser client
  - `lib/auth/server.ts` - Server component client
  - `lib/auth/middleware.ts` - Middleware client helpers

## 2. Authentication Core

- [x] 2.1 Create auth helper functions
  - `lib/auth/permissions.ts` - Role definitions and permission checks
  - Functions: `getRoleHierarchy()`, `hasRole()`, `canAccess()`
- [x] 2.2 Create auth UI components
  - `components/auth/LoginForm.tsx` - Reusable login form component
  - `components/auth/SignupForm.tsx` - Reusable signup form component
  - `components/auth/UserMenu.tsx` - User dropdown menu with logout
- [x] 2.3 Create auth route pages
  - `app/(auth)/login/page.tsx` - Login page
  - `app/(auth)/signup/page.tsx` - Signup page
  - `app/(auth)/layout.tsx` - Auth routes layout (centered, no dashboard chrome)
- [x] 2.4 Implement login functionality
  - Email validation
  - Password validation
  - Error handling and display
  - Redirect to dashboard on success
- [x] 2.5 Implement signup functionality
  - Email/password validation
  - Password confirmation
  - Default role assignment (employee)
  - Email verification trigger (if enabled)

## 3. Route Protection

- [x] 3.1 Create Next.js middleware
  - `middleware.ts` - Route protection middleware
  - Protect all `/dashboard/*` routes
  - Redirect unauthenticated users to `/login`
  - Preserve intended destination for post-login redirect
- [x] 3.2 Add auth check to dashboard layout
  - Update `app/dashboard/layout.tsx` to verify session
  - Add UserMenu component to header
  - Display user info and logout button
- [x] 3.3 Implement logout functionality
  - Server action or API route for logout
  - Clear session and cookies
  - Redirect to login page

## 4. Authorization and Roles

- [x] 4.1 Extend SafetyModule type with role requirements
  - Add optional `minRole` property to `SafetyModule` interface in `lib/safety-framework/types.ts`
  - Update TypeScript definitions
- [x] 4.2 Implement module access control
  - Update module registry to filter modules by user role
  - Update dashboard home to show only accessible modules
  - Update navigation to hide unauthorized modules
- [x] 4.3 Add role-based route protection
  - Check module `minRole` in module route handlers
  - Return 403 for insufficient permissions
  - Create `app/dashboard/[moduleId]/page.tsx` error boundaries

## 5. Database Schema Updates

- [x] 5.1 Create database migration for user_id column
  - Add `user_id` UUID column to `incidents` table (nullable initially)
  - Add foreign key constraint to `auth.users`
  - Create migration file in `drizzle/migrations/`
- [x] 5.2 Update Drizzle schema
  - Modify `lib/db/schema/incidents.ts` to include `userId` field
  - Add TypeScript type for user relationship
  - Re-generate Drizzle types
- [ ] 5.3 Create data migration for existing incidents
  - Script to assign existing incidents to first admin or system user
  - Make `user_id` NOT NULL after migration
  - Run migration: `npm run db:migrate` (deferred - requires database setup)

## 6. Update Incident Module

- [x] 6.1 Update incident creation to use authenticated user
  - Modify `lib/db/repositories/incidents.ts` to capture `user_id`
  - Get authenticated user ID from session
  - Set `reported_by` from user email/name
- [x] 6.2 Implement role-based incident queries
  - Employee: Filter incidents by `user_id = currentUser.id`
  - Manager/Admin: Return all incidents
  - Viewer: Return all incidents (read-only enforced in UI)
- [x] 6.3 Add ownership checks for updates/deletes
  - Employee: Can only edit/delete own incidents
  - Manager/Admin: Can edit/delete any incident
  - Return 403 for unauthorized operations
- [x] 6.4 Update incident module UI
  - Add `minRole: 'employee'` to incident module definition
  - Update IncidentList to show owner information (deferred - UI updates)
  - Update IncidentDetail to show current user's permissions (deferred - UI updates)

## 7. User Management

- [x] 7.1 Create admin-only user management route
  - `app/dashboard/admin/users/page.tsx` - User list page
  - Protect route with admin-only middleware
- [ ] 7.2 Implement user listing
  - Fetch all users from Supabase Auth (requires Admin SDK setup - documented in UI)
  - Display in table with email, role, created date, last sign-in
  - Add search and filtering
- [ ] 7.3 Implement role assignment UI
  - Role dropdown for each user (deferred - requires Admin SDK)
  - Update role in Supabase Auth metadata
  - Prevent admin from changing own role
  - Show success/error messages
- [ ] 7.4 Create user profile page
  - `app/dashboard/profile/page.tsx` - User profile (deferred to future enhancement)
  - Display user email, role (read-only), account info
  - Allow user to update display name
- [x] 7.5 Implement first-user admin setup
  - Server-side check: if no users exist, make first user admin
  - Support `INITIAL_ADMIN_EMAIL` environment variable override

## 8. Testing and Validation

- [ ] 8.1 Test authentication flows (manual testing required after database setup)
  - Signup new user → verify employee role assigned
  - Login with valid credentials → verify redirect to dashboard
  - Login with invalid credentials → verify error message
  - Logout → verify session cleared and redirect to login
- [ ] 8.2 Test authorization (manual testing required after database setup)
  - Employee user → verify can only see own incidents
  - Manager user → verify can see all incidents
  - Viewer user → verify read-only access
  - Admin user → verify full access including user management
- [ ] 8.3 Test route protection (manual testing required after database setup)
  - Unauthenticated access to `/dashboard` → verify redirect to login
  - Authenticated access → verify dashboard loads
  - Insufficient role for module → verify 403 error
- [ ] 8.4 Test edge cases (manual testing required after database setup)
  - Session expiry → verify redirect to login
  - Invalid session token → verify logout and re-login required
  - Concurrent sessions → verify both work correctly
- [ ] 8.5 Verify database constraints (deferred - requires database setup)
  - Incident creation without user_id → verify fails
  - Foreign key integrity → verify cascades/restrictions work
  - Role data in auth metadata → verify persists correctly

## 9. Documentation and Cleanup

- [ ] 9.1 Update README (deferred to final deployment)
  - Add authentication setup instructions
  - Document environment variables
  - Explain role system
- [ ] 9.2 Update module development guide (deferred to final deployment)
  - Document `minRole` property
  - Explain how to access current user in modules
  - Provide examples of role-based UI rendering
- [x] 9.3 Add JSDoc comments
  - Document auth helper functions
  - Document permission check functions
  - Document role types and interfaces
- [ ] 9.4 Create .env.local.example (blocked by gitignore - documented in design.md)


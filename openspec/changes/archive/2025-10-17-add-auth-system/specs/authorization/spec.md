## ADDED Requirements

### Requirement: Role-Based Access Control
The system SHALL implement role-based access control with four predefined roles: Admin, Manager, Employee, and Viewer.

#### Scenario: Roles have distinct permission levels
- **WHEN** roles are defined in the system
- **THEN** Admin role has full system access including user management
- **AND** Manager role can create, edit, delete, and view all safety records
- **AND** Employee role can create and view own safety records
- **AND** Viewer role has read-only access to safety records

#### Scenario: User role is stored in auth metadata
- **WHEN** a user account is created or updated
- **THEN** role is stored in Supabase Auth app_metadata
- **AND** role is accessible in user session
- **AND** role cannot be modified by the user directly

#### Scenario: Default role assigned on signup
- **WHEN** a new user signs up
- **THEN** user is automatically assigned "employee" role
- **AND** admin can later change the role

### Requirement: Route Protection by Role
The system SHALL protect routes and modules based on user roles.

#### Scenario: Unauthenticated users redirected to login
- **WHEN** an unauthenticated user attempts to access `/dashboard`
- **THEN** user is redirected to `/login`
- **AND** original URL is preserved for post-login redirect

#### Scenario: Authenticated users access dashboard
- **WHEN** an authenticated user with any role accesses `/dashboard`
- **THEN** dashboard is displayed
- **AND** user sees modules appropriate for their role

#### Scenario: Module visibility based on role
- **WHEN** a module specifies minimum required role
- **THEN** users with insufficient role do not see module in navigation
- **AND** direct access to module route is denied with 403 error

#### Scenario: Admin-only routes protected
- **WHEN** a non-admin user attempts to access `/dashboard/admin`
- **THEN** access is denied with 403 Forbidden error
- **AND** admin users can access the route normally

### Requirement: Permission Check Helpers
The system SHALL provide helper functions for checking user permissions in application code.

#### Scenario: Check if user has required role
- **WHEN** code calls permission check with required role
- **THEN** function returns true if user role is equal or higher
- **AND** function returns false if user role is insufficient
- **AND** role hierarchy is: Admin > Manager > Employee > Viewer

#### Scenario: Check current user role
- **WHEN** component needs to conditionally render based on role
- **THEN** helper function returns current user's role
- **AND** function can be called from client or server components

### Requirement: Module-Level Access Control
The system SHALL allow safety modules to specify minimum role requirements for access.

#### Scenario: Module defines minimum role
- **WHEN** a module specifies `minRole: 'manager'`
- **THEN** only users with Manager or Admin role can access the module
- **AND** Employee and Viewer roles are denied access

#### Scenario: Module with no role requirement
- **WHEN** a module does not specify `minRole`
- **THEN** all authenticated users can access the module
- **AND** unauthenticated users are still redirected to login


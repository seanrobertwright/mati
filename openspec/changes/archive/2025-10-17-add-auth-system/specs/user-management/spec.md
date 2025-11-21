## ADDED Requirements

### Requirement: User Listing for Administrators
The system SHALL provide administrators with the ability to view all registered users.

#### Scenario: Admin views user list
- **WHEN** an admin accesses the user management page
- **THEN** a table displays all registered users
- **AND** table shows email, role, created date, and last sign-in
- **AND** table is sortable and searchable

#### Scenario: Non-admin cannot access user list
- **WHEN** a non-admin user attempts to access user management
- **THEN** access is denied with 403 error
- **AND** user is shown "Insufficient permissions" message

### Requirement: Role Assignment by Administrators
The system SHALL allow administrators to assign and modify user roles.

#### Scenario: Admin changes user role
- **WHEN** an admin selects a user and assigns a new role
- **THEN** user's role is updated in Supabase Auth metadata
- **AND** change takes effect on user's next session refresh
- **AND** audit log records the role change (who, when, old role, new role)

#### Scenario: Admin cannot demote themselves
- **WHEN** an admin attempts to change their own role to non-admin
- **THEN** operation is prevented with warning message
- **AND** error indicates "Cannot modify your own admin role"

#### Scenario: Role options are predefined
- **WHEN** admin opens role selection dropdown
- **THEN** only valid roles are shown: Admin, Manager, Employee, Viewer
- **AND** current role is pre-selected

### Requirement: User Profile Management
The system SHALL allow users to view and update their own profile information.

#### Scenario: User views own profile
- **WHEN** a user accesses their profile page
- **THEN** profile displays email, role (read-only), and account creation date
- **AND** user can see their current role but cannot change it

#### Scenario: User updates profile information
- **WHEN** a user updates their display name or other profile fields
- **THEN** changes are saved to Supabase Auth user_metadata
- **AND** updated information is reflected immediately in UI
- **AND** changes persist across sessions

### Requirement: Initial Admin Setup
The system SHALL support creating the first administrator account for initial setup.

#### Scenario: First user becomes admin
- **WHEN** the first user signs up and no other users exist
- **THEN** user is automatically assigned "admin" role
- **AND** subsequent users receive "employee" role by default

#### Scenario: Admin can be created via environment config
- **WHEN** an email is specified in `INITIAL_ADMIN_EMAIL` environment variable
- **THEN** user with that email is automatically assigned "admin" role on first login
- **AND** this override works even if other users already exist


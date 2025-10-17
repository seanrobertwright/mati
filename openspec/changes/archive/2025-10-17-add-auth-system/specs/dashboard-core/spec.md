## MODIFIED Requirements

### Requirement: Module Routing
The system SHALL dynamically route dashboard URLs to the appropriate module components with authentication and role-based access control.

#### Scenario: Unauthenticated user redirected to login
- **WHEN** an unauthenticated user navigates to `/dashboard/[moduleId]`
- **THEN** user is redirected to `/login`
- **AND** original URL is saved for post-login redirect

#### Scenario: Authenticated user accesses authorized module
- **WHEN** an authenticated user navigates to `/dashboard/[moduleId]` for a module they have access to
- **THEN** the corresponding module's route component is rendered
- **AND** user session is available to the module

#### Scenario: User lacks required role for module
- **WHEN** an authenticated user navigates to a module requiring higher role
- **THEN** access is denied with 403 Forbidden error
- **AND** error message indicates insufficient permissions

#### Scenario: Non-existent module shows 404
- **WHEN** a user navigates to a moduleId that does not exist
- **THEN** a 404 not found page is displayed

#### Scenario: Module sub-routes are supported with auth
- **WHEN** a module defines sub-routes and authenticated user navigates to `/dashboard/[moduleId]/[subpage]`
- **THEN** the module's route component receives the subpage parameter
- **AND** user authentication status is verified
- **AND** role requirements are checked


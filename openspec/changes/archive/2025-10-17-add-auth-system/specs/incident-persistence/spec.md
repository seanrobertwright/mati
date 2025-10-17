## MODIFIED Requirements

### Requirement: Incidents Table Schema
The system SHALL persist incident reports in a PostgreSQL table with proper data types, constraints, and user ownership tracking.

#### Scenario: Table structure with user ownership
- **WHEN** the incidents table is created or migrated
- **THEN** it SHALL include the following columns:
  - `id` (UUID, primary key, auto-generated)
  - `title` (text, not null)
  - `description` (text, not null)
  - `severity` (enum: low, medium, high, critical, not null)
  - `status` (enum: open, investigating, resolved, closed, not null)
  - `reported_by` (text, not null) - display name for backward compatibility
  - `user_id` (UUID, not null, foreign key to auth.users)
  - `reported_at` (timestamp, not null, default now)
  - `created_at` (timestamp, not null, default now)
  - `updated_at` (timestamp, not null, default now)

#### Scenario: User ownership is enforced
- **WHEN** a new incident is created
- **THEN** `user_id` is set to the authenticated user's ID
- **AND** `reported_by` is set to user's display name or email
- **AND** user_id cannot be null or modified after creation

#### Scenario: Data persistence across restarts
- **WHEN** an incident is created and the server restarts
- **THEN** the incident data SHALL persist in the database
- **AND** the incident SHALL be retrievable after restart
- **AND** user ownership information is preserved

## ADDED Requirements

### Requirement: User-Scoped Incident Queries
The system SHALL filter incident queries based on user role and ownership.

#### Scenario: Employee sees only own incidents
- **WHEN** a user with "employee" role queries incidents
- **THEN** only incidents where `user_id` matches the user are returned
- **AND** incidents created by other users are not visible

#### Scenario: Manager sees all incidents
- **WHEN** a user with "manager" or "admin" role queries incidents
- **THEN** all incidents in the system are returned
- **AND** each incident includes user ownership information

#### Scenario: Viewer sees all incidents read-only
- **WHEN** a user with "viewer" role queries incidents
- **THEN** all incidents are returned
- **AND** user cannot create, edit, or delete incidents

### Requirement: Incident Ownership for Updates
The system SHALL enforce ownership rules when updating or deleting incidents.

#### Scenario: Employee can edit own incidents
- **WHEN** an employee attempts to edit an incident they created
- **THEN** update is allowed
- **AND** changes are persisted

#### Scenario: Employee cannot edit others' incidents
- **WHEN** an employee attempts to edit an incident created by another user
- **THEN** update is denied with 403 Forbidden error
- **AND** error message indicates "Cannot edit incidents created by others"

#### Scenario: Manager can edit any incident
- **WHEN** a manager or admin attempts to edit any incident
- **THEN** update is allowed regardless of ownership
- **AND** audit trail records who made the change


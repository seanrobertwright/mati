# incident-persistence Specification

## Purpose
TBD - created by archiving change add-supabase-database-integration. Update Purpose after archive.
## Requirements
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

### Requirement: Database Migrations
The system SHALL use a migration system to version and evolve the database schema.

#### Scenario: Initial migration
- **WHEN** the database is first set up
- **THEN** a migration SHALL create the incidents table
- **AND** the migration SHALL be recorded in the migration history

#### Scenario: Schema changes
- **WHEN** the schema definition is modified
- **THEN** Drizzle Kit SHALL generate a new migration file
- **AND** the migration SHALL be applied to update the database

#### Scenario: Migration rollback
- **WHEN** a migration needs to be reverted
- **THEN** Drizzle Kit SHALL provide rollback capability
- **AND** the database SHALL return to the previous schema state

### Requirement: Data Integrity
The system SHALL enforce data integrity constraints at the database level.

#### Scenario: Required fields validation
- **WHEN** an attempt is made to insert an incident with missing required fields
- **THEN** the database SHALL reject the operation
- **AND** a validation error SHALL be returned

#### Scenario: Enum constraint enforcement
- **WHEN** an attempt is made to insert an invalid severity or status value
- **THEN** the database SHALL reject the operation
- **AND** an error SHALL indicate the valid enum values

### Requirement: Incident Data Retention
The system SHALL persist incident data indefinitely unless explicitly deleted.

#### Scenario: Long-term storage
- **WHEN** incidents are created over months or years
- **THEN** all incidents SHALL remain accessible in the database
- **AND** no automatic deletion SHALL occur

#### Scenario: Explicit deletion
- **WHEN** an incident is deleted through the application
- **THEN** the record SHALL be permanently removed from the database
- **AND** the deletion SHALL be irreversible

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


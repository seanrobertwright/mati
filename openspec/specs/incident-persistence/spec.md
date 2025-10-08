# incident-persistence Specification

## Purpose
TBD - created by archiving change add-supabase-database-integration. Update Purpose after archive.
## Requirements
### Requirement: Incidents Table Schema
The system SHALL persist incident reports in a PostgreSQL table with proper data types and constraints.

#### Scenario: Table structure
- **WHEN** the incidents table is created via migration
- **THEN** it SHALL include the following columns:
  - `id` (UUID, primary key, auto-generated)
  - `title` (text, not null)
  - `description` (text, not null)
  - `severity` (enum: low, medium, high, critical, not null)
  - `status` (enum: open, investigating, resolved, closed, not null)
  - `reported_by` (text, not null)
  - `reported_at` (timestamp, not null, default now)
  - `created_at` (timestamp, not null, default now)
  - `updated_at` (timestamp, not null, default now)

#### Scenario: Data persistence across restarts
- **WHEN** an incident is created and the server restarts
- **THEN** the incident data SHALL persist in the database
- **AND** the incident SHALL be retrievable after restart

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


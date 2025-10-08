## ADDED Requirements

### Requirement: Repository Pattern Implementation
The system SHALL implement a repository pattern to encapsulate database operations and separate data access from business logic.

#### Scenario: Centralized data access
- **WHEN** components need to access incident data
- **THEN** they SHALL use repository functions from `lib/db/repositories/incidents.ts`
- **AND** no direct database queries SHALL exist outside the repository layer

#### Scenario: Reusable operations
- **WHEN** multiple components need the same data operation
- **THEN** they SHALL share a single repository function
- **AND** code duplication SHALL be avoided

### Requirement: CRUD Operations for Incidents
The system SHALL provide Create, Read, Update, and Delete operations for incident reports.

#### Scenario: Create incident
- **WHEN** a new incident is submitted
- **THEN** the repository SHALL insert the incident into the database
- **AND** return the created incident with generated ID and timestamps

#### Scenario: Read all incidents
- **WHEN** the incident list is requested
- **THEN** the repository SHALL fetch all incidents from the database
- **AND** return them ordered by most recent first

#### Scenario: Read single incident
- **WHEN** a specific incident is requested by ID
- **THEN** the repository SHALL fetch the incident from the database
- **AND** return the incident or null if not found

#### Scenario: Update incident
- **WHEN** an incident is modified
- **THEN** the repository SHALL update the database record
- **AND** update the `updated_at` timestamp
- **AND** return the updated incident

#### Scenario: Delete incident
- **WHEN** an incident is deleted
- **THEN** the repository SHALL remove the record from the database
- **AND** return confirmation of deletion

### Requirement: Type Safety in Data Access
The system SHALL provide full TypeScript type safety for all database operations.

#### Scenario: Inferred types from schema
- **WHEN** repository functions are used
- **THEN** TypeScript SHALL infer types directly from the Drizzle schema
- **AND** no manual type definitions SHALL be required for database models

#### Scenario: Type-safe function signatures
- **WHEN** calling repository functions
- **THEN** parameters SHALL be fully typed
- **AND** return values SHALL have complete type information
- **AND** IDE autocomplete SHALL provide accurate suggestions

### Requirement: Error Handling in Data Access
The system SHALL handle database errors gracefully and provide meaningful error information.

#### Scenario: Database query failure
- **WHEN** a database query fails
- **THEN** the repository SHALL catch the error
- **AND** log technical details to the server console
- **AND** throw a user-friendly error message

#### Scenario: Not found errors
- **WHEN** a requested incident does not exist
- **THEN** the repository SHALL return null for single record queries
- **AND** NOT throw an exception

#### Scenario: Validation errors
- **WHEN** invalid data is provided to a repository function
- **THEN** the repository SHALL throw a validation error
- **AND** the error message SHALL indicate which fields are invalid

### Requirement: Async Data Fetching Pattern
The system SHALL use React Server Components for asynchronous database queries.

#### Scenario: Server component data fetching
- **WHEN** a React Server Component needs incident data
- **THEN** it SHALL call repository functions directly with async/await
- **AND** the data SHALL be fetched server-side before rendering

#### Scenario: Client component interaction
- **WHEN** client-side interactivity is needed
- **THEN** data SHALL be fetched in a Server Component parent
- **AND** passed as props to Client Components marked with 'use client'

#### Scenario: Loading states
- **WHEN** data is being fetched from the database
- **THEN** Next.js loading.tsx files SHALL provide loading UI
- **AND** the user SHALL see a loading indicator

### Requirement: Database Transaction Support
The system SHALL support database transactions for operations that require atomicity.

#### Scenario: Transaction execution
- **WHEN** multiple related database operations are performed
- **THEN** the repository SHALL wrap them in a transaction
- **AND** all operations SHALL commit together or rollback together

#### Scenario: Transaction rollback
- **WHEN** any operation in a transaction fails
- **THEN** all changes SHALL be rolled back
- **AND** the database SHALL remain in a consistent state


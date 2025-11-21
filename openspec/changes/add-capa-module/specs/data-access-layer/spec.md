## ADDED Requirements

### Requirement: CAPA Repository Operations
The system SHALL provide repository functions for CAPA CRUD operations following the established repository pattern.

#### Scenario: Create CAPA with metadata
- **WHEN** creating a new CAPA through the repository
- **THEN** the repository SHALL insert the CAPA with all metadata into the database
- **AND** generate a unique CAPA number
- **AND** set initial status and timestamps
- **AND** validate required fields before insertion

#### Scenario: Query CAPAs by status and priority
- **WHEN** fetching CAPAs by status (draft, investigation, action, verification, closed)
- **THEN** the repository SHALL return matching CAPAs
- **AND** support priority filtering (critical, high, medium, low)
- **AND** order by priority and due date

#### Scenario: Update CAPA workflow state
- **WHEN** updating CAPA status through the repository
- **THEN** the repository SHALL validate state transitions
- **AND** update status and transition timestamps
- **AND** log the state change in audit trail

#### Scenario: CAPA search and filtering
- **WHEN** searching CAPAs by criteria
- **THEN** the repository SHALL support filtering by date range, type, initiator, assignee
- **AND** provide full-text search on title and description
- **AND** return results with pagination

### Requirement: CAPA Investigation Repository Operations
The system SHALL provide repository functions for managing CAPA investigations and root cause analysis.

#### Scenario: Create investigation record
- **WHEN** starting CAPA investigation
- **THEN** the repository SHALL create investigation record linked to CAPA
- **AND** initialize investigation tools (5-why, fishbone, etc.)
- **AND** set investigation due date

#### Scenario: Store root cause analysis
- **WHEN** recording root cause findings
- **THEN** the repository SHALL store root cause categories and descriptions
- **AND** link to investigation methodologies used
- **AND** attach evidence and supporting data

#### Scenario: Update investigation progress
- **WHEN** updating investigation status
- **THEN** the repository SHALL track investigation completion
- **AND** record investigator assignments
- **AND** maintain investigation timeline

### Requirement: CAPA Action Repository Operations
The system SHALL provide repository functions for managing corrective and preventive actions.

#### Scenario: Create action plans
- **WHEN** creating action plans for CAPA
- **THEN** the repository SHALL store action details (description, type, responsible party, due date)
- **AND** differentiate between corrective and preventive actions
- **AND** set action priority and dependencies

#### Scenario: Track action completion
- **WHEN** updating action status
- **THEN** the repository SHALL record completion dates and evidence
- **AND** validate action effectiveness criteria
- **AND** update CAPA progress based on action status

#### Scenario: Action verification storage
- **WHEN** storing action verification results
- **THEN** the repository SHALL record verification methods and results
- **AND** store quantitative and qualitative evidence
- **AND** link to effectiveness monitoring

### Requirement: CAPA Effectiveness Repository Operations
The system SHALL provide repository functions for tracking CAPA effectiveness and compliance.

#### Scenario: Schedule effectiveness reviews
- **WHEN** scheduling effectiveness monitoring
- **THEN** the repository SHALL create review schedules based on CAPA type and risk
- **AND** set review intervals and criteria
- **AND** assign review responsibilities

#### Scenario: Record effectiveness data
- **WHEN** conducting effectiveness reviews
- **THEN** the repository SHALL store review results and metrics
- **AND** track key performance indicators
- **AND** maintain historical effectiveness data

#### Scenario: Generate compliance metrics
- **WHEN** generating CAPA metrics
- **THEN** the repository SHALL calculate compliance rates and trends
- **AND** provide ISO 9001/45001 compliance indicators
- **AND** support reporting and dashboard queries

### Requirement: CAPA Audit Trail Repository Operations
The system SHALL provide comprehensive audit trail tracking for all CAPA operations.

#### Scenario: Log CAPA lifecycle events
- **WHEN** CAPA records are created, modified, or transitioned
- **THEN** the repository SHALL create audit entries with user, timestamp, action, and details
- **AND** maintain immutable audit history
- **AND** support audit trail queries and exports

#### Scenario: Track investigation activities
- **WHEN** investigation activities occur
- **THEN** the repository SHALL log all investigation steps and findings
- **AND** record tool usage and evidence attachments
- **AND** maintain investigation audit trail

#### Scenario: Audit action implementation
- **WHEN** actions are planned, assigned, or completed
- **THEN** the repository SHALL track all action-related activities
- **AND** record verification and effectiveness reviews
- **AND** support compliance audit requirements

### Requirement: Type Safety for CAPA Data Access
The system SHALL provide full TypeScript type safety for all CAPA repository operations.

#### Scenario: Inferred types from CAPA schema
- **WHEN** using CAPA repository functions
- **THEN** TypeScript SHALL infer types from Drizzle schema definitions
- **AND** provide autocomplete for all CAPA fields
- **AND** enforce type safety at compile time

#### Scenario: Repository function signatures
- **WHEN** calling CAPA repository functions
- **THEN** parameters SHALL be fully typed with proper interfaces
- **AND** return values SHALL have complete type information
- **AND** enums SHALL be type-safe (status, priority, type, etc.)
## MODIFIED Requirements

### Requirement: Incidents Table Schema
The system SHALL persist incident reports in a PostgreSQL table with proper data types, constraints, user ownership tracking, and CAPA integration.

#### Scenario: Table structure with CAPA integration
- **WHEN** the incidents table is created or migrated
- **THEN** it SHALL include the following additional columns for CAPA integration:
  - `capa_required` (boolean, default false) - indicates if incident requires CAPA
  - `capa_id` (UUID, nullable, foreign key to capas) - links to related CAPA
  - `capa_initiated_at` (timestamp, nullable) - when CAPA was initiated from this incident
  - `capa_status` (enum: not_required, pending, initiated, completed, nullable) - CAPA status

#### Scenario: CAPA linkage is maintained
- **WHEN** a CAPA is initiated from an incident
- **THEN** `capa_id` is set to the CAPA's ID
- **AND** `capa_initiated_at` is set to current timestamp
- **AND** `capa_status` is updated to 'initiated'
- **AND** bidirectional linking is maintained

#### Scenario: CAPA requirement assessment
- **WHEN** assessing if an incident requires CAPA
- **THEN** `capa_required` can be set to true
- **AND** `capa_status` is set to 'pending'
- **AND** this triggers CAPA workflow initiation
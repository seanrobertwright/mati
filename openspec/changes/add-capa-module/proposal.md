# CAPA Module Proposal

## Why
Organizations need ISO 9001 and ISO 45001 compliant Corrective and Preventive Action (CAPA) systems to maintain quality and safety standards. Current system lacks structured CAPA management, root cause analysis, effectiveness monitoring, and compliance tracking required for certification audits. CAPA is a critical component of both quality management (ISO 9001) and occupational health & safety (ISO 45001) systems.

## What Changes
- Add new CAPA safety module with full CAPA lifecycle management
- Implement CAPA workflow: identification → investigation → root cause analysis → action planning → implementation → verification → closure
- Create CAPA database schema with all required fields for ISO compliance
- Build investigation tools including 5-Why analysis, fishbone diagrams, and risk assessment integration
- Add effectiveness monitoring with metrics and trend analysis
- Integrate with existing incident reporting and document management systems
- Provide compliance dashboards and audit trails
- Support both corrective actions (fixing problems) and preventive actions (preventing potential issues)

## Impact
- Affected specs:
  - `capa-management` (NEW) - Core CAPA management capabilities and ISO compliance requirements
  - `data-access-layer` (MODIFIED) - Add CAPA repository operations
  - `module-registry` (no change) - Auto-discovery will handle new module
  - `dashboard-core` (no change) - Module will integrate via existing framework
  - `incident-persistence` (MODIFIED) - Add CAPA reference fields to incidents

- Affected code:
  - `lib/modules/capa-management/` (NEW) - Module implementation
  - `lib/db/schema/capa.ts` (NEW) - Database schema for CAPA records, investigations, actions, verifications
  - `lib/db/repositories/capa.ts` (NEW) - Repository layer for CAPA operations
  - `lib/incident-reporting/` (MODIFIED) - Add CAPA initiation from incidents
  - `components/dashboard/` (possible new components) - CAPA status widgets, effectiveness metrics

- Breaking changes: None
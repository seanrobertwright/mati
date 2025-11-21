# CAPA Module Implementation Tasks

# CAPA Module Implementation Tasks

## 1. Database Schema & Infrastructure
### 1.1 CAPA Core Table Schema
- [ ] 1.1.1 Define `capas` table with basic fields (id, number, title, description)
- [ ] 1.1.2 Add CAPA type fields (corrective/preventive, priority, severity)
- [ ] 1.1.3 Add workflow fields (status, current_step, initiated_by, initiated_at)
- [ ] 1.1.4 Add date fields (due_date, completed_at, closed_at)
- [ ] 1.1.5 Add metadata fields (category, department, affected_areas)

### 1.2 CAPA Investigation Table Schema
- [ ] 1.2.1 Define `capa_investigations` table with basic fields (id, capa_id, investigator_id)
- [ ] 1.2.2 Add investigation fields (methodology, start_date, target_completion_date)
- [ ] 1.2.3 Add status tracking (status, completed_at, findings_summary)

### 1.3 CAPA Root Causes Table Schema
- [ ] 1.3.1 Define `capa_root_causes` table with basic fields (id, investigation_id, category)
- [ ] 1.3.2 Add root cause fields (description, evidence, confidence_level)
- [ ] 1.3.3 Add analysis tool references (tool_used, tool_data)

### 1.4 CAPA Actions Table Schema
- [ ] 1.4.1 Define `capa_actions` table with basic fields (id, capa_id, type, title)
- [ ] 1.4.2 Add action fields (description, assigned_to, due_date, priority)
- [ ] 1.4.3 Add tracking fields (status, completed_at, effectiveness_criteria)

### 1.5 CAPA Verification Table Schema
- [ ] 1.5.1 Define `capa_verifications` table with basic fields (id, capa_id, action_id)
- [ ] 1.5.2 Add verification fields (method, criteria, results, verified_by)
- [ ] 1.5.3 Add date fields (verification_date, next_review_date)

### 1.6 CAPA Effectiveness Reviews Table Schema
- [ ] 1.6.1 Define `capa_effectiveness_reviews` table with basic fields (id, capa_id, reviewer_id)
- [ ] 1.6.2 Add review fields (review_date, findings, recommendations)
- [ ] 1.6.3 Add follow-up fields (next_review_date, status)

### 1.7 Incident Table Modifications
- [ ] 1.7.1 Add `capa_required` boolean field to incidents table
- [ ] 1.7.2 Add `capa_id` UUID field to incidents table
- [ ] 1.7.3 Add `capa_initiated_at` timestamp field to incidents table
- [ ] 1.7.4 Add `capa_status` enum field to incidents table

### 1.8 Database Migration & Testing
- [ ] 1.8.1 Generate Drizzle migrations for all new tables
- [ ] 1.8.2 Test migrations on development database
- [ ] 1.8.3 Verify foreign key constraints work correctly
- [ ] 1.8.4 Test rollback functionality

### 1.9 Database Performance Optimization
- [ ] 1.9.1 Add indexes on frequently queried fields (status, priority, due_date)
- [ ] 1.9.2 Add composite indexes for common filter combinations
- [ ] 1.9.3 Add full-text search indexes for text fields
- [ ] 1.9.4 Analyze and optimize query performance

## 2. Repository Layer
### 2.1 CAPA Repository - Basic CRUD
- [ ] 2.1.1 Create `lib/db/repositories/capas.ts` file structure
- [ ] 2.1.2 Implement `createCAPA()` function with validation
- [ ] 2.1.3 Implement `getCAPAById()` function
- [ ] 2.1.4 Implement `getCAPAsByStatus()` function
- [ ] 2.1.5 Implement `updateCAPA()` function
- [ ] 2.1.6 Implement `deleteCAPA()` function (with safety checks)

### 2.2 CAPA Repository - Advanced Queries
- [ ] 2.2.1 Implement `getCAPAsByPriority()` function
- [ ] 2.2.2 Implement `getOverdueCAPAs()` function
- [ ] 2.2.3 Implement `searchCAPAs()` function with full-text search
- [ ] 2.2.4 Implement `getCAPAsByAssignee()` function
- [ ] 2.2.5 Implement `getCAPAsByDateRange()` function

### 2.3 CAPA Workflow State Management
- [ ] 2.3.1 Implement `transitionCAPAStatus()` function with validation
- [ ] 2.3.2 Add workflow state validation rules
- [ ] 2.3.3 Implement automatic timestamp updates on state changes
- [ ] 2.3.4 Add workflow audit logging to state transitions

### 2.4 Investigation Repository
- [ ] 2.4.1 Create `lib/db/repositories/capa-investigations.ts`
- [ ] 2.4.2 Implement `createInvestigation()` function
- [ ] 2.4.3 Implement `getInvestigationByCAPAId()` function
- [ ] 2.4.4 Implement `updateInvestigation()` function
- [ ] 2.4.5 Implement `completeInvestigation()` function

### 2.5 Actions Repository
- [ ] 2.5.1 Create `lib/db/repositories/capa-actions.ts`
- [ ] 2.5.2 Implement `createAction()` function
- [ ] 2.5.3 Implement `getActionsByCAPAId()` function
- [ ] 2.5.4 Implement `updateActionStatus()` function
- [ ] 2.5.5 Implement `assignAction()` function

### 2.6 Verification Repository
- [ ] 2.6.1 Create `lib/db/repositories/capa-verifications.ts`
- [ ] 2.6.2 Implement `createVerification()` function
- [ ] 2.6.3 Implement `getVerificationsByCAPAId()` function
- [ ] 2.6.4 Implement `updateVerificationResults()` function

### 2.7 Effectiveness Tracking Repository
- [ ] 2.7.1 Create `lib/db/repositories/capa-effectiveness.ts`
- [ ] 2.7.2 Implement `scheduleEffectivenessReview()` function
- [ ] 2.7.3 Implement `recordEffectivenessReview()` function
- [ ] 2.7.4 Implement `getEffectivenessMetrics()` function

### 2.8 Repository Error Handling & Type Safety
- [ ] 2.8.1 Add comprehensive error handling to all repository functions
- [ ] 2.8.2 Implement proper TypeScript types for all functions
- [ ] 2.8.3 Add input validation using Zod schemas
- [ ] 2.8.4 Create repository result types (success/error unions)

### 2.9 Transaction Management
- [ ] 2.9.1 Create transaction wrapper utilities
- [ ] 2.9.2 Implement multi-table CAPA creation transactions
- [ ] 2.9.3 Implement workflow transition transactions
- [ ] 2.9.4 Add transaction rollback error handling

## 3. CAPA Workflow Engine
- [ ] 3.1 Create `lib/modules/capa-management/services/workflow-engine.ts`
- [ ] 3.2 Implement CAPA state machine (draft → investigation → action → verification → closed)
- [ ] 3.3 Add workflow validation rules (required fields per state)
- [ ] 3.4 Implement automatic due date calculations
- [ ] 3.5 Create escalation rules for overdue CAPAs
- [ ] 3.6 Add workflow audit logging

## 4. Investigation Tools
### 4.1 5-Why Analysis Tool
- [ ] 4.1.1 Create `FiveWhyAnalysis` component basic structure
- [ ] 4.1.2 Implement question input fields (Why 1-5)
- [ ] 4.1.3 Add evidence attachment for each level
- [ ] 4.1.4 Implement save/load functionality
- [ ] 4.1.5 Add validation for complete analysis

### 4.2 Fishbone Diagram Builder
- [ ] 4.2.1 Create `FishboneDiagram` component structure
- [ ] 4.2.2 Implement main categories (People, Process, Equipment, Materials, Environment, Management)
- [ ] 4.2.3 Add sub-cause input functionality
- [ ] 4.2.4 Implement visual diagram rendering
- [ ] 4.2.5 Add save/export capabilities

### 4.3 Risk Assessment Integration
- [ ] 4.3.1 Create risk assessment matrix component
- [ ] 4.3.2 Implement likelihood/impact scoring
- [ ] 4.3.3 Add risk priority calculation
- [ ] 4.3.4 Integrate with existing risk assessment data
- [ ] 4.3.5 Link risks to root cause findings

### 4.4 Investigation Template System
- [ ] 4.4.1 Create template data structure
- [ ] 4.4.2 Implement template selection UI
- [ ] 4.4.3 Add template customization features
- [ ] 4.4.4 Create predefined industry templates
- [ ] 4.4.5 Add template management (create/edit/delete)

### 4.5 Evidence Attachment System
- [ ] 4.5.1 Create evidence upload component
- [ ] 4.5.2 Implement file type validation
- [ ] 4.5.3 Add evidence metadata fields
- [ ] 4.5.4 Implement evidence linking to findings
- [ ] 4.5.5 Add evidence preview functionality

### 4.6 Investigation Collaboration Features
- [ ] 4.6.1 Add investigation team assignment
- [ ] 4.6.2 Implement comment/discussion system
- [ ] 4.6.3 Add investigation progress tracking
- [ ] 4.6.4 Create investigation review workflow
- [ ] 4.6.5 Add collaboration notifications

## 5. Action Management
- [ ] 5.1 Create action planning interface
- [ ] 5.2 Implement action assignment and tracking
- [ ] 5.3 Add action effectiveness criteria
- [ ] 5.4 Create action verification workflow
- [ ] 5.5 Implement action deadline management
- [ ] 5.6 Add action dependency tracking

## 6. UI Components - CAPA Management
### 6.1 CAPA List Component
- [ ] 6.1.1 Create `CAPAList` component basic structure
- [ ] 6.1.2 Implement data fetching and loading states
- [ ] 6.1.3 Add basic table layout with CAPA information
- [ ] 6.1.4 Implement sorting by columns (number, status, priority, due date)
- [ ] 6.1.5 Add filtering by status, priority, and assignee

### 6.2 CAPA Detail View Component
- [ ] 6.2.1 Create `CAPADetailView` component structure
- [ ] 6.2.2 Implement CAPA header section (number, title, status)
- [ ] 6.2.3 Add description and metadata display
- [ ] 6.2.4 Implement tabbed interface for different sections
- [ ] 6.2.5 Add action buttons based on user permissions

### 6.3 CAPA Workflow Status Component
- [ ] 6.3.1 Create `CAPAWorkflowStatus` component
- [ ] 6.3.2 Implement visual workflow progress indicator
- [ ] 6.3.3 Add current step highlighting
- [ ] 6.3.4 Show completion status for each step
- [ ] 6.3.5 Add workflow navigation controls

### 6.4 CAPA Create Form Component
- [ ] 6.4.1 Create `CAPACreateForm` component structure
- [ ] 6.4.2 Implement basic information fields (title, description, type)
- [ ] 6.4.3 Add priority and severity selection
- [ ] 6.4.4 Implement due date picker
- [ ] 6.4.5 Add form validation and submission

### 6.5 Investigation Form Component
- [ ] 6.5.1 Create `InvestigationForm` component
- [ ] 6.5.2 Add investigation methodology selection
- [ ] 6.5.3 Implement investigator assignment
- [ ] 6.5.4 Add investigation timeline fields
- [ ] 6.5.5 Implement form submission and validation

### 6.6 Action Planning Form Component
- [ ] 6.6.1 Create `ActionPlanningForm` component
- [ ] 6.6.2 Implement action type selection (corrective/preventive)
- [ ] 6.6.3 Add action details fields (title, description, assignee)
- [ ] 6.6.4 Implement due date and priority settings
- [ ] 6.6.5 Add effectiveness criteria input

### 6.7 Verification Form Component
- [ ] 6.7.1 Create `VerificationForm` component
- [ ] 6.7.2 Add verification method selection
- [ ] 6.7.3 Implement criteria definition
- [ ] 6.7.4 Add results input fields
- [ ] 6.7.5 Implement verification submission

## 7. UI Components - Investigation Tools
- [ ] 7.1 Create `FiveWhyAnalysis` component
- [ ] 7.2 Create `FishboneDiagram` component
- [ ] 7.3 Create `RiskAssessmentMatrix` component
- [ ] 7.4 Create `InvestigationTemplates` component
- [ ] 7.5 Create `EvidenceManager` component

## 8. UI Components - Metrics & Reporting
- [ ] 8.1 Create `CAPAMetricsDashboard` component
- [ ] 8.2 Create `CAPAEffectivenessWidget` component
- [ ] 8.3 Create `OverdueCAPAWidget` component
- [ ] 8.4 Create `CAPATrendAnalysis` component
- [ ] 8.5 Create `ComplianceReportGenerator` component
- [ ] 8.6 Create `CAPAAuditTrailViewer` component

## 9. Integration Features
### 9.1 Incident-CAPA Integration
- [ ] 9.1.1 Add "Create CAPA" button to incident detail view
- [ ] 9.1.2 Implement CAPA creation from incident data
- [ ] 9.1.3 Add bidirectional linking between incidents and CAPAs
- [ ] 9.1.4 Update incident status when CAPA is initiated
- [ ] 9.1.5 Show CAPA status on incident list/cards

### 9.2 Document Management Integration
- [ ] 9.2.1 Add document attachment to CAPA investigations
- [ ] 9.2.2 Implement evidence linking to document management
- [ ] 9.2.3 Add CAPA reference to document metadata
- [ ] 9.2.4 Create document templates for CAPA reports
- [ ] 9.2.5 Implement document version tracking for CAPA evidence

### 9.3 Risk Assessment Integration
- [ ] 9.3.1 Link CAPA root causes to risk assessments
- [ ] 9.3.2 Add CAPA recommendations to risk mitigation plans
- [ ] 9.3.3 Show related CAPAs on risk assessment details
- [ ] 9.3.4 Implement risk score updates based on CAPA outcomes
- [ ] 9.3.5 Create preventive actions from risk assessments

### 9.4 CAPA Notification System
- [ ] 9.4.1 Implement due date reminder notifications
- [ ] 9.4.2 Add assignment notifications
- [ ] 9.4.3 Create approval request notifications
- [ ] 9.4.4 Implement escalation notifications
- [ ] 9.4.5 Add status change notifications

### 9.5 CAPA Search and Cross-referencing
- [ ] 9.5.1 Implement global CAPA search functionality
- [ ] 9.5.2 Add cross-references between related CAPAs
- [ ] 9.5.3 Create CAPA relationship mapping
- [ ] 9.5.4 Implement CAPA history and trend analysis
- [ ] 9.5.5 Add CAPA export and reporting features

## 10. Module Integration
- [ ] 10.1 Create `lib/modules/capa-management/index.ts` module definition
- [ ] 10.2 Create module icon component
- [ ] 10.3 Create dashboard widget for CAPA status
- [ ] 10.4 Create main route component with CAPA management interface
- [ ] 10.5 Define navigation items (CAPAs, Investigations, Metrics, Reports)
- [ ] 10.6 Register module in `lib/safety-framework/registry.ts`

## 11. API Routes (Server Actions)
- [ ] 11.1 Create `app/api/capas/route.ts` for CAPA CRUD operations
- [ ] 11.2 Create `app/api/capas/[id]/workflow/route.ts` for state transitions
- [ ] 11.3 Create `app/api/capas/[id]/investigation/route.ts`
- [ ] 11.4 Create `app/api/capas/[id]/actions/route.ts`
- [ ] 11.5 Create `app/api/capas/[id]/verification/route.ts`
- [ ] 11.6 Add rate limiting and security headers
- [ ] 11.7 Implement proper error handling and validation

## 12. Permission & Authorization
- [ ] 12.1 Extend `lib/auth/permissions.ts` with CAPA permission types
- [ ] 12.2 Implement `canCreateCAPA(user)` check
- [ ] 12.3 Implement `canEditCAPA(user, capa)` check
- [ ] 12.4 Implement `canApproveCAPA(user, capa)` check
- [ ] 12.5 Implement `canCloseCAPA(user, capa)` check
- [ ] 12.6 Add role-based access control (investigator, approver, etc.)

## 13. Validation & Compliance
- [ ] 13.1 Add Zod schemas for CAPA data validation
- [ ] 13.2 Implement ISO 9001 compliance checks
- [ ] 13.3 Implement ISO 45001 compliance checks
- [ ] 13.4 Add CAPA completeness validation
- [ ] 13.5 Create compliance audit checklist
- [ ] 13.6 Add automated compliance monitoring

## 14. Notifications & Escalation
- [ ] 14.1 Create CAPA due date reminder system
- [ ] 14.2 Create escalation notifications for overdue items
- [ ] 14.3 Add approval request notifications
- [ ] 14.4 Create effectiveness review reminders
- [ ] 14.5 Implement notification preferences
- [ ] 14.6 Add notification badge to module icon

## 15. Testing
### 15.1 Workflow Engine Unit Tests
- [ ] 15.1.1 Test CAPA state transitions
- [ ] 15.1.2 Test workflow validation rules
- [ ] 15.1.3 Test due date calculations
- [ ] 15.1.4 Test escalation logic
- [ ] 15.1.5 Test audit logging

### 15.2 Repository Layer Unit Tests
- [ ] 15.2.1 Test CAPA CRUD operations
- [ ] 15.2.2 Test investigation repository functions
- [ ] 15.2.3 Test action repository functions
- [ ] 15.2.4 Test verification repository functions
- [ ] 15.2.5 Test transaction handling

### 15.3 CAPA Lifecycle Integration Tests
- [ ] 15.3.1 Test complete CAPA creation workflow
- [ ] 15.3.2 Test investigation to action transition
- [ ] 15.3.3 Test action verification workflow
- [ ] 15.3.4 Test CAPA closure process
- [ ] 15.3.5 Test effectiveness review scheduling

### 15.4 ISO Compliance Validation Tests
- [ ] 15.4.1 Test ISO 9001 compliance checks
- [ ] 15.4.2 Test ISO 45001 compliance checks
- [ ] 15.4.3 Test CAPA completeness validation
- [ ] 15.4.4 Test compliance reporting
- [ ] 15.4.5 Test audit trail completeness

### 15.5 Investigation Tools Functionality Tests
- [ ] 15.5.1 Test 5-Why analysis tool
- [ ] 15.5.2 Test fishbone diagram builder
- [ ] 15.5.3 Test risk assessment integration
- [ ] 15.5.4 Test template system
- [ ] 15.5.5 Test evidence attachment

### 15.6 Permission and Security Tests
- [ ] 15.6.1 Test CAPA creation permissions
- [ ] 15.6.2 Test CAPA editing permissions
- [ ] 15.6.3 Test approval permissions
- [ ] 15.6.4 Test role-based access control
- [ ] 15.6.5 Test permission edge cases

### 15.7 Performance and Load Tests
- [ ] 15.7.1 Test CAPA list performance with 1000+ records
- [ ] 15.7.2 Test search performance
- [ ] 15.7.3 Test concurrent CAPA operations
- [ ] 15.7.4 Test large file uploads
- [ ] 15.7.5 Test database query performance

## 16. Documentation
- [ ] 16.1 Update module README with CAPA usage guide
- [ ] 16.2 Document ISO 9001 compliance features
- [ ] 16.3 Document ISO 45001 compliance features
- [ ] 16.4 Create CAPA workflow documentation
- [ ] 16.5 Create investigation methodology guide
- [ ] 16.6 Document effectiveness monitoring procedures

## 17. Accessibility & UX
- [ ] 17.1 Add ARIA labels to all CAPA workflow elements
- [ ] 17.2 Ensure keyboard navigation in investigation tools
- [ ] 17.3 Add focus indicators and screen reader support
- [ ] 17.4 Test with screen readers
- [ ] 17.5 Ensure responsive design for mobile/tablet
- [ ] 17.6 Add tooltips for complex CAPA features
- [ ] 17.7 Create onboarding tour for CAPA workflows

## 18. Performance Optimization
- [ ] 18.1 Add pagination to CAPA lists
- [ ] 18.2 Implement efficient CAPA search and filtering
- [ ] 18.3 Add database indexes for common queries
- [ ] 18.4 Optimize investigation tool rendering
- [ ] 18.5 Implement lazy loading for large datasets
- [ ] 18.6 Add caching for frequently accessed CAPA data

## 19. Security & Audit
- [ ] 19.1 Add comprehensive audit logging for all CAPA operations
- [ ] 19.2 Implement data retention policies for closed CAPAs
- [ ] 19.3 Add CAPA data export capabilities
- [ ] 19.4 Implement backup procedures for CAPA data
- [ ] 19.5 Add integrity checks for CAPA records
- [ ] 19.6 Create CAPA data anonymization for testing
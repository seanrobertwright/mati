# Document Management Design

## Context
The safety management system needs ISO 9001 and ISO 45001 compliant document control to meet certification requirements. This requires:
- Structured document organization and version control
- Multi-stage approval workflows
- Audit trails and compliance metrics
- Integration with existing auth while supporting document-specific roles

Key constraints:
- Must use local filesystem storage (not cloud)
- Must integrate with existing Drizzle/PostgreSQL database
- Must follow existing module framework patterns
- Must support existing role-based permissions plus document-specific roles

## Goals / Non-Goals

**Goals:**
- ISO 9001/45001 compliant document management
- File manager UI with directory/subdirectory navigation
- Complete document lifecycle tracking
- Change request workflow with discussion
- Metrics dashboard with drill-down
- Audit trail for compliance
- Local filesystem storage with database metadata

**Non-Goals:**
- Cloud storage integration (phase 2)
- Real-time collaborative editing (use change requests instead)
- Advanced search/OCR capabilities (phase 2)
- Integration with external document systems (phase 2)
- Mobile app support (web-only initially)

## Decisions

### Decision 1: Hybrid Storage Model
**What:** Store file content on local filesystem, metadata in PostgreSQL database

**Why:**
- User requirement for local filesystem storage
- Database provides fast querying for metadata, status, metrics
- Enables transactional integrity for document operations
- Separates concerns: filesystem for binary data, database for structured data

**Alternatives considered:**
- Pure database storage (BLOBs): Poor performance for large files
- Pure filesystem: No transactional guarantees, complex querying

**Implementation:**
- Database stores: metadata, versions, relationships, permissions, audit log
- Filesystem stores: actual file content with hash-based naming
- Path stored as environment variable: `DOCUMENT_STORAGE_PATH`

### Decision 2: Document Version Strategy
**What:** Full version copies on local filesystem, version metadata in database

**Why:**
- ISO requires ability to retrieve any historical version
- Disk space is cheap, compliance is expensive
- Simplifies rollback and audit scenarios
- No complex diff/merge logic needed

**Schema:**
```
documents (id, current_version_id, directory_id, ...)
document_versions (id, document_id, version_number, file_path, created_by, ...)
```

### Decision 3: Directory Structure Model
**What:** Recursive directory tree using adjacency list pattern

**Why:**
- Simple to implement with PostgreSQL
- Supports unlimited nesting depth
- Easy to query with recursive CTEs
- Matches user's mental model (file manager)

**Schema:**
```
directories (id, name, parent_id, created_by, ...)
- parent_id NULL = root directory
- Recursive queries for tree traversal
```

### Decision 4: Approval Workflow Implementation
**What:** State machine with explicit stages and role-based transitions

**Why:**
- Clear audit trail (who approved when)
- Flexible routing based on document category
- Supports parallel review/approval
- ISO compliance requires explicit approval records

**States:**
- `draft` → author working
- `pending_review` → awaiting reviewer
- `pending_approval` → awaiting approver  
- `approved` → current/active
- `under_review` → scheduled review triggered
- `archived` → superseded by new version

**Transitions stored in `document_approvals` table for audit**

### Decision 5: Change Request Model
**What:** Separate `change_requests` table linked to documents with discussion thread

**Why:**
- ISO requires formal change control process
- Supports collaborative discussion before changes
- Maintains approval routing separate from document workflow
- Audit trail for why changes were made

**Features:**
- Change request status (draft, submitted, under_review, approved, rejected)
- Comments thread (like issue tracking)
- Approval routing based on change impact
- Links to affected documents

### Decision 6: Permission Model
**What:** Combine existing auth roles with document-specific assignments

**Why:**
- Leverage existing permission infrastructure
- Support document-specific owners/approvers/reviewers
- Allow organization-wide roles (e.g., quality manager can approve all)
- Maintain least-privilege principle

**Implementation:**
```
document_permissions (
  document_id,
  user_id, 
  role: 'owner' | 'reviewer' | 'approver' | 'viewer'
)
```

**Permission hierarchy:**
1. System admin - full access
2. Document owner - can edit, assign reviewers/approvers
3. Document approver - can approve/reject
4. Document reviewer - can review and comment
5. Viewer - read-only access
6. No permission - no access (unless directory-level permission grants it)

### Decision 7: Metrics & Reporting
**What:** Pre-computed metrics with drill-down views

**Why:**
- Real-time metrics too slow for large document sets
- ISO audits require specific reports
- Dashboard performance critical for UX

**Approach:**
- Computed queries for current metrics (acceptable for initial implementation)
- Future: materialized views or scheduled metric computation
- Drill-down: click metric → filtered document list → document detail

**Key Metrics:**
- Documents overdue for review (days overdue, count, %)
- Documents by status (new, pending, approved, overdue)
- Change requests (open, approved, avg time to approval)
- Recent activity timeline
- Audit log access

## Data Model Summary

```sql
-- Core entities
directories (id, name, parent_id, created_by, created_at)
documents (id, title, category, directory_id, current_version_id, owner_id, 
           status, effective_date, review_frequency_days, next_review_date, 
           created_at, updated_at)
document_versions (id, document_id, version_number, file_path, file_hash,
                   file_size, uploaded_by, created_at, notes)

-- Workflow & permissions  
document_permissions (id, document_id, user_id, role, granted_by, granted_at)
document_approvals (id, document_id, version_id, approver_id, role,
                    status, approved_at, notes)

-- Change management
change_requests (id, document_id, title, description, requested_by,
                 status, priority, created_at, updated_at)
change_request_comments (id, change_request_id, user_id, comment, created_at)

-- Audit trail
document_audit_log (id, document_id, user_id, action, details, timestamp)
```

## File Storage Strategy

**Directory structure:**
```
{DOCUMENT_STORAGE_PATH}/
  documents/
    {document-id}/
      {version-number}_{hash}.{ext}
  temp/
    {upload-id}.{ext}
```

**Upload flow:**
1. Client uploads to temp directory
2. Server validates file
3. Server computes hash
4. Database transaction: create version record
5. Move file to permanent location
6. Delete temp file
7. Update document current_version_id

**Hash strategy:**
- Use SHA-256 for file integrity
- Detect duplicate uploads
- Support rollback to any version

## Risks / Trade-offs

**Risk:** File system and database out of sync
- **Mitigation:** Transactional operations, background verification job, manual reconciliation tool

**Risk:** Disk space exhaustion from version storage
- **Mitigation:** Configurable retention policy, archive old versions, disk space monitoring

**Risk:** Concurrent edits to same document
- **Mitigation:** Optimistic locking on document versions, clear conflict UI

**Risk:** Performance degradation with thousands of documents
- **Mitigation:** Pagination, indexes on key fields, future materialized views for metrics

**Trade-off:** Full version copies vs. delta storage
- **Decision:** Full copies - simplicity and reliability over storage efficiency
- **Rationale:** Disk is cheap, ISO compliance requires exact historical versions

**Trade-off:** Real-time metrics vs. pre-computed
- **Decision:** Real-time computed queries initially
- **Rationale:** Simpler to implement, optimize later when scale requires it

## Migration Plan

### Phase 1: Core Infrastructure (Week 1-2)
1. Database schema and migrations
2. File storage infrastructure
3. Repository layer
4. Basic CRUD operations

### Phase 2: UI & Navigation (Week 3-4)
5. Directory tree component
6. File browser interface
7. Document upload/download
8. Document detail view

### Phase 3: Workflow (Week 5-6)
9. Approval workflow state machine
10. Permission checks
11. Review scheduling
12. Notifications

### Phase 4: Change Management (Week 7-8)
13. Change request system
14. Discussion/comments
15. Change approval routing

### Phase 5: Metrics & Compliance (Week 9-10)
16. Metrics dashboard
17. Audit log viewer
18. Compliance reports
19. Export capabilities

### Rollback Strategy
- Database migrations are reversible
- File storage can be cleared (no dependency)
- Module can be disabled by removing from registry
- No impact on existing modules

## Open Questions

1. **Document categories:** Should we provide a predefined list or allow custom categories?
   - *Recommendation:* Configurable enum in database, admin can manage list

2. **Review frequency:** Fixed intervals (30, 60, 90 days) or custom per document?
   - *Recommendation:* Custom per document, with suggested defaults by category

3. **Notifications:** Email, in-app, or both for review reminders?
   - *Recommendation:* In-app initially, email in phase 2

4. **File size limits:** What's the maximum document size?
   - *Recommendation:* 100MB default, configurable via environment variable

5. **Document numbering:** Auto-generated (DOC-001) or manual?
   - *Recommendation:* Auto-generated with configurable prefix by category

6. **Archive policy:** How long to keep superseded versions?
   - *Recommendation:* Indefinite retention (ISO requirement), future: configurable per category


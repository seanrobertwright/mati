# Document Management Compliance Audit Checklist

## Overview
This checklist provides a comprehensive framework for auditing the Document Management system for ISO 9001:2015 and ISO 45001:2018 compliance.

## How to Use This Checklist
1. Review each section before audit
2. Gather required evidence
3. Mark items as ✓ (compliant), ✗ (non-compliant), or N/A (not applicable)
4. Document findings and corrective actions
5. Schedule follow-up for non-compliant items

---

## Section 1: Document Control (ISO 9001:2015 Clause 7.5)

### 1.1 Document Identification
- [ ] All documents have unique identifiers (UUID)
- [ ] Document titles are clear and descriptive
- [ ] Version numbers are sequential and tracked
- [ ] Document categories are properly assigned
- [ ] Effective dates are recorded

**Evidence Required:**
- Sample document list showing IDs, titles, versions
- Database query results for document metadata

**Verification Method:**
```sql
SELECT id, title, category_id, version, effective_date 
FROM documents 
LIMIT 10;
```

### 1.2 Document Approval
- [ ] All approved documents have approval records
- [ ] Approver names and dates are recorded
- [ ] Approval notes are documented
- [ ] Multi-stage approval is enforced where required
- [ ] Self-approval is prevented

**Evidence Required:**
- Sample approval records
- Workflow configuration
- Audit trail of approvals

**Verification Method:**
```sql
SELECT d.title, da.approver_id, da.approved_at, da.notes
FROM documents d
JOIN document_approvals da ON d.id = da.document_id
WHERE d.status = 'approved'
LIMIT 10;
```

### 1.3 Document Review
- [ ] Review frequencies are defined
- [ ] Next review dates are calculated
- [ ] Overdue reviews are tracked
- [ ] Review reminders are sent
- [ ] Reviewers are assigned

**Evidence Required:**
- Review schedule report
- Overdue review list
- Notification logs

**Verification Method:**
```sql
SELECT title, review_frequency_days, next_review_date,
       CASE WHEN next_review_date < CURRENT_DATE THEN 'OVERDUE' ELSE 'CURRENT' END as status
FROM documents
WHERE status = 'approved'
ORDER BY next_review_date;
```

### 1.4 Version Control
- [ ] All document versions are retained
- [ ] Version history is accessible
- [ ] Current version is clearly identified
- [ ] Superseded versions are marked
- [ ] Version comparison is available

**Evidence Required:**
- Version history for sample documents
- Database records of all versions

**Verification Method:**
```sql
SELECT document_id, version_number, created_at, uploaded_by
FROM document_versions
WHERE document_id = 'sample-doc-id'
ORDER BY version_number DESC;
```

---

## Section 2: Access Control and Permissions

### 2.1 Role-Based Access
- [ ] User roles are defined (admin, manager, employee)
- [ ] Permissions are assigned by role
- [ ] Role assignments are documented
- [ ] Access is restricted based on role
- [ ] Role changes are logged

**Evidence Required:**
- User role matrix
- Permission configuration
- Audit log of role changes

**Verification Method:**
```sql
SELECT u.name, u.role, COUNT(dp.document_id) as accessible_documents
FROM users u
LEFT JOIN document_permissions dp ON u.id = dp.user_id
GROUP BY u.name, u.role;
```

### 2.2 Document Permissions
- [ ] Document-specific permissions are assigned
- [ ] Permission types are clear (owner, approver, reviewer, viewer)
- [ ] Permission grants are logged
- [ ] Permission revocations are logged
- [ ] Permissions can be audited

**Evidence Required:**
- Sample permission assignments
- Audit log of permission changes

**Verification Method:**
```sql
SELECT d.title, u.name, dp.role, dp.granted_by, dp.granted_at
FROM document_permissions dp
JOIN documents d ON dp.document_id = d.id
JOIN users u ON dp.user_id = u.id
ORDER BY d.title, dp.granted_at DESC;
```

### 2.3 Directory Permissions
- [ ] Directory-level permissions are supported
- [ ] Children inherit permissions
- [ ] Inheritance is documented
- [ ] Exceptions are tracked
- [ ] Permission conflicts are resolved

**Evidence Required:**
- Directory permission structure
- Inheritance rules documentation

---

## Section 3: Audit Trail (ISO 9001 & ISO 45001)

### 3.1 Audit Log Completeness
- [ ] All document actions are logged
- [ ] User identification is recorded
- [ ] Timestamps are accurate
- [ ] Action details are captured
- [ ] Logs are tamper-proof

**Actions to Verify:**
- Document created
- Document updated
- File uploaded
- File downloaded
- Status changed
- Permission granted
- Permission revoked
- Approval submitted
- Review completed

**Evidence Required:**
- Sample audit log entries
- Audit log query results

**Verification Method:**
```sql
SELECT action, COUNT(*) as occurrences
FROM document_audit_log
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY action
ORDER BY occurrences DESC;
```

### 3.2 Audit Trail Accessibility
- [ ] Audit logs are searchable
- [ ] Filters are available (user, action, date)
- [ ] Export capability exists
- [ ] Reports can be generated
- [ ] Logs are retained per policy

**Evidence Required:**
- Audit log viewer screenshots
- Sample audit reports

### 3.3 Audit Trail Security
- [ ] Logs cannot be modified
- [ ] Logs cannot be deleted
- [ ] Access to logs is restricted
- [ ] Unauthorized access attempts are logged
- [ ] Regular backups are performed

**Evidence Required:**
- Database constraints on audit log table
- Access control configuration
- Backup schedule

---

## Section 4: Change Control

### 4.1 Change Request Process
- [ ] Change requests are required for approved documents
- [ ] Change justification is documented
- [ ] Impact assessment is performed
- [ ] Approvals are obtained
- [ ] Implementation is tracked

**Evidence Required:**
- Sample change requests
- Change request workflow diagram
- Approval records

**Verification Method:**
```sql
SELECT title, description, priority, status, requested_by
FROM change_requests
WHERE status IN ('approved', 'implemented')
LIMIT 10;
```

### 4.2 Change Discussion
- [ ] Comments are supported on change requests
- [ ] Discussion history is retained
- [ ] Stakeholder input is documented
- [ ] Decisions are recorded
- [ ] Consensus is achieved

**Evidence Required:**
- Change request comment threads
- Decision documentation

**Verification Method:**
```sql
SELECT cr.title, crc.comment, crc.created_at, u.name
FROM change_request_comments crc
JOIN change_requests cr ON crc.change_request_id = cr.id
JOIN users u ON crc.user_id = u.id
WHERE cr.id = 'sample-cr-id'
ORDER BY crc.created_at;
```

---

## Section 5: OH&S Document Control (ISO 45001)

### 5.1 Safety Document Identification
- [ ] Safety documents are clearly marked
- [ ] Hazard information is accessible
- [ ] Emergency procedures are identified
- [ ] PPE requirements are documented
- [ ] Safety training is linked

**Evidence Required:**
- List of safety-critical documents
- Category assignments
- Metadata tags

**Verification Method:**
```sql
SELECT title, category_id, description
FROM documents
WHERE category_id IN (
  SELECT id FROM document_categories 
  WHERE name IN ('safety_procedure', 'emergency_procedure')
);
```

### 5.2 Worker Accessibility
- [ ] Documents are accessible at point of use
- [ ] Mobile access is available
- [ ] Offline capability exists
- [ ] Search is fast and effective
- [ ] Emergency procedures are prioritized

**Evidence Required:**
- Mobile accessibility testing
- Search performance metrics
- User access statistics

### 5.3 Worker Consultation
- [ ] Workers can comment on changes
- [ ] Feedback is considered
- [ ] Consultation is documented
- [ ] Input influences decisions
- [ ] Process is transparent

**Evidence Required:**
- Worker comments on change requests
- Documentation of consultation process

---

## Section 6: Retention and Archival

### 6.1 Retention Policy
- [ ] Retention periods are defined
- [ ] Legal requirements are met
- [ ] Retention is enforced
- [ ] Exceptions are documented
- [ ] Disposal is controlled

**Evidence Required:**
- Retention policy documentation
- Retention schedule by document type

**Verification Method:**
```sql
SELECT category_id, COUNT(*) as total, 
       SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived
FROM documents
GROUP BY category_id;
```

### 6.2 Archival Process
- [ ] Archival replaces deletion
- [ ] Archived documents remain accessible
- [ ] Archival is logged
- [ ] Archived documents are searchable
- [ ] Restoration is possible

**Evidence Required:**
- Archived document list
- Archival workflow documentation
- Restoration procedure

---

## Section 7: System Performance and Reliability

### 7.1 Availability
- [ ] System uptime meets SLA
- [ ] Downtime is scheduled and communicated
- [ ] Maintenance windows are minimal
- [ ] Redundancy is in place
- [ ] Disaster recovery is tested

**Evidence Required:**
- Uptime monitoring reports
- Maintenance schedule
- DR test results

### 7.2 Performance
- [ ] Search results load quickly (< 2 seconds)
- [ ] Document downloads are fast
- [ ] Uploads are reliable
- [ ] Page load times are acceptable
- [ ] System scales with user growth

**Evidence Required:**
- Performance monitoring dashboard
- Load test results
- User feedback

### 7.3 Data Integrity
- [ ] File hashes verify integrity
- [ ] Corruption is detected
- [ ] Backups are verified
- [ ] Recovery is tested
- [ ] Data validation is automatic

**Evidence Required:**
- File integrity check results
- Backup verification logs
- Recovery test documentation

---

## Section 8: User Training and Support

### 8.1 User Training
- [ ] Training materials are available
- [ ] Training is documented
- [ ] Competency is verified
- [ ] Refresher training is scheduled
- [ ] Training records are maintained

**Evidence Required:**
- Training documentation (User Guide)
- Training completion records
- Competency assessments

### 8.2 User Support
- [ ] Help documentation is available
- [ ] Support contact is clear
- [ ] Issues are tracked
- [ ] Response times are acceptable
- [ ] User feedback is collected

**Evidence Required:**
- Help documentation
- Support ticket system
- User feedback surveys

---

## Section 9: Metrics and Monitoring

### 9.1 Compliance Metrics
- [ ] Document control effectiveness is measured
- [ ] Review compliance is tracked
- [ ] Approval cycle time is monitored
- [ ] Overdue documents are reported
- [ ] Trends are analyzed

**Evidence Required:**
- Compliance dashboard
- Monthly/quarterly reports
- Trend analysis

**Key Metrics:**
- % of documents current (not overdue for review)
- Average approval cycle time
- Change request throughput
- User adoption rate
- Audit log activity

### 9.2 Continuous Improvement
- [ ] Metrics drive improvement
- [ ] Bottlenecks are identified
- [ ] Process improvements are implemented
- [ ] Effectiveness is measured
- [ ] Success is documented

**Evidence Required:**
- Improvement projects
- Before/after metrics
- Lessons learned documentation

---

## Section 10: Security and Compliance

### 10.1 Data Protection
- [ ] Access is authenticated
- [ ] Sensitive data is protected
- [ ] Encryption is used where appropriate
- [ ] Privacy requirements are met
- [ ] Data breaches are prevented

**Evidence Required:**
- Security configuration
- Access control policies
- Encryption implementation

### 10.2 Regulatory Compliance
- [ ] ISO 9001 requirements are met
- [ ] ISO 45001 requirements are met
- [ ] Legal requirements are identified
- [ ] Compliance is verified
- [ ] Non-conformances are addressed

**Evidence Required:**
- Compliance mapping document
- Internal audit reports
- Corrective action records

---

## Audit Summary Template

### Overall Assessment
- **Audit Date:** ________________
- **Auditor:** ________________
- **Scope:** ________________

### Findings Summary
| Section | Compliant | Non-Compliant | N/A | Total |
|---------|-----------|---------------|-----|-------|
| 1. Document Control | | | | |
| 2. Access Control | | | | |
| 3. Audit Trail | | | | |
| 4. Change Control | | | | |
| 5. OH&S Control | | | | |
| 6. Retention | | | | |
| 7. Performance | | | | |
| 8. Training | | | | |
| 9. Metrics | | | | |
| 10. Security | | | | |
| **TOTAL** | | | | |

### Non-Conformances
| ID | Section | Finding | Severity | Corrective Action | Due Date | Status |
|----|---------|---------|----------|-------------------|----------|--------|
| | | | | | | |

### Recommendations
1. ________________________________________________________________
2. ________________________________________________________________
3. ________________________________________________________________

### Conclusion
☐ System is compliant  
☐ System has minor non-conformances  
☐ System has major non-conformances  
☐ System is not compliant

**Next Audit Date:** ________________

**Auditor Signature:** ________________

---

## Appendix: Evidence Gathering

### Pre-Audit Preparation
1. Export document list
2. Generate compliance reports
3. Prepare audit log samples
4. Collect approval records
5. Document system configuration

### SQL Queries for Evidence
```sql
-- Total documents by status
SELECT status, COUNT(*) FROM documents GROUP BY status;

-- Overdue reviews
SELECT COUNT(*) FROM documents 
WHERE next_review_date < CURRENT_DATE AND status = 'approved';

-- Recent approvals
SELECT COUNT(*) FROM document_approvals 
WHERE approved_at > NOW() - INTERVAL '30 days';

-- Permission audit
SELECT COUNT(*) FROM document_permissions;

-- Audit log activity
SELECT COUNT(*) FROM document_audit_log 
WHERE timestamp > NOW() - INTERVAL '30 days';

-- Change requests
SELECT status, COUNT(*) FROM change_requests GROUP BY status;
```

### Documentation Checklist
- [ ] System configuration export
- [ ] User role matrix
- [ ] Document category definitions
- [ ] Workflow diagrams
- [ ] Retention policy
- [ ] Backup logs
- [ ] Training records
- [ ] Support documentation

## Conclusion
Regular use of this checklist ensures ongoing compliance with ISO 9001:2015 and ISO 45001:2018 requirements, demonstrates due diligence, and identifies opportunities for continuous improvement.

**Recommended Audit Frequency:**
- Internal audits: Quarterly
- Management review: Semi-annually
- External certification audit: Annually


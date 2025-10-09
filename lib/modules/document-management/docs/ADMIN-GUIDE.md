# Document Management Admin Guide

## Overview
This guide provides administrators with comprehensive information on setting up, configuring, and managing the Document Management module.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Configuration](#configuration)
3. [User Management](#user-management)
4. [Document Organization](#document-organization)
5. [Workflow Configuration](#workflow-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Initial Setup

### Prerequisites
- ✅ PostgreSQL database installed and running
- ✅ File system with adequate storage space
- ✅ Proper environment configuration
- ✅ User authentication system in place

### Installation Steps

#### 1. Database Setup
```bash
# Run Drizzle migrations
npm run db:generate
npm run db:migrate

# Verify tables were created
psql -d your_database -c "\dt"
```

Expected tables:
- `directories`
- `documents`
- `document_versions`
- `document_permissions`
- `document_approvals`
- `change_requests`
- `change_request_comments`
- `document_audit_log`

#### 2. File Storage Setup
```bash
# Create storage directory
sudo mkdir -p /var/lib/document-storage
sudo chown www-data:www-data /var/lib/document-storage
sudo chmod 755 /var/lib/document-storage

# Create subdirectories
cd /var/lib/document-storage
mkdir documents temp
chmod 755 documents temp
```

#### 3. Environment Configuration
Create/update `.env.local`:
```env
# Required
DOCUMENT_STORAGE_PATH=/var/lib/document-storage

# Optional - File size limits
MAX_FILE_SIZE=104857600  # 100MB in bytes
MAX_FILE_SIZE_IMAGES=10485760  # 10MB for images

# Optional - Review reminders
REVIEW_REMINDER_DAYS=30,14,7,3,1
DEFAULT_REVIEW_FREQUENCY_DAYS=90

# Optional - Notification settings
NOTIFICATION_BATCH_SIZE=50
NOTIFICATION_RETENTION_DAYS=30
```

#### 4. Verify Installation
```bash
# Check database connectivity
npm run db:studio

# Test file storage
touch /var/lib/document-storage/test.txt
rm /var/lib/document-storage/test.txt

# Check module registration
# Navigate to /dashboard - Document Management should appear
```

## Configuration

### Document Categories

#### Define Categories
Categories help organize documents by type. Default categories:
- `policy` - Organizational policies
- `procedure` - Standard operating procedures
- `work_instruction` - Detailed work instructions
- `form` - Forms and templates
- `record` - Records and evidence

#### Add Custom Categories
```sql
-- Create categories table if needed
CREATE TABLE IF NOT EXISTS document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add custom category
INSERT INTO document_categories (name, description, icon, color)
VALUES ('safety_data_sheet', 'Chemical safety data sheets', 'file-warning', 'orange');
```

### File Type Configuration

#### Allowed File Types
Default allowed types are defined in `validation.ts`:
- Documents: PDF, Word, Excel, PowerPoint, Text, CSV
- Images: JPEG, PNG, GIF, WebP, SVG
- Archives: ZIP, RAR, 7Z

#### Customize Allowed Types
```typescript
// lib/modules/document-management/validation.ts
export const ALLOWED_FILE_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    // Add custom types
    'application/vnd.oasis.opendocument.text', // ODT
  ],
  // ...
};
```

### Storage Configuration

#### Storage Path
Default: `/var/lib/document-storage`

**Considerations:**
- Use SSD for better performance
- Ensure adequate space (plan for 10x current document volume)
- Regular backups essential
- Consider separate partition for isolation

#### Disk Space Monitoring
```bash
# Check current usage
du -sh /var/lib/document-storage

# Monitor disk space
df -h /var/lib/document-storage

# Set up alert when 80% full
# Add to cron or monitoring system
```

#### Backup Configuration
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/documents"
DATE=$(date +%Y%m%d)
tar -czf $BACKUP_DIR/documents-$DATE.tar.gz /var/lib/document-storage

# Keep last 30 days
find $BACKUP_DIR -name "documents-*.tar.gz" -mtime +30 -delete
```

## User Management

### Roles and Permissions

#### System Roles
- **Admin** - Full system access
  - Manage all documents
  - Configure system settings
  - Manage users and permissions
  - Override workflow restrictions

- **Manager** - Department management
  - Manage department documents
  - Assign approvers and reviewers
  - View metrics and reports
  - Cannot modify system settings

- **Employee** - Standard user
  - Create draft documents
  - View approved documents
  - Submit for review
  - Cannot approve own documents

#### Document-Specific Roles
- **Owner** - Document creator/responsible person
  - Full control of document
  - Assign reviewers and approvers
  - Cannot self-approve

- **Approver** - Authorized to approve
  - Can approve/reject documents
  - Typically manager or subject matter expert
  - Cannot approve if also owner

- **Reviewer** - Technical reviewer
  - Can review and comment
  - Moves document to approval stage
  - Typically subject matter expert

- **Viewer** - Read-only access
  - Can view and download
  - Cannot modify
  - Typical for reference documents

### Assigning Permissions

#### System-Wide Permissions
```sql
-- Grant manager role to user
UPDATE users SET role = 'manager' WHERE id = 'user-id';

-- Grant admin access
UPDATE users SET role = 'admin' WHERE id = 'user-id';
```

#### Document-Specific Permissions
```sql
-- Assign document owner
INSERT INTO document_permissions (document_id, user_id, role, granted_by)
VALUES ('doc-id', 'user-id', 'owner', 'admin-id');

-- Assign approver
INSERT INTO document_permissions (document_id, user_id, role, granted_by)
VALUES ('doc-id', 'manager-id', 'approver', 'owner-id');

-- Assign reviewer
INSERT INTO document_permissions (document_id, user_id, role, granted_by)
VALUES ('doc-id', 'expert-id', 'reviewer', 'owner-id');
```

#### Directory-Level Permissions
```sql
-- Grant access to entire directory
INSERT INTO directory_permissions (directory_id, user_id, role, granted_by)
VALUES ('dir-id', 'user-id', 'viewer', 'admin-id');

-- Children inherit permissions
-- Users with directory access automatically have access to all documents within
```

### Permission Inheritance
1. **System role** - Base access level
2. **Directory permission** - Applies to all documents in directory
3. **Document permission** - Specific document access
4. **Effective permission** - Highest level applies

Example:
- User is Employee (system role) → Can view approved docs
- User has Viewer on Directory A → Can view all docs in Directory A
- User has Owner on Doc X → Can manage Doc X specifically
- Result: User can manage Doc X, view Directory A, view other approved docs

## Document Organization

### Directory Structure

#### Best Practices
```
Root
├── Policies
│   ├── Quality Policies
│   ├── Safety Policies
│   └── HR Policies
├── Procedures
│   ├── Manufacturing
│   ├── Quality Control
│   └── Safety
├── Work Instructions
│   ├── Department A
│   └── Department B
├── Forms
│   ├── Safety Forms
│   └── Quality Forms
└── Records
    ├── Training Records
    ├── Inspection Records
    └── Incident Reports
```

#### Creating Directory Structure
```sql
-- Create top-level directories
INSERT INTO directories (id, name, parent_id, created_by)
VALUES 
  ('dir-1', 'Policies', NULL, 'admin-id'),
  ('dir-2', 'Procedures', NULL, 'admin-id'),
  ('dir-3', 'Work Instructions', NULL, 'admin-id');

-- Create sub-directories
INSERT INTO directories (id, name, parent_id, created_by)
VALUES 
  ('dir-1-1', 'Quality Policies', 'dir-1', 'admin-id'),
  ('dir-1-2', 'Safety Policies', 'dir-1', 'admin-id');
```

### Document Naming Conventions

#### Recommended Format
```
[Category Prefix]-[Department Code]-[Sequential Number]-[Short Title]
```

Examples:
- `POL-QA-001-Quality Policy`
- `SOP-MFG-015-Machine Setup Procedure`
- `WI-SAFE-023-PPE Requirements`
- `FORM-QA-005-Inspection Checklist`

#### Benefits
- **Sortability** - Documents sort logically
- **Identifiability** - Clear document type
- **Traceability** - Easy to reference
- **Uniqueness** - Prevents duplicates

## Workflow Configuration

### Approval Workflow

#### Standard Workflow
```
Draft → Pending Review → Pending Approval → Approved
```

#### Configure Reviewers
1. Navigate to document settings
2. Assign reviewer(s)
3. Set review criteria (optional)
4. Save configuration

#### Configure Approvers
1. Navigate to document settings
2. Assign approver(s)
3. Set approval criteria (optional)
4. Save configuration

#### Multi-Stage Approval
```sql
-- Example: Two-stage approval
-- Stage 1: Technical review
INSERT INTO document_approvals (document_id, stage, role, required)
VALUES ('doc-id', 'technical_review', 'reviewer', true);

-- Stage 2: Management approval
INSERT INTO document_approvals (document_id, stage, role, required)
VALUES ('doc-id', 'management_approval', 'approver', true);
```

### Review Frequency

#### Set Default Review Frequency
```sql
-- Update default in application settings
UPDATE system_settings 
SET value = '90' 
WHERE key = 'default_review_frequency_days';
```

#### Set Document-Specific Frequency
```sql
-- Set per document
UPDATE documents 
SET review_frequency_days = 180
WHERE id = 'doc-id';

-- Calculate next review date
UPDATE documents 
SET next_review_date = effective_date + (review_frequency_days || ' days')::interval
WHERE id = 'doc-id';
```

#### Review Frequency Guidelines
- Critical safety procedures: 30-90 days
- Standard procedures: 180-365 days
- Policies: 365-730 days
- Reference documents: As needed

## Monitoring and Maintenance

### Metrics Dashboard

#### Key Metrics to Monitor
1. **Document Status Distribution**
   - Total documents
   - By status (draft, pending, approved)
   - Approval pipeline health

2. **Review Compliance**
   - Documents due for review
   - Overdue reviews
   - Average review cycle time

3. **Approval Performance**
   - Average approval time
   - Approval success rate
   - Rejected document trends

4. **User Activity**
   - Most active users
   - Document access patterns
   - Upload/download statistics

#### Accessing Metrics
```sql
-- Document status summary
SELECT status, COUNT(*) 
FROM documents 
GROUP BY status;

-- Overdue reviews
SELECT id, title, next_review_date, 
       CURRENT_DATE - next_review_date AS days_overdue
FROM documents 
WHERE next_review_date < CURRENT_DATE 
  AND status = 'approved'
ORDER BY days_overdue DESC;

-- Approval cycle time
SELECT AVG(approved_at - created_at) AS avg_approval_time
FROM documents
WHERE status = 'approved';
```

### Audit Log Review

#### Regular Audit Tasks
- **Weekly:** Review failed access attempts
- **Monthly:** Review permission changes
- **Quarterly:** Comprehensive audit log analysis
- **Annually:** Full compliance audit

#### Audit Log Queries
```sql
-- Recent document access
SELECT u.name, dal.action, dal.timestamp, d.title
FROM document_audit_log dal
JOIN documents d ON dal.document_id = d.id
JOIN users u ON dal.user_id = u.id
WHERE dal.timestamp > NOW() - INTERVAL '7 days'
ORDER BY dal.timestamp DESC;

-- Permission changes
SELECT * FROM document_audit_log
WHERE action IN ('permission_granted', 'permission_revoked')
  AND timestamp > NOW() - INTERVAL '30 days';

-- Failed access attempts
SELECT user_id, document_id, COUNT(*) as attempts
FROM document_audit_log
WHERE action = 'access_denied'
  AND timestamp > NOW() - INTERVAL '7 days'
GROUP BY user_id, document_id
HAVING COUNT(*) > 5;
```

### System Maintenance

#### Daily Tasks
- Monitor disk space
- Check backup completion
- Review system errors

#### Weekly Tasks
- Review overdue documents
- Check approval queue
- Analyze upload failures

#### Monthly Tasks
- Database optimization
- Audit log archiving
- Permission audit
- User access review

#### Quarterly Tasks
- Comprehensive system audit
- Performance optimization
- Capacity planning
- Training needs assessment

### Database Maintenance
```sql
-- Analyze tables for query optimization
ANALYZE documents;
ANALYZE document_versions;
ANALYZE document_permissions;

-- Vacuum to reclaim space
VACUUM ANALYZE documents;

-- Reindex for performance
REINDEX TABLE documents;

-- Check table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
WHERE relname LIKE 'document%'
ORDER BY pg_total_relation_size(relid) DESC;
```

## Troubleshooting

### Common Issues

#### Documents Not Uploading
**Symptoms:** File upload fails or hangs

**Checks:**
1. File size within limits
2. File type allowed
3. Disk space available
4. Storage path writable
5. Network connectivity

**Solutions:**
```bash
# Check disk space
df -h /var/lib/document-storage

# Check permissions
ls -la /var/lib/document-storage

# Fix permissions
sudo chown -R www-data:www-data /var/lib/document-storage
sudo chmod -R 755 /var/lib/document-storage

# Check logs
tail -f /var/log/application.log | grep "upload"
```

#### Permission Errors
**Symptoms:** Users cannot access documents they should see

**Checks:**
1. User role assignment
2. Document permissions
3. Directory permissions
4. Document status

**Solutions:**
```sql
-- Check user role
SELECT id, name, role FROM users WHERE id = 'user-id';

-- Check document permissions
SELECT * FROM document_permissions WHERE document_id = 'doc-id';

-- Check effective permissions
-- (Use permission checking function from application)

-- Grant permission
INSERT INTO document_permissions (document_id, user_id, role, granted_by)
VALUES ('doc-id', 'user-id', 'viewer', 'admin-id');
```

#### Slow Performance
**Symptoms:** System is slow to load or search

**Checks:**
1. Database indexes
2. File system performance
3. Query optimization
4. Cache effectiveness

**Solutions:**
```sql
-- Check missing indexes
SELECT schemaname, tablename, attname, n_distinct
FROM pg_stats
WHERE tablename = 'documents'
  AND n_distinct > 100;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_review_date ON documents(next_review_date);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON document_audit_log(timestamp);
```

## Best Practices

### Security
1. **Regular permission audits** - Monthly review
2. **Least privilege principle** - Minimum necessary access
3. **Separation of duties** - No self-approval
4. **Audit trail review** - Monitor suspicious activity
5. **Regular backups** - Daily automated backups
6. **Disaster recovery** - Tested recovery procedures

### Performance
1. **Pagination** - Use for lists >100 items
2. **Caching** - Enable for frequently accessed documents
3. **Database optimization** - Regular VACUUM and ANALYZE
4. **File organization** - Keep storage directory organized
5. **Archive old documents** - Move inactive documents to archive

### Compliance
1. **Regular reviews** - Enforce review schedules
2. **Complete audit trails** - Never delete audit logs
3. **Version control** - Retain all versions
4. **Change control** - Use change requests for approved docs
5. **Training records** - Document user training

### User Experience
1. **Clear naming** - Consistent document naming
2. **Logical organization** - Intuitive directory structure
3. **Quick access** - Dashboard widgets for common documents
4. **Search optimization** - Metadata and full-text search
5. **Mobile access** - Ensure mobile responsiveness

## Support and Resources

### Getting Help
- Check this admin guide
- Review troubleshooting section
- Check audit logs for errors
- Consult user guide
- Review API documentation

### Additional Resources
- [ISO 9001 Compliance Guide](./ISO-9001-COMPLIANCE.md)
- [ISO 45001 Compliance Guide](./ISO-45001-COMPLIANCE.md)
- [User Guide](./USER-GUIDE.md)
- [Configuration Reference](./CONFIGURATION.md)
- [API Documentation](../README.md)

## Appendix

### SQL Schema Reference
See database schema in `/drizzle/migrations/`

### Environment Variables Reference
See `.env.template` for all available settings

### API Endpoints
See module API documentation

### Audit Log Actions
| Action | Description |
|--------|-------------|
| `document_created` | New document created |
| `document_updated` | Document metadata changed |
| `document_deleted` | Document deleted |
| `file_uploaded` | New file version uploaded |
| `file_downloaded` | Document downloaded |
| `status_changed` | Document status transition |
| `permission_granted` | Access granted to user |
| `permission_revoked` | Access removed from user |
| `approval_submitted` | Document approved |
| `approval_rejected` | Document rejected |
| `review_completed` | Periodic review completed |


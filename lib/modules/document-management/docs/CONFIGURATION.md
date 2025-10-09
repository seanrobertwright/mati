# Document Management Configuration Reference

## Overview
This document provides detailed information about all configuration options for the Document Management module.

## Environment Variables

### Required Configuration

#### DOCUMENT_STORAGE_PATH
**Type:** String (File path)  
**Required:** Yes  
**Default:** None

Path to the directory where document files will be stored.

```env
DOCUMENT_STORAGE_PATH=/var/lib/document-storage
```

**Considerations:**
- Must be an absolute path
- Directory must exist and be writable
- Recommend using dedicated partition
- Ensure adequate disk space (10x expected document volume)
- Regular backups essential

**Platform-specific:**
- **Linux/Mac:** `/var/lib/document-storage`
- **Windows:** `C:\ProgramData\DocumentStorage`
- **Docker:** `/app/storage` (mount volume)

### Optional Configuration

#### MAX_FILE_SIZE
**Type:** Integer (bytes)  
**Required:** No  
**Default:** 104857600 (100MB)

Maximum allowed file size for uploads.

```env
MAX_FILE_SIZE=104857600  # 100MB
MAX_FILE_SIZE=52428800   # 50MB
MAX_FILE_SIZE=209715200  # 200MB
```

**Considerations:**
- Consider server upload limits
- Balance accessibility vs. performance
- Larger files = longer upload times
- Ensure database can handle metadata

#### MAX_FILE_SIZE_IMAGES
**Type:** Integer (bytes)  
**Required:** No  
**Default:** 10485760 (10MB)

Maximum allowed file size for image uploads specifically.

```env
MAX_FILE_SIZE_IMAGES=10485760  # 10MB
```

#### REVIEW_REMINDER_DAYS
**Type:** Comma-separated integers  
**Required:** No  
**Default:** `30,14,7,3,1`

Days before review due date to send reminders.

```env
REVIEW_REMINDER_DAYS=30,14,7,3,1
REVIEW_REMINDER_DAYS=14,7,1      # Simplified
REVIEW_REMINDER_DAYS=30,7        # Minimal
```

**Considerations:**
- More reminders = better compliance
- Too many reminders = notification fatigue
- Adjust based on organization culture

#### DEFAULT_REVIEW_FREQUENCY_DAYS
**Type:** Integer (days)  
**Required:** No  
**Default:** 90

Default review frequency when not specified.

```env
DEFAULT_REVIEW_FREQUENCY_DAYS=90   # Quarterly
DEFAULT_REVIEW_FREQUENCY_DAYS=180  # Semi-annually
DEFAULT_REVIEW_FREQUENCY_DAYS=365  # Annually
```

**Recommendations by Document Type:**
- Emergency procedures: 30 days
- Safety procedures: 90 days
- Standard procedures: 180 days
- Policies: 365 days
- Reference documents: 730 days

#### NOTIFICATION_BATCH_SIZE
**Type:** Integer  
**Required:** No  
**Default:** 50

Number of notifications to process per batch.

```env
NOTIFICATION_BATCH_SIZE=50   # Default
NOTIFICATION_BATCH_SIZE=100  # High volume
NOTIFICATION_BATCH_SIZE=25   # Low volume
```

**Considerations:**
- Higher = better performance, potential delays
- Lower = more frequent processing, less efficient
- Adjust based on user count

#### NOTIFICATION_RETENTION_DAYS
**Type:** Integer (days)  
**Required:** No  
**Default:** 30

How long to retain dismissed notifications.

```env
NOTIFICATION_RETENTION_DAYS=30   # Default
NOTIFICATION_RETENTION_DAYS=90   # Longer retention
NOTIFICATION_RETENTION_DAYS=7    # Shorter retention
```

### Database Configuration

#### Connection String
```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
```

**Connection Pool Settings:**
```env
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_IDLE_TIMEOUT=30000  # milliseconds
```

**Considerations:**
- Pool size depends on concurrent users
- Idle timeout prevents stale connections
- Monitor connection usage

### Security Configuration

#### File Upload Security
```env
# Enable virus scanning (requires ClamAV)
ENABLE_VIRUS_SCAN=false

# Enable file content validation
VALIDATE_FILE_CONTENT=true

# Maximum filename length
MAX_FILENAME_LENGTH=255
```

#### Access Control
```env
# Session timeout (minutes)
SESSION_TIMEOUT=30

# Require approval for document deletion
REQUIRE_DELETE_APPROVAL=true

# Enable document watermarking (future)
ENABLE_WATERMARK=false
```

## Application Configuration

### Document Categories

Define in database:
```sql
CREATE TABLE document_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  review_frequency_days INTEGER,
  requires_approval BOOLEAN DEFAULT true
);

-- Insert default categories
INSERT INTO document_categories (name, description, review_frequency_days) VALUES
  ('policy', 'Organizational policies', 365),
  ('procedure', 'Standard operating procedures', 180),
  ('work_instruction', 'Detailed work instructions', 90),
  ('form', 'Forms and templates', 180),
  ('record', 'Records and evidence', NULL);
```

### Workflow Configuration

#### Approval Stages
```sql
CREATE TABLE approval_stages (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  required_role VARCHAR(50),
  is_required BOOLEAN DEFAULT true
);

-- Configure approval workflow
INSERT INTO approval_stages (name, sequence_order, required_role, is_required) VALUES
  ('Technical Review', 1, 'reviewer', true),
  ('Management Approval', 2, 'approver', true),
  ('Quality Assurance', 3, 'qa_manager', false);
```

#### State Machine Configuration
```typescript
// lib/modules/document-management/services/document-lifecycle.ts
const STATE_TRANSITIONS = {
  draft: {
    allowedTransitions: ['pending_review', 'archived'],
    requiredPermission: 'owner',
  },
  pending_review: {
    allowedTransitions: ['pending_approval', 'draft'],
    requiredPermission: 'reviewer',
  },
  pending_approval: {
    allowedTransitions: ['approved', 'draft'],
    requiredPermission: 'approver',
  },
  approved: {
    allowedTransitions: ['under_review', 'archived'],
    requiredPermission: 'owner',
  },
  under_review: {
    allowedTransitions: ['approved'],
    requiredPermission: 'reviewer',
  },
  archived: {
    allowedTransitions: [],
    requiredPermission: 'admin',
  },
};
```

### Permission Configuration

#### Role Permissions
```sql
CREATE TABLE role_permissions (
  role VARCHAR(50) NOT NULL,
  permission VARCHAR(50) NOT NULL,
  PRIMARY KEY (role, permission)
);

-- Configure role permissions
INSERT INTO role_permissions (role, permission) VALUES
  ('admin', '*'),
  ('manager', 'create_document'),
  ('manager', 'assign_permissions'),
  ('manager', 'approve_document'),
  ('employee', 'create_document'),
  ('employee', 'view_approved');
```

#### Document Permission Levels
```typescript
const PERMISSION_HIERARCHY = [
  'owner',      // Level 4 - Full control
  'approver',   // Level 3 - Can approve
  'reviewer',   // Level 2 - Can review
  'viewer',     // Level 1 - Read only
];
```

### File Type Configuration

#### Allowed MIME Types
```typescript
// lib/modules/document-management/validation.ts
export const ALLOWED_FILE_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
};
```

#### Custom File Type Addition
```typescript
// Add custom file type
export const CUSTOM_FILE_TYPES = {
  cad: [
    'application/x-autocad',
    'image/vnd.dwg',
  ],
};

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_FILE_TYPES.documents,
  ...ALLOWED_FILE_TYPES.images,
  ...CUSTOM_FILE_TYPES.cad,
];
```

## Feature Flags

### Enable/Disable Features
```env
# Feature flags
FEATURE_CHANGE_REQUESTS=true
FEATURE_AUDIT_LOG=true
FEATURE_NOTIFICATIONS=true
FEATURE_METRICS_DASHBOARD=true
FEATURE_ADVANCED_SEARCH=true
FEATURE_FILE_PREVIEW=false  # Future feature
```

### Beta Features
```env
# Beta features (use with caution)
BETA_COLLABORATIVE_EDITING=false
BETA_OCR_SEARCH=false
BETA_AI_SUGGESTIONS=false
```

## Performance Tuning

### Caching Configuration
```env
# Permission cache
PERMISSION_CACHE_TTL=300     # 5 minutes
PERMISSION_CACHE_MAX_SIZE=1000

# Document metadata cache
DOCUMENT_CACHE_TTL=600       # 10 minutes
DOCUMENT_CACHE_MAX_SIZE=500

# Search results cache
SEARCH_CACHE_TTL=60          # 1 minute
SEARCH_CACHE_MAX_SIZE=100
```

### Pagination Settings
```env
# Default page size
DEFAULT_PAGE_SIZE=50

# Maximum page size
MAX_PAGE_SIZE=200

# Enable virtual scrolling
ENABLE_VIRTUAL_SCROLL=true
```

### File Storage Optimization
```env
# Enable file compression
ENABLE_FILE_COMPRESSION=false

# Image optimization
OPTIMIZE_IMAGES=true
IMAGE_MAX_WIDTH=2000
IMAGE_MAX_HEIGHT=2000
IMAGE_QUALITY=85

# Enable deduplication
ENABLE_FILE_DEDUPLICATION=true
```

## Monitoring and Logging

### Logging Configuration
```env
# Log level
LOG_LEVEL=info  # debug, info, warn, error

# Log file location
LOG_FILE=/var/log/document-management/app.log

# Log rotation
LOG_MAX_SIZE=100M
LOG_MAX_FILES=10

# Structured logging
LOG_FORMAT=json  # json or text

# Sensitive data logging
LOG_SENSITIVE_DATA=false
```

### Metrics Collection
```env
# Enable metrics
ENABLE_METRICS=true

# Metrics provider
METRICS_PROVIDER=prometheus  # prometheus, datadog, none

# Metrics port
METRICS_PORT=9090
```

### Health Checks
```env
# Health check endpoint
HEALTH_CHECK_ENDPOINT=/health

# Database health check
CHECK_DATABASE=true

# File storage health check
CHECK_FILE_STORAGE=true

# Health check timeout
HEALTH_CHECK_TIMEOUT=5000  # milliseconds
```

## Backup and Recovery

### Backup Configuration
```env
# Backup location
BACKUP_PATH=/backups/documents

# Backup schedule (cron format)
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM

# Backup retention
BACKUP_RETENTION_DAYS=30

# Include database in backup
BACKUP_DATABASE=true

# Backup compression
BACKUP_COMPRESS=true
```

### Recovery Configuration
```env
# Point-in-time recovery
ENABLE_PITR=true

# Recovery test schedule
RECOVERY_TEST_SCHEDULE="0 3 * * 0"  # Weekly on Sunday
```

## Integration Configuration

### Email Notifications
```env
# Email provider
EMAIL_PROVIDER=smtp  # smtp, sendgrid, ses

# SMTP settings
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASSWORD=secret
SMTP_FROM=noreply@example.com

# Email templates
EMAIL_TEMPLATE_DIR=/app/email-templates
```

### External Systems
```env
# ERP integration
ENABLE_ERP_SYNC=false
ERP_API_URL=https://erp.example.com/api
ERP_API_KEY=secret

# Active Directory integration
ENABLE_AD_SYNC=false
AD_SERVER=ldap://ad.example.com
AD_BASE_DN=DC=example,DC=com
```

## Development vs. Production

### Development Settings
```env
NODE_ENV=development
DEBUG=true
ENABLE_DEV_TOOLS=true
SKIP_MIGRATIONS=false
MOCK_FILE_STORAGE=true
DISABLE_AUTH=false  # Never use in production!
```

### Production Settings
```env
NODE_ENV=production
DEBUG=false
ENABLE_DEV_TOOLS=false
SKIP_MIGRATIONS=false
MOCK_FILE_STORAGE=false
REQUIRE_HTTPS=true
```

## Configuration Validation

### Startup Checks
```typescript
// Validate required configuration
function validateConfig() {
  if (!process.env.DOCUMENT_STORAGE_PATH) {
    throw new Error('DOCUMENT_STORAGE_PATH is required');
  }
  
  if (!existsSync(process.env.DOCUMENT_STORAGE_PATH)) {
    throw new Error('DOCUMENT_STORAGE_PATH does not exist');
  }
  
  // Additional checks...
}
```

### Configuration Testing
```bash
# Test configuration
npm run config:validate

# Test file storage
npm run storage:test

# Test database connection
npm run db:test
```

## Best Practices

### Security
- Never commit `.env` files
- Use secrets management in production
- Rotate credentials regularly
- Limit file size to prevent DoS
- Enable virus scanning in production

### Performance
- Adjust cache TTL based on change frequency
- Monitor cache hit rates
- Use CDN for static files (future)
- Enable compression for large files
- Optimize database indexes

### Reliability
- Configure backups
- Test recovery procedures
- Monitor disk space
- Set up alerts
- Use health checks

### Maintainability
- Document custom configurations
- Use version control for config changes
- Review settings quarterly
- Keep configuration simple
- Use defaults when possible

## Troubleshooting

### Configuration Issues
```bash
# Check current configuration
npm run config:show

# Validate configuration
npm run config:validate

# Reset to defaults
npm run config:reset

# Export configuration
npm run config:export > config-backup.json
```

### Common Problems
1. **File uploads failing:** Check `MAX_FILE_SIZE` and disk space
2. **Slow performance:** Review cache settings and database configuration
3. **Email not sending:** Verify SMTP settings
4. **Permission errors:** Check database permissions and role configuration

## Configuration Examples

### Small Organization (< 50 users)
```env
DOCUMENT_STORAGE_PATH=/var/lib/documents
MAX_FILE_SIZE=52428800  # 50MB
DEFAULT_REVIEW_FREQUENCY_DAYS=180
NOTIFICATION_BATCH_SIZE=25
DATABASE_POOL_MAX=5
```

### Medium Organization (50-500 users)
```env
DOCUMENT_STORAGE_PATH=/mnt/documents
MAX_FILE_SIZE=104857600  # 100MB
DEFAULT_REVIEW_FREQUENCY_DAYS=90
NOTIFICATION_BATCH_SIZE=50
DATABASE_POOL_MAX=10
ENABLE_METRICS=true
```

### Large Organization (> 500 users)
```env
DOCUMENT_STORAGE_PATH=/mnt/shared/documents
MAX_FILE_SIZE=209715200  # 200MB
DEFAULT_REVIEW_FREQUENCY_DAYS=90
NOTIFICATION_BATCH_SIZE=100
DATABASE_POOL_MAX=20
ENABLE_METRICS=true
ENABLE_FILE_DEDUPLICATION=true
PERMISSION_CACHE_TTL=600
```

## Summary
Proper configuration is essential for optimal system performance, security, and user experience. Review and adjust settings based on your organization's specific needs and usage patterns.


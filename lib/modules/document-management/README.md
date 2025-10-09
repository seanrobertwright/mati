# Document Management Module

## Overview
ISO 9001 and ISO 45001 compliant document control system providing comprehensive document lifecycle management, approval workflows, change control, and compliance reporting.

## Features

### Core Functionality
- **Hierarchical Directory Structure** - Organize documents in folders and subfolders
- **Document Lifecycle Management** - Complete workflow from draft to approval to archival
- **Multi-Stage Approval Workflows** - Configurable review and approval processes
- **Change Request System** - Formal change control with discussion and approval
- **Version Control** - Complete history of all document versions
- **Permission Management** - Granular access control with role-based permissions
- **Audit Trail** - Complete audit log of all document activities
- **Compliance Metrics** - Real-time dashboards and compliance reporting

### ISO Compliance
- **ISO 9001:2015** - Quality management document control
- **ISO 45001:2018** - Occupational health and safety documentation
- **Audit-Ready** - Complete traceability and audit trails
- **Periodic Review** - Automated review scheduling and reminders
- **Version Control** - All document versions retained and accessible

## Installation

### Prerequisites
- PostgreSQL database
- File system access for document storage
- Proper environment configuration

### Environment Variables
Add to `.env.local`:
```env
# Document storage path (required)
DOCUMENT_STORAGE_PATH=/path/to/document/storage

# File size limits (optional)
MAX_FILE_SIZE=104857600  # 100MB in bytes

# Review reminder settings (optional)
REVIEW_REMINDER_DAYS=30,14,7,3,1
```

### Database Setup
Run migrations:
```bash
npm run db:generate
npm run db:migrate
```

Required tables:
- `directories`
- `documents`
- `document_versions`
- `document_permissions`
- `document_approvals`
- `change_requests`
- `change_request_comments`
- `document_audit_log`

### File Storage
Create storage directory:
```bash
mkdir -p /path/to/document/storage
chmod 755 /path/to/document/storage
```

Directory structure will be automatically created:
```
document-storage/
├── documents/
│   ├── {document-id}/
│   │   └── {version}_{hash}.{ext}
└── temp/
    └── {upload-id}.{ext}
```

## Usage

### Document Management

#### Creating Documents
```typescript
import { createDocument } from '@/lib/modules/document-management/actions';

const result = await createDocument({
  title: 'Safety Policy',
  description: 'Company safety policy document',
  categoryId: 'policy-id',
  reviewFrequencyDays: 90,
});
```

#### Uploading Files
```typescript
import { FileUploadWithRetry } from '@/lib/modules/document-management';

<FileUploadWithRetry
  onUpload={async (file) => {
    // Upload implementation
  }}
  maxRetries={3}
  maxFileSize={100 * 1024 * 1024} // 100MB
  multiple={false}
/>
```

#### Document Search and Filtering
```typescript
import { DocumentFilterBar } from '@/lib/modules/document-management';

<DocumentFilterBar
  filters={filters}
  onFiltersChange={setFilters}
  presets={savedPresets}
  availableOwners={users}
/>
```

### Approval Workflow

#### Submitting for Review
```typescript
import { submitForReview } from '@/lib/modules/document-management/actions';

await submitForReview({
  documentId: 'doc-123',
  reviewerId: 'user-456',
});
```

#### Approving Documents
```typescript
import { approveDocument } from '@/lib/modules/document-management/actions';

await approveDocument({
  documentId: 'doc-123',
  action: 'approve',
  notes: 'Approved - meets all requirements',
});
```

### Change Requests

#### Creating Change Requests
```typescript
import { createChangeRequest } from '@/lib/modules/document-management/actions';

await createChangeRequest({
  documentId: 'doc-123',
  title: 'Update safety procedures',
  description: 'Need to update section 3.2 to reflect new equipment',
  priority: 'medium',
});
```

### Notifications

#### Using Notification Center
```typescript
import { NotificationCenter } from '@/lib/modules/document-management';

<NotificationCenter
  notifications={notifications}
  onMarkAsRead={handleMarkAsRead}
  onMarkAllAsRead={handleMarkAllAsRead}
  onDismiss={handleDismiss}
/>
```

#### Setting Notification Preferences
```typescript
import { NotificationPreferences } from '@/lib/modules/document-management';

<NotificationPreferences
  preferences={userPreferences}
  onSave={handleSavePreferences}
/>
```

## Permissions

### Permission Roles
- **Owner** - Full control of document
- **Approver** - Can approve/reject documents
- **Reviewer** - Can review and comment
- **Viewer** - Read-only access

### System Roles
- **Admin** - Full access to all documents
- **Manager** - Can assign approvers and reviewers
- **Employee** - Can view approved documents

### Permission Hierarchy
```
Admin > Owner > Approver > Reviewer > Viewer
```

## Document Lifecycle

### States
1. **Draft** - Initial creation, editable by owner
2. **Pending Review** - Submitted for review
3. **Pending Approval** - Review passed, awaiting approval
4. **Approved** - Active and published
5. **Under Review** - Periodic review in progress
6. **Archived** - Superseded by newer version

### State Transitions
```
Draft ─┬─> Pending Review ──> Pending Approval ──> Approved ──> Archived
       └──────────────────────────────────────────────────────> Archived
                                                          └──> Under Review ──> Approved
```

### Workflow Rules
- Documents must pass review before approval
- Owners cannot approve their own documents
- Approved documents require change requests for modifications
- Archived documents cannot be modified

## Validation

### Document Metadata
```typescript
import { documentMetadataSchema } from '@/lib/modules/document-management';

const validatedData = documentMetadataSchema.parse({
  title: 'Document Title', // Required, max 255 chars
  description: 'Optional description', // Optional, max 2000 chars
  reviewFrequencyDays: 90, // Optional, 1-3650 days
});
```

### File Validation
```typescript
import { validateFile } from '@/lib/modules/document-management';

const result = validateFile(file, {
  maxSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: ['application/pdf', 'image/jpeg'],
});

if (!result.valid) {
  console.error(result.error);
}
```

### Supported File Types
- **Documents:** PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), Text, CSV
- **Images:** JPEG, PNG, GIF, WebP, SVG
- **Archives:** ZIP, RAR, 7Z

## Error Handling

### Using Error Boundaries
```typescript
import { DocumentErrorBoundary } from '@/lib/modules/document-management';

<DocumentErrorBoundary onError={(error) => logError(error)}>
  <YourComponent />
</DocumentErrorBoundary>
```

### Error Codes
```typescript
import { ERROR_CODES, toUserFriendlyError } from '@/lib/modules/document-management';

try {
  await uploadDocument(file);
} catch (error) {
  const message = toUserFriendlyError(error);
  showNotification(message);
}
```

## Testing

### Running Tests
```bash
npm install -D vitest @vitest/ui
npm test
npm run test:coverage
```

### Test Coverage
- Unit tests: Validation, permissions, state machine
- Integration tests: Workflows, file operations
- Performance tests: Large files, concurrent operations

See `__tests__/README.md` for detailed testing documentation.

## Performance

### Optimization Features
- Lazy loading for directory trees
- Pagination for document lists
- Permission caching
- File streaming for large documents
- Virtualized scrolling support

### Best Practices
- Use pagination for lists >100 items
- Enable caching for frequently accessed documents
- Optimize images before upload
- Use appropriate review frequencies

## Security

### Built-in Security
- Path traversal protection
- File type validation
- Size limit enforcement
- MIME type verification
- Permission checks on all operations
- Audit logging for sensitive actions

### Best Practices
- Regular permission audits
- Monitor failed access attempts
- Review audit logs periodically
- Keep approved documents read-only
- Use change requests for modifications

## Accessibility

### ARIA Support
All components include proper ARIA labels and roles

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter/Space for activation
- Escape to close dialogs
- Arrow keys for list navigation

### Screen Reader Support
- Descriptive labels for all controls
- Status announcements
- Error messages
- Loading state notifications

## Troubleshooting

### Common Issues

**Documents not appearing**
- Check user permissions
- Verify document status
- Check directory filters

**Upload failures**
- Verify file size < MAX_FILE_SIZE
- Check file type is allowed
- Ensure storage path is writable
- Check disk space

**Permission errors**
- Verify user role
- Check document-specific permissions
- Review directory inheritance

**Slow performance**
- Enable pagination
- Reduce document list size
- Clear browser cache
- Check database indexes

### Logs and Debugging
```bash
# Check audit log
SELECT * FROM document_audit_log WHERE document_id = 'doc-123' ORDER BY timestamp DESC;

# Check permissions
SELECT * FROM document_permissions WHERE document_id = 'doc-123';

# Check approval status
SELECT * FROM document_approvals WHERE document_id = 'doc-123';
```

## API Reference

See detailed API documentation in:
- [Actions API](./actions/README.md)
- [Components API](./components/README.md)
- [Services API](./services/README.md)
- [Validation API](./validation.ts)

## Contributing

### Development Setup
```bash
npm install
npm run dev
```

### Code Style
- Follow existing patterns
- Use TypeScript strict mode
- Add tests for new features
- Update documentation

### Pull Requests
- Include tests
- Update documentation
- Follow commit conventions
- Link related issues

## Support

For issues, questions, or contributions:
- Check documentation
- Review troubleshooting guide
- Check test examples
- Open an issue on GitHub

## License

See project root LICENSE file.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.


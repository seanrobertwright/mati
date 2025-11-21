# Implementation Design: Document Upload and Folder Creation

## Context

The document management module has all infrastructure in place:
- ✅ Database schema (directories, documents, document_versions, audit_log)
- ✅ File storage service with security features
- ✅ UI components (forms, dialogs, file upload)
- ✅ Server actions (stubbed with TODOs)
- ✅ API routes (stubbed with TODOs)
- ✅ Repository layer (needs verification)

**Problem:** The components aren't connected - server actions and API routes have commented-out database calls, preventing actual functionality.

**Goal:** Complete the implementation by connecting all layers without changing the design.

## Goals / Non-Goals

**Goals:**
- Make folder creation operational (create, rename, delete)
- Make document upload operational (upload → storage → database)
- Ensure audit logging works for all operations
- Maintain security (auth checks, file validation, path traversal protection)
- Provide proper error handling and user feedback

**Non-Goals:**
- Changing the database schema
- Adding new features beyond basic CRUD
- Implementing drag-and-drop (already designed for later)
- Implementing document versioning (phase 2 of upload feature)

## Decisions

### Decision 1: Implementation Order
**Approach:** Repository verification → Directory actions → Document upload

**Rationale:**
1. Repository functions are the foundation - verify they work first
2. Directory creation is simpler - good for testing the flow
3. Document upload is more complex - tackle once directory flow works

**Steps:**
1. Verify and test repository functions in isolation
2. Complete directory server actions
3. Complete document upload API route
4. Connect UI and test end-to-end

### Decision 2: File Upload Flow
**Flow:** UI Form → API Route → File Storage → Database Transaction

```
1. User submits DocumentUploadForm
   ↓
2. POST /api/documents/upload (FormData)
   ↓
3. Validate file (size, type)
   ↓
4. Save to temp storage (file-storage.ts)
   ↓
5. Begin database transaction:
   a. Create document record
   b. Create document_version record
   c. Link version to document
   d. Create audit log
   ↓
6. Move file to permanent storage
   ↓
7. Return document object to UI
```

**Why API route instead of Server Action:**
- Large file uploads need streaming support
- API routes handle FormData better
- Allows progress tracking
- Separate route for downloads

### Decision 3: Directory Creation Flow
**Flow:** UI Dialog → Server Action → Database

```
1. User submits CreateDirectoryDialog
   ↓
2. Call createDirectory() server action
   ↓
3. Validate directory name
   ↓
4. Create directory in database
   ↓
5. Create audit log
   ↓
6. Revalidate path
   ↓
7. Return success to UI
```

**Why Server Action:**
- Simple data mutation
- No file handling needed
- Built-in security with 'use server'
- Easy form integration

### Decision 4: Error Handling Strategy
**Approach:** Fail fast with clear messages

**Error Categories:**
1. **Validation errors** → Return { error: "message" } with 400 status
2. **Auth errors** → Return { error: "Unauthorized" } with 401 status
3. **Database errors** → Log error, return generic message with 500 status
4. **File storage errors** → Clean up partial state, return error with 500 status

**Transaction Handling:**
- Document upload uses implicit transaction (single connection)
- If file save fails after DB insert, log error (file will be orphaned but traceable)
- Background cleanup job can remove orphaned files (future enhancement)

### Decision 5: Audit Logging
**When to log:**
- Directory created/renamed/deleted
- Document uploaded
- Document version created

**What to log:**
```typescript
{
  documentId: string | null,  // null for directory operations
  userId: string,
  action: string,             // 'directory_created', 'document_uploaded', etc.
  details: string | null,     // JSON with additional context
  timestamp: Date
}
```

**Error handling:**
- Audit logging failures should not block operations
- Log error to console but continue
- Creates async audit trail (may have gaps if logging fails)

## Implementation Details

### File Storage Integration

**Upload Process:**
```typescript
// 1. Save to temp
const tempPath = await saveToTemp(file);

// 2. Create document record
const document = await createDocument({ ... });

// 3. Store permanently
const fileResult = await storeFile(
  tempPath,
  document.id,
  1, // version number
  file.name,
  userId
);

// 4. Create version record
const version = await createDocumentVersion({
  documentId: document.id,
  versionNumber: 1,
  filePath: fileResult.filePath,
  fileHash: fileResult.fileHash,
  fileSize: fileResult.fileSize,
  mimeType: fileResult.mimeType,
  uploadedBy: userId,
});

// 5. Link version to document
await updateDocument(document.id, {
  currentVersionId: version.id
});
```

### Repository Function Signatures

**Verify these exist and work:**

```typescript
// Directories
createDirectory(data: {
  name: string;
  parentId: string | null;
  createdBy: string;
}): Promise<Directory>

// Documents  
createDocument(data: {
  title: string;
  directoryId: string | null;
  categoryId: string | null;
  ownerId: string;
  status: string;
  description?: string;
}): Promise<Document>

// Versions
createDocumentVersion(data: {
  documentId: string;
  versionNumber: number;
  filePath: string;
  fileName: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
}): Promise<DocumentVersion>

// Audit
createAuditLog(data: {
  documentId: string | null;
  userId: string;
  action: string;
  details?: string;
}): Promise<void>
```

## Risks / Trade-offs

**Risk:** File orphaned if database fails after file upload
- **Mitigation:** Add background cleanup job (future)
- **Trade-off:** Accept potential orphans for simpler implementation now

**Risk:** Audit log gaps if logging fails
- **Mitigation:** Separate audit logging service, log errors
- **Trade-off:** Async audit trail vs blocking operations

**Risk:** Large file uploads timing out
- **Mitigation:** Set `maxDuration: 60` on API route
- **Trade-off:** Long timeouts vs upload reliability

**Risk:** Concurrent directory creation with same name
- **Mitigation:** Database unique constraint on (name, parent_id)
- **Trade-off:** Database enforces uniqueness vs application logic

## Validation Checklist

Before marking complete, verify:

- [ ] Can create root directory via UI
- [ ] Can create nested directory via UI
- [ ] Can upload PDF to root
- [ ] Can upload PDF to specific directory
- [ ] File stored with hash-based name
- [ ] Document appears in database with correct metadata
- [ ] Version record created and linked
- [ ] Audit log entries created
- [ ] File size validation works (reject >100MB)
- [ ] File type validation works (reject .exe)
- [ ] Error messages display in UI
- [ ] Success feedback shows in UI
- [ ] Directory tree refreshes after creation
- [ ] Document list refreshes after upload

## Migration Plan

**Steps:**
1. Verify database migrated with latest schema
2. Set `DOCUMENT_STORAGE_PATH` in environment
3. Complete repository functions
4. Complete directory actions
5. Complete upload API
6. Test manually
7. Deploy to staging
8. Final testing
9. Deploy to production

**Rollback:**
- Revert code changes
- No database rollback needed (schema unchanged)
- Delete any test files from storage

## Open Questions

1. ~~Should we support resumable uploads?~~ → No, keep simple for now
2. ~~Should directory names be unique globally or per-parent?~~ → Per-parent (already in schema)
3. ~~What happens to documents when directory deleted?~~ → Cascade delete (already in schema)
4. **Should we validate document title uniqueness?** → Not initially, allow duplicates
5. **Should we auto-generate document numbers?** → Not in this change, manual titles only


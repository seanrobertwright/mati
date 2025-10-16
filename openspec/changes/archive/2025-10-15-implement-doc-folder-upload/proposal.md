# Implement Document Upload and Folder Creation

## Why

The document management module has complete UI components, server actions, and infrastructure (database schema, file storage, API routes) but the core functionality is stubbed with TODOs. Users cannot currently create folders or upload documents because the server actions and repository functions are not connected to the database. This change implements the working functionality to make these features operational.

## What Changes

- Uncomment and complete the database operations in server actions (`createDirectory`, `createDocument`)
- Implement the repository function connections in API routes
- Complete the file upload flow from UI → API → Storage → Database
- Enable folder creation flow from UI → Server Action → Database
- Add proper error handling and validation throughout the flow
- Ensure audit logging works for both operations
- Wire up revalidation paths for UI updates

**This is NOT adding new features** - it's implementing the functionality that's already designed, specced, and scaffolded.

## Impact

### Affected specs:
- `document-management` (NO CHANGE) - Requirements already defined, just implementing them

### Affected code:
- `lib/modules/document-management/actions/directories.ts` - Complete `createDirectory` implementation
- `lib/modules/document-management/actions/documents.ts` - Complete document CRUD operations (if needed)
- `app/api/documents/upload/route.ts` - Complete upload API route
- `lib/db/repositories/directories.ts` - Verify/complete repository functions
- `lib/db/repositories/documents.ts` - Verify/complete repository functions  
- `lib/db/repositories/audit-log.ts` - Ensure audit logging works

### Breaking changes:
None - This is completing existing functionality

## Dependencies

- Database must be migrated with latest schema (directories, documents tables)
- `DOCUMENT_STORAGE_PATH` environment variable must be configured
- Supabase auth must be working for user identification


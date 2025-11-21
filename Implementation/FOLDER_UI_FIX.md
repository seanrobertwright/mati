# Folder UI Display Issue - FIXED

## Problem
Folders were being created successfully in the database, but they were not appearing in the UI after creation.

## Root Cause
The `getAllDirectories()` server action was calling `getDirectoryTree()` from the repository, which returns a **nested tree structure** (`DirectoryWithChildren[]`):

```typescript
// Returns nested structure like:
[
  { id: '1', name: 'Folder A', children: [
      { id: '2', name: 'Subfolder', children: [] }
    ]
  }
]
```

However, the `DirectoryTree` UI component expects a **flat array** of directories (`Directory[]`):

```typescript
// Expects flat structure like:
[
  { id: '1', name: 'Folder A', parentId: null },
  { id: '2', name: 'Subfolder', parentId: '1' }
]
```

The component has its own `buildDirectoryTree()` function that constructs the tree from the flat list.

## Solution
Changed `getAllDirectories()` to query the database directly for a flat list of all directories instead of using the nested tree structure:

**Before:**
```typescript
const tree = await dbGetDirectoryTree();
return { 
  success: true,
  directories: tree || [],
};
```

**After:**
```typescript
const allDirectories = await db.select().from(directories).orderBy(directories.name);
return { 
  success: true,
  directories: allDirectories || [],
};
```

## Files Modified
1. `lib/modules/document-management/actions/directories.ts`
   - Added imports: `db` from `@/lib/db/client` and `directories` from `@/lib/db/schema`
   - Changed `getAllDirectories()` to use direct Drizzle query instead of `getDirectoryTree()`

## Testing
After this fix:
1. Create a new folder via the UI
2. The folder should immediately appear in the sidebar directory tree
3. Nested folders should also display correctly
4. The tree structure is built client-side from the flat array

## Additional Notes
- The `getDirectoryTree()` repository function is still useful for other purposes (like getting a pre-built tree for API responses)
- This fix maintains the separation of concerns: the repository can return different formats, and the UI components handle their own tree building logic

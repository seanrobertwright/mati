# Module Development Guide

This guide explains how to create new safety modules with proper authentication and authorization.

---

## Table of Contents

1. [Overview](#overview)
2. [Module Structure](#module-structure)
3. [Adding Role Requirements](#adding-role-requirements)
4. [Server Actions & Permissions](#server-actions--permissions)
5. [UI Permission Checks](#ui-permission-checks)
6. [Best Practices](#best-practices)
7. [Example Module](#example-module)

---

## Overview

Safety modules in this system follow a modular architecture with built-in authentication and authorization support.

**Key Principles:**
- Modules declare minimum role requirements
- Server actions enforce permissions
- UI conditionally renders based on user role
- 3-layer security: module, server, and UI

---

## Module Structure

A typical module structure:

```
lib/modules/my-module/
├── index.ts              # Module definition & exports
├── components/           # React components
│   ├── MyModuleWidget.tsx
│   └── MyModuleList.tsx
├── actions/              # Server actions
│   └── my-actions.ts
├── MyModuleRoute.tsx     # Main route component
└── MyModuleIcon.tsx      # Module icon
```

---

## Adding Role Requirements

### Step 1: Define Module with minRole

In `lib/modules/my-module/index.ts`:

```typescript
import type { SafetyModule } from '@/lib/safety-framework';

const myModule: SafetyModule = {
  id: 'my-module',
  name: 'My Module',
  description: 'Description of what this module does',
  version: '1.0.0',
  
  // ✅ Set minimum role requirement
  minRole: 'employee', // Options: 'viewer' | 'employee' | 'manager' | 'admin'
  
  widgets: [
    // ... your widgets
  ],
  
  navigation: [
    {
      label: 'My Module',
      href: '/my-module',
      icon: MyModuleIcon,
    },
  ],
  
  route: MyModuleRoute,
};

export default myModule;
```

### minRole Options

| Value | Who Can Access | Use Case |
|-------|----------------|----------|
| `undefined` | All authenticated users | Public modules |
| `'viewer'` | Everyone (read-only for viewers) | Data viewing, reports |
| `'employee'` | Employee and above | Standard features |
| `'manager'` | Manager and admin only | Elevated features |
| `'admin'` | Admin only | System configuration |

**Recommendation:** Use `'viewer'` for modules with data, then enforce write permissions in server actions.

---

## Server Actions & Permissions

### Step 2: Add Permission Checks to Server Actions

In `lib/modules/my-module/actions/my-actions.ts`:

```typescript
'use server';

import { createClient } from '@/lib/auth/server';
import { hasRole, getUserRole } from '@/lib/auth/permissions';
import { revalidatePath } from 'next/cache';

/**
 * Create a new record (requires employee role)
 */
export async function createRecord(data: { title: string; description: string }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check authentication
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // ✅ Check minimum role requirement
    if (!hasRole(user, 'employee')) {
      return { error: 'Forbidden: Viewers have read-only access' };
    }

    // Perform the operation
    // const record = await createRecordInDb({ ...data, userId: user.id });

    revalidatePath('/dashboard/my-module');
    
    return { success: true };
  } catch (error) {
    console.error('Create record error:', error);
    return { error: 'Failed to create record' };
  }
}

/**
 * Update a record (requires employee role + ownership check)
 */
export async function updateRecord(recordId: string, data: any) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // ✅ Check minimum role
    if (!hasRole(user, 'employee')) {
      return { error: 'Forbidden: Viewers have read-only access' };
    }

    // ✅ Check ownership or elevated role
    // const record = await getRecordById(recordId);
    // if (record.userId !== user.id && !hasRole(user, 'manager')) {
    //   return { error: 'Forbidden: Can only edit own records' };
    // }

    // Update the record
    // await updateRecordInDb(recordId, data);

    revalidatePath('/dashboard/my-module');
    
    return { success: true };
  } catch (error) {
    console.error('Update record error:', error);
    return { error: 'Failed to update record' };
  }
}

/**
 * Delete a record (requires manager role)
 */
export async function deleteRecord(recordId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // ✅ Require elevated role for deletion
    if (!hasRole(user, 'manager')) {
      return { error: 'Forbidden: Manager role required' };
    }

    // Delete the record
    // await deleteRecordFromDb(recordId);

    revalidatePath('/dashboard/my-module');
    
    return { success: true };
  } catch (error) {
    console.error('Delete record error:', error);
    return { error: 'Failed to delete record' };
  }
}

/**
 * Get records (available to all authenticated users)
 */
export async function getRecords() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    const userRole = getUserRole(user);

    // ✅ Managers see all records, employees see only their own
    let records;
    if (hasRole(user, 'manager')) {
      // records = await getAllRecordsFromDb();
    } else {
      // records = await getRecordsByUserFromDb(user.id);
    }

    return { success: true, records: [] };
  } catch (error) {
    console.error('Get records error:', error);
    return { error: 'Failed to fetch records' };
  }
}
```

### Permission Helper Functions

**Available from `@/lib/auth/permissions`:**

```typescript
// Check if user has at least the specified role
hasRole(user, 'employee') // true if employee, manager, or admin

// Get user's current role
getUserRole(user) // returns 'viewer' | 'employee' | 'manager' | 'admin'

// Check if user is admin
isAdmin(user) // shorthand for hasRole(user, 'admin')

// Check if user can edit a resource
canEditResource(user, resourceOwnerId) // true if owns resource or is manager+
```

---

## UI Permission Checks

### Step 3: Conditional Rendering Based on Role

In `lib/modules/my-module/MyModuleRoute.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import { createClient } from '@/lib/auth/client';
import { getUserRole, hasRole } from '@/lib/auth/permissions';

export default function MyModuleRoute() {
  const [canEdit, setCanEdit] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
  const [records, setRecords] = useState([]);

  // ✅ Check user permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const role = getUserRole(user);
        setCanEdit(hasRole(user, 'employee'));
        setIsViewer(role === 'viewer');
      }
    };
    
    checkPermissions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with role badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">My Module</h1>
          
          {/* ✅ Show read-only badge for viewers */}
          {isViewer && (
            <Badge variant="secondary" className="gap-1">
              <Eye className="h-3 w-3" />
              Read-Only Access
            </Badge>
          )}
        </div>

        {/* ✅ Only show create button if user can edit */}
        <div className="flex gap-2">
          {canEdit && (
            <Button onClick={() => handleCreate()}>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-4">
        {records.map((record) => (
          <RecordCard
            key={record.id}
            record={record}
            canEdit={canEdit}  // ✅ Pass permission to child
          />
        ))}
      </div>
    </div>
  );
}

function RecordCard({ record, canEdit }: { record: any; canEdit: boolean }) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{record.title}</h3>
      <p>{record.description}</p>
      
      {/* ✅ Only show action buttons if user can edit */}
      {canEdit && (
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="destructive">Delete</Button>
        </div>
      )}
    </div>
  );
}
```

---

## Best Practices

### ✅ DO

1. **Always check permissions server-side** - Never trust client-only checks
2. **Use `minRole` on modules** - Prevents unauthorized module access
3. **Hide UI elements for restricted users** - Better UX
4. **Show read-only badges** - Clear user feedback
5. **Return clear error messages** - "Forbidden: Viewers have read-only access"
6. **Revalidate paths** - Clear cache after mutations
7. **Log permission denials** - Help with debugging

### ❌ DON'T

1. **Don't skip server-side checks** - UI hiding is not security
2. **Don't hardcode permissions** - Use helper functions
3. **Don't expose sensitive data to viewers** - Check role before returning data
4. **Don't forget to check ownership** - Users should only edit their own data (unless manager+)
5. **Don't use admin permissions in modules** - Keep admin features in admin area

---

## Example Module

See the complete example modules in:
- `lib/modules/incident-reporting/` - Standard employee module
- `lib/modules/document-management/` - Viewer-accessible module with read-only enforcement

---

## Permission Check Checklist

When creating a new module, ensure:

- [ ] Module has `minRole` defined
- [ ] All create actions check `hasRole(user, 'employee')`
- [ ] All update actions check role + ownership
- [ ] All delete actions check appropriate role
- [ ] Get actions filter by role (managers see all, employees see own)
- [ ] UI checks permissions and conditionally renders
- [ ] Read-only badge shown for viewers
- [ ] Create/edit/delete buttons hidden for viewers
- [ ] Error messages are clear and user-friendly
- [ ] Paths revalidated after mutations

---

## Testing Your Module

Test with different roles:

1. **As Viewer:** Can view module, sees read-only badge, no create/edit buttons
2. **As Employee:** Can create own records, edit own records, view own records
3. **As Manager:** Can view all records, edit any record, delete records
4. **As Admin:** Full access to everything

---

## Need Help?

- Check existing modules for reference
- Review `lib/auth/permissions.ts` for available helpers
- See `AUTHENTICATION_TESTING_FINAL_REPORT.md` for security guidelines
- Refer to `VIEWER_ROLE_FIX_SUMMARY.md` for read-only implementation example

---

**Remember:** Security is implemented in layers (module, server, UI). Never rely on UI-only permission checks!

# Role System Documentation

Complete guide to the 4-tier role-based authorization system.

---

## Table of Contents

1. [Overview](#overview)
2. [Role Hierarchy](#role-hierarchy)
3. [Role Definitions](#role-definitions)
4. [Permission Matrix](#permission-matrix)
5. [Implementation Details](#implementation-details)
6. [Role Assignment](#role-assignment)
7. [Use Cases](#use-cases)
8. [Security Notes](#security-notes)

---

## Overview

The Safety Management System uses a hierarchical role-based access control (RBAC) system with four distinct roles.

**Key Features:**
- 4-tier hierarchy (viewer → employee → manager → admin)
- Roles stored in Supabase Auth `app_metadata`
- Cached in JWT tokens for performance
- Server-side validation on all protected operations
- UI adapts based on user role

---

## Role Hierarchy

Roles are ordered from lowest to highest permission level:

```
┌─────────────────────────────────────────┐
│  Admin (Level 3)                        │
│  ├─ Full system access                  │
│  ├─ User management                     │
│  └─ All module permissions              │
├─────────────────────────────────────────┤
│  Manager / Safety Manager (Level 2)    │
│  ├─ View all data                       │
│  ├─ Edit any incident/document          │
│  └─ Delete records                      │
├─────────────────────────────────────────┤
│  Employee (Level 1)                     │
│  ├─ Create incidents/documents          │
│  ├─ View own data                       │
│  └─ Edit own records                    │
├─────────────────────────────────────────┤
│  Viewer (Level 0)                       │
│  ├─ Read-only access                    │
│  ├─ View modules and data               │
│  └─ Cannot create/edit/delete           │
└─────────────────────────────────────────┘
```

**Principle:** Higher roles inherit all permissions from lower roles.

---

## Role Definitions

### Viewer (Level 0)

**Display Name:** Viewer  
**Color Badge:** Secondary (gray)

**Description:**
Read-only access to safety records and reports. Cannot create, edit, or delete any data.

**Typical Users:**
- Contractors (temporary access)
- Auditors (read-only compliance checks)
- Executive viewers (high-level overview)
- Training users (learning the system)

**Permissions:**
- ✅ View dashboard
- ✅ View incidents (read-only)
- ✅ View documents (read-only)
- ✅ View reports
- ❌ Cannot create anything
- ❌ Cannot edit anything
- ❌ Cannot delete anything
- ❌ No access to admin panel

**UI Indicators:**
- "Read-Only Access" badge displayed
- Create/Edit/Delete buttons hidden
- Forms disabled

---

### Employee (Level 1)

**Display Name:** Employee  
**Color Badge:** Default (blue)

**Description:**
Standard user role for employees who need to report incidents and manage their own documents.

**Typical Users:**
- Regular employees
- Safety reporters
- Team members
- New users (default signup role)

**Permissions:**
- ✅ All Viewer permissions
- ✅ Create incidents
- ✅ Edit own incidents
- ✅ Upload documents
- ✅ Edit own documents
- ✅ View own data
- ❌ Cannot view others' data (module-dependent)
- ❌ Cannot delete records
- ❌ No access to admin panel

**Data Scope:**
- Can only see and edit their own records
- Incidents filtered by `user_id`
- Documents filtered by ownership

---

### Manager / Safety Manager (Level 2)

**Display Name:** Safety Manager (or Manager)  
**Color Badge:** Warning (yellow/orange)

**Description:**
Elevated permissions for managers who oversee safety operations and need access to all incidents and documents.

**Typical Users:**
- Safety managers
- Department heads
- Supervisors
- Compliance officers

**Permissions:**
- ✅ All Employee permissions
- ✅ **View all incidents** (not just own)
- ✅ **View all documents** (full access)
- ✅ **Edit any incident** (cross-user editing)
- ✅ **Edit any document**
- ✅ **Delete incidents**
- ✅ **Delete documents**
- ✅ Approve change requests
- ✅ Assign reviewers
- ❌ No user management
- ❌ No access to admin panel

**Data Scope:**
- Full visibility across all users' data
- Can manage any record in the system
- Elevated permissions for oversight

---

### Admin / Administrator (Level 3)

**Display Name:** Administrator  
**Color Badge:** Destructive (red)

**Description:**
Full system access including user management, system configuration, and all module features.

**Typical Users:**
- System administrators
- IT staff
- Safety system owners
- Executive administrators

**Permissions:**
- ✅ All Manager permissions
- ✅ **User management** (view all users)
- ✅ **Change user roles**
- ✅ **Delete users** (except self)
- ✅ **Access admin panel**
- ✅ System configuration
- ✅ Full data access
- ✅ Override any permission

**Special Features:**
- Cannot modify own admin role (self-protection)
- Cannot delete own account (safety measure)
- Global logout affects all sessions
- Service role key access (server-side only)

---

## Permission Matrix

| Feature | Viewer | Employee | Manager | Admin |
|---------|--------|----------|---------|-------|
| **Dashboard Access** | ✅ | ✅ | ✅ | ✅ |
| **View Incidents** | ✅ Read-only | ✅ Own | ✅ All | ✅ All |
| **Create Incidents** | ❌ | ✅ | ✅ | ✅ |
| **Edit Incidents** | ❌ | ✅ Own | ✅ All | ✅ All |
| **Delete Incidents** | ❌ | ❌ | ✅ | ✅ |
| **View Documents** | ✅ Read-only | ✅ Own | ✅ All | ✅ All |
| **Upload Documents** | ❌ | ✅ | ✅ | ✅ |
| **Edit Documents** | ❌ | ✅ Own | ✅ All | ✅ All |
| **Delete Documents** | ❌ | ❌ | ✅ | ✅ |
| **View Reports** | ✅ | ✅ | ✅ | ✅ |
| **User Management** | ❌ | ❌ | ❌ | ✅ |
| **Change Roles** | ❌ | ❌ | ❌ | ✅ |
| **Delete Users** | ❌ | ❌ | ❌ | ✅ |
| **Admin Panel Access** | ❌ | ❌ | ❌ | ✅ |

---

## Implementation Details

### Storage

Roles are stored in Supabase Auth metadata:

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "app_metadata": {
    "role": "employee"  // ← Role stored here
  }
}
```

### Token Caching

Roles are embedded in JWT tokens for performance:
- No database lookup on every request
- Token refresh updates role
- **Role changes require re-login** to take effect

### Default Role

New signups automatically receive the `employee` role:

```typescript
// In signup logic
const newUser = {
  email,
  password,
  options: {
    data: {
      role: 'employee'  // Default role
    }
  }
}
```

### Role Validation

Server-side role checks use the permission helpers:

```typescript
import { hasRole, getUserRole } from '@/lib/auth/permissions';

// Check if user has minimum role
if (!hasRole(user, 'employee')) {
  return { error: 'Forbidden' };
}

// Get current role
const role = getUserRole(user); // 'viewer' | 'employee' | 'manager' | 'admin'
```

---

## Role Assignment

### For New Users

**Default:** All new signups get `employee` role automatically.

**To change default:** Modify the signup logic in authentication actions.

### For Existing Users

**Via Admin Dashboard:**
1. Login as admin
2. Go to `/dashboard/admin/users`
3. Find the user
4. Click "Change Role"
5. Select new role
6. User must **logout and login** for changes to take effect

**Via Script:**
```bash
npm run setup:admin
# Or
npx ts-node scripts/set-admin-role.ts
```

**Via Supabase Dashboard:**
1. Go to Authentication > Users
2. Edit user
3. Add to app_metadata: `{ "role": "admin" }`
4. User must logout and login

---

## Use Cases

### Typical Scenarios

#### Scenario 1: Small Company (5-10 employees)
**Setup:**
- 1 Admin (system owner)
- 1 Manager (safety officer)
- 8 Employees (all staff)

**Workflow:**
- Employees report incidents
- Manager reviews and approves
- Admin manages users and system

---

#### Scenario 2: Large Organization (100+ employees)
**Setup:**
- 2 Admins (IT + Safety Director)
- 5 Managers (Department heads)
- 90 Employees (staff)
- 10 Viewers (contractors, auditors)

**Workflow:**
- Employees report in their departments
- Managers oversee their areas
- Admins handle system and users
- Viewers for compliance reviews

---

#### Scenario 3: Audit Period
**Setup:**
- Temporarily assign `viewer` role to auditors
- Auditors can read all data
- No risk of accidental changes
- Remove access after audit complete

---

### Role Assignment Guide

| User Type | Recommended Role |
|-----------|-----------------|
| CEO / Executive | Viewer (overview only) |
| Safety Director | Admin |
| Department Manager | Manager |
| Safety Officer | Manager |
| Regular Employee | Employee |
| Contractor | Viewer |
| Auditor | Viewer |
| IT Staff | Admin |
| Temporary Worker | Viewer or Employee |
| Intern | Viewer |

---

## Security Notes

### Role Changes

**Important:** Role changes do NOT take effect immediately.

**Reason:** Roles are cached in JWT tokens (1-hour expiry by default).

**Solution:** User must logout and login again to get new token with updated role.

**Alternative:** Implement token refresh logic (more complex).

---

### Global Logout

When a user logs out, **all their active sessions are terminated**.

**Why:** Security best practice - prevents orphaned sessions.

**Behavior:** Logout on one device = logout on all devices.

**This is correct and expected!**

---

### Admin Self-Protection

Admins cannot:
- Change their own role
- Delete their own account

**Why:** Prevents accidentally losing admin access.

**Solution:** Use another admin account to modify admin users.

---

### Service Role Key

The `SUPABASE_SERVICE_ROLE_KEY` grants full database access.

**⚠️ NEVER expose this to the client!**

**Usage:** Server-side admin operations only.

**Location:** `.env.local` (never committed to git).

---

### Permission Enforcement

**3 Layers of Security:**

1. **Module Level** (`minRole`)
   - Prevents accessing modules without permission
   - User doesn't see restricted modules in navigation

2. **Server Level** (`hasRole` checks)
   - Every mutation validates permissions
   - Returns error if unauthorized
   - **This is the critical layer!**

3. **UI Level** (conditional rendering)
   - Hides buttons for unauthorized users
   - Shows read-only badges
   - Better UX (not security)

**Rule:** NEVER rely on UI-only checks for security!

---

## FAQs

### Q: Can I create custom roles?

**A:** The system uses 4 fixed roles. To add custom roles, you'd need to:
1. Update the `UserRole` type in `lib/auth/permissions.ts`
2. Add to `ROLE_HIERARCHY`
3. Update all permission checks
4. Add UI for the new role

**Recommendation:** Use the 4 existing roles - they cover most use cases.

---

### Q: Why can't viewers see anything on the dashboard?

**A:** If modules have `minRole: 'employee'`, viewers can't access them.

**Solution:** Set `minRole: 'viewer'` and enforce read-only in server actions (see viewer role fix documentation).

---

### Q: How do I make a user admin?

**A:** See [Role Assignment](#role-assignment) section above. Use the admin script or Supabase dashboard.

---

### Q: Do role changes take effect immediately?

**A:** No. User must logout and login again to refresh their JWT token.

---

### Q: Can a user have multiple roles?

**A:** No. Each user has exactly one role. Higher roles inherit lower role permissions.

---

### Q: What if I delete all admins?

**A:** Use the `scripts/set-admin-role.ts` script to assign admin role to a user directly via service role key.

---

## Summary

- **4 Roles:** Viewer (0), Employee (1), Manager (2), Admin (3)
- **Hierarchical:** Higher roles inherit all lower permissions
- **Stored:** In Supabase Auth `app_metadata`
- **Cached:** In JWT tokens (logout/login to refresh)
- **Default:** New signups get `employee` role
- **Security:** 3-layer enforcement (module, server, UI)
- **Admin:** Full access + user management, self-protected

---

**For implementation details, see:**
- `MODULE_DEVELOPMENT_GUIDE.md` - How to use roles in modules
- `AUTHENTICATION_TESTING_FINAL_REPORT.md` - Test results
- `lib/auth/permissions.ts` - Permission helper functions

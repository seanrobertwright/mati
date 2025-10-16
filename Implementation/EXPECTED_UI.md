# What You Should See - User Management UI

## Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Safety Management Dashboard                     [UserMenu]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Management                                              │
│  Manage user accounts and assign roles                        │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Users (1)                                            │   │
│  │  View and manage all registered users in the system   │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ Email         │ Role  │ Status   │ ... │ Actions││ │   │
│  │  ├───────────────────────────────────────────────────┤ │   │
│  │  │ sean...@gmail │[Admin]│[Verified]│ ... │ [btns] ││ │   │
│  │  │  You          │       │          │     │DISABLED││ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Role Definitions                                     │   │
│  │  Available roles and their permissions                │   │
│  ├───────────────────────────────────────────────────────┤   │
│  │  ┌──────────────┐  ┌──────────────┐                  │   │
│  │  │ Admin [badge]│  │Manager[badge]│                  │   │
│  │  │ Full system  │  │Can view/edit │                  │   │
│  │  │ access       │  │all data      │                  │   │
│  │  └──────────────┘  └──────────────┘                  │   │
│  │  ┌──────────────┐  ┌──────────────┐                  │   │
│  │  │Employee[bdg] │  │ Viewer[badge]│                  │   │
│  │  │ Limited to   │  │ Read-only    │                  │   │
│  │  │ own data     │  │ access       │                  │   │
│  │  └──────────────┘  └──────────────┘                  │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Role Change Dialog

When you click "Change Role" (for another user):

```
┌────────────────────────────────────┐
│  Change User Role              [X] │
├────────────────────────────────────┤
│  Update the role for test@...com   │
│                                    │
│  Current role: [Manager]           │
│                                    │
│  Select new role:                  │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ [Admin] (Administrator)      │ │
│  │ Full system access including │ │
│  │ user management              │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ [Manager] (current)          │ │
│  │ Can view and edit all safety │ │
│  │ data                         │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ [Employee]                   │ │
│  │ Can create and view own data │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ [Viewer]                     │ │
│  │ Read-only access to reports  │ │
│  └──────────────────────────────┘ │
│                                    │
│              [Cancel]              │
└────────────────────────────────────┘
```

Click any role to immediately change it!

## Delete Confirmation Dialog

When you click "Delete":

```
┌────────────────────────────────────┐
│  Delete User                   [X] │
├────────────────────────────────────┤
│  Are you sure you want to delete   │
│  test@example.com?                 │
│                                    │
│  This action cannot be undone.     │
│                                    │
│          [Cancel] [Delete User]    │
└────────────────────────────────────┘
```

## Badge Colors

### Role Badges
- **Admin**: Dark/default color (primary)
- **Manager**: Gray/secondary color
- **Employee**: Outline style (white bg, border)
- **Viewer**: Outline style (white bg, border)

### Status Badges
- **Verified**: Green background (✓ Email confirmed)
- **Pending**: Yellow background (⏳ Awaiting email confirmation)

### Special Badges
- **You**: Outline badge next to your own email

## Table Columns

1. **Email** - User's email address + "You" badge for current user
2. **Role** - Colored badge (Admin/Manager/Employee/Viewer)
3. **Status** - Verified or Pending badge
4. **Created** - Account creation date (e.g., "Oct 15, 2025")
5. **Last Sign In** - Most recent login or "Never"
6. **Actions** - "Change Role" and "Delete" buttons (disabled for your account)

## Expected Behavior

### ✅ Your Account (Admin)
- Row has "You" badge
- Both buttons are **grayed out/disabled**
- Cannot click them
- This is correct! (self-protection)

### ✅ Other Users
- Buttons are **blue/clickable**
- "Change Role" opens dialog
- "Delete" opens confirmation
- Actions complete with page reload

## Browser Console

**Should see:**
- Module loading messages
- GET requests returning 200
- No red errors

**Should NOT see:**
- 500 errors
- "Cannot find module" errors
- React errors
- CORS errors

---

## 🎯 Success Criteria

You know it's working if:
1. ✅ Page loads without errors
2. ✅ You can see at least one user (yourself)
3. ✅ Your buttons are disabled
4. ✅ Role change dialog opens for other users
5. ✅ Role changes actually update the user
6. ✅ Deletions work with confirmation

---

**Current Status:** Page compiled successfully, ready to test!  
**Your Browser:** Should be at http://localhost:3001/dashboard/admin/users

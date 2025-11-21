# Test 3: Role-Based Authorization - Quick Guide

## 🎯 What We're Testing
Verifying that different user roles have appropriate access levels and permissions.

---

## 📋 Test 3.1: Admin Access (Full Access)

### **In main browser window (login as admin):**

1. **Login as admin** (if not already):
   - Email: `seanrobertwright@gmail.com`
   - Password: [your password]

2. **Check user menu:**
   - What role does it show?
   - Should say "Administrator"

3. **Try accessing these pages:**
   - `/dashboard` - ✓
   - `/dashboard/admin/users` - ✓
   - `/dashboard/incident-reporting` - ✓
   - `/dashboard/document-management` - ✓

4. **For each page, verify:**
   - Page loads without errors
   - No 403 forbidden errors
   - All features visible

### **Expected:**
- ✅ User menu shows "Administrator"
- ✅ All pages accessible
- ✅ No permission errors
- ✅ Full functionality available

### **Your Results:**
```
Role in user menu: admin
Dashboard accessible: Yes
Admin users page: Yes
Incident reporting: Yes
Document management: Yes
All features work: Yes
Test PASSED: Yes
```

---

## 📋 Test 3.2: Employee Access (Limited)

### **In incognito window:**

1. **Login as employee:**
   - Email: `test-employee@example.com`
   - Password: `password123`

2. **Check user menu:**
   - What role does it show?
   - Should say "Employee"

3. **Try accessing:**
   - `/dashboard` - Should work ✓
   - `/dashboard/admin/users` - Should redirect ✗
   - `/dashboard/incident-reporting` - Should work ✓
   - `/dashboard/document-management` - Should work ✓

4. **For admin users page:**
   - Type URL directly: `http://localhost:3000/dashboard/admin/users`
   - Where does it go?
   - Should redirect to `/dashboard`

### **Expected:**
- ✅ User menu shows "Employee"
- ✅ Dashboard works
- ✅ Admin pages redirect away (403 or redirect to dashboard)
- ✅ Regular modules accessible
- ✅ Employee cannot access admin features

### **Your Results:**
```
Role in user menu: employee
Dashboard accessible: Yes
Admin page redirects: Yes
Where redirected to: /dashboord
Incident reporting accessible: Yes
Document management accessible: Yes
Test PASSED: Yes
```

---

## 📋 Test 3.3: Create Manager User (Setup)

### **In admin window:**

1. **Go to user management:**
   - `http://localhost:3000/dashboard/admin/users`

2. **Find test-employee@example.com**

3. **Change role to Manager:**
   - Click "Change Role"
   - Select "Manager" or "Safety Manager"
   - Confirm

4. **Verify:**
   - User's role badge shows "Safety Manager"
   - Alert shows success

### **Expected:**
- ✅ Can change role successfully
- ✅ Role updates in user list
- ✅ Ready for manager testing

### **Your Results:**
```
Role changed successfully: Yes
New role shows as Manager: Yes
Test PASSED: Yes
```

---

## 📋 Test 3.4: Manager Access

### **In incognito window:**

1. **Logout and login again as test user:**
   - Email: `test-employee@example.com` (now manager)
   - Password: `password123`

2. **Check user menu:**
   - Role should now show "Safety Manager" or "Manager"

3. **Try accessing:**
   - `/dashboard` - Should work ✓
   - `/dashboard/admin/users` - Should redirect ✗
   - `/dashboard/incident-reporting` - Should work ✓
   - `/dashboard/document-management` - Should work ✓

4. **Check permissions:**
   - Manager should see ALL incidents (not just own)
   - Manager should be able to edit/delete any incident
   - Manager CANNOT access admin user management

### **Expected:**
- ✅ User menu shows "Safety Manager" or "Manager"
- ✅ Dashboard and modules accessible
- ✅ Admin panel still blocked
- ✅ Higher permissions than employee

### **Your Results:**
```
Role in user menu: manager
Dashboard accessible: Yes
Admin page blocked: Yes
Modules accessible: Yes
Test PASSED: Yes
```

---

## 📋 Test 3.5: Create Viewer User (Setup)

### **In admin window:**

1. **Change test user role to Viewer:**
   - Go to admin users page
   - Find test-employee@example.com
   - Change role to "Viewer"
   - Confirm

### **Expected:**
- ✅ Role changed to Viewer
- ✅ Shows "Viewer" badge

### **Your Results:**
```
Changed to Viewer: Yes
Badge updated: Yes
Test PASSED: Yes
```

---

## 📋 Test 3.6: Viewer Access (Read-Only)

### **In incognito window:**

1. **Logout and login again:**
   - Email: `test-employee@example.com` (now viewer)
   - Password: `password123`

2. **Check user menu:**
   - Should show "Viewer"

3. **Try accessing pages:**
   - Dashboard - Should work ✓
   - Admin panel - Should be blocked ✗
   - Modules - Should work but read-only ✓

4. **Check for read-only restrictions:**
   - Can view data?
   - Are create/edit/delete buttons visible?
   - Try to create/edit if possible - should fail

### **Expected:**
- ✅ User menu shows "Viewer"
- ✅ Can view dashboard and data
- ✅ Cannot create/edit/delete
- ✅ Admin panel blocked
- ✅ True read-only access

### **Your Results:**
```
Role in user menu: viewer
Can view dashboard: Yes (FIXED! ✅)
Can view modules: Yes (FIXED! ✅)
Read-only badge visible: Yes
Can create/edit/delete: No (buttons hidden ✅)
Admin panel blocked: Yes
Read-only enforced: Yes
Test PASSED: Yes ✅
```

**FIX APPLIED:** Option D (Hybrid) - Changed minRole to 'viewer', added server-side checks, added UI read-only indicators

---

## 📋 Test 3.7: Self-Edit Prevention

### **In admin window:**

1. **Go to admin users page**

2. **Try to change YOUR OWN role:**
   - Find your admin account
   - Buttons should be DISABLED

3. **Verify self-protection:**
   - Cannot change own role
   - Cannot delete own account

### **Expected:**
- ✅ Own account buttons disabled
- ✅ Cannot modify own role
- ✅ Security working

### **Your Results:**
```
Own buttons disabled: Yes
Self-protection works: Yes
Test PASSED: Yes
```

---

## ✅ Quick Summary

**Test 3 Status:**

| Test | Expected | Actual | Pass? |
|------|----------|--------|-------|
| 3.1: Admin full access | All pages | All accessible | ✅ |
| 3.2: Employee limited | Admin blocked | Redirected | ✅ |
| 3.3: Create manager | Role changed | Success | ✅ |
| 3.4: Manager access | Admin blocked | Correct | ✅ |
| 3.5: Create viewer | Role changed | Success | ✅ |
| 3.6: Viewer read-only | No edit/delete | Fixed! Read-only | ✅ |
| 3.7: Self-edit prevention | Disabled | Working | ✅ |

**Overall Test 3:** ✅ **PASS**

**Pass Rate:** 7/7 (100%)

---

## 🐛 Any Issues?

```
[Note any problems, unexpected behavior, or bugs here]
```

---

## 📊 Progress So Far

- ✅ Test 1: Signup Flow (3/3 passed)
- ✅ Test 2: Login & Logout (7/7 passed)
- ✅ Test 3: Role-Based Authorization (7/7 passed) 🎉
- ⏳ Test 4: Route Protection  
- ⏳ Test 5: Edge Cases

**Overall Progress:** 17/26 tests passed (65%)

---

## ➡️ Next Test

Test 3 is complete! Moving to:
**Test 4: Route Protection**

---

## 🎉 Test 3 Complete!

All role-based authorization tests passed including the viewer fix!
- **Manager** (2) - All data, no user management
- **Admin** (3) - Full system access

**Testing Tips:**
- Use incognito window for non-admin users
- Keep admin window open separately
- Logout/login after role changes
- Check both UI (buttons) and actual permissions

---

**Fill in your results as you test!** 🧪

# Authentication Testing Guide - Section 8

**Date:** October 16, 2025  
**Status:** 🧪 In Progress  
**Estimated Time:** 1-2 hours

---

## Overview

We'll systematically test all authentication and authorization flows to ensure production readiness.

### Testing Sections
1. **Signup Flow** - New user registration and role assignment
2. **Login/Logout** - Authentication flows
3. **Authorization** - Role-based access control
4. **Route Protection** - Middleware and guards
5. **Edge Cases** - Session handling, errors, special scenarios

---

## 🧪 Test 1: Signup Flow

### Test 1.1: Default Employee Role ✓
**Goal:** Verify new users get 'employee' role by default

**Steps:**
1. Open **incognito/private** browser window
2. Go to: `http://localhost:3001/signup`
3. Sign up with:
   - Email: `test-employee@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Sign Up"

**Expected Results:**
- [ ] Success message appears
- [ ] Redirected to dashboard (or shows email verification message)
- [ ] If logged in automatically, check user menu shows "Employee" role

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 1.2: Admin Email Assignment ✓
**Goal:** Verify INITIAL_ADMIN_EMAIL gets admin role

**Prerequisites:**
- Check `.env.local` has: `INITIAL_ADMIN_EMAIL=seanrobertwright@gmail.com`
- OR add: `NEXT_PUBLIC_INITIAL_ADMIN_EMAIL=admin-test@example.com`

**Steps:**
1. Update `.env.local` with a new test email as NEXT_PUBLIC_INITIAL_ADMIN_EMAIL
2. Restart dev server: `npm run dev`
3. Open incognito browser
4. Go to signup page
5. Sign up with the email from NEXT_PUBLIC_INITIAL_ADMIN_EMAIL

**Expected Results:**
- [ ] User created successfully
- [ ] User has 'admin' role in database
- [ ] Can access `/dashboard/admin/users`

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 1.3: Duplicate Email Prevention ✓
**Goal:** Cannot signup with existing email

**Steps:**
1. Try to signup with an email that already exists
2. Use: `seanrobertwright@gmail.com`

**Expected Results:**
- [ ] Error message appears
- [ ] Says email already registered or similar
- [ ] User not created

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

## 🧪 Test 2: Login & Logout Flows

### Test 2.1: Valid Login ✓
**Goal:** Login with correct credentials redirects to dashboard

**Steps:**
1. Go to: `http://localhost:3001/login`
2. Enter valid credentials:
   - Email: `seanrobertwright@gmail.com`
   - Password: [your password]
3. Click "Login"

**Expected Results:**
- [ ] No error message
- [ ] Redirected to `/dashboard`
- [ ] User menu shows your email
- [ ] User menu shows "Administrator" role

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 2.2: Invalid Password ✓
**Goal:** Wrong password shows error

**Steps:**
1. Go to login page
2. Enter email: `seanrobertwright@gmail.com`
3. Enter wrong password: `wrongpassword123`
4. Click "Login"

**Expected Results:**
- [ ] Error message appears
- [ ] Says "Invalid credentials" or similar
- [ ] Stays on login page
- [ ] Does NOT redirect to dashboard

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 2.3: Non-existent Email ✓
**Goal:** Login with non-existent email shows error

**Steps:**
1. Go to login page
2. Enter email: `nonexistent@example.com`
3. Enter any password
4. Click "Login"

**Expected Results:**
- [ ] Error message appears
- [ ] Says "Invalid credentials" or similar
- [ ] Stays on login page

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 2.4: Logout Functionality ✓
**Goal:** Logout clears session and redirects

**Steps:**
1. Ensure you're logged in
2. Click user menu (top-right)
3. Click "Logout" button
4. Observe what happens

**Expected Results:**
- [ ] Session cleared
- [ ] Redirected to `/login` page
- [ ] Cannot access `/dashboard` without logging in again
- [ ] Trying to access `/dashboard` redirects to `/login`

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

## 🧪 Test 3: Role-Based Authorization

### Test 3.1: Admin Access ✓
**Goal:** Admin can access all areas

**Steps:**
1. Login as admin (your account)
2. Try accessing:
   - `/dashboard` ✓
   - `/dashboard/admin/users` ✓
   - `/dashboard/incident-reporting` ✓
   - `/dashboard/document-management` ✓

**Expected Results:**
- [ ] All pages accessible
- [ ] No 403 errors
- [ ] All features visible and functional

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 3.2: Employee Access (Limited) ✓
**Goal:** Employee has restricted access

**Prerequisites:**
- Create test employee user (from Test 1.1)
- OR use admin panel to change a user's role to "Employee"

**Steps:**
1. Login as employee user
2. Try accessing:
   - `/dashboard` - Should work
   - `/dashboard/admin/users` - Should redirect
   - `/dashboard/incident-reporting` - Should work
   - `/dashboard/document-management` - Should work

**Expected Results:**
- [ ] Dashboard accessible
- [ ] Admin pages redirect to dashboard
- [ ] Can access modules with minRole: 'employee' or lower
- [ ] Cannot access admin-only features

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 3.3: Manager Access ✓
**Goal:** Manager can view/edit all incidents

**Prerequisites:**
- Create test manager user OR change role in admin panel

**Steps:**
1. Login as manager
2. Check access to:
   - Dashboard ✓
   - Incident reporting (should see ALL incidents, not just own)
   - Document management ✓
   - Admin users page (should redirect)

**Expected Results:**
- [ ] Can access dashboard
- [ ] Can see all incidents (if incident module shows data)
- [ ] Cannot access admin user management
- [ ] Has edit/delete permissions for all records

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 3.4: Viewer Access (Read-Only) ✓
**Goal:** Viewer has read-only access

**Prerequisites:**
- Create test viewer user OR change role in admin panel

**Steps:**
1. Login as viewer
2. Check:
   - Can view dashboard
   - Can view reports/data
   - Cannot create/edit/delete items
   - Cannot access admin panel

**Expected Results:**
- [ ] Read-only access to modules
- [ ] No create/edit/delete buttons visible
- [ ] Cannot access admin features
- [ ] Can view reports and data

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

## 🧪 Test 4: Route Protection

### Test 4.1: Unauthenticated Access ✓
**Goal:** Must login to access dashboard

**Steps:**
1. Logout completely
2. Manually try to access: `http://localhost:3001/dashboard`
3. Try: `http://localhost:3001/dashboard/admin/users`

**Expected Results:**
- [ ] Redirected to `/login`
- [ ] URL parameter includes `redirectTo` for return path
- [ ] After login, redirected back to intended page

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 4.2: Insufficient Role Access ✓
**Goal:** 403 or redirect when role insufficient

**Steps:**
1. Login as employee
2. Try accessing admin routes
3. Check browser console for errors

**Expected Results:**
- [ ] Redirected away from admin pages
- [ ] No 500 server errors
- [ ] Appropriate error handling

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 4.3: Middleware Protection ✓
**Goal:** Middleware catches all dashboard routes

**Steps:**
1. Logout
2. Try accessing any `/dashboard/*` route directly via URL
3. All should redirect to login

**Expected Results:**
- [ ] All dashboard routes protected
- [ ] Redirect preserves intended destination
- [ ] No flash of protected content

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

## 🧪 Test 5: Edge Cases

### Test 5.1: Session Expiry ✓
**Goal:** Expired session requires re-login

**Steps:**
1. Login normally
2. Manually clear cookies in browser DevTools
3. Try to navigate or refresh page

**Expected Results:**
- [ ] Redirected to login
- [ ] Session recognized as invalid
- [ ] Can login again successfully

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 5.2: Role Change While Logged In ✓
**Goal:** Role changes require re-login

**Steps:**
1. Login as test user
2. In another browser/tab, use admin panel to change that user's role
3. In original session, try accessing features of new role

**Expected Results:**
- [ ] Old permissions apply until logout/login
- [ ] After logout/login, new role takes effect
- [ ] No errors or crashes

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 5.3: Concurrent Sessions ✓
**Goal:** Multiple browser sessions work independently

**Steps:**
1. Login on Chrome as admin
2. Login on Firefox (or incognito) as different user
3. Both should work independently

**Expected Results:**
- [ ] Both sessions work simultaneously
- [ ] Each shows correct user data
- [ ] No session interference

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

### Test 5.4: Direct API Access ✓
**Goal:** Server actions validate auth

**Steps:**
1. Open browser DevTools Network tab
2. Perform an action (like changing a role)
3. Try to replay the request while logged out

**Expected Results:**
- [ ] Request fails without valid session
- [ ] Returns 401 or appropriate error
- [ ] No unauthorized data access

**Actual Results:**
```
[Record what happened]
```

**Status:** ⏳ Pending / ✅ Pass / ❌ Fail

---

## 📊 Test Summary

### Quick Stats
```
Total Tests: 20
Completed: ___
Passed: ___
Failed: ___
Skipped: ___
```

### Pass Rate
```
___% (___/20)
```

---

## 🐛 Issues Found

### Critical Issues (Block Production)
```
1. 
2. 
3. 
```

### Medium Issues (Should Fix)
```
1. 
2. 
3. 
```

### Minor Issues (Nice to Have)
```
1. 
2. 
3. 
```

---

## ✅ Next Steps

After completing all tests:

**If all pass:**
- [ ] Mark Section 8 as complete
- [ ] Move to Documentation (Section 9)
- [ ] Prepare for production deployment

**If issues found:**
- [ ] Document each issue
- [ ] Prioritize fixes
- [ ] Implement fixes
- [ ] Re-test

---

## 📝 Notes

```
[Add any observations, concerns, or suggestions here]
```

---

**Tester:** _______________  
**Start Time:** _______________  
**End Time:** _______________  
**Total Time:** _______________

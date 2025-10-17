# Test 2: Login & Logout Flows - Quick Guide

## 🎯 What We're Testing
Verifying that users can login with valid credentials, invalid logins show errors, and logout works correctly.

---

## 📋 Test 2.1: Valid Login (Test Employee)

### **In incognito window (or new incognito):**

1. **Navigate to login page:**
   ```
   http://localhost:3000/login
   ```

2. **Login with test user:**
   - Email: `test-employee@example.com`
   - Password: `password123`
   - Click "Login"

3. **Observe what happens:**
   - Any error messages? No
   - Where are you redirected to? /dashboard
   - Can you see the dashboard?
   - What does the user menu show?

### **Expected:**
- ✅ No error message
- ✅ Redirected to `/dashboard`
- ✅ User menu shows email
- ✅ User menu shows role (Employee)
- ✅ Dashboard loads successfully

### **Your Results:**
```
Error shown: Yes / No
Redirected to: __________
User menu email: __________
User menu role: __________
Dashboard accessible: Yes / No
Test PASSED: Yes / No
```

---

## 📋 Test 2.2: Invalid Password

### **Still in incognito window:**

1. **Logout first** (if logged in)
   - Click user menu → Logout

2. **Try to login with WRONG password:**
   - Email: `test-employee@example.com`
   - Password: `wrongpassword123` ← wrong!
   - Click "Login"

3. **What happens?**
   - Error message shown?
   - What does it say?
   - Are you redirected anywhere?

### **Expected:**
- ✅ Error message appears
- ✅ Says "Invalid credentials" or similar
- ✅ Stays on login page
- ✅ Does NOT redirect to dashboard

### **Your Results:**
```
Error message shown: Yes / No
Error text: __________
Stayed on login page: Yes / No
NOT redirected to dashboard: Yes / No
Test PASSED: Yes / No
```

---

## 📋 Test 2.3: Non-existent Email

### **Still on login page:**

1. **Try to login with email that doesn't exist:**
   - Email: `nonexistent@example.com`
   - Password: `anypassword`
   - Click "Login"

2. **What happens?**
   - Error message?
   - Same error as wrong password?

### **Expected:**
- ✅ Error message appears
- ✅ Says "Invalid credentials" or similar
- ✅ Does NOT reveal whether email exists (security)
- ✅ Stays on login page

### **Your Results:**
```
Error message shown: Yes / No
Error text: __________
Stays on login page: Yes / No
Test PASSED: Yes / No
```

---

## 📋 Test 2.4: Valid Admin Login

### **In your MAIN browser window (not incognito):**

1. **If not logged in, login as admin:**
   - Email: `seanrobertwright@gmail.com`
   - Password: [your password]
   - Click "Login"

2. **Verify:**
   - Redirected to dashboard? Yes
   - User menu shows "Administrator"? Yes
   - Can access admin panel? Yes

### **Expected:**
- ✅ Login successful
- ✅ Shows "Administrator" role
- ✅ Can access `/dashboard/admin/users`

### **Your Results:**
```
Login successful: Yes
Role shown: Administrator
Admin panel accessible: No
Test PASSED: Yes
```

---

## 📋 Test 2.5: Logout Employee

### **In incognito window:**

1. **Login as employee again** (if not logged in):
   - Email: `test-employee@example.com`
   - Password: `password123`

2. **Click user menu → Logout**

3. **Verify logout:**
   - Redirected to login page? Yes
   - Try accessing dashboard directly: `http://localhost:3000/dashboard`
   - Are you redirected to login? Yes

### **Expected:**
- ✅ Logout successful
- ✅ Redirected to `/login`
- ✅ Session cleared
- ✅ Accessing `/dashboard` redirects to `/login`
- ✅ Cannot access protected pages

### **Your Results:**
```
Logout redirected to login: Yes 
Dashboard protected after logout: Yes 
Session cleared: Yes 
Test PASSED: Yes 
```

---

## 📋 Test 2.6: Logout Admin

### **In main browser window:**

1. **Click user menu → Logout**

2. **Verify:**
   - Redirected to login?
   - Try accessing admin panel: `http://localhost:3000/dashboard/admin/users`
   - Redirected to login?

3. **Login again** (you'll need this for later tests)

### **Expected:**
- ✅ Admin logout works
- ✅ Admin routes now protected
- ✅ Can login again successfully

### **Your Results:**
```
Logout worked: Yes
Admin panel protected: Yes
Can login again: Yes
Test PASSED: Yes
```

---

## 📋 Test 2.7: Redirect After Login

### **Test the redirect feature:**

1. **Logout from main window**

2. **Try to access a specific page directly:**
   ```
   http://localhost:3000/dashboard/admin/users
   ```

3. **You should be redirected to login**
   - Check URL - does it have `?redirectTo=` parameter?

4. **Login with admin credentials**

5. **After login, where are you?**
   - Back at the admin users page you tried to access?
   - Or just at `/dashboard`?

### **Expected:**
- ✅ Redirected to login with URL parameter
- ✅ After login, redirected to originally requested page
- ✅ Seamless user experience

### **Your Results:**
```
URL had redirectTo parameter: Yes
Redirected to original page after login: Yes
Test PASSED: Yes
```

---

## ✅ Quick Summary

**Test 2 Status:**

| Test | Expected | Actual | Pass? |
|------|----------|--------|-------|
| 2.1: Valid login (employee) | Success | _____ | ✅ |
| 2.2: Invalid password | Error shown | _____ | ✅ |
| 2.3: Non-existent email | Error shown | _____ | ✅ |
| 2.4: Valid login (admin) | Success | _____ | ✅ |
| 2.5: Logout (employee) | Redirected | _____ | ✅ |
| 2.6: Logout (admin) | Redirected | _____ | ✅ |
| 2.7: Redirect after login | Original page | _____ | ✅ |

**Overall Test 2:** ✅ Pass / ☐ Fail

**Pass Rate:** __7/7

---

## 🐛 Any Issues?

```
[Note any problems, unexpected behavior, or bugs here]
```

---

## 📊 Progress So Far

- ✅ Test 1: Signup Flow (3/3 passed)
- ✅ Test 2: Login & Logout (7/7)
- ⏳ Test 3: Role-Based Authorization
- ⏳ Test 4: Route Protection  
- ⏳ Test 5: Edge Cases

---

## ➡️ Next Test

Once Test 2 is complete, we'll move to:
**Test 3: Role-Based Authorization**

---

**Fill in your results as you test each item!** 🧪

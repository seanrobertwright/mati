# Test 1: Signup Flow - Quick Guide

## 🎯 What We're Testing
Verifying that new user registration works and assigns the correct default role (employee).

---

## 📋 Test 1.1: Default Employee Role

### **Open TWO browser windows:**

**Window 1:** Keep your current admin session  
**Window 2:** Open **incognito/private mode** for testing

### **Steps for Incognito Window:**

1. **Navigate to signup page:**
   ```
   http://localhost:3001/signup
   ```

2. **Fill in the form:**
   - Email: `test-employee@example.com`
   - Password: `password123`
   - Confirm Password: `password123`

3. **Click "Sign Up"**

4. **Observe what happens:**
   - Do you see a success message? Yes
   - Are you redirected somewhere? No
   - Does it say to check email? Yes
   - Or are you logged in automatically? No

5. **If logged in automatically:**
   - Look at the user menu (top-right)
   - What role does it show?
   - Can you access the dashboard?

6. **Verify the role in admin panel:**
   - Go back to Window 1 (your admin session)
   - Open: `http://localhost:3001/dashboard/admin/users`
   - Look for `test-employee@example.com` in the list
   - What role badge does it show? Employee

### **Expected:**
- ✅ New user created successfully
- ✅ User has "Employee" role (NOT admin)
- ✅ User appears in admin user list with "Employee" badge

### **Your Results:**
```
Success message shown: Yes
Automatically logged in: No
Role shown in user menu: __employee________
Role in admin panel: Employee__________
Test PASSED: Yes
```

---

## 📋 Test 1.2: Duplicate Email (Quick)

### **In the same incognito window:**

1. **Try to sign up again** with the same email:
   - Email: `test-employee@example.com`
   - Password: `password123`

2. **Click "Sign Up"**

3. **What happens?**
   - Error message shown? yes
   - What does it say? User already exists

### **Expected:**
- ✅ Error message appears
- ✅ Says something like "User already registered" or "Email in use"
- ✅ Cannot create duplicate account

### **Your Results:**
```
Error message shown: Yes / No
Error text: USer already exists__________
Test PASSED: Yes
```

---

## 📋 Test 1.3: Logout Test User

### **In incognito window:**

1. **If you're logged in as test-employee:**
   - Click user menu (top-right)
   - Click "Logout"

2. **Verify:**
   - Redirected to login page?  Yes
   - Cannot access dashboard anymore? No

### **Expected:**
- ✅ Logged out successfully
- ✅ Redirected to /login
- ✅ Accessing /dashboard redirects to /login

### **Your Results:**
```
Logout worked: Yes
Redirected to login: Yes
Dashboard protected: Yes
Test PASSED: Yes
```

---

## ✅ Quick Summary

**Test 1 Status:**

| Test | Expected | Actual | Pass? |
|------|----------|--------|-------|
| 1.1: Default employee role | Employee | _____ | ✅ |
| 1.2: Duplicate email blocked | Error shown | _____ | ✅ |
| 1.3: Logout works | Redirected | _____ | ✅ |

**Overall Test 1:** ✅ Pass / ☐ Fail

---

## 🐛 Any Issues?

```
[Note any problems, unexpected behavior, or bugs here]
```

---

## ➡️ Next Test

Once Test 1 is complete, we'll move to:
**Test 2: Login & Logout Flows**

---

**Just follow the steps above and tell me the results!** 🧪

**Quick Answer Format:**
- "Test 1 passed - employee role assigned correctly"

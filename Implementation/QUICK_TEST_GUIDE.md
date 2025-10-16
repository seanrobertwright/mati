# Quick Test Guide - User Management UI

## 🚀 Quick Start

**URL:** http://localhost:3001/dashboard/admin/users

## ✅ Quick Smoke Test (5 minutes)

### 1. Page Loads
- Open URL above
- ✓ See "User Management" title
- ✓ See your admin account in table

### 2. Self-Protection Works
- ✓ Your row has "You" badge
- ✓ "Change Role" and "Delete" buttons are DISABLED for you

### 3. Create Test User (Optional)
- Open incognito tab: http://localhost:3001/signup
- Sign up as: test@example.com / password123
- Return to admin page, refresh
- ✓ New user appears with "Employee" role

### 4. Change Role
- Click "Change Role" for test user
- ✓ Dialog shows all 4 roles
- Click "Manager"
- ✓ Alert shows success
- ✓ Page reloads
- ✓ User now has "Manager" badge

### 5. Delete User  
- Click "Delete" for test user
- ✓ Confirmation dialog appears
- Click "Delete User"
- ✓ User removed from list

## ❓ Common Issues

**"Error: Missing SUPABASE_SERVICE_ROLE_KEY"**
- Already fixed! Service key is in .env.local
- If you see this, restart dev server

**"Access Denied" or redirect to dashboard**
- Your user might not be admin
- Check INITIAL_ADMIN_EMAIL in .env.local matches your email

**No users showing**
- This is normal if no one has signed up yet
- Create a test user via /signup page

## 📊 What to Look For

### ✅ Good Signs
- Table loads quickly
- Buttons are responsive
- Dialogs are clear
- Role badges have different colors
- Your account is protected (buttons disabled)

### ❌ Red Flags
- 500 errors in console
- Can change your own role (security issue!)
- Page doesn't reload after changes
- Wrong user gets modified
- Crashes or blank screens

## 🎯 Key Features to Verify

1. **View Users** - Table shows all registered users
2. **Role Badges** - Admin, Manager, Employee, Viewer clearly labeled
3. **Change Roles** - Admins can update any user's role
4. **Delete Users** - Admins can remove users (with confirmation)
5. **Self-Protection** - Can't modify own account
6. **Status Indicators** - Shows verified vs pending email

## 📝 Report Back

Just let me know:
- ✅ **"Everything works!"** - Great, we'll move on
- ⚠️ **"Found minor issues"** - Describe what you saw
- ❌ **"Critical bug"** - Tell me what broke

---

**Ready to test?** Open the page and run through the Quick Smoke Test above! 🧪

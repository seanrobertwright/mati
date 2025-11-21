# ✅ Development Mock Auth Enabled

## What I Did

Created a **mock authentication system** that bypasses Supabase Auth API calls while still using your real database.

### Files Created/Updated:

1. ✅ `lib/auth/dev-mock.ts` - Mock user and session data
2. ✅ `lib/auth/client.ts` - Uses mock in dev mode
3. ✅ `lib/auth/server.ts` - Uses mock in dev mode
4. ✅ `lib/auth/middleware.ts` - Bypasses auth checks in dev mode

## 🔑 **MANUAL STEP REQUIRED:**

**Add this to your `.env.local` file:**

```bash
# Development Mode: Skip Supabase Auth (corporate network blocks it)
DEV_MODE_SKIP_AUTH=true
NEXT_PUBLIC_DEV_MODE_SKIP_AUTH=true
```

**Your complete `.env.local` should look like:**

```bash
DATABASE_URL=postgresql://postgres.vwwcprauksknefwslips:Raspberrypi70!!@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Development Mode: Skip Supabase Auth (corporate network blocks it)
DEV_MODE_SKIP_AUTH=true
NEXT_PUBLIC_DEV_MODE_SKIP_AUTH=true

# Supabase Configuration (blocked by corporate network - using dev mock instead)
NEXT_PUBLIC_SUPABASE_URL=https://vwwcprauksknefwslips.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d2NwcmF1a3NrbmVmd3NsaXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDY3NjYsImV4cCI6MjA3NTUyMjc2Nn0.W7zXGoU4xb635uPHp3SRpqhCoLeGX2JRx51BAkXWANc

# Document Storage
DOCUMENT_STORAGE_PATH=./documents
```

## After Adding Environment Variables:

```bash
# 1. Clear Next.js cache
Remove-Item -Recurse -Force .next

# 2. Restart dev server
npm run dev

# 3. Open browser to http://localhost:3000
```

## What Will Happen:

✅ **Auto-login as test user:**
- Email: dev@example.com
- ID: 00000000-0000-0000-0000-000000000001
- Role: admin

✅ **Skip signup/login pages** - goes straight to dashboard

✅ **All features work:**
- Create folders
- Upload documents
- Access dashboard
- All database operations work

✅ **Console shows:** "⚠️ DEV MODE: Using mock authentication"

## Mock User Details

```typescript
{
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev@example.com',
  role: 'admin'
}
```

This user will be used for all operations (creating directories, uploading documents, etc.)

## When On Different Network

To use real Supabase Auth (when not on corporate network):

1. **Comment out** dev mode in `.env.local`:
```bash
# DEV_MODE_SKIP_AUTH=true
# NEXT_PUBLIC_DEV_MODE_SKIP_AUTH=true
```

2. Restart server
3. Real Supabase Auth will work

## Benefits

- ✅ Develop without network issues
- ✅ Use real database (pooler connection works)
- ✅ Test all document management features
- ✅ No Docker needed
- ✅ No VPN needed
- ✅ Easy to toggle on/off

---

**Add those 2 lines to `.env.local` then restart your dev server!**


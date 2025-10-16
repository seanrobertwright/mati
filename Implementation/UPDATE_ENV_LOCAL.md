# 🔧 Update .env.local for Local Supabase

## ✅ Local Supabase is Running!

Your local Supabase is now running with these services:
- 🗄️ Database: http://127.0.0.1:54322
- 🔑 Auth API: http://127.0.0.1:54321
- 🎨 Studio UI: http://127.0.0.1:54323
- 📧 Email UI: http://127.0.0.1:54324

## 📝 MANUAL STEP: Update .env.local

**Replace the entire content of your `.env.local` file with this:**

```bash
# Local Supabase Configuration (no network needed!)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Local Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Supabase Service Role Key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Document Storage
DOCUMENT_STORAGE_PATH=./documents

# Optional: Initial admin email
INITIAL_ADMIN_EMAIL=admin@example.com
```

**IMPORTANT:** These are the **standard local Supabase credentials** - same for everyone running locally. This is safe because it's only accessible on your machine.

## After Updating .env.local

Run these commands:

```powershell
# 1. Push your database schema to local Supabase
npm run db:push

# 2. Clear Next.js cache
Remove-Item -Recurse -Force .next

# 3. Start dev server
npm run dev
```

## What Will Work

✅ **Signup/Login** - Works locally, no network calls
✅ **Database** - PostgreSQL running on your machine
✅ **Auth** - Full Supabase Auth running locally
✅ **Email testing** - Mailpit catches all emails at http://localhost:54324
✅ **Database UI** - Supabase Studio at http://localhost:54323
✅ **Document management** - All features work

## Accessing Services

**Supabase Studio (Database UI):**
- URL: http://127.0.0.1:54323
- View tables, run queries, manage data
- No login required

**Mailpit (Email Testing):**
- URL: http://127.0.0.1:54324
- See all signup confirmation emails
- No actual emails sent

**Your App:**
- URL: http://localhost:3000
- Full functionality
- No corporate network issues!

## Stop/Start Supabase

**When done developing:**
```powershell
supabase stop
```

**Start again:**
```powershell
supabase start
```

---

**Update your `.env.local` file now, then run the commands above!** 🚀


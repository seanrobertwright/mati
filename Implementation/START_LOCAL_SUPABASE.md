# Start Local Supabase with Docker

## Step 1: Start Docker Desktop

1. **Open Docker Desktop** from Start Menu
2. **Wait for it to fully start** (icon in system tray turns green)
3. You should see "Docker Desktop is running"

## Step 2: Restart PowerShell

**Close this PowerShell terminal and open a NEW one** (Docker adds itself to PATH on first run)

Or refresh PATH in current terminal:
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

## Step 3: Verify Docker Works

```powershell
docker --version
docker ps
```

Should show Docker version and running containers.

## Step 4: Start Local Supabase

```powershell
cd C:\test\mati
supabase start
```

**This will:**
- Download Supabase Docker images (~2-3 GB, one time)
- Start PostgreSQL, Auth, API, and other services
- Take 2-5 minutes first time
- Show local credentials when ready

**Expected output:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbG...
service_role key: eyJhbG...
```

## Step 5: Update .env.local

**Replace Supabase settings with local URLs:**

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Local Supabase (no network needed!)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<copy-anon-key-from-supabase-start-output>

# Remove dev mock mode (no longer needed)
# DEV_MODE_SKIP_AUTH=true
# NEXT_PUBLIC_DEV_MODE_SKIP_AUTH=true

# Document Storage
DOCUMENT_STORAGE_PATH=./documents
```

## Step 6: Apply Database Migrations

```powershell
# Push your schema to local Supabase
npm run db:push

# Or use Supabase migrations
supabase db push
```

## Step 7: Restart Dev Server

```powershell
# Clear cache
Remove-Item -Recurse -Force .next

# Start server
npm run dev
```

## Step 8: Test!

1. Visit http://localhost:3000
2. Try signup - should work now (no network calls!)
3. Everything runs locally

## Supabase Studio

Access local database UI at: **http://localhost:54323**
- See all tables
- Query data
- Manage auth users
- No login needed for local studio

## Stop Supabase

When done developing:
```powershell
supabase stop
```

## Start Again

Next time:
```powershell
supabase start
```

Much faster (images already downloaded).

---

**Next Steps:**
1. Open Docker Desktop
2. Wait for it to start
3. Close and reopen PowerShell (or refresh PATH)
4. Run `supabase start`
5. Copy anon key to .env.local
6. Restart dev server

Let me know when Docker Desktop is running and I'll help with the next steps!


# Setup Local Supabase (Windows)

## Method 1: Using Scoop (Recommended)

### Install Scoop (if not installed)
```powershell
# Run in PowerShell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Install Supabase CLI
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Verify Installation
```powershell
supabase --version
```

## Method 2: Direct Download (Alternative)

Download from: https://github.com/supabase/cli/releases

1. Download `supabase_windows_amd64.zip`
2. Extract to a folder (e.g., `C:\supabase`)
3. Add to PATH or run directly

## Method 3: Use Docker (If Docker Installed)

If you have Docker Desktop:

```bash
# Pull Supabase image
docker pull supabase/postgres

# Create docker-compose.yml in project root
# (I can create this for you)
```

## Method 4: Simple Alternative - Use Local PostgreSQL Only

**Skip Supabase entirely**, just use local PostgreSQL:

### Install PostgreSQL
- Download: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember the password you set

### Update .env.local
```bash
# Comment out Supabase
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Add local PostgreSQL
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mati
```

### Update Auth System
We'd need to replace Supabase Auth with a simpler solution like:
- NextAuth.js
- Simple JWT auth
- Or bypass auth temporarily

## Recommendation

**Easiest path forward:**

1. **Install Scoop** (package manager for Windows)
2. **Install Supabase CLI via Scoop**
3. **Run local Supabase**

**OR**

**Connect via mobile hotspot** when developing (simpler for now)

---

Which method would you prefer?
1. Install Scoop + Supabase CLI
2. Use mobile hotspot for now
3. Switch to local PostgreSQL without Supabase Auth
4. Use Docker (if you have it)


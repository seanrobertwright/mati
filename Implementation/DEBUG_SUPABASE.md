# Supabase Connection Troubleshooting

## Error Details
- **Error:** "Failed to fetch" during signup
- **URL:** https://vwwcprauksknefwslips.supabase.co
- **Status:** URL is reachable (403 on direct access is normal)

## Possible Causes

### 1. Supabase Project Paused
- Free tier projects pause after inactivity
- **Solution:** Visit https://supabase.com/dashboard and resume the project

### 2. Email Confirmation Disabled
- Supabase requires email confirmation by default
- **Solution:** Enable email confirmation or use "Disable email confirmations" in settings

### 3. CORS or Network Issue
- Browser might be blocking the request
- **Check:** Open browser DevTools → Network tab → Look for failed requests

### 4. Invalid Environment Variables
- Variables might not be loaded correctly
- **Current values:**
  - URL: `https://vwwcprauksknefwslips.supabase.co`
  - Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (present)

## Recommended Fixes

### Option 1: Check Supabase Dashboard
1. Visit https://supabase.com/dashboard/project/vwwcprauksknefwslips
2. Check if project is **paused** → Click "Resume" if paused
3. Go to Authentication → Providers → Enable Email
4. Go to Authentication → Settings → Disable "Enable email confirmations" (for testing)

### Option 2: Verify Environment Variables
Run in terminal:
```bash
npm run dev
```

Check console output shows:
- ✅ NEXT_PUBLIC_SUPABASE_URL is defined
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is defined

### Option 3: Test Supabase Connection Directly
Create a test file to verify Supabase is working:

```typescript
// test-supabase.ts
import { createClient } from '@/lib/auth/client';

const supabase = createClient();
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase client created:', !!supabase);
```

### Option 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try signup again
4. Look for failed request to Supabase
5. Check the error details

## Quick Fix: Disable Email Confirmation

For development/testing, disable email confirmation in Supabase:

1. Go to Supabase Dashboard
2. Authentication → Settings
3. Find "Enable email confirmations"
4. Toggle OFF (or set to "Disabled")
5. Save changes
6. Try signup again

## Alternative: Use Local Supabase

If cloud Supabase continues to have issues:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Update .env.local with local URLs
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key-from-console>
```


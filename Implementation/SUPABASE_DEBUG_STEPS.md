# Supabase "Failed to fetch" Debug Steps

## Issue
Getting "Failed to fetch" error during signup, but Supabase project is working fine.

## Most Likely Fix: Restart Dev Server

**Reason:** Environment variables in `.env.local` are only loaded when Next.js dev server starts.

**Steps:**
1. Stop the dev server (Ctrl+C in terminal)
2. Restart it: `npm run dev`
3. Hard refresh browser: `Ctrl + Shift + R`
4. Try signup again

## Verify Environment Variables Are Loading

**Test Page Created:** `/test-env`

Visit: http://localhost:3000/test-env

You should see:
- ✅ NEXT_PUBLIC_SUPABASE_URL: https://vwwcprauksknefwslips.supabase.co
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ✅ DEFINED

If you see ❌ NOT DEFINED, the dev server isn't loading `.env.local`

## Check Browser DevTools

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors like:
   - "undefined is not a function"
   - "Cannot read property 'auth' of undefined"
   - "Invalid API key"
4. Go to **Network** tab
5. Try signup again
6. Look for failed request to `supabase.co/auth`
7. Click on the failed request to see details

## Common Causes

### ❌ Env vars not loaded
**Fix:** Restart dev server

### ❌ Browser using old cached code
**Fix:** Hard refresh (Ctrl+Shift+R)

### ❌ CORS policy blocking request
**Check:** Look for CORS error in browser console
**Fix:** Usually not an issue with Supabase, but check Supabase dashboard → Authentication → Settings → Site URL

### ❌ Supabase client not initialized properly
**Check:** Add console.log in `lib/auth/client.ts`:
```typescript
export function createClient() {
  console.log('Creating Supabase client with:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## Quick Verification Script

Add this temporarily to `components/auth/SignupForm.tsx` before the signup call:

```typescript
// Add before line 42
console.log('Supabase config:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseClient: !!supabase
});
```

If you see `undefined` for URL or `false` for hasKey → dev server issue.

## Nuclear Option: Complete Reset

If nothing else works:

```bash
# 1. Stop dev server
# 2. Clear Next.js cache
rm -rf .next

# 3. Reinstall dependencies (rarely needed)
rm -rf node_modules package-lock.json
npm install

# 4. Restart dev server
npm run dev
```


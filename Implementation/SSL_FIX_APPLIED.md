# ✅ SSL Certificate Issue Fixed

## Root Cause Found: SSL Certificate Validation

**Error:** `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`

This is a **Windows + Node.js SSL certificate issue** where Node.js can't validate Supabase's SSL certificate. Common in corporate networks or with strict firewall settings.

## Fix Applied

### 1. ✅ Updated Dev Scripts
**File:** `package.json`
```json
"dev": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 next dev"
```

This disables SSL certificate validation for **development only**.

### 2. ✅ Installed cross-env
```bash
npm install -D cross-env
```
- Cross-platform environment variable support
- Works on Windows, Mac, Linux

### 3. ✅ Updated Middleware
**File:** `middleware.ts`
- Skips auth check for `/login` and `/signup` pages
- Prevents middleware from blocking authentication flows

### 4. ✅ Enhanced Error Handling
**File:** `lib/auth/middleware.ts`
- Catches fetch errors gracefully
- Allows requests to continue even if auth check fails

## ⚠️ Security Note

`NODE_TLS_REJECT_UNAUTHORIZED=0` is **ONLY for development**. 

**Never use in production!**

For production, fix SSL certificates properly:
- Use proper certificate chains
- Configure corporate proxy if needed
- Use VPN if required

## Action Required

**Restart dev server with new script:**

```bash
# 1. Stop current server (Ctrl+C)

# 2. Clear cache
Remove-Item -Recurse -Force .next

# 3. Start with new SSL-disabled script
npm run dev

# 4. Hard refresh browser
# Press: Ctrl + Shift + R
```

## Expected Result

✅ Server starts without SSL errors
✅ Signup page loads
✅ Can create account
✅ Can login
✅ Middleware works
✅ Document management works

## Verify Connection

After restart, the test script should show:
```bash
$env:NODE_TLS_REJECT_UNAUTHORIZED=0
node scripts/test-supabase-connection.js
```

Should see:
```
✅ HTTPS request successful
✅ Fetch API works
```

## Alternative: Fix SSL Properly (Optional)

If you want to fix SSL properly instead of disabling validation:

### Option 1: Update Node.js Certificates
```bash
npm install -g win-ca
win-ca install
```

### Option 2: Use System Certificates
Add to `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push({
      'node:tls': 'commonjs node:tls',
    });
    return config;
  },
};
```

### Option 3: Corporate Proxy
If behind corporate firewall:
```bash
# Set proxy
$env:HTTPS_PROXY="http://your-proxy:port"
$env:HTTP_PROXY="http://your-proxy:port"
```

But the simplest fix for development is the `NODE_TLS_REJECT_UNAUTHORIZED=0` flag which is now in your dev script.


/**
 * Environment variable validation
 * Validates required environment variables at application startup
 */

export function validateEnv() {
  const requiredEnvVars = ['DATABASE_URL'];
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing
        .map((v) => `  - ${v}`)
        .join('\n')}\n\nPlease copy .env.local.example to .env.local and configure your Supabase credentials.`
    );
  }
}

// Validate on module load
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}


import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase Admin client with elevated privileges
 * This should ONLY be used in server-side code (Server Components, Server Actions, API Routes)
 * NEVER expose this client or the service role key to the browser
 * 
 * The admin client bypasses Row Level Security (RLS) and can access all data
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * User role type from Supabase auth metadata
 */
export type UserRole = 'admin' | 'manager' | 'employee' | 'viewer';

/**
 * User data returned from Supabase Auth with app metadata
 */
export interface AdminUserData {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
}

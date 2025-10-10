import { createBrowserClient } from '@supabase/ssr';
import { isDevMockAuthEnabled, getDevMockUser, getDevMockSession } from './dev-mock';

/**
 * Create a Supabase client for use in Client Components
 * This client runs in the browser and uses the anon key
 * 
 * In dev mode with DEV_MODE_SKIP_AUTH=true, returns a mock client
 */
export function createClient() {
  // Dev mode: Return mock client
  if (isDevMockAuthEnabled()) {
    console.warn('⚠️ DEV MODE: Using mock authentication');
    return createMockClient();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file:\n' +
      `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗ MISSING'}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✓' : '✗ MISSING'}`
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

/**
 * Create a mock Supabase client for development
 */
function createMockClient(): any {
  const mockUser = getDevMockUser();
  const mockSession = getDevMockSession();

  return {
    auth: {
      signUp: async () => ({ data: { user: mockUser, session: mockSession }, error: null }),
      signInWithPassword: async () => ({ data: { user: mockUser, session: mockSession }, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      getSession: async () => ({ data: { session: mockSession }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
    }),
  };
}


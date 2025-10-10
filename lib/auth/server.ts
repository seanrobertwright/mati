import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isDevMockAuthEnabled, getDevMockUser, getDevMockSession } from './dev-mock';

/**
 * Create a Supabase client for use in Server Components and Server Actions
 * This client runs on the server and has access to cookies
 * 
 * In dev mode with DEV_MODE_SKIP_AUTH=true, returns a mock client
 */
export async function createClient() {
  // Dev mode: Return mock client
  if (isDevMockAuthEnabled()) {
    console.warn('⚠️ DEV MODE: Using mock authentication (server)');
    return createMockServerClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a mock server Supabase client for development
 */
function createMockServerClient(): any {
  const mockUser = getDevMockUser();
  const mockSession = getDevMockSession();

  return {
    auth: {
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      getSession: async () => ({ data: { session: mockSession }, error: null }),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
    }),
  };
}


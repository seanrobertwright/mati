/**
 * Development Mock Auth
 * 
 * Provides a mock authentication layer for development when Supabase Auth API is blocked.
 * Returns a consistent test user without making external API calls.
 * 
 * USAGE: Only enable when DEV_MODE_SKIP_AUTH=true in environment
 */

import type { User } from '@supabase/supabase-js';

export const DEV_MOCK_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {
    provider: 'email',
    providers: ['email'],
  },
  user_metadata: {
    role: 'admin', // Admin for testing
    email: 'dev@example.com',
  },
};

/**
 * Check if dev mode auth bypass is enabled
 */
export function isDevMockAuthEnabled(): boolean {
  return process.env.DEV_MODE_SKIP_AUTH === 'true';
}

/**
 * Get mock user for development
 */
export function getDevMockUser(): User {
  return DEV_MOCK_USER;
}

/**
 * Mock session for development
 */
export function getDevMockSession() {
  return {
    access_token: 'dev-mock-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'dev-mock-refresh',
    user: DEV_MOCK_USER,
  };
}


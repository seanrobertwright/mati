/**
 * Vitest setup file
 * Runs before all tests
 */

import { beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables
process.env.DOCUMENT_STORAGE_PATH = '/tmp/test-documents';
process.env.NODE_ENV = 'test';

// Setup before all tests
beforeAll(() => {
  // Initialize test database
  // Setup test file storage
  console.log('Setting up test environment...');
});

// Cleanup after all tests
afterAll(() => {
  // Cleanup test database
  // Remove test files
  console.log('Cleaning up test environment...');
});

// Reset mocks after each test
afterEach(() => {
  // Reset all mocks
});

// Mock Next.js modules that are not available in test environment
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));


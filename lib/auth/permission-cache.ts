/**
 * Simple in-memory cache for document permissions
 * Improves performance by reducing database queries for frequently accessed documents
 */

import type { DocumentRole } from './permissions';

interface CachedPermission {
  role: DocumentRole | null;
  timestamp: number;
}

interface CacheEntry {
  documentPermissions: Map<string, CachedPermission>; // userId -> permission
  directoryPermissions: Map<string, CachedPermission>; // userId -> permission
}

// Cache storage: resourceId -> CacheEntry
const permissionCache = new Map<string, CacheEntry>();

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Get cached document permission
 */
export function getCachedDocumentPermission(
  documentId: string,
  userId: string
): DocumentRole | null | undefined {
  const entry = permissionCache.get(documentId);
  if (!entry) return undefined;

  const cached = entry.documentPermissions.get(userId);
  if (!cached) return undefined;

  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    entry.documentPermissions.delete(userId);
    return undefined;
  }

  return cached.role;
}

/**
 * Set cached document permission
 */
export function setCachedDocumentPermission(
  documentId: string,
  userId: string,
  role: DocumentRole | null
): void {
  let entry = permissionCache.get(documentId);
  if (!entry) {
    entry = {
      documentPermissions: new Map(),
      directoryPermissions: new Map(),
    };
    permissionCache.set(documentId, entry);
  }

  entry.documentPermissions.set(userId, {
    role,
    timestamp: Date.now(),
  });
}

/**
 * Get cached directory permission
 */
export function getCachedDirectoryPermission(
  directoryId: string,
  userId: string
): DocumentRole | null | undefined {
  const entry = permissionCache.get(`dir:${directoryId}`);
  if (!entry) return undefined;

  const cached = entry.directoryPermissions.get(userId);
  if (!cached) return undefined;

  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    entry.directoryPermissions.delete(userId);
    return undefined;
  }

  return cached.role;
}

/**
 * Set cached directory permission
 */
export function setCachedDirectoryPermission(
  directoryId: string,
  userId: string,
  role: DocumentRole | null
): void {
  const key = `dir:${directoryId}`;
  let entry = permissionCache.get(key);
  if (!entry) {
    entry = {
      documentPermissions: new Map(),
      directoryPermissions: new Map(),
    };
    permissionCache.set(key, entry);
  }

  entry.directoryPermissions.set(userId, {
    role,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate document permission cache
 */
export function invalidateDocumentPermissionCache(documentId: string, userId?: string): void {
  if (userId) {
    // Invalidate specific user's permission
    const entry = permissionCache.get(documentId);
    if (entry) {
      entry.documentPermissions.delete(userId);
    }
  } else {
    // Invalidate all permissions for this document
    permissionCache.delete(documentId);
  }
}

/**
 * Invalidate directory permission cache
 */
export function invalidateDirectoryPermissionCache(directoryId: string, userId?: string): void {
  const key = `dir:${directoryId}`;
  if (userId) {
    // Invalidate specific user's permission
    const entry = permissionCache.get(key);
    if (entry) {
      entry.directoryPermissions.delete(userId);
    }
  } else {
    // Invalidate all permissions for this directory
    permissionCache.delete(key);
  }
}

/**
 * Invalidate all documents in a directory
 * Call this when directory permissions change
 */
export function invalidateDirectoryDocumentsCache(directoryId: string): void {
  // Invalidate the directory itself
  invalidateDirectoryPermissionCache(directoryId);

  // We can't easily track which documents are in a directory,
  // so we clear the entire cache when directory permissions change
  // This is conservative but safe
  clearPermissionCache();
}

/**
 * Clear all permission cache
 */
export function clearPermissionCache(): void {
  permissionCache.clear();
}

/**
 * Clean up expired cache entries
 * Should be called periodically (e.g., every 10 minutes)
 */
export function cleanupExpiredCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entry] of permissionCache.entries()) {
    // Clean up expired document permissions
    for (const [userId, cached] of entry.documentPermissions.entries()) {
      if (now - cached.timestamp > CACHE_TTL) {
        entry.documentPermissions.delete(userId);
      }
    }

    // Clean up expired directory permissions
    for (const [userId, cached] of entry.directoryPermissions.entries()) {
      if (now - cached.timestamp > CACHE_TTL) {
        entry.directoryPermissions.delete(userId);
      }
    }

    // If entry is empty, mark for deletion
    if (entry.documentPermissions.size === 0 && entry.directoryPermissions.size === 0) {
      keysToDelete.push(key);
    }
  }

  // Delete empty entries
  for (const key of keysToDelete) {
    permissionCache.delete(key);
  }
}

/**
 * Get cache statistics
 */
export function getPermissionCacheStats(): {
  totalEntries: number;
  totalPermissions: number;
  memoryEstimate: string;
} {
  let totalPermissions = 0;

  for (const entry of permissionCache.values()) {
    totalPermissions += entry.documentPermissions.size + entry.directoryPermissions.size;
  }

  // Rough memory estimate (each entry ~100 bytes)
  const memoryBytes = totalPermissions * 100;
  const memoryKB = (memoryBytes / 1024).toFixed(2);

  return {
    totalEntries: permissionCache.size,
    totalPermissions,
    memoryEstimate: `${memoryKB} KB`,
  };
}

// Set up automatic cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredCache, 10 * 60 * 1000);
}


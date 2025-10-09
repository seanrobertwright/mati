import { db } from '../client';
import { directoryPermissions } from '../schema';
import { eq, and } from 'drizzle-orm';
import type { User } from '@supabase/supabase-js';
import type { DocumentRole } from '@/lib/auth/permissions';
import {
  invalidateDirectoryPermissionCache,
  invalidateDirectoryDocumentsCache,
} from '@/lib/auth/permission-cache';

export type DirectoryPermission = typeof directoryPermissions.$inferSelect;

/**
 * Grant directory permission
 */
export async function grantDirectoryPermission(
  directoryId: string,
  userId: string,
  role: DocumentRole,
  grantedBy: User
): Promise<DirectoryPermission> {
  try {
    // Check if permission already exists
    const existing = await db
      .select()
      .from(directoryPermissions)
      .where(
        and(
          eq(directoryPermissions.directoryId, directoryId),
          eq(directoryPermissions.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing permission
      const [updated] = await db
        .update(directoryPermissions)
        .set({
          role,
          grantedBy: grantedBy.id,
          grantedAt: new Date(),
        })
        .where(eq(directoryPermissions.id, existing[0].id))
        .returning();

      // Invalidate cache for directory and all its documents
      invalidateDirectoryDocumentsCache(directoryId);

      return updated;
    }

    // Create new permission
    const [permission] = await db
      .insert(directoryPermissions)
      .values({
        directoryId,
        userId,
        role,
        grantedBy: grantedBy.id,
      })
      .returning();

    // Invalidate cache for directory and all its documents
    invalidateDirectoryDocumentsCache(directoryId);

    return permission;
  } catch (error) {
    console.error('Error granting directory permission:', error);
    throw new Error('Failed to grant directory permission');
  }
}

/**
 * Revoke directory permission
 */
export async function revokeDirectoryPermission(
  directoryId: string,
  userId: string
): Promise<void> {
  try {
    await db
      .delete(directoryPermissions)
      .where(
        and(
          eq(directoryPermissions.directoryId, directoryId),
          eq(directoryPermissions.userId, userId)
        )
      );

    // Invalidate cache for directory and all its documents
    invalidateDirectoryDocumentsCache(directoryId);
  } catch (error) {
    console.error('Error revoking directory permission:', error);
    throw new Error('Failed to revoke directory permission');
  }
}

/**
 * Get user's permission for a directory
 */
export async function getUserDirectoryPermission(
  directoryId: string,
  userId: string
): Promise<DirectoryPermission | null> {
  try {
    const [permission] = await db
      .select()
      .from(directoryPermissions)
      .where(
        and(
          eq(directoryPermissions.directoryId, directoryId),
          eq(directoryPermissions.userId, userId)
        )
      )
      .limit(1);

    return permission || null;
  } catch (error) {
    console.error('Error fetching user directory permission:', error);
    throw new Error('Failed to fetch user directory permission');
  }
}

/**
 * Get all permissions for a directory
 */
export async function getDirectoryPermissions(directoryId: string): Promise<DirectoryPermission[]> {
  try {
    return await db
      .select()
      .from(directoryPermissions)
      .where(eq(directoryPermissions.directoryId, directoryId));
  } catch (error) {
    console.error('Error fetching directory permissions:', error);
    throw new Error('Failed to fetch directory permissions');
  }
}

/**
 * Get inherited permission from parent directories
 * Traverses up the directory tree to find the highest permission level
 */
export async function getInheritedDirectoryPermission(
  directoryId: string | null,
  userId: string
): Promise<DirectoryPermission | null> {
  if (!directoryId) return null;

  try {
    // First check direct permission on this directory
    const directPermission = await getUserDirectoryPermission(directoryId, userId);
    if (directPermission) {
      return directPermission;
    }

    // Get the directory to find its parent
    const [directory] = await db.query.directories.findMany({
      where: (directories, { eq }) => eq(directories.id, directoryId),
      limit: 1,
    });

    if (!directory || !directory.parentId) {
      return null;
    }

    // Recursively check parent directories
    return getInheritedDirectoryPermission(directory.parentId, userId);
  } catch (error) {
    console.error('Error getting inherited directory permission:', error);
    return null;
  }
}


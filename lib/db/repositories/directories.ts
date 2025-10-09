import { db } from '../client';
import { directories } from '../schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import type { User } from '@supabase/supabase-js';

export type Directory = typeof directories.$inferSelect;
export type NewDirectory = typeof directories.$inferInsert;

export interface DirectoryWithChildren extends Directory {
  children?: DirectoryWithChildren[];
  documentCount?: number;
}

/**
 * Create a new directory
 */
export async function createDirectory(
  data: Omit<NewDirectory, 'id' | 'createdAt' | 'updatedAt'>,
  user: User
): Promise<Directory> {
  try {
    const [directory] = await db
      .insert(directories)
      .values({
        ...data,
        createdBy: user.id,
      })
      .returning();

    return directory;
  } catch (error) {
    console.error('Error creating directory:', error);
    throw new Error('Failed to create directory');
  }
}

/**
 * Get directory by ID
 */
export async function getDirectoryById(id: string): Promise<Directory | null> {
  try {
    const [directory] = await db
      .select()
      .from(directories)
      .where(eq(directories.id, id))
      .limit(1);

    return directory || null;
  } catch (error) {
    console.error('Error fetching directory:', error);
    throw new Error('Failed to fetch directory');
  }
}

/**
 * Get all root directories (no parent)
 */
export async function getRootDirectories(): Promise<Directory[]> {
  try {
    return await db
      .select()
      .from(directories)
      .where(isNull(directories.parentId))
      .orderBy(directories.name);
  } catch (error) {
    console.error('Error fetching root directories:', error);
    throw new Error('Failed to fetch root directories');
  }
}

/**
 * Get subdirectories of a parent directory
 */
export async function getSubdirectories(parentId: string): Promise<Directory[]> {
  try {
    return await db
      .select()
      .from(directories)
      .where(eq(directories.parentId, parentId))
      .orderBy(directories.name);
  } catch (error) {
    console.error('Error fetching subdirectories:', error);
    throw new Error('Failed to fetch subdirectories');
  }
}

/**
 * Get complete directory tree from a root
 * Uses recursive CTE to fetch all descendants
 */
export async function getDirectoryTree(rootId?: string): Promise<DirectoryWithChildren[]> {
  try {
    const query = rootId
      ? sql`
          WITH RECURSIVE directory_tree AS (
            SELECT *, 0 as depth
            FROM ${directories}
            WHERE ${directories.id} = ${rootId}
            
            UNION ALL
            
            SELECT d.*, dt.depth + 1
            FROM ${directories} d
            INNER JOIN directory_tree dt ON d.parent_id = dt.id
          )
          SELECT * FROM directory_tree
          ORDER BY depth, name
        `
      : sql`
          WITH RECURSIVE directory_tree AS (
            SELECT *, 0 as depth
            FROM ${directories}
            WHERE parent_id IS NULL
            
            UNION ALL
            
            SELECT d.*, dt.depth + 1
            FROM ${directories} d
            INNER JOIN directory_tree dt ON d.parent_id = dt.id
          )
          SELECT * FROM directory_tree
          ORDER BY depth, name
        `;

    const result = await db.execute(query);
    return result.rows as DirectoryWithChildren[];
  } catch (error) {
    console.error('Error fetching directory tree:', error);
    throw new Error('Failed to fetch directory tree');
  }
}

/**
 * Update directory
 */
export async function updateDirectory(
  id: string,
  data: Partial<Pick<Directory, 'name' | 'parentId'>>
): Promise<Directory> {
  try {
    // Validate no circular reference if changing parent
    if (data.parentId) {
      const isCircular = await checkCircularReference(id, data.parentId);
      if (isCircular) {
        throw new Error('Cannot move directory: would create circular reference');
      }
    }

    const [updated] = await db
      .update(directories)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(directories.id, id))
      .returning();

    if (!updated) {
      throw new Error('Directory not found');
    }

    return updated;
  } catch (error) {
    console.error('Error updating directory:', error);
    throw error instanceof Error ? error : new Error('Failed to update directory');
  }
}

/**
 * Delete directory (will cascade to documents if configured)
 */
export async function deleteDirectory(id: string): Promise<void> {
  try {
    await db.delete(directories).where(eq(directories.id, id));
  } catch (error) {
    console.error('Error deleting directory:', error);
    throw new Error('Failed to delete directory');
  }
}

/**
 * Check if moving a directory would create a circular reference
 */
async function checkCircularReference(directoryId: string, newParentId: string): Promise<boolean> {
  try {
    // Check if newParentId is a descendant of directoryId
    const query = sql`
      WITH RECURSIVE descendants AS (
        SELECT id
        FROM ${directories}
        WHERE id = ${directoryId}
        
        UNION ALL
        
        SELECT d.id
        FROM ${directories} d
        INNER JOIN descendants ON d.parent_id = descendants.id
      )
      SELECT EXISTS(
        SELECT 1 FROM descendants WHERE id = ${newParentId}
      ) as is_circular
    `;

    const result = await db.execute(query);
    return (result.rows[0] as any).is_circular;
  } catch (error) {
    console.error('Error checking circular reference:', error);
    return true; // Fail safe - prevent move if we can't verify
  }
}

/**
 * Get directory path (breadcrumb trail)
 */
export async function getDirectoryPath(directoryId: string): Promise<Directory[]> {
  try {
    const query = sql`
      WITH RECURSIVE directory_path AS (
        SELECT *, 0 as depth
        FROM ${directories}
        WHERE id = ${directoryId}
        
        UNION ALL
        
        SELECT d.*, dp.depth + 1
        FROM ${directories} d
        INNER JOIN directory_path dp ON d.id = dp.parent_id
      )
      SELECT * FROM directory_path
      ORDER BY depth DESC
    `;

    const result = await db.execute(query);
    return result.rows as Directory[];
  } catch (error) {
    console.error('Error fetching directory path:', error);
    throw new Error('Failed to fetch directory path');
  }
}


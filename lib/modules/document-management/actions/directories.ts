'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth/server';
import {
  createDirectory as dbCreateDirectory,
  updateDirectory as dbUpdateDirectory,
  deleteDirectory as dbDeleteDirectory,
  getDirectoryById,
  listDirectories,
} from '@/lib/db/repositories/directories';
import { createAuditLog } from '@/lib/db/repositories/audit-log';

/**
 * Server action to create a new directory
 */
export async function createDirectory(data: {
  name: string;
  parentId?: string | null;
}) {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Validate directory name
    if (!data.name || data.name.trim().length === 0) {
      return { error: 'Directory name is required' };
    }

    if (data.name.length > 255) {
      return { error: 'Directory name too long' };
    }

    // TODO: Implement actual database operation
    // const directory = await dbCreateDirectory({
    //   name: data.name.trim(),
    //   parentId: data.parentId || null,
    //   createdBy: user.id,
    // });

    // await createAuditLog({
    //   documentId: null,
    //   userId: user.id,
    //   action: 'directory_created',
    //   details: `Created directory: ${data.name}`,
    // });

    revalidatePath('/dashboard/document-management');
    
    return { 
      success: true,
      // directory,
    };
  } catch (error) {
    console.error('Create directory error:', error);
    return { error: 'Failed to create directory' };
  }
}

/**
 * Server action to rename a directory
 */
export async function renameDirectory(directoryId: string, newName: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Validate new name
    if (!newName || newName.trim().length === 0) {
      return { error: 'Directory name is required' };
    }

    if (newName.length > 255) {
      return { error: 'Directory name too long' };
    }

    // TODO: Check if directory exists and permissions
    // const directory = await getDirectoryById(directoryId);
    // if (!directory) {
    //   return { error: 'Directory not found' };
    // }

    // const updatedDirectory = await dbUpdateDirectory(directoryId, {
    //   name: newName.trim(),
    // });

    // await createAuditLog({
    //   documentId: null,
    //   userId: user.id,
    //   action: 'directory_renamed',
    //   details: `Renamed directory to: ${newName}`,
    // });

    revalidatePath('/dashboard/document-management');
    
    return { 
      success: true,
      // directory: updatedDirectory,
    };
  } catch (error) {
    console.error('Rename directory error:', error);
    return { error: 'Failed to rename directory' };
  }
}

/**
 * Server action to delete a directory
 */
export async function deleteDirectory(directoryId: string, force: boolean = false) {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // TODO: Check if directory exists and is empty (unless force=true)
    // const directory = await getDirectoryById(directoryId);
    // if (!directory) {
    //   return { error: 'Directory not found' };
    // }

    // Check if directory has children
    // if (!force) {
    //   const children = await listDirectories(directoryId);
    //   if (children.length > 0) {
    //     return { error: 'Directory is not empty' };
    //   }
    // }

    // await dbDeleteDirectory(directoryId, force);

    // await createAuditLog({
    //   documentId: null,
    //   userId: user.id,
    //   action: 'directory_deleted',
    //   details: `Deleted directory: ${directory.name}`,
    // });

    revalidatePath('/dashboard/document-management');
    
    return { success: true };
  } catch (error) {
    console.error('Delete directory error:', error);
    return { error: 'Failed to delete directory' };
  }
}

/**
 * Server action to get directory tree
 */
export async function getDirectoryTree(parentId?: string | null) {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // TODO: Implement actual database query
    // const directories = await listDirectories(parentId || null);

    return { 
      success: true,
      directories: [],
    };
  } catch (error) {
    console.error('Get directory tree error:', error);
    return { error: 'Failed to get directory tree' };
  }
}

/**
 * Server action to move a directory to a new parent
 */
export async function moveDirectory(directoryId: string, newParentId: string | null) {
  try {
    const user = await getUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // TODO: Validate that we're not creating a circular reference
    // TODO: Check permissions

    // const updatedDirectory = await dbUpdateDirectory(directoryId, {
    //   parentId: newParentId,
    // });

    // await createAuditLog({
    //   documentId: null,
    //   userId: user.id,
    //   action: 'directory_moved',
    //   details: 'Directory moved to new parent',
    // });

    revalidatePath('/dashboard/document-management');
    
    return { 
      success: true,
      // directory: updatedDirectory,
    };
  } catch (error) {
    console.error('Move directory error:', error);
    return { error: 'Failed to move directory' };
  }
}


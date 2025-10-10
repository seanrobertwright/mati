'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/auth/server';
import {
  createDirectory as dbCreateDirectory,
  updateDirectory as dbUpdateDirectory,
  deleteDirectory as dbDeleteDirectory,
  getDirectoryById,
  getDirectoryTree as dbGetDirectoryTree,
  getRootDirectories,
  getSubdirectories,
} from '@/lib/db/repositories/directories';
import { logDocumentAction, AuditActions } from '@/lib/db/repositories/audit-log';

/**
 * Server action to create a new directory
 */
export async function createDirectory(data: {
  name: string;
  parentId?: string | null;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
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

    // In dev mode with mock auth, simulate directory creation
    if (process.env.DEV_MODE_SKIP_AUTH === 'true') {
      console.log('Dev mode: Simulating directory creation');
      const mockDirectory = {
        id: `mock-dir-${Date.now()}`,
        name: data.name.trim(),
        parentId: data.parentId || null,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      revalidatePath('/dashboard/document-management');
      return { 
        success: true,
        directory: mockDirectory,
      };
    }

    // Create directory in database
    const directory = await dbCreateDirectory({
      name: data.name.trim(),
      parentId: data.parentId || null,
    }, user);

    // Log the action
    await logDocumentAction(
      AuditActions.DIRECTORY_CREATED,
      user.id,
      undefined,
      { directoryName: data.name, directoryId: directory.id }
    );

    revalidatePath('/dashboard/document-management');
    
    return { 
      success: true,
      directory,
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
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

    // Check if directory exists
    const directory = await getDirectoryById(directoryId);
    if (!directory) {
      return { error: 'Directory not found' };
    }

    // Update directory in database
    const updatedDirectory = await dbUpdateDirectory(directoryId, {
      name: newName.trim(),
    });

    // Log the action
    await logDocumentAction(
      'directory_renamed',
      user.id,
      undefined,
      { directoryId, oldName: directory.name, newName: newName.trim() }
    );

    revalidatePath('/dashboard/document-management');
    
    return { 
      success: true,
      directory: updatedDirectory,
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Check if directory exists
    const directory = await getDirectoryById(directoryId);
    if (!directory) {
      return { error: 'Directory not found' };
    }

    // Delete directory (cascade delete handled by database schema)
    await dbDeleteDirectory(directoryId);

    // Log the action
    await logDocumentAction(
      AuditActions.DIRECTORY_DELETED,
      user.id,
      undefined,
      { directoryId, directoryName: directory.name }
    );

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Get all directories (tree structure)
    const directories = await dbGetDirectoryTree();

    return { 
      success: true,
      directories,
    };
  } catch (error) {
    console.error('Get directory tree error:', error);
    return { error: 'Failed to get directory tree' };
  }
}

/**
 * Server action to get all directories (flat list)
 */
export async function getAllDirectories() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Unauthorized', directories: [] };
    }

    console.log('Getting all directories for user:', user.id);

    // In dev mode with mock auth, return empty array for now
    if (process.env.DEV_MODE_SKIP_AUTH === 'true') {
      console.log('Dev mode: Returning empty directories array');
      return { 
        success: true,
        directories: [],
      };
    }

    // Get all directories via tree structure
    try {
      const tree = await dbGetDirectoryTree();
      console.log('Retrieved directory tree:', tree);

      return { 
        success: true,
        directories: tree || [],
      };
    } catch (dbError) {
      console.error('Database error in getDirectoryTree:', dbError);
      return { 
        success: false, 
        error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`,
        directories: []
      };
    }
  } catch (error) {
    console.error('Get all directories error:', error);
    return { 
      success: false,
      error: `Failed to get directories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      directories: []
    };
  }
}

/**
 * Server action to move a directory to a new parent
 */
export async function moveDirectory(directoryId: string, newParentId: string | null) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
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


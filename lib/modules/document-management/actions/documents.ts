'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/auth/server';
import { 
  createDocument as dbCreateDocument,
  updateDocument as dbUpdateDocument,
  deleteDocument as dbDeleteDocument,
  getDocumentById,
  getDocumentsByDirectory,
  type Document,
} from '@/lib/db/repositories/documents';
import { canEditDocument, getUserRole, hasRole } from '@/lib/auth/permissions';

/**
 * Server action to create a new document
 */
export async function createDocument(data: {
  title: string;
  description?: string;
  directoryId?: string | null;
  categoryId?: string | null;
  effectiveDate?: string;
  reviewFrequencyDays?: number;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Viewers cannot create documents
    if (!hasRole(user, 'employee')) {
      return { error: 'Forbidden: Viewers have read-only access' };
    }

    // TODO: Implement actual database operation
    // const document = await dbCreateDocument({
    //   ...data,
    //   ownerId: user.id,
    //   status: 'draft',
    // });

    // await getAuditLog({
    //   documentId: document.id,
    //   userId: user.id,
    //   action: 'document_created',
    //   details: `Created document: ${data.title}`,
    // });

    revalidatePath('/dashboard/document-management');
    
    return { 
      success: true,
      // document,
    };
  } catch (error) {
    console.error('Create document error:', error);
    return { error: 'Failed to create document' };
  }
}

/**
 * Server action to update document metadata
 */
export async function updateDocument(
  documentId: string,
  data: {
    title?: string;
    description?: string;
    categoryId?: string | null;
    effectiveDate?: string;
    reviewFrequencyDays?: number;
  }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Viewers cannot update documents
    if (!hasRole(user, 'employee')) {
      return { error: 'Forbidden: Viewers have read-only access' };
    }

    // TODO: Check permissions
    // const document = await getDocumentById(documentId);
    // if (!document) {
    //   return { error: 'Document not found' };
    // }

    // const hasPermission = await canEditDocument(user, document);
    // if (!hasPermission) {
    //   return { error: 'Forbidden' };
    // }

    // const updatedDocument = await dbUpdateDocument(documentId, data);

    // await getAuditLog({
    //   documentId,
    //   userId: user.id,
    //   action: 'document_updated',
    //   details: 'Document metadata updated',
    // });

    revalidatePath('/dashboard/document-management');
    revalidatePath(`/dashboard/document-management/${documentId}`);
    
    return { 
      success: true,
      // document: updatedDocument,
    };
  } catch (error) {
    console.error('Update document error:', error);
    return { error: 'Failed to update document' };
  }
}

/**
 * Server action to delete a document
 */
export async function deleteDocument(documentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // Viewers cannot delete documents
    if (!hasRole(user, 'employee')) {
      return { error: 'Forbidden: Viewers have read-only access' };
    }

    // TODO: Check permissions
    // const document = await getDocumentById(documentId);
    // if (!document) {
    //   return { error: 'Document not found' };
    // }

    // const hasPermission = await canDeleteDocument(user, document);
    // if (!hasPermission) {
    //   return { error: 'Forbidden' };
    // }

    // await dbDeleteDocument(documentId);

    // await getAuditLog({
    //   documentId,
    //   userId: user.id,
    //   action: 'document_deleted',
    //   details: `Deleted document: ${document.title}`,
    // });

    revalidatePath('/dashboard/document-management');
    
    return { success: true };
  } catch (error) {
    console.error('Delete document error:', error);
    return { error: 'Failed to delete document' };
  }
}

/**
 * Server action to get document details
 */
export async function getDocument(documentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Unauthorized' };
    }

    // TODO: Get document and check permissions
    // const document = await getDocumentById(documentId);
    // if (!document) {
    //   return { error: 'Document not found' };
    // }

    // const hasPermission = await canViewDocument(user, document);
    // if (!hasPermission) {
    //   return { error: 'Forbidden' };
    // }

    return { 
      success: true,
      // document,
    };
  } catch (error) {
    console.error('Get document error:', error);
    return { error: 'Failed to get document' };
  }
}

/**
 * Server action to list documents in a directory
 */
export async function getDocuments(directoryId?: string | null) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Unauthorized', documents: [] };
    }

    // Get documents from the specified directory (or root if null/undefined)
    const documents = await getDocumentsByDirectory(
      directoryId === undefined ? null : directoryId,
      {
        orderBy: 'updatedAt',
        order: 'desc',
      }
    );

    console.log(`Retrieved ${documents.length} documents for directory:`, directoryId);

    return { 
      success: true,
      documents: documents as Document[],
    };
  } catch (error) {
    console.error('List documents error:', error);
    return { 
      success: false,
      error: 'Failed to list documents',
      documents: []
    };
  }
}

/**
 * Server action to move a document to a different directory
 */
export async function moveDocument(
  documentId: string,
  targetDirectoryId: string | null
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get the document and check permissions
    const document = await getDocumentById(documentId);
    if (!document) {
      return { success: false, error: 'Document not found' };
    }

    // Check if user has permission to edit this document
    // For now, simple check: user must be owner or admin
    const hasPermission = canEditDocument(user, null, document.ownerId);
    if (!hasPermission) {
      return { success: false, error: 'Forbidden: You do not have permission to move this document' };
    }

    // Update the document's directory
    const updatedDocument = await dbUpdateDocument(documentId, {
      directoryId: targetDirectoryId,
    });

    // Log the move in audit trail
    const { logDocumentAction } = await import('@/lib/db/repositories/audit-log');
    await logDocumentAction(
      'document_moved',
      user.id,
      documentId,
      `Moved document to ${targetDirectoryId ? 'directory ' + targetDirectoryId : 'root'}`
    );

    // Revalidate both old and new directory views
    revalidatePath('/dashboard/document-management');
    
    return { 
      success: true,
      document: updatedDocument,
    };
  } catch (error) {
    console.error('Move document error:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to move document'
    };
  }
}


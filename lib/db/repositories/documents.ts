import { db } from '../client';
import {
  documents,
  documentVersions,
  documentPermissions,
  documentApprovals,
  documentCategories,
} from '../schema';
import { eq, and, desc, asc, or, lt, gte, inArray, sql, isNull } from 'drizzle-orm';
import type { User } from '@supabase/supabase-js';
import { invalidateDocumentPermissionCache } from '@/lib/auth/permission-cache';

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type NewDocumentVersion = typeof documentVersions.$inferInsert;
export type DocumentPermission = typeof documentPermissions.$inferSelect;
export type DocumentApproval = typeof documentApprovals.$inferSelect;
export type DocumentCategory = typeof documentCategories.$inferSelect;

export interface DocumentWithDetails extends Document {
  currentVersion?: DocumentVersion;
  category?: DocumentCategory;
  permissions?: DocumentPermission[];
}

/**
 * Create a new document
 */
export async function createDocument(
  data: Omit<NewDocument, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>,
  user: User
): Promise<Document> {
  try {
    const [document] = await db
      .insert(documents)
      .values({
        ...data,
        ownerId: user.id,
        status: 'draft',
      })
      .returning();

    // Grant owner permission
    await db.insert(documentPermissions).values({
      documentId: document.id,
      userId: user.id,
      role: 'owner',
      grantedBy: user.id,
    });

    return document;
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document');
  }
}

/**
 * Get document by ID with optional details
 */
export async function getDocumentById(
  id: string,
  includeDetails = false
): Promise<DocumentWithDetails | null> {
  try {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!document) return null;

    if (includeDetails) {
      // Fetch current version
      if (document.currentVersionId) {
        const [version] = await db
          .select()
          .from(documentVersions)
          .where(eq(documentVersions.id, document.currentVersionId))
          .limit(1);
        (document as DocumentWithDetails).currentVersion = version;
      }

      // Fetch category
      if (document.categoryId) {
        const [category] = await db
          .select()
          .from(documentCategories)
          .where(eq(documentCategories.id, document.categoryId))
          .limit(1);
        (document as DocumentWithDetails).category = category;
      }

      // Fetch permissions
      const permissions = await db
        .select()
        .from(documentPermissions)
        .where(eq(documentPermissions.documentId, id));
      (document as DocumentWithDetails).permissions = permissions;
    }

    return document;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw new Error('Failed to fetch document');
  }
}

/**
 * Get all documents in a directory
 */
export async function getDocumentsByDirectory(
  directoryId: string | null,
  options?: {
    status?: string[];
    categoryId?: string;
    ownerId?: string;
    orderBy?: 'title' | 'createdAt' | 'updatedAt' | 'nextReviewDate';
    order?: 'asc' | 'desc';
  }
): Promise<Document[]> {
  try {
    let query = db.select().from(documents);

    // Apply filters
    const conditions = [];
    if (directoryId === null) {
      conditions.push(isNull(documents.directoryId));
    } else {
      conditions.push(eq(documents.directoryId, directoryId));
    }

    if (options?.status && options.status.length > 0) {
      conditions.push(inArray(documents.status, options.status));
    }

    if (options?.categoryId) {
      conditions.push(eq(documents.categoryId, options.categoryId));
    }

    if (options?.ownerId) {
      conditions.push(eq(documents.ownerId, options.ownerId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Apply ordering
    const orderField = options?.orderBy || 'createdAt';
    const orderDir = options?.order || 'desc';
    const orderFn = orderDir === 'asc' ? asc : desc;

    return await (query as any).orderBy(orderFn(documents[orderField]));
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw new Error('Failed to fetch documents');
  }
}

/**
 * Search documents by text
 */
export async function searchDocuments(
  searchText: string,
  options?: {
    directoryId?: string;
    status?: string[];
    categoryId?: string;
  }
): Promise<Document[]> {
  try {
    const conditions = [
      or(
        sql`${documents.title} ILIKE ${`%${searchText}%`}`,
        sql`${documents.description} ILIKE ${`%${searchText}%`}`
      ),
    ];

    if (options?.directoryId) {
      conditions.push(eq(documents.directoryId, options.directoryId));
    }

    if (options?.status && options.status.length > 0) {
      conditions.push(inArray(documents.status, options.status));
    }

    if (options?.categoryId) {
      conditions.push(eq(documents.categoryId, options.categoryId));
    }

    return await db
      .select()
      .from(documents)
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt));
  } catch (error) {
    console.error('Error searching documents:', error);
    throw new Error('Failed to search documents');
  }
}

/**
 * Get documents overdue for review
 */
export async function getOverdueDocuments(): Promise<Document[]> {
  try {
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.status, 'approved'),
          lt(documents.nextReviewDate, new Date())
        )
      )
      .orderBy(asc(documents.nextReviewDate));
  } catch (error) {
    console.error('Error fetching overdue documents:', error);
    throw new Error('Failed to fetch overdue documents');
  }
}

/**
 * Get documents by status
 */
export async function getDocumentsByStatus(status: string[]): Promise<Document[]> {
  try {
    return await db
      .select()
      .from(documents)
      .where(inArray(documents.status, status))
      .orderBy(desc(documents.updatedAt));
  } catch (error) {
    console.error('Error fetching documents by status:', error);
    throw new Error('Failed to fetch documents');
  }
}

/**
 * Update document
 */
export async function updateDocument(
  id: string,
  data: Partial<Omit<Document, 'id' | 'createdAt' | 'ownerId'>>
): Promise<Document> {
  try {
    // Calculate next review date if relevant fields changed
    if (data.effectiveDate || data.reviewFrequencyDays !== undefined) {
      const [currentDoc] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id))
        .limit(1);

      if (currentDoc) {
        const effectiveDate = data.effectiveDate || currentDoc.effectiveDate;
        const reviewFrequency = data.reviewFrequencyDays ?? currentDoc.reviewFrequencyDays;

        if (effectiveDate && reviewFrequency) {
          const nextReview = new Date(effectiveDate);
          nextReview.setDate(nextReview.getDate() + reviewFrequency);
          data.nextReviewDate = nextReview;
        }
      }
    }

    const [updated] = await db
      .update(documents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();

    if (!updated) {
      throw new Error('Document not found');
    }

    return updated;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error instanceof Error ? error : new Error('Failed to update document');
  }
}

/**
 * Delete document (will cascade to versions, permissions, etc.)
 */
export async function deleteDocument(id: string): Promise<void> {
  try {
    await db.delete(documents).where(eq(documents.id, id));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}

/**
 * Create new document version
 */
export async function createDocumentVersion(
  documentId: string,
  data: Omit<NewDocumentVersion, 'id' | 'documentId' | 'createdAt'>,
  user: User,
  updateCurrent = true
): Promise<DocumentVersion> {
  return await db.transaction(async (tx) => {
    try {
      // Get next version number
      const versions = await tx
        .select()
        .from(documentVersions)
        .where(eq(documentVersions.documentId, documentId))
        .orderBy(desc(documentVersions.versionNumber))
        .limit(1);

      const nextVersion = versions.length > 0 ? versions[0].versionNumber + 1 : 1;

      // Create version
      const [version] = await tx
        .insert(documentVersions)
        .values({
          ...data,
          documentId,
          versionNumber: nextVersion,
          uploadedBy: user.id,
        })
        .returning();

      // Update document's current version if requested
      if (updateCurrent) {
        await tx
          .update(documents)
          .set({
            currentVersionId: version.id,
            updatedAt: new Date(),
          })
          .where(eq(documents.id, documentId));
      }

      return version;
    } catch (error) {
      console.error('Error creating document version:', error);
      throw new Error('Failed to create document version');
    }
  });
}

/**
 * Get all versions for a document
 */
export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  try {
    return await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.versionNumber));
  } catch (error) {
    console.error('Error fetching document versions:', error);
    throw new Error('Failed to fetch document versions');
  }
}

/**
 * Get specific version
 */
export async function getDocumentVersion(versionId: string): Promise<DocumentVersion | null> {
  try {
    const [version] = await db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.id, versionId))
      .limit(1);

    return version || null;
  } catch (error) {
    console.error('Error fetching document version:', error);
    throw new Error('Failed to fetch document version');
  }
}

/**
 * Grant document permission
 */
export async function grantDocumentPermission(
  documentId: string,
  userId: string,
  role: 'owner' | 'approver' | 'reviewer' | 'viewer',
  grantedBy: User
): Promise<DocumentPermission> {
  try {
    // Check if permission already exists
    const existing = await db
      .select()
      .from(documentPermissions)
      .where(
        and(
          eq(documentPermissions.documentId, documentId),
          eq(documentPermissions.userId, userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing permission
      const [updated] = await db
        .update(documentPermissions)
        .set({
          role,
          grantedBy: grantedBy.id,
          grantedAt: new Date(),
        })
        .where(eq(documentPermissions.id, existing[0].id))
        .returning();

      // Invalidate cache
      invalidateDocumentPermissionCache(documentId, userId);

      return updated;
    }

    // Create new permission
    const [permission] = await db
      .insert(documentPermissions)
      .values({
        documentId,
        userId,
        role,
        grantedBy: grantedBy.id,
      })
      .returning();

    // Invalidate cache
    invalidateDocumentPermissionCache(documentId, userId);

    return permission;
  } catch (error) {
    console.error('Error granting document permission:', error);
    throw new Error('Failed to grant document permission');
  }
}

/**
 * Revoke document permission
 */
export async function revokeDocumentPermission(
  documentId: string,
  userId: string
): Promise<void> {
  try {
    await db
      .delete(documentPermissions)
      .where(
        and(
          eq(documentPermissions.documentId, documentId),
          eq(documentPermissions.userId, userId)
        )
      );

    // Invalidate cache
    invalidateDocumentPermissionCache(documentId, userId);
  } catch (error) {
    console.error('Error revoking document permission:', error);
    throw new Error('Failed to revoke document permission');
  }
}

/**
 * Get user's permission for a document
 */
export async function getUserDocumentPermission(
  documentId: string,
  userId: string
): Promise<DocumentPermission | null> {
  try {
    const [permission] = await db
      .select()
      .from(documentPermissions)
      .where(
        and(
          eq(documentPermissions.documentId, documentId),
          eq(documentPermissions.userId, userId)
        )
      )
      .limit(1);

    return permission || null;
  } catch (error) {
    console.error('Error fetching user permission:', error);
    throw new Error('Failed to fetch user permission');
  }
}

/**
 * Get all permissions for a document
 */
export async function getDocumentPermissions(documentId: string): Promise<DocumentPermission[]> {
  try {
    return await db
      .select()
      .from(documentPermissions)
      .where(eq(documentPermissions.documentId, documentId));
  } catch (error) {
    console.error('Error fetching document permissions:', error);
    throw new Error('Failed to fetch document permissions');
  }
}

/**
 * Create document approval record
 */
export async function createDocumentApproval(
  documentId: string,
  versionId: string,
  approverId: string,
  role: 'reviewer' | 'approver'
): Promise<DocumentApproval> {
  try {
    const [approval] = await db
      .insert(documentApprovals)
      .values({
        documentId,
        versionId,
        approverId,
        role,
        status: 'pending',
      })
      .returning();

    return approval;
  } catch (error) {
    console.error('Error creating document approval:', error);
    throw new Error('Failed to create document approval');
  }
}

/**
 * Update document approval
 */
export async function updateDocumentApproval(
  approvalId: string,
  status: 'approved' | 'rejected' | 'changes_requested',
  notes?: string
): Promise<DocumentApproval> {
  try {
    const [approval] = await db
      .update(documentApprovals)
      .set({
        status,
        notes,
        decidedAt: new Date(),
      })
      .where(eq(documentApprovals.id, approvalId))
      .returning();

    if (!approval) {
      throw new Error('Approval not found');
    }

    return approval;
  } catch (error) {
    console.error('Error updating document approval:', error);
    throw error instanceof Error ? error : new Error('Failed to update document approval');
  }
}

/**
 * Get approval history for a document
 */
export async function getDocumentApprovals(documentId: string): Promise<DocumentApproval[]> {
  try {
    return await db
      .select()
      .from(documentApprovals)
      .where(eq(documentApprovals.documentId, documentId))
      .orderBy(desc(documentApprovals.createdAt));
  } catch (error) {
    console.error('Error fetching document approvals:', error);
    throw new Error('Failed to fetch document approvals');
  }
}

/**
 * Document categories
 */
export async function getDocumentCategories(): Promise<DocumentCategory[]> {
  try {
    return await db.select().from(documentCategories).orderBy(documentCategories.name);
  } catch (error) {
    console.error('Error fetching document categories:', error);
    throw new Error('Failed to fetch document categories');
  }
}

export async function createDocumentCategory(
  name: string,
  description?: string,
  defaultReviewFrequencyDays?: number
): Promise<DocumentCategory> {
  try {
    const [category] = await db
      .insert(documentCategories)
      .values({
        name,
        description,
        defaultReviewFrequencyDays,
      })
      .returning();

    return category;
  } catch (error) {
    console.error('Error creating document category:', error);
    throw new Error('Failed to create document category');
  }
}


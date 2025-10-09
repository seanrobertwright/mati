import { db } from '../client';
import { changeRequests, changeRequestComments, changeRequestApprovals } from '../schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import type { User } from '@supabase/supabase-js';

export type ChangeRequest = typeof changeRequests.$inferSelect;
export type NewChangeRequest = typeof changeRequests.$inferInsert;
export type ChangeRequestComment = typeof changeRequestComments.$inferSelect;
export type ChangeRequestApproval = typeof changeRequestApprovals.$inferSelect;

export interface ChangeRequestWithDetails extends ChangeRequest {
  comments?: ChangeRequestComment[];
  approvals?: ChangeRequestApproval[];
}

/**
 * Create a new change request
 */
export async function createChangeRequest(
  data: Omit<NewChangeRequest, 'id' | 'createdAt' | 'updatedAt' | 'requestedBy'>,
  user: User
): Promise<ChangeRequest> {
  try {
    const [changeRequest] = await db
      .insert(changeRequests)
      .values({
        ...data,
        requestedBy: user.id,
        status: 'draft',
      })
      .returning();

    return changeRequest;
  } catch (error) {
    console.error('Error creating change request:', error);
    throw new Error('Failed to create change request');
  }
}

/**
 * Get change request by ID
 */
export async function getChangeRequestById(
  id: string,
  includeDetails = false
): Promise<ChangeRequestWithDetails | null> {
  try {
    const [changeRequest] = await db
      .select()
      .from(changeRequests)
      .where(eq(changeRequests.id, id))
      .limit(1);

    if (!changeRequest) return null;

    if (includeDetails) {
      // Fetch comments
      const comments = await db
        .select()
        .from(changeRequestComments)
        .where(eq(changeRequestComments.changeRequestId, id))
        .orderBy(desc(changeRequestComments.createdAt));
      (changeRequest as ChangeRequestWithDetails).comments = comments;

      // Fetch approvals
      const approvals = await db
        .select()
        .from(changeRequestApprovals)
        .where(eq(changeRequestApprovals.changeRequestId, id))
        .orderBy(desc(changeRequestApprovals.createdAt));
      (changeRequest as ChangeRequestWithDetails).approvals = approvals;
    }

    return changeRequest;
  } catch (error) {
    console.error('Error fetching change request:', error);
    throw new Error('Failed to fetch change request');
  }
}

/**
 * Get all change requests for a document
 */
export async function getChangeRequestsByDocument(documentId: string): Promise<ChangeRequest[]> {
  try {
    return await db
      .select()
      .from(changeRequests)
      .where(eq(changeRequests.documentId, documentId))
      .orderBy(desc(changeRequests.createdAt));
  } catch (error) {
    console.error('Error fetching change requests:', error);
    throw new Error('Failed to fetch change requests');
  }
}

/**
 * Get change requests by status
 */
export async function getChangeRequestsByStatus(
  statuses: Array<ChangeRequest['status']>
): Promise<ChangeRequest[]> {
  try {
    return await db
      .select()
      .from(changeRequests)
      .where(inArray(changeRequests.status, statuses))
      .orderBy(desc(changeRequests.updatedAt));
  } catch (error) {
    console.error('Error fetching change requests by status:', error);
    throw new Error('Failed to fetch change requests');
  }
}

/**
 * Get all change requests (with optional filters)
 */
export async function getAllChangeRequests(options?: {
  status?: Array<ChangeRequest['status']>;
  priority?: Array<ChangeRequest['priority']>;
  documentId?: string;
}): Promise<ChangeRequest[]> {
  try {
    let query = db.select().from(changeRequests);

    const conditions = [];

    if (options?.status && options.status.length > 0) {
      conditions.push(inArray(changeRequests.status, options.status));
    }

    if (options?.priority && options.priority.length > 0) {
      conditions.push(inArray(changeRequests.priority, options.priority));
    }

    if (options?.documentId) {
      conditions.push(eq(changeRequests.documentId, options.documentId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await (query as any).orderBy(desc(changeRequests.updatedAt));
  } catch (error) {
    console.error('Error fetching all change requests:', error);
    throw new Error('Failed to fetch change requests');
  }
}

/**
 * Update change request
 */
export async function updateChangeRequest(
  id: string,
  data: Partial<Omit<ChangeRequest, 'id' | 'createdAt' | 'requestedBy'>>
): Promise<ChangeRequest> {
  try {
    const [updated] = await db
      .update(changeRequests)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, id))
      .returning();

    if (!updated) {
      throw new Error('Change request not found');
    }

    return updated;
  } catch (error) {
    console.error('Error updating change request:', error);
    throw error instanceof Error ? error : new Error('Failed to update change request');
  }
}

/**
 * Delete change request
 */
export async function deleteChangeRequest(id: string): Promise<void> {
  try {
    await db.delete(changeRequests).where(eq(changeRequests.id, id));
  } catch (error) {
    console.error('Error deleting change request:', error);
    throw new Error('Failed to delete change request');
  }
}

/**
 * Add comment to change request
 */
export async function addChangeRequestComment(
  changeRequestId: string,
  comment: string,
  user: User
): Promise<ChangeRequestComment> {
  return await db.transaction(async (tx) => {
    try {
      // Create comment
      const [newComment] = await tx
        .insert(changeRequestComments)
        .values({
          changeRequestId,
          userId: user.id,
          comment,
        })
        .returning();

      // Update change request updated_at
      await tx
        .update(changeRequests)
        .set({ updatedAt: new Date() })
        .where(eq(changeRequests.id, changeRequestId));

      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  });
}

/**
 * Get comments for a change request
 */
export async function getChangeRequestComments(
  changeRequestId: string
): Promise<ChangeRequestComment[]> {
  try {
    return await db
      .select()
      .from(changeRequestComments)
      .where(eq(changeRequestComments.changeRequestId, changeRequestId))
      .orderBy(desc(changeRequestComments.createdAt));
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to fetch comments');
  }
}

/**
 * Create change request approval
 */
export async function createChangeRequestApproval(
  changeRequestId: string,
  approverId: string
): Promise<ChangeRequestApproval> {
  try {
    const [approval] = await db
      .insert(changeRequestApprovals)
      .values({
        changeRequestId,
        approverId,
        status: 'pending',
      })
      .returning();

    return approval;
  } catch (error) {
    console.error('Error creating approval:', error);
    throw new Error('Failed to create approval');
  }
}

/**
 * Update change request approval
 */
export async function updateChangeRequestApproval(
  approvalId: string,
  status: 'approved' | 'rejected',
  notes?: string
): Promise<ChangeRequestApproval> {
  try {
    const [approval] = await db
      .update(changeRequestApprovals)
      .set({
        status,
        notes,
        decidedAt: new Date(),
      })
      .where(eq(changeRequestApprovals.id, approvalId))
      .returning();

    if (!approval) {
      throw new Error('Approval not found');
    }

    return approval;
  } catch (error) {
    console.error('Error updating approval:', error);
    throw error instanceof Error ? error : new Error('Failed to update approval');
  }
}

/**
 * Get approvals for a change request
 */
export async function getChangeRequestApprovals(
  changeRequestId: string
): Promise<ChangeRequestApproval[]> {
  try {
    return await db
      .select()
      .from(changeRequestApprovals)
      .where(eq(changeRequestApprovals.changeRequestId, changeRequestId))
      .orderBy(desc(changeRequestApprovals.createdAt));
  } catch (error) {
    console.error('Error fetching approvals:', error);
    throw new Error('Failed to fetch approvals');
  }
}

/**
 * Check if all approvals are complete for a change request
 */
export async function areAllApprovalsComplete(changeRequestId: string): Promise<boolean> {
  try {
    const approvals = await getChangeRequestApprovals(changeRequestId);

    if (approvals.length === 0) return false;

    return approvals.every((approval) => approval.status !== 'pending');
  } catch (error) {
    console.error('Error checking approvals:', error);
    return false;
  }
}

/**
 * Check if change request is approved (all approvals are 'approved')
 */
export async function isChangeRequestApproved(changeRequestId: string): Promise<boolean> {
  try {
    const approvals = await getChangeRequestApprovals(changeRequestId);

    if (approvals.length === 0) return false;

    return approvals.every((approval) => approval.status === 'approved');
  } catch (error) {
    console.error('Error checking if approved:', error);
    return false;
  }
}


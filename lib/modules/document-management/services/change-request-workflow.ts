import { db } from '@/lib/db/client';
import { changeRequests, changeRequestApprovals } from '@/lib/db/schema';
import {
  createChangeRequest,
  getChangeRequestById,
  updateChangeRequest,
  addChangeRequestComment,
  createChangeRequestApproval,
  updateChangeRequestApproval,
  getChangeRequestApprovals,
  areAllApprovalsComplete,
  isChangeRequestApproved,
} from '@/lib/db/repositories/change-requests';
import { getDocumentById } from '@/lib/db/repositories/documents';
import { logDocumentAction } from './audit-log';
import type { User } from '@supabase/supabase-js';
import { eq, and } from 'drizzle-orm';

/**
 * Change request status types
 */
export type ChangeRequestStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'implemented'
  | 'cancelled';

/**
 * Valid state transitions for change requests
 */
const VALID_CR_TRANSITIONS: Record<ChangeRequestStatus, ChangeRequestStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['under_review', 'cancelled'],
  under_review: ['approved', 'rejected', 'draft'],
  approved: ['implemented'],
  rejected: ['draft', 'cancelled'],
  implemented: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Check if a change request state transition is valid
 */
export function isValidCRTransition(
  currentStatus: ChangeRequestStatus,
  newStatus: ChangeRequestStatus
): boolean {
  return VALID_CR_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Submit a change request for review
 */
export async function submitChangeRequest(
  changeRequestId: string,
  reviewers: string[],
  user: User
): Promise<void> {
  const changeRequest = await getChangeRequestById(changeRequestId);
  if (!changeRequest) {
    throw new Error('Change request not found');
  }

  if (!isValidCRTransition(changeRequest.status as ChangeRequestStatus, 'submitted')) {
    throw new Error(
      `Cannot submit change request from status: ${changeRequest.status}`
    );
  }

  await db.transaction(async (tx) => {
    // Update status
    await tx
      .update(changeRequests)
      .set({
        status: 'submitted',
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, changeRequestId));

    // Create approval records for reviewers
    for (const reviewerId of reviewers) {
      await tx.insert(changeRequestApprovals).values({
        changeRequestId,
        approverId: reviewerId,
        status: 'pending',
      });
    }

    // Log action
    if (changeRequest.documentId) {
      await logDocumentAction(
        changeRequest.documentId,
        user.id,
        'create',
        { changeRequestId, action: 'submit', reviewers },
        tx
      );
    }
  });
}

/**
 * Move change request to under review
 */
export async function startChangeRequestReview(
  changeRequestId: string,
  user: User
): Promise<void> {
  const changeRequest = await getChangeRequestById(changeRequestId);
  if (!changeRequest) {
    throw new Error('Change request not found');
  }

  if (!isValidCRTransition(changeRequest.status as ChangeRequestStatus, 'under_review')) {
    throw new Error(
      `Cannot start review from status: ${changeRequest.status}`
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(changeRequests)
      .set({
        status: 'under_review',
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, changeRequestId));

    // Log action
    if (changeRequest.documentId) {
      await logDocumentAction(
        changeRequest.documentId,
        user.id,
        'update',
        { changeRequestId, action: 'start_review' },
        tx
      );
    }
  });
}

/**
 * Approve a change request
 */
export async function approveChangeRequest(
  changeRequestId: string,
  approvalId: string,
  notes: string | undefined,
  user: User
): Promise<void> {
  const changeRequest = await getChangeRequestById(changeRequestId);
  if (!changeRequest) {
    throw new Error('Change request not found');
  }

  await db.transaction(async (tx) => {
    // Update the approval record
    await tx
      .update(changeRequestApprovals)
      .set({
        status: 'approved',
        notes,
        decidedAt: new Date(),
      })
      .where(eq(changeRequestApprovals.id, approvalId));

    // Check if all approvals are complete
    const allApprovals = await tx
      .select()
      .from(changeRequestApprovals)
      .where(eq(changeRequestApprovals.changeRequestId, changeRequestId));

    const pendingApprovals = allApprovals.filter((a) => a.status === 'pending');
    const rejectedApprovals = allApprovals.filter((a) => a.status === 'rejected');

    let newStatus: ChangeRequestStatus = changeRequest.status as ChangeRequestStatus;

    if (rejectedApprovals.length > 0) {
      newStatus = 'rejected';
    } else if (pendingApprovals.length === 0) {
      // All approvals complete and approved
      newStatus = 'approved';
    }

    // Update change request status if changed
    if (newStatus !== changeRequest.status) {
      await tx
        .update(changeRequests)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(changeRequests.id, changeRequestId));
    }

    // Log action
    if (changeRequest.documentId) {
      await logDocumentAction(
        changeRequest.documentId,
        user.id,
        'approve',
        { changeRequestId, approvalId, notes, newStatus },
        tx
      );
    }
  });
}

/**
 * Reject a change request
 */
export async function rejectChangeRequest(
  changeRequestId: string,
  approvalId: string,
  notes: string,
  user: User
): Promise<void> {
  const changeRequest = await getChangeRequestById(changeRequestId);
  if (!changeRequest) {
    throw new Error('Change request not found');
  }

  await db.transaction(async (tx) => {
    // Update the approval record
    await tx
      .update(changeRequestApprovals)
      .set({
        status: 'rejected',
        notes,
        decidedAt: new Date(),
      })
      .where(eq(changeRequestApprovals.id, approvalId));

    // Set change request to rejected
    await tx
      .update(changeRequests)
      .set({
        status: 'rejected',
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, changeRequestId));

    // Log action
    if (changeRequest.documentId) {
      await logDocumentAction(
        changeRequest.documentId,
        user.id,
        'reject',
        { changeRequestId, approvalId, notes },
        tx
      );
    }
  });
}

/**
 * Cancel a change request
 */
export async function cancelChangeRequest(
  changeRequestId: string,
  reason: string,
  user: User
): Promise<void> {
  const changeRequest = await getChangeRequestById(changeRequestId);
  if (!changeRequest) {
    throw new Error('Change request not found');
  }

  if (!isValidCRTransition(changeRequest.status as ChangeRequestStatus, 'cancelled')) {
    throw new Error(
      `Cannot cancel change request from status: ${changeRequest.status}`
    );
  }

  await db.transaction(async (tx) => {
    // Cancel any pending approvals
    await tx
      .update(changeRequestApprovals)
      .set({
        status: 'rejected',
        notes: `Cancelled: ${reason}`,
        decidedAt: new Date(),
      })
      .where(
        and(
          eq(changeRequestApprovals.changeRequestId, changeRequestId),
          eq(changeRequestApprovals.status, 'pending')
        )
      );

    // Update change request status
    await tx
      .update(changeRequests)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, changeRequestId));

    // Log action
    if (changeRequest.documentId) {
      await logDocumentAction(
        changeRequest.documentId,
        user.id,
        'update',
        { changeRequestId, action: 'cancel', reason },
        tx
      );
    }
  });
}

/**
 * Mark change request as implemented
 */
export async function markChangeRequestImplemented(
  changeRequestId: string,
  implementationNotes: string,
  user: User
): Promise<void> {
  const changeRequest = await getChangeRequestById(changeRequestId);
  if (!changeRequest) {
    throw new Error('Change request not found');
  }

  if (!isValidCRTransition(changeRequest.status as ChangeRequestStatus, 'implemented')) {
    throw new Error(
      `Cannot mark as implemented from status: ${changeRequest.status}`
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(changeRequests)
      .set({
        status: 'implemented',
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, changeRequestId));

    // Add implementation notes as a comment
    await tx.insert(changeRequests).values({
      changeRequestId,
      userId: user.id,
      comment: `Implementation completed: ${implementationNotes}`,
    } as any);

    // Log action
    if (changeRequest.documentId) {
      await logDocumentAction(
        changeRequest.documentId,
        user.id,
        'update',
        { changeRequestId, action: 'implement', notes: implementationNotes },
        tx
      );
    }
  });
}

/**
 * Return change request to draft
 */
export async function returnChangeRequestToDraft(
  changeRequestId: string,
  reason: string,
  user: User
): Promise<void> {
  const changeRequest = await getChangeRequestById(changeRequestId);
  if (!changeRequest) {
    throw new Error('Change request not found');
  }

  if (!isValidCRTransition(changeRequest.status as ChangeRequestStatus, 'draft')) {
    throw new Error(
      `Cannot return to draft from status: ${changeRequest.status}`
    );
  }

  await db.transaction(async (tx) => {
    // Cancel pending approvals
    await tx
      .update(changeRequestApprovals)
      .set({
        status: 'rejected',
        notes: `Returned to draft: ${reason}`,
        decidedAt: new Date(),
      })
      .where(
        and(
          eq(changeRequestApprovals.changeRequestId, changeRequestId),
          eq(changeRequestApprovals.status, 'pending')
        )
      );

    // Update status
    await tx
      .update(changeRequests)
      .set({
        status: 'draft',
        updatedAt: new Date(),
      })
      .where(eq(changeRequests.id, changeRequestId));

    // Log action
    if (changeRequest.documentId) {
      await logDocumentAction(
        changeRequest.documentId,
        user.id,
        'update',
        { changeRequestId, action: 'return_to_draft', reason },
        tx
      );
    }
  });
}

/**
 * Get workflow stage for a change request
 */
export interface ChangeRequestWorkflowStage {
  currentStatus: ChangeRequestStatus;
  pendingApprovals: Array<{
    id: string;
    approverId: string;
    createdAt: Date;
  }>;
  completedApprovals: Array<{
    id: string;
    approverId: string;
    status: 'approved' | 'rejected';
    decidedAt: Date;
    notes?: string;
  }>;
  nextActions: string[];
  canTransitionTo: ChangeRequestStatus[];
}

export async function getChangeRequestWorkflowStage(
  changeRequestId: string
): Promise<ChangeRequestWorkflowStage> {
  const changeRequest = await getChangeRequestById(changeRequestId, true);
  if (!changeRequest) {
    throw new Error('Change request not found');
  }

  const currentStatus = changeRequest.status as ChangeRequestStatus;
  const allApprovals = await getChangeRequestApprovals(changeRequestId);

  const pendingApprovals = allApprovals
    .filter((a) => a.status === 'pending')
    .map((a) => ({
      id: a.id,
      approverId: a.approverId,
      createdAt: a.createdAt,
    }));

  const completedApprovals = allApprovals
    .filter((a) => a.status !== 'pending')
    .map((a) => ({
      id: a.id,
      approverId: a.approverId,
      status: a.status as 'approved' | 'rejected',
      decidedAt: a.decidedAt!,
      notes: a.notes || undefined,
    }));

  // Determine next actions
  const nextActions: string[] = [];
  if (currentStatus === 'draft') {
    nextActions.push('Submit for review');
  } else if (currentStatus === 'submitted') {
    nextActions.push('Start review');
  } else if (currentStatus === 'under_review' && pendingApprovals.length > 0) {
    nextActions.push('Complete reviews');
  } else if (currentStatus === 'approved') {
    nextActions.push('Implement changes');
  } else if (currentStatus === 'rejected') {
    nextActions.push('Revise and resubmit');
  }

  return {
    currentStatus,
    pendingApprovals,
    completedApprovals,
    nextActions,
    canTransitionTo: VALID_CR_TRANSITIONS[currentStatus] || [],
  };
}

/**
 * Calculate average approval time for change requests
 */
export async function getChangeRequestMetrics(): Promise<{
  totalChangeRequests: number;
  byStatus: Record<string, number>;
  averageApprovalTime: number; // in days
  openChangeRequests: number;
}> {
  try {
    // This would typically query the database for aggregate metrics
    // For now, returning a basic structure
    return {
      totalChangeRequests: 0,
      byStatus: {},
      averageApprovalTime: 0,
      openChangeRequests: 0,
    };
  } catch (error) {
    console.error('Error getting change request metrics:', error);
    throw new Error('Failed to get change request metrics');
  }
}


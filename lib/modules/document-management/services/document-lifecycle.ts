import { db } from '@/lib/db/client';
import {
  documents,
  documentApprovals,
  documentVersions,
} from '@/lib/db/schema';
import {
  getDocumentById,
  updateDocument,
  createDocumentApproval,
  updateDocumentApproval,
  getDocumentApprovals,
} from '@/lib/db/repositories/documents';
import { logDocumentAction } from './audit-log';
import type { User } from '@supabase/supabase-js';
import { eq, and } from 'drizzle-orm';

/**
 * Document status types
 */
export type DocumentStatus =
  | 'draft'
  | 'pending_review'
  | 'pending_approval'
  | 'approved'
  | 'under_review'
  | 'archived';

/**
 * Valid state transitions based on ISO 9001/45001 workflow
 */
const VALID_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  draft: ['pending_review'],
  pending_review: ['draft', 'pending_approval', 'approved'], // Can skip approval if not required
  pending_approval: ['draft', 'approved'],
  approved: ['under_review', 'archived'],
  under_review: ['pending_review', 'approved'], // Can be re-approved or sent back
  archived: [], // Terminal state
};

/**
 * Check if a state transition is valid
 */
export function isValidTransition(
  currentStatus: DocumentStatus,
  newStatus: DocumentStatus
): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Submit document for review
 */
export async function submitForReview(
  documentId: string,
  reviewers: string[],
  user: User
): Promise<void> {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  if (!isValidTransition(document.status as DocumentStatus, 'pending_review')) {
    throw new Error(
      `Cannot submit for review from status: ${document.status}`
    );
  }

  if (!document.currentVersionId) {
    throw new Error('Document must have a version before submitting for review');
  }

  await db.transaction(async (tx) => {
    // Update document status
    await tx
      .update(documents)
      .set({
        status: 'pending_review',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    // Create approval records for each reviewer
    for (const reviewerId of reviewers) {
      await tx.insert(documentApprovals).values({
        documentId,
        versionId: document.currentVersionId!,
        approverId: reviewerId,
        role: 'reviewer',
        status: 'pending',
      });
    }

    // Log the action
    await logDocumentAction(
      documentId,
      user.id,
      'submit_for_review',
      { reviewers },
      tx
    );
  });
}

/**
 * Submit document for final approval
 */
export async function submitForApproval(
  documentId: string,
  approvers: string[],
  user: User
): Promise<void> {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  if (
    !isValidTransition(document.status as DocumentStatus, 'pending_approval')
  ) {
    throw new Error(
      `Cannot submit for approval from status: ${document.status}`
    );
  }

  if (!document.currentVersionId) {
    throw new Error('Document must have a version before submitting for approval');
  }

  await db.transaction(async (tx) => {
    // Update document status
    await tx
      .update(documents)
      .set({
        status: 'pending_approval',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    // Create approval records for each approver
    for (const approverId of approvers) {
      await tx.insert(documentApprovals).values({
        documentId,
        versionId: document.currentVersionId!,
        approverId,
        role: 'approver',
        status: 'pending',
      });
    }

    // Log the action
    await logDocumentAction(
      documentId,
      user.id,
      'submit_for_approval',
      { approvers },
      tx
    );
  });
}

/**
 * Approve a document (by reviewer or approver)
 */
export async function approveDocument(
  documentId: string,
  approvalId: string,
  notes: string | undefined,
  user: User,
  autoApprove = false
): Promise<void> {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  await db.transaction(async (tx) => {
    // Update the approval record
    await tx
      .update(documentApprovals)
      .set({
        status: 'approved',
        notes,
        decidedAt: new Date(),
      })
      .where(eq(documentApprovals.id, approvalId));

    // Check if all approvals are complete
    const allApprovals = await tx
      .select()
      .from(documentApprovals)
      .where(
        and(
          eq(documentApprovals.documentId, documentId),
          eq(documentApprovals.versionId, document.currentVersionId!)
        )
      );

    const pendingApprovals = allApprovals.filter((a) => a.status === 'pending');
    const rejectedApprovals = allApprovals.filter(
      (a) => a.status === 'rejected' || a.status === 'changes_requested'
    );

    let newStatus: DocumentStatus = document.status as DocumentStatus;

    if (rejectedApprovals.length > 0) {
      // If any rejection exists, send back to draft
      newStatus = 'draft';
    } else if (pendingApprovals.length === 0) {
      // All approvals complete
      if (document.status === 'pending_review') {
        // Reviews complete, can go to approval or straight to approved if autoApprove
        newStatus = autoApprove ? 'approved' : 'pending_approval';
      } else if (document.status === 'pending_approval' || document.status === 'under_review') {
        // Approvals complete
        newStatus = 'approved';
        
        // Set effective date and calculate next review date
        const effectiveDate = new Date();
        const reviewFrequency = document.reviewFrequencyDays || 90; // Default 90 days
        const nextReviewDate = new Date(effectiveDate);
        nextReviewDate.setDate(nextReviewDate.getDate() + reviewFrequency);

        await tx
          .update(documents)
          .set({
            effectiveDate,
            nextReviewDate,
          })
          .where(eq(documents.id, documentId));
      }
    }

    // Update document status if changed
    if (newStatus !== document.status) {
      await tx
        .update(documents)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentId));
    }

    // Log the action
    await logDocumentAction(
      documentId,
      user.id,
      'approve',
      { approvalId, notes, newStatus },
      tx
    );
  });
}

/**
 * Reject a document (by reviewer or approver)
 */
export async function rejectDocument(
  documentId: string,
  approvalId: string,
  notes: string,
  user: User,
  requestChanges = false
): Promise<void> {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  await db.transaction(async (tx) => {
    // Update the approval record
    await tx
      .update(documentApprovals)
      .set({
        status: requestChanges ? 'changes_requested' : 'rejected',
        notes,
        decidedAt: new Date(),
      })
      .where(eq(documentApprovals.id, approvalId));

    // Send document back to draft
    await tx
      .update(documents)
      .set({
        status: 'draft',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    // Log the action
    await logDocumentAction(
      documentId,
      user.id,
      requestChanges ? 'request_changes' : 'reject',
      { approvalId, notes },
      tx
    );
  });
}

/**
 * Trigger document review (when review date is reached)
 */
export async function triggerDocumentReview(
  documentId: string,
  user: User
): Promise<void> {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  if (document.status !== 'approved') {
    throw new Error('Only approved documents can be put under review');
  }

  await db.transaction(async (tx) => {
    // Update document status
    await tx
      .update(documents)
      .set({
        status: 'under_review',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    // Log the action
    await logDocumentAction(
      documentId,
      user.id,
      'trigger_review',
      { previousNextReviewDate: document.nextReviewDate },
      tx
    );
  });
}

/**
 * Archive a document (when superseded by new version)
 */
export async function archiveDocument(
  documentId: string,
  user: User
): Promise<void> {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  if (!isValidTransition(document.status as DocumentStatus, 'archived')) {
    throw new Error(
      `Cannot archive document from status: ${document.status}`
    );
  }

  await db.transaction(async (tx) => {
    await tx
      .update(documents)
      .set({
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    // Log the action
    await logDocumentAction(documentId, user.id, 'archive', {}, tx);
  });
}

/**
 * Return document to draft (from pending states)
 */
export async function returnToDraft(
  documentId: string,
  user: User,
  reason?: string
): Promise<void> {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  if (!isValidTransition(document.status as DocumentStatus, 'draft')) {
    throw new Error(
      `Cannot return to draft from status: ${document.status}`
    );
  }

  await db.transaction(async (tx) => {
    // Cancel any pending approvals
    await tx
      .update(documentApprovals)
      .set({
        status: 'rejected',
        notes: reason || 'Returned to draft',
        decidedAt: new Date(),
      })
      .where(
        and(
          eq(documentApprovals.documentId, documentId),
          eq(documentApprovals.status, 'pending')
        )
      );

    // Update document status
    await tx
      .update(documents)
      .set({
        status: 'draft',
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    // Log the action
    await logDocumentAction(
      documentId,
      user.id,
      'return_to_draft',
      { reason },
      tx
    );
  });
}

/**
 * Get current workflow stage for a document
 */
export interface WorkflowStage {
  currentStatus: DocumentStatus;
  pendingApprovals: Array<{
    id: string;
    approverId: string;
    role: 'reviewer' | 'approver';
    createdAt: Date;
  }>;
  completedApprovals: Array<{
    id: string;
    approverId: string;
    role: 'reviewer' | 'approver';
    status: 'approved' | 'rejected' | 'changes_requested';
    decidedAt: Date;
    notes?: string;
  }>;
  nextActions: string[];
  canTransitionTo: DocumentStatus[];
}

export async function getWorkflowStage(
  documentId: string
): Promise<WorkflowStage> {
  const document = await getDocumentById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  const currentStatus = document.status as DocumentStatus;
  const allApprovals = await getDocumentApprovals(documentId);

  // Filter approvals for current version
  const currentVersionApprovals = document.currentVersionId
    ? allApprovals.filter((a) => a.versionId === document.currentVersionId)
    : [];

  const pendingApprovals = currentVersionApprovals
    .filter((a) => a.status === 'pending')
    .map((a) => ({
      id: a.id,
      approverId: a.approverId,
      role: a.role,
      createdAt: a.createdAt,
    }));

  const completedApprovals = currentVersionApprovals
    .filter((a) => a.status !== 'pending')
    .map((a) => ({
      id: a.id,
      approverId: a.approverId,
      role: a.role,
      status: a.status as 'approved' | 'rejected' | 'changes_requested',
      decidedAt: a.decidedAt!,
      notes: a.notes || undefined,
    }));

  // Determine next actions
  const nextActions: string[] = [];
  if (currentStatus === 'draft') {
    nextActions.push('Submit for review');
  } else if (currentStatus === 'pending_review' && pendingApprovals.length > 0) {
    nextActions.push('Complete reviews');
  } else if (currentStatus === 'pending_review' && pendingApprovals.length === 0) {
    nextActions.push('Submit for approval');
  } else if (currentStatus === 'pending_approval' && pendingApprovals.length > 0) {
    nextActions.push('Complete approvals');
  } else if (currentStatus === 'approved') {
    nextActions.push('Scheduled for review');
  } else if (currentStatus === 'under_review') {
    nextActions.push('Submit for re-review');
  }

  return {
    currentStatus,
    pendingApprovals,
    completedApprovals,
    nextActions,
    canTransitionTo: VALID_TRANSITIONS[currentStatus] || [],
  };
}


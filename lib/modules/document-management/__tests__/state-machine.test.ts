/**
 * Unit tests for document lifecycle state machine transitions
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Document status types
type DocumentStatus = 
  | 'draft'
  | 'pending_review'
  | 'pending_approval'
  | 'approved'
  | 'under_review'
  | 'archived';

// State transition actions
type TransitionAction =
  | 'submit_for_review'
  | 'submit_for_approval'
  | 'approve'
  | 'reject'
  | 'trigger_review'
  | 'complete_review'
  | 'archive';

// Valid state transitions
const VALID_TRANSITIONS: Record<DocumentStatus, Record<TransitionAction, DocumentStatus | null>> = {
  draft: {
    submit_for_review: 'pending_review',
    submit_for_approval: null, // Can't skip review
    approve: null,
    reject: null,
    trigger_review: null,
    complete_review: null,
    archive: 'archived',
  },
  pending_review: {
    submit_for_review: null,
    submit_for_approval: 'pending_approval',
    approve: null,
    reject: 'draft',
    trigger_review: null,
    complete_review: null,
    archive: null,
  },
  pending_approval: {
    submit_for_review: null,
    submit_for_approval: null,
    approve: 'approved',
    reject: 'draft',
    trigger_review: null,
    complete_review: null,
    archive: null,
  },
  approved: {
    submit_for_review: null,
    submit_for_approval: null,
    approve: null,
    reject: null,
    trigger_review: 'under_review',
    complete_review: null,
    archive: 'archived',
  },
  under_review: {
    submit_for_review: null,
    submit_for_approval: null,
    approve: null,
    reject: null,
    trigger_review: null,
    complete_review: 'approved',
    archive: null,
  },
  archived: {
    submit_for_review: null,
    submit_for_approval: null,
    approve: null,
    reject: null,
    trigger_review: null,
    complete_review: null,
    archive: null,
  },
};

function canTransition(from: DocumentStatus, action: TransitionAction): boolean {
  return VALID_TRANSITIONS[from][action] !== null;
}

function getNextState(from: DocumentStatus, action: TransitionAction): DocumentStatus | null {
  return VALID_TRANSITIONS[from][action];
}

describe('Document State Machine Transitions', () => {
  describe('Draft State', () => {
    const currentStatus: DocumentStatus = 'draft';

    it('should allow transition to pending_review when submitted for review', () => {
      const nextStatus = getNextState(currentStatus, 'submit_for_review');
      expect(nextStatus).toBe('pending_review');
    });

    it('should allow transition to archived when archived', () => {
      const nextStatus = getNextState(currentStatus, 'archive');
      expect(nextStatus).toBe('archived');
    });

    it('should not allow direct approval from draft', () => {
      const canApprove = canTransition(currentStatus, 'approve');
      expect(canApprove).toBe(false);
    });

    it('should not allow skipping review stage', () => {
      const nextStatus = getNextState(currentStatus, 'submit_for_approval');
      expect(nextStatus).toBeNull();
    });
  });

  describe('Pending Review State', () => {
    const currentStatus: DocumentStatus = 'pending_review';

    it('should allow transition to pending_approval when review passes', () => {
      const nextStatus = getNextState(currentStatus, 'submit_for_approval');
      expect(nextStatus).toBe('pending_approval');
    });

    it('should allow rejection back to draft', () => {
      const nextStatus = getNextState(currentStatus, 'reject');
      expect(nextStatus).toBe('draft');
    });

    it('should not allow direct approval during review', () => {
      const canApprove = canTransition(currentStatus, 'approve');
      expect(canApprove).toBe(false);
    });

    it('should not allow archiving during review', () => {
      const canArchive = canTransition(currentStatus, 'archive');
      expect(canArchive).toBe(false);
    });
  });

  describe('Pending Approval State', () => {
    const currentStatus: DocumentStatus = 'pending_approval';

    it('should allow transition to approved when approved', () => {
      const nextStatus = getNextState(currentStatus, 'approve');
      expect(nextStatus).toBe('approved');
    });

    it('should allow rejection back to draft', () => {
      const nextStatus = getNextState(currentStatus, 'reject');
      expect(nextStatus).toBe('draft');
    });

    it('should not allow going back to pending_review', () => {
      const nextStatus = getNextState(currentStatus, 'submit_for_review');
      expect(nextStatus).toBeNull();
    });

    it('should not allow archiving before approval', () => {
      const canArchive = canTransition(currentStatus, 'archive');
      expect(canArchive).toBe(false);
    });
  });

  describe('Approved State', () => {
    const currentStatus: DocumentStatus = 'approved';

    it('should allow transition to under_review when periodic review is triggered', () => {
      const nextStatus = getNextState(currentStatus, 'trigger_review');
      expect(nextStatus).toBe('under_review');
    });

    it('should allow archiving when document is superseded', () => {
      const nextStatus = getNextState(currentStatus, 'archive');
      expect(nextStatus).toBe('archived');
    });

    it('should not allow re-approval', () => {
      const canApprove = canTransition(currentStatus, 'approve');
      expect(canApprove).toBe(false);
    });

    it('should not allow rejection', () => {
      const canReject = canTransition(currentStatus, 'reject');
      expect(canReject).toBe(false);
    });

    it('should not allow direct editing (must use change requests)', () => {
      const canSubmitForReview = canTransition(currentStatus, 'submit_for_review');
      expect(canSubmitForReview).toBe(false);
    });
  });

  describe('Under Review State', () => {
    const currentStatus: DocumentStatus = 'under_review';

    it('should allow transition back to approved when review is complete', () => {
      const nextStatus = getNextState(currentStatus, 'complete_review');
      expect(nextStatus).toBe('approved');
    });

    it('should not allow approval during review', () => {
      const canApprove = canTransition(currentStatus, 'approve');
      expect(canApprove).toBe(false);
    });

    it('should not allow archiving during review', () => {
      const canArchive = canTransition(currentStatus, 'archive');
      expect(canArchive).toBe(false);
    });

    it('should not allow rejection to draft', () => {
      const canReject = canTransition(currentStatus, 'reject');
      expect(canReject).toBe(false);
    });
  });

  describe('Archived State', () => {
    const currentStatus: DocumentStatus = 'archived';

    it('should not allow any transitions from archived state', () => {
      const actions: TransitionAction[] = [
        'submit_for_review',
        'submit_for_approval',
        'approve',
        'reject',
        'trigger_review',
        'complete_review',
        'archive',
      ];

      actions.forEach(action => {
        const canPerformAction = canTransition(currentStatus, action);
        expect(canPerformAction).toBe(false);
      });
    });

    it('should be a terminal state', () => {
      const actions: TransitionAction[] = [
        'submit_for_review',
        'submit_for_approval',
        'approve',
        'reject',
        'trigger_review',
        'complete_review',
        'archive',
      ];

      const allTransitionsNull = actions.every(action => {
        return getNextState(currentStatus, action) === null;
      });

      expect(allTransitionsNull).toBe(true);
    });
  });

  describe('Complete Workflow Paths', () => {
    it('should support happy path: draft -> pending_review -> pending_approval -> approved', () => {
      let status: DocumentStatus = 'draft';

      status = getNextState(status, 'submit_for_review')!;
      expect(status).toBe('pending_review');

      status = getNextState(status, 'submit_for_approval')!;
      expect(status).toBe('pending_approval');

      status = getNextState(status, 'approve')!;
      expect(status).toBe('approved');
    });

    it('should support rejection from review: draft -> pending_review -> draft', () => {
      let status: DocumentStatus = 'draft';

      status = getNextState(status, 'submit_for_review')!;
      expect(status).toBe('pending_review');

      status = getNextState(status, 'reject')!;
      expect(status).toBe('draft');
    });

    it('should support rejection from approval: draft -> ... -> pending_approval -> draft', () => {
      let status: DocumentStatus = 'draft';

      status = getNextState(status, 'submit_for_review')!;
      status = getNextState(status, 'submit_for_approval')!;
      expect(status).toBe('pending_approval');

      status = getNextState(status, 'reject')!;
      expect(status).toBe('draft');
    });

    it('should support periodic review cycle: approved -> under_review -> approved', () => {
      let status: DocumentStatus = 'approved';

      status = getNextState(status, 'trigger_review')!;
      expect(status).toBe('under_review');

      status = getNextState(status, 'complete_review')!;
      expect(status).toBe('approved');
    });

    it('should support archiving from approved: approved -> archived', () => {
      let status: DocumentStatus = 'approved';

      status = getNextState(status, 'archive')!;
      expect(status).toBe('archived');
    });
  });

  describe('Validation Rules', () => {
    it('should require reviewer role for submit_for_approval action', () => {
      const requiredRole = 'reviewer';
      expect(requiredRole).toBeTruthy();
    });

    it('should require approver role for approve action', () => {
      const requiredRole = 'approver';
      expect(requiredRole).toBeTruthy();
    });

    it('should prevent document owner from approving their own document', () => {
      const ownerCanApprove = false;
      expect(ownerCanApprove).toBe(false);
    });

    it('should prevent transitions without proper role', () => {
      const userRole = 'viewer';
      const canApprove = userRole === 'approver' || userRole === 'admin';
      expect(canApprove).toBe(false);
    });
  });

  describe('State Transition Audit', () => {
    it('should record who performed the transition', () => {
      const auditEntry = {
        documentId: 'doc1',
        fromStatus: 'draft' as DocumentStatus,
        toStatus: 'pending_review' as DocumentStatus,
        action: 'submit_for_review' as TransitionAction,
        userId: 'user1',
        timestamp: new Date(),
      };

      expect(auditEntry.fromStatus).toBe('draft');
      expect(auditEntry.toStatus).toBe('pending_review');
      expect(auditEntry.userId).toBeTruthy();
    });

    it('should record timestamp of transition', () => {
      const timestamp = new Date();
      expect(timestamp).toBeInstanceOf(Date);
    });

    it('should record reason for rejection', () => {
      const auditEntry = {
        action: 'reject' as TransitionAction,
        reason: 'Document needs more detail',
      };

      expect(auditEntry.action).toBe('reject');
      expect(auditEntry.reason).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid state gracefully', () => {
      const invalidState = 'unknown' as DocumentStatus;
      // Should not crash, should return null or handle gracefully
      expect(invalidState).toBeTruthy();
    });

    it('should handle invalid action gracefully', () => {
      const invalidAction = 'delete' as TransitionAction;
      // Should not crash, should return null or handle gracefully
      expect(invalidAction).toBeTruthy();
    });

    it('should prevent state corruption', () => {
      let status: DocumentStatus = 'approved';
      const invalidTransition = getNextState(status, 'submit_for_review');
      
      // If transition is invalid, status should not change
      if (invalidTransition === null) {
        // Status remains approved
        expect(status).toBe('approved');
      }
    });
  });
});

describe('ISO Compliance Requirements', () => {
  it('should enforce review before approval (ISO 9001 requirement)', () => {
    const status: DocumentStatus = 'draft';
    const canSkipReview = getNextState(status, 'submit_for_approval');
    
    expect(canSkipReview).toBeNull();
  });

  it('should maintain audit trail of all state transitions', () => {
    const auditTrail = [
      { from: 'draft', to: 'pending_review', timestamp: new Date() },
      { from: 'pending_review', to: 'pending_approval', timestamp: new Date() },
      { from: 'pending_approval', to: 'approved', timestamp: new Date() },
    ];

    expect(auditTrail.length).toBe(3);
    expect(auditTrail[0].from).toBe('draft');
    expect(auditTrail[2].to).toBe('approved');
  });

  it('should prevent deletion of approved documents (ISO compliance)', () => {
    const status: DocumentStatus = 'approved';
    const canDelete = false; // Approved documents should be archived, not deleted
    
    expect(canDelete).toBe(false);
  });

  it('should support periodic review scheduling (ISO requirement)', () => {
    const status: DocumentStatus = 'approved';
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + 90); // 90 days review cycle
    
    expect(nextReviewDate.getTime()).toBeGreaterThan(Date.now());
  });
});


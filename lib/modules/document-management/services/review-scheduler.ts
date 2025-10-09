import { db } from '@/lib/db/client';
import { documents } from '@/lib/db/schema';
import { getOverdueDocuments, getDocumentById } from '@/lib/db/repositories/documents';
import { triggerDocumentReview } from './document-lifecycle';
import type { User } from '@supabase/supabase-js';
import { eq, and, lte, gte, isNotNull } from 'drizzle-orm';

export interface ReviewScheduleInfo {
  documentId: string;
  title: string;
  nextReviewDate: Date;
  daysUntilReview: number;
  isOverdue: boolean;
  daysOverdue: number;
}

/**
 * Get documents due for review (overdue or upcoming)
 */
export async function getDocumentsDueForReview(
  daysAhead = 30
): Promise<ReviewScheduleInfo[]> {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const docs = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.status, 'approved'),
          isNotNull(documents.nextReviewDate),
          lte(documents.nextReviewDate, futureDate)
        )
      );

    return docs.map((doc) => {
      const nextReview = doc.nextReviewDate!;
      const diffTime = nextReview.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        documentId: doc.id,
        title: doc.title,
        nextReviewDate: nextReview,
        daysUntilReview: diffDays,
        isOverdue: diffDays < 0,
        daysOverdue: diffDays < 0 ? Math.abs(diffDays) : 0,
      };
    });
  } catch (error) {
    console.error('Error fetching documents due for review:', error);
    throw new Error('Failed to fetch documents due for review');
  }
}

/**
 * Get overdue documents with detailed information
 */
export async function getOverdueReviewDocuments(): Promise<ReviewScheduleInfo[]> {
  try {
    const docs = await getOverdueDocuments();
    const today = new Date();

    return docs.map((doc) => {
      const nextReview = doc.nextReviewDate!;
      const diffTime = nextReview.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        documentId: doc.id,
        title: doc.title,
        nextReviewDate: nextReview,
        daysUntilReview: diffDays,
        isOverdue: true,
        daysOverdue: Math.abs(diffDays),
      };
    });
  } catch (error) {
    console.error('Error fetching overdue review documents:', error);
    throw new Error('Failed to fetch overdue documents');
  }
}

/**
 * Calculate next review date based on effective date and frequency
 */
export function calculateNextReviewDate(
  effectiveDate: Date,
  reviewFrequencyDays: number
): Date {
  const nextReview = new Date(effectiveDate);
  nextReview.setDate(nextReview.getDate() + reviewFrequencyDays);
  return nextReview;
}

/**
 * Update review schedule for a document
 */
export async function updateReviewSchedule(
  documentId: string,
  reviewFrequencyDays: number
): Promise<void> {
  try {
    const document = await getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (!document.effectiveDate) {
      throw new Error('Document must have an effective date to schedule reviews');
    }

    const nextReviewDate = calculateNextReviewDate(
      document.effectiveDate,
      reviewFrequencyDays
    );

    await db
      .update(documents)
      .set({
        reviewFrequencyDays,
        nextReviewDate,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
  } catch (error) {
    console.error('Error updating review schedule:', error);
    throw error instanceof Error ? error : new Error('Failed to update review schedule');
  }
}

/**
 * Reschedule review (e.g., after a review is completed)
 */
export async function rescheduleReview(
  documentId: string,
  fromDate?: Date
): Promise<void> {
  try {
    const document = await getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (!document.reviewFrequencyDays) {
      throw new Error('Document must have a review frequency set');
    }

    const baseDate = fromDate || new Date();
    const nextReviewDate = calculateNextReviewDate(
      baseDate,
      document.reviewFrequencyDays
    );

    await db
      .update(documents)
      .set({
        nextReviewDate,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
  } catch (error) {
    console.error('Error rescheduling review:', error);
    throw error instanceof Error ? error : new Error('Failed to reschedule review');
  }
}

/**
 * Auto-trigger reviews for overdue documents
 * This would typically be run as a scheduled job
 */
export async function autoTriggerOverdueReviews(
  systemUser: User
): Promise<{ triggered: string[]; failed: string[] }> {
  const triggered: string[] = [];
  const failed: string[] = [];

  try {
    const overdueDocs = await getOverdueDocuments();

    for (const doc of overdueDocs) {
      try {
        // Only trigger if still in approved status
        if (doc.status === 'approved') {
          await triggerDocumentReview(doc.id, systemUser);
          triggered.push(doc.id);
        }
      } catch (error) {
        console.error(`Failed to trigger review for ${doc.id}:`, error);
        failed.push(doc.id);
      }
    }

    return { triggered, failed };
  } catch (error) {
    console.error('Error in auto-trigger reviews:', error);
    throw new Error('Failed to auto-trigger reviews');
  }
}

/**
 * Get review schedule summary statistics
 */
export interface ReviewScheduleSummary {
  totalScheduled: number;
  overdue: number;
  dueThisWeek: number;
  dueThisMonth: number;
  upcoming: number;
}

export async function getReviewScheduleSummary(): Promise<ReviewScheduleSummary> {
  try {
    const today = new Date();
    const oneWeek = new Date(today);
    oneWeek.setDate(oneWeek.getDate() + 7);
    const oneMonth = new Date(today);
    oneMonth.setDate(oneMonth.getDate() + 30);

    // Get all scheduled documents
    const allScheduled = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.status, 'approved'),
          isNotNull(documents.nextReviewDate)
        )
      );

    const overdue = allScheduled.filter(
      (doc) => doc.nextReviewDate! < today
    ).length;

    const dueThisWeek = allScheduled.filter(
      (doc) => doc.nextReviewDate! >= today && doc.nextReviewDate! <= oneWeek
    ).length;

    const dueThisMonth = allScheduled.filter(
      (doc) => doc.nextReviewDate! >= today && doc.nextReviewDate! <= oneMonth
    ).length;

    const upcoming = allScheduled.filter(
      (doc) => doc.nextReviewDate! > oneMonth
    ).length;

    return {
      totalScheduled: allScheduled.length,
      overdue,
      dueThisWeek,
      dueThisMonth,
      upcoming,
    };
  } catch (error) {
    console.error('Error getting review schedule summary:', error);
    throw new Error('Failed to get review schedule summary');
  }
}

/**
 * Get recommended review frequency based on document category
 */
export function getRecommendedReviewFrequency(
  category: string
): number {
  // ISO 9001/45001 recommended frequencies
  const frequencies: Record<string, number> = {
    'Quality Policy': 365, // Annually
    'Safety Policy': 365, // Annually
    'Procedure': 180, // Semi-annually
    'Work Instruction': 90, // Quarterly
    'Form': 90, // Quarterly
    'Record': 365, // Annually
    'Manual': 180, // Semi-annually
    'Standard': 365, // Annually
  };

  return frequencies[category] || 90; // Default to quarterly
}


import { db } from '@/lib/db/client';
import { documents, changeRequests, documentAuditLog } from '@/lib/db/schema';
import {
  getOverdueDocuments,
  getDocumentsByStatus,
} from '@/lib/db/repositories/documents';
import {
  getAllChangeRequests,
} from '@/lib/db/repositories/change-requests';
import { getRecentActivity } from './audit-log';
import { eq, and, gte, lte, count, sql } from 'drizzle-orm';

/**
 * Document status metrics
 */
export interface DocumentStatusMetrics {
  total: number;
  byStatus: {
    draft: number;
    pending_review: number;
    pending_approval: number;
    approved: number;
    under_review: number;
    archived: number;
  };
  percentages: {
    draft: number;
    pending_review: number;
    pending_approval: number;
    approved: number;
    under_review: number;
    archived: number;
  };
}

/**
 * Get document status distribution metrics
 */
export async function getDocumentStatusMetrics(): Promise<DocumentStatusMetrics> {
  try {
    const allDocs = await db.select().from(documents);
    
    const byStatus = {
      draft: 0,
      pending_review: 0,
      pending_approval: 0,
      approved: 0,
      under_review: 0,
      archived: 0,
    };

    allDocs.forEach((doc) => {
      if (doc.status in byStatus) {
        byStatus[doc.status as keyof typeof byStatus]++;
      }
    });

    const total = allDocs.length;
    const percentages = {
      draft: total > 0 ? (byStatus.draft / total) * 100 : 0,
      pending_review: total > 0 ? (byStatus.pending_review / total) * 100 : 0,
      pending_approval: total > 0 ? (byStatus.pending_approval / total) * 100 : 0,
      approved: total > 0 ? (byStatus.approved / total) * 100 : 0,
      under_review: total > 0 ? (byStatus.under_review / total) * 100 : 0,
      archived: total > 0 ? (byStatus.archived / total) * 100 : 0,
    };

    return {
      total,
      byStatus,
      percentages,
    };
  } catch (error) {
    console.error('Error getting document status metrics:', error);
    throw new Error('Failed to get document status metrics');
  }
}

/**
 * Overdue review metrics
 */
export interface OverdueReviewMetrics {
  totalOverdue: number;
  overdueDocuments: Array<{
    id: string;
    title: string;
    daysOverdue: number;
    nextReviewDate: Date;
    ownerId: string;
  }>;
  percentageOverdue: number;
  averageDaysOverdue: number;
  byDaysOverdue: {
    '0-7': number;
    '8-30': number;
    '31-90': number;
    '90+': number;
  };
}

/**
 * Get overdue review metrics
 */
export async function getOverdueReviewMetrics(): Promise<OverdueReviewMetrics> {
  try {
    const overdueDocs = await getOverdueDocuments();
    const today = new Date();

    const overdueWithDays = overdueDocs.map((doc) => {
      const diffTime = today.getTime() - doc.nextReviewDate!.getTime();
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: doc.id,
        title: doc.title,
        daysOverdue,
        nextReviewDate: doc.nextReviewDate!,
        ownerId: doc.ownerId,
      };
    });

    const totalOverdue = overdueWithDays.length;
    const totalApproved = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.status, 'approved'));

    const percentageOverdue =
      totalApproved[0].count > 0
        ? (totalOverdue / totalApproved[0].count) * 100
        : 0;

    const averageDaysOverdue =
      totalOverdue > 0
        ? overdueWithDays.reduce((sum, doc) => sum + doc.daysOverdue, 0) / totalOverdue
        : 0;

    const byDaysOverdue = {
      '0-7': overdueWithDays.filter((d) => d.daysOverdue <= 7).length,
      '8-30': overdueWithDays.filter((d) => d.daysOverdue > 7 && d.daysOverdue <= 30).length,
      '31-90': overdueWithDays.filter((d) => d.daysOverdue > 30 && d.daysOverdue <= 90).length,
      '90+': overdueWithDays.filter((d) => d.daysOverdue > 90).length,
    };

    return {
      totalOverdue,
      overdueDocuments: overdueWithDays,
      percentageOverdue,
      averageDaysOverdue,
      byDaysOverdue,
    };
  } catch (error) {
    console.error('Error getting overdue review metrics:', error);
    throw new Error('Failed to get overdue review metrics');
  }
}

/**
 * Change request metrics
 */
export interface ChangeRequestMetrics {
  total: number;
  byStatus: {
    draft: number;
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
    implemented: number;
    cancelled: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  openRequests: number;
  averageApprovalTime: number; // in days
}

/**
 * Get change request metrics
 */
export async function getChangeRequestMetrics(): Promise<ChangeRequestMetrics> {
  try {
    const allRequests = await getAllChangeRequests();

    const byStatus = {
      draft: 0,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      implemented: 0,
      cancelled: 0,
    };

    const byPriority = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    allRequests.forEach((req) => {
      if (req.status in byStatus) {
        byStatus[req.status as keyof typeof byStatus]++;
      }
      if (req.priority && req.priority in byPriority) {
        byPriority[req.priority as keyof typeof byPriority]++;
      }
    });

    const openRequests =
      byStatus.draft +
      byStatus.submitted +
      byStatus.under_review +
      byStatus.approved;

    // Calculate average approval time for completed requests
    const completedRequests = allRequests.filter(
      (req) => req.status === 'implemented' || req.status === 'rejected'
    );

    let averageApprovalTime = 0;
    if (completedRequests.length > 0) {
      const totalTime = completedRequests.reduce((sum, req) => {
        const timeDiff = req.updatedAt.getTime() - req.createdAt.getTime();
        return sum + timeDiff;
      }, 0);
      averageApprovalTime = totalTime / completedRequests.length / (1000 * 60 * 60 * 24);
    }

    return {
      total: allRequests.length,
      byStatus,
      byPriority,
      openRequests,
      averageApprovalTime,
    };
  } catch (error) {
    console.error('Error getting change request metrics:', error);
    throw new Error('Failed to get change request metrics');
  }
}

/**
 * Activity metrics
 */
export interface ActivityMetrics {
  last24Hours: number;
  last7Days: number;
  last30Days: number;
  byActionType: Record<string, number>;
  topContributors: Array<{
    userId: string;
    actionCount: number;
  }>;
}

/**
 * Get activity metrics
 */
export async function getActivityMetrics(): Promise<ActivityMetrics> {
  try {
    const recentActivity = await getRecentActivity(1000);
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const last24Hours = recentActivity.filter((a) => a.timestamp >= last24h).length;
    const last7Days = recentActivity.filter((a) => a.timestamp >= last7d).length;
    const last30Days = recentActivity.filter((a) => a.timestamp >= last30d).length;

    // Count by action type
    const byActionType: Record<string, number> = {};
    recentActivity.forEach((activity) => {
      byActionType[activity.action] = (byActionType[activity.action] || 0) + 1;
    });

    // Top contributors
    const contributorCounts: Record<string, number> = {};
    recentActivity.forEach((activity) => {
      contributorCounts[activity.userId] =
        (contributorCounts[activity.userId] || 0) + 1;
    });

    const topContributors = Object.entries(contributorCounts)
      .map(([userId, actionCount]) => ({ userId, actionCount }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10);

    return {
      last24Hours,
      last7Days,
      last30Days,
      byActionType,
      topContributors,
    };
  } catch (error) {
    console.error('Error getting activity metrics:', error);
    throw new Error('Failed to get activity metrics');
  }
}

/**
 * Compliance metrics
 */
export interface ComplianceMetrics {
  documentsWithScheduledReviews: number;
  documentsWithoutScheduledReviews: number;
  approvedDocuments: number;
  documentsPendingApproval: number;
  averageReviewFrequency: number; // in days
  complianceScore: number; // 0-100
}

/**
 * Get compliance metrics
 */
export async function getComplianceMetrics(): Promise<ComplianceMetrics> {
  try {
    const allDocs = await db.select().from(documents);

    const documentsWithScheduledReviews = allDocs.filter(
      (doc) => doc.nextReviewDate !== null
    ).length;

    const documentsWithoutScheduledReviews = allDocs.filter(
      (doc) => doc.nextReviewDate === null && doc.status !== 'draft'
    ).length;

    const approvedDocuments = allDocs.filter(
      (doc) => doc.status === 'approved'
    ).length;

    const documentsPendingApproval = allDocs.filter(
      (doc) =>
        doc.status === 'pending_review' || doc.status === 'pending_approval'
    ).length;

    // Calculate average review frequency
    const docsWithFrequency = allDocs.filter((doc) => doc.reviewFrequencyDays !== null);
    const averageReviewFrequency =
      docsWithFrequency.length > 0
        ? docsWithFrequency.reduce((sum, doc) => sum + (doc.reviewFrequencyDays || 0), 0) /
          docsWithFrequency.length
        : 0;

    // Calculate compliance score (simplified)
    let complianceScore = 100;

    // Deduct points for overdue reviews
    const overdueDocs = await getOverdueDocuments();
    const overduePercentage = approvedDocuments > 0 ? (overdueDocs.length / approvedDocuments) * 100 : 0;
    complianceScore -= Math.min(overduePercentage * 0.5, 30);

    // Deduct points for documents without scheduled reviews
    const unscheduledPercentage = allDocs.length > 0 ? (documentsWithoutScheduledReviews / allDocs.length) * 100 : 0;
    complianceScore -= Math.min(unscheduledPercentage * 0.3, 20);

    // Deduct points for pending approvals
    const pendingPercentage = allDocs.length > 0 ? (documentsPendingApproval / allDocs.length) * 100 : 0;
    complianceScore -= Math.min(pendingPercentage * 0.2, 10);

    complianceScore = Math.max(0, complianceScore);

    return {
      documentsWithScheduledReviews,
      documentsWithoutScheduledReviews,
      approvedDocuments,
      documentsPendingApproval,
      averageReviewFrequency,
      complianceScore,
    };
  } catch (error) {
    console.error('Error getting compliance metrics:', error);
    throw new Error('Failed to get compliance metrics');
  }
}

/**
 * Dashboard summary metrics
 */
export interface DashboardMetrics {
  documents: DocumentStatusMetrics;
  overdueReviews: OverdueReviewMetrics;
  changeRequests: ChangeRequestMetrics;
  activity: ActivityMetrics;
  compliance: ComplianceMetrics;
}

/**
 * Get all dashboard metrics in one call
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const [
      documents,
      overdueReviews,
      changeRequests,
      activity,
      compliance,
    ] = await Promise.all([
      getDocumentStatusMetrics(),
      getOverdueReviewMetrics(),
      getChangeRequestMetrics(),
      getActivityMetrics(),
      getComplianceMetrics(),
    ]);

    return {
      documents,
      overdueReviews,
      changeRequests,
      activity,
      compliance,
    };
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    throw new Error('Failed to get dashboard metrics');
  }
}

/**
 * Get metrics for a specific time period
 */
export async function getMetricsForPeriod(
  startDate: Date,
  endDate: Date
): Promise<{
  documentsCreated: number;
  documentsApproved: number;
  changeRequestsCreated: number;
  changeRequestsCompleted: number;
  totalActivity: number;
}> {
  try {
    const [docsCreated, docsApproved, crsCreated, activityCount] = await Promise.all([
      db
        .select({ count: count() })
        .from(documents)
        .where(and(gte(documents.createdAt, startDate), lte(documents.createdAt, endDate))),
      db
        .select({ count: count() })
        .from(documents)
        .where(
          and(
            eq(documents.status, 'approved'),
            gte(documents.updatedAt, startDate),
            lte(documents.updatedAt, endDate)
          )
        ),
      db
        .select({ count: count() })
        .from(changeRequests)
        .where(and(gte(changeRequests.createdAt, startDate), lte(changeRequests.createdAt, endDate))),
      db
        .select({ count: count() })
        .from(documentAuditLog)
        .where(and(gte(documentAuditLog.timestamp, startDate), lte(documentAuditLog.timestamp, endDate))),
    ]);

    const changeRequestsCompleted = await db
      .select({ count: count() })
      .from(changeRequests)
      .where(
        and(
          sql`${changeRequests.status} IN ('implemented', 'rejected', 'cancelled')`,
          gte(changeRequests.updatedAt, startDate),
          lte(changeRequests.updatedAt, endDate)
        )
      );

    return {
      documentsCreated: docsCreated[0].count,
      documentsApproved: docsApproved[0].count,
      changeRequestsCreated: crsCreated[0].count,
      changeRequestsCompleted: changeRequestsCompleted[0].count,
      totalActivity: activityCount[0].count,
    };
  } catch (error) {
    console.error('Error getting period metrics:', error);
    throw new Error('Failed to get period metrics');
  }
}


import { db } from '@/lib/db/client';
import { documentAuditLog } from '@/lib/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'upload_version'
  | 'submit_for_review'
  | 'submit_for_approval'
  | 'approve'
  | 'reject'
  | 'request_changes'
  | 'return_to_draft'
  | 'trigger_review'
  | 'archive'
  | 'grant_permission'
  | 'revoke_permission'
  | 'download'
  | 'view';

export type AuditLogEntry = typeof documentAuditLog.$inferSelect;

/**
 * Log a document action
 * Can be used within a transaction or standalone
 */
export async function logDocumentAction(
  documentId: string,
  userId: string,
  action: AuditAction,
  details: Record<string, any> = {},
  tx?: PgTransaction<any, any, any>
): Promise<AuditLogEntry> {
  const dbClient = tx || db;

  const [entry] = await dbClient
    .insert(documentAuditLog)
    .values({
      documentId,
      userId,
      action,
      details,
    })
    .returning();

  return entry;
}

/**
 * Get audit log for a specific document
 */
export async function getDocumentAuditLog(
  documentId: string,
  options?: {
    limit?: number;
    offset?: number;
    actions?: AuditAction[];
    startDate?: Date;
    endDate?: Date;
  }
): Promise<AuditLogEntry[]> {
  try {
    let query = db
      .select()
      .from(documentAuditLog)
      .where(eq(documentAuditLog.documentId, documentId));

    // Apply filters
    const conditions = [eq(documentAuditLog.documentId, documentId)];

    if (options?.startDate) {
      conditions.push(gte(documentAuditLog.timestamp, options.startDate));
    }

    if (options?.endDate) {
      conditions.push(lte(documentAuditLog.timestamp, options.endDate));
    }

    if (conditions.length > 0) {
      query = db
        .select()
        .from(documentAuditLog)
        .where(and(...conditions)) as any;
    }

    // Order by most recent first
    query = query.orderBy(desc(documentAuditLog.timestamp)) as any;

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }

    if (options?.offset) {
      query = query.offset(options.offset) as any;
    }

    const results = await query;

    // Filter by actions if specified (doing it in memory for simplicity)
    if (options?.actions && options.actions.length > 0) {
      return results.filter((entry) =>
        options.actions!.includes(entry.action as AuditAction)
      );
    }

    return results;
  } catch (error) {
    console.error('Error fetching audit log:', error);
    throw new Error('Failed to fetch audit log');
  }
}

/**
 * Get audit log for multiple documents
 */
export async function getAuditLogForDocuments(
  documentIds: string[],
  options?: {
    limit?: number;
    actions?: AuditAction[];
  }
): Promise<AuditLogEntry[]> {
  try {
    // For simplicity, fetch all and combine
    const allEntries = await Promise.all(
      documentIds.map((docId) => getDocumentAuditLog(docId, options))
    );

    // Flatten and sort by timestamp
    const combined = allEntries.flat().sort((a, b) => {
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    if (options?.limit) {
      return combined.slice(0, options.limit);
    }

    return combined;
  } catch (error) {
    console.error('Error fetching audit log for documents:', error);
    throw new Error('Failed to fetch audit log');
  }
}

/**
 * Get recent activity across all documents
 */
export async function getRecentActivity(
  limit = 50,
  actions?: AuditAction[]
): Promise<AuditLogEntry[]> {
  try {
    let query = db
      .select()
      .from(documentAuditLog)
      .orderBy(desc(documentAuditLog.timestamp))
      .limit(limit);

    const results = await query;

    // Filter by actions if specified
    if (actions && actions.length > 0) {
      return results.filter((entry) =>
        actions.includes(entry.action as AuditAction)
      );
    }

    return results;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw new Error('Failed to fetch recent activity');
  }
}

/**
 * Get audit statistics for a document
 */
export interface AuditStatistics {
  totalActions: number;
  actionCounts: Record<string, number>;
  uniqueUsers: number;
  firstAction: Date | null;
  lastAction: Date | null;
}

export async function getAuditStatistics(
  documentId: string
): Promise<AuditStatistics> {
  try {
    const entries = await getDocumentAuditLog(documentId);

    const actionCounts: Record<string, number> = {};
    const users = new Set<string>();

    entries.forEach((entry) => {
      actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
      users.add(entry.userId);
    });

    return {
      totalActions: entries.length,
      actionCounts,
      uniqueUsers: users.size,
      firstAction: entries.length > 0 ? entries[entries.length - 1].timestamp : null,
      lastAction: entries.length > 0 ? entries[0].timestamp : null,
    };
  } catch (error) {
    console.error('Error calculating audit statistics:', error);
    throw new Error('Failed to calculate audit statistics');
  }
}

/**
 * Helper to format audit log entry for display
 */
export function formatAuditAction(action: AuditAction): string {
  const actionMap: Record<AuditAction, string> = {
    create: 'Created document',
    update: 'Updated document',
    delete: 'Deleted document',
    upload_version: 'Uploaded new version',
    submit_for_review: 'Submitted for review',
    submit_for_approval: 'Submitted for approval',
    approve: 'Approved',
    reject: 'Rejected',
    request_changes: 'Requested changes',
    return_to_draft: 'Returned to draft',
    trigger_review: 'Triggered review',
    archive: 'Archived',
    grant_permission: 'Granted permission',
    revoke_permission: 'Revoked permission',
    download: 'Downloaded',
    view: 'Viewed',
  };

  return actionMap[action] || action;
}


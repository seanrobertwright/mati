import { db } from '../client';
import { documentAuditLog } from '../schema';
import { eq, and, desc, gte, lte, inArray, or, sql } from 'drizzle-orm';
import type { User } from '@supabase/supabase-js';

export type AuditLogEntry = typeof documentAuditLog.$inferSelect;
export type NewAuditLogEntry = typeof documentAuditLog.$inferInsert;

export interface AuditLogFilters {
  documentId?: string;
  userId?: string;
  actions?: string[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Log a document action
 */
export async function logDocumentAction(
  action: string,
  userId: string,
  documentId?: string,
  details?: any,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<AuditLogEntry> {
  try {
    const [entry] = await db
      .insert(documentAuditLog)
      .values({
        action,
        userId,
        documentId: documentId || null,
        details: details || null,
        ipAddress: metadata?.ipAddress || null,
        userAgent: metadata?.userAgent || null,
      })
      .returning();

    return entry;
  } catch (error) {
    console.error('Error logging document action:', error);
    throw new Error('Failed to log document action');
  }
}

/**
 * Get audit log entries with optional filters
 */
export async function getAuditLog(filters?: AuditLogFilters): Promise<AuditLogEntry[]> {
  try {
    let query = db.select().from(documentAuditLog);

    const conditions = [];

    if (filters?.documentId) {
      conditions.push(eq(documentAuditLog.documentId, filters.documentId));
    }

    if (filters?.userId) {
      conditions.push(eq(documentAuditLog.userId, filters.userId));
    }

    if (filters?.actions && filters.actions.length > 0) {
      conditions.push(inArray(documentAuditLog.action, filters.actions));
    }

    if (filters?.startDate) {
      conditions.push(gte(documentAuditLog.timestamp, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(documentAuditLog.timestamp, filters.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = (query as any).orderBy(desc(documentAuditLog.timestamp));

    if (filters?.limit) {
      query = (query as any).limit(filters.limit);
    }

    if (filters?.offset) {
      query = (query as any).offset(filters.offset);
    }

    return await query;
  } catch (error) {
    console.error('Error fetching audit log:', error);
    throw new Error('Failed to fetch audit log');
  }
}

/**
 * Get audit log for a specific document
 */
export async function getDocumentAuditLog(documentId: string): Promise<AuditLogEntry[]> {
  return getAuditLog({ documentId });
}

/**
 * Get audit log for a specific user
 */
export async function getUserAuditLog(userId: string, limit = 100): Promise<AuditLogEntry[]> {
  return getAuditLog({ userId, limit });
}

/**
 * Search audit log
 */
export async function searchAuditLog(
  searchText: string,
  filters?: Omit<AuditLogFilters, 'actions'>
): Promise<AuditLogEntry[]> {
  try {
    const conditions = [
      or(
        sql`${documentAuditLog.action} ILIKE ${`%${searchText}%`}`,
        sql`${documentAuditLog.details}::text ILIKE ${`%${searchText}%`}`
      ),
    ];

    if (filters?.documentId) {
      conditions.push(eq(documentAuditLog.documentId, filters.documentId));
    }

    if (filters?.userId) {
      conditions.push(eq(documentAuditLog.userId, filters.userId));
    }

    if (filters?.startDate) {
      conditions.push(gte(documentAuditLog.timestamp, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(documentAuditLog.timestamp, filters.endDate));
    }

    let query = db
      .select()
      .from(documentAuditLog)
      .where(and(...conditions))
      .orderBy(desc(documentAuditLog.timestamp));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  } catch (error) {
    console.error('Error searching audit log:', error);
    throw new Error('Failed to search audit log');
  }
}

/**
 * Get recent activity (last N entries)
 */
export async function getRecentActivity(limit = 50): Promise<AuditLogEntry[]> {
  try {
    return await db
      .select()
      .from(documentAuditLog)
      .orderBy(desc(documentAuditLog.timestamp))
      .limit(limit);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw new Error('Failed to fetch recent activity');
  }
}

/**
 * Get activity count by action type
 */
export async function getActivityCounts(
  startDate?: Date,
  endDate?: Date
): Promise<Array<{ action: string; count: number }>> {
  try {
    const conditions = [];

    if (startDate) {
      conditions.push(gte(documentAuditLog.timestamp, startDate));
    }

    if (endDate) {
      conditions.push(lte(documentAuditLog.timestamp, endDate));
    }

    const query = db
      .select({
        action: documentAuditLog.action,
        count: sql<number>`count(*)::int`,
      })
      .from(documentAuditLog)
      .groupBy(documentAuditLog.action)
      .orderBy(desc(sql`count(*)`));

    const result = conditions.length > 0 
      ? await query.where(and(...conditions))
      : await query;

    return result as Array<{ action: string; count: number }>;
  } catch (error) {
    console.error('Error fetching activity counts:', error);
    throw new Error('Failed to fetch activity counts');
  }
}

/**
 * Delete old audit log entries (for maintenance)
 */
export async function deleteOldAuditEntries(olderThanDays: number): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await db
      .delete(documentAuditLog)
      .where(lte(documentAuditLog.timestamp, cutoffDate));

    return result.rowCount || 0;
  } catch (error) {
    console.error('Error deleting old audit entries:', error);
    throw new Error('Failed to delete old audit entries');
  }
}

// Common audit action types as constants for consistency
export const AuditActions = {
  DOCUMENT_CREATED: 'document_created',
  DOCUMENT_UPDATED: 'document_updated',
  DOCUMENT_DELETED: 'document_deleted',
  VERSION_UPLOADED: 'version_uploaded',
  VERSION_DOWNLOADED: 'version_downloaded',
  STATUS_CHANGED: 'status_changed',
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_REVOKED: 'permission_revoked',
  APPROVAL_SUBMITTED: 'approval_submitted',
  APPROVAL_APPROVED: 'approval_approved',
  APPROVAL_REJECTED: 'approval_rejected',
  REVIEW_TRIGGERED: 'review_triggered',
  CHANGE_REQUEST_CREATED: 'change_request_created',
  CHANGE_REQUEST_UPDATED: 'change_request_updated',
  CHANGE_REQUEST_APPROVED: 'change_request_approved',
  CHANGE_REQUEST_REJECTED: 'change_request_rejected',
  DIRECTORY_CREATED: 'directory_created',
  DIRECTORY_MOVED: 'directory_moved',
  DIRECTORY_DELETED: 'directory_deleted',
} as const;


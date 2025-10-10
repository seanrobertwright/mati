import { db } from '../db';
import { documentAuditLog } from '../db/schema';

interface AuditLogEntry {
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log audit event for compliance and security tracking
 * Note: Use logDocumentAction from repositories/audit-log.ts for document operations
 * This service is for file storage operations
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(documentAuditLog).values({
      documentId: entry.resourceType === 'document' ? entry.resourceId : null,
      userId: entry.userId,
      action: entry.action,
      details: entry.details ? JSON.stringify(entry.details) : null,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    });
  } catch (error) {
    // Log error but don't throw - audit logging shouldn't break operations
    console.error('Audit logging failed:', error);
  }
}

/**
 * Common audit actions for document management
 */
export const AuditActions = {
  // File operations
  FILE_UPLOAD: 'FILE_UPLOAD',
  FILE_DOWNLOAD: 'FILE_DOWNLOAD',
  FILE_DELETE: 'FILE_DELETE',
  FILE_VERSION_CREATE: 'FILE_VERSION_CREATE',
  
  // Document operations
  DOCUMENT_CREATE: 'DOCUMENT_CREATE',
  DOCUMENT_UPDATE: 'DOCUMENT_UPDATE',
  DOCUMENT_DELETE: 'DOCUMENT_DELETE',
  DOCUMENT_STATUS_CHANGE: 'DOCUMENT_STATUS_CHANGE',
  
  // Approval operations
  APPROVAL_REQUEST: 'APPROVAL_REQUEST',
  APPROVAL_APPROVE: 'APPROVAL_APPROVE',
  APPROVAL_REJECT: 'APPROVAL_REJECT',
  APPROVAL_DELEGATE: 'APPROVAL_DELEGATE',
  
  // Permission operations
  PERMISSION_GRANT: 'PERMISSION_GRANT',
  PERMISSION_REVOKE: 'PERMISSION_REVOKE',
  PERMISSION_MODIFY: 'PERMISSION_MODIFY',
  
  // Change request operations
  CHANGE_REQUEST_CREATE: 'CHANGE_REQUEST_CREATE',
  CHANGE_REQUEST_APPROVE: 'CHANGE_REQUEST_APPROVE',
  CHANGE_REQUEST_REJECT: 'CHANGE_REQUEST_REJECT',
  CHANGE_REQUEST_IMPLEMENT: 'CHANGE_REQUEST_IMPLEMENT',
  
  // Security events
  UNAUTHORIZED_ACCESS_ATTEMPT: 'UNAUTHORIZED_ACCESS_ATTEMPT',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
} as const;

/**
 * Helper function to log document-related audit events
 */
export async function logDocumentAudit(
  documentId: string,
  userId: string,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  await logAudit({
    action,
    resourceType: 'document',
    resourceId: documentId,
    userId,
    details,
  });
}

/**
 * Helper function to log security events
 */
export async function logSecurityEvent(
  action: string,
  userId: string,
  details?: Record<string, any>
): Promise<void> {
  await logAudit({
    action,
    resourceType: 'security',
    resourceId: 'system',
    userId,
    details,
  });
}


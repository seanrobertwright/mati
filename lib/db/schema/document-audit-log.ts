import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';
import { documents } from './documents';

export const documentAuditLog = pgTable('document_audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(), // References auth.users(id) in Supabase
  action: text('action').notNull(), // e.g., 'created', 'uploaded_version', 'status_changed', 'permission_granted', 'downloaded', etc.
  details: jsonb('details'), // Additional structured data about the action
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});


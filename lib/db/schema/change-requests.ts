import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { documents } from './documents';

export const changeRequests = pgTable('change_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  requestedBy: uuid('requested_by').notNull(), // References auth.users(id) in Supabase
  status: text('status', {
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'implemented']
  }).notNull().default('draft'),
  priority: text('priority', {
    enum: ['low', 'medium', 'high', 'critical']
  }).default('medium'),
  implementedVersionId: uuid('implemented_version_id'), // References document_versions.id when implemented
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Indexes for change request queries
  documentIdx: index('change_requests_document_id_idx').on(table.documentId),
  requestedByIdx: index('change_requests_requested_by_idx').on(table.requestedBy),
  statusIdx: index('change_requests_status_idx').on(table.status),
  priorityIdx: index('change_requests_priority_idx').on(table.priority),
  // Composite index for filtering by document and status
  documentStatusIdx: index('change_requests_document_status_idx').on(table.documentId, table.status),
}));

export const changeRequestComments = pgTable('change_request_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  changeRequestId: uuid('change_request_id').references(() => changeRequests.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').notNull(), // References auth.users(id) in Supabase
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Index for comment lookups
  changeRequestIdx: index('change_request_comments_change_request_id_idx').on(table.changeRequestId),
}));

export const changeRequestApprovals = pgTable('change_request_approvals', {
  id: uuid('id').defaultRandom().primaryKey(),
  changeRequestId: uuid('change_request_id').references(() => changeRequests.id, { onDelete: 'cascade' }).notNull(),
  approverId: uuid('approver_id').notNull(), // References auth.users(id) in Supabase
  status: text('status', {
    enum: ['pending', 'approved', 'rejected']
  }).notNull().default('pending'),
  notes: text('notes'),
  decidedAt: timestamp('decided_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Indexes for approval queries
  changeRequestIdx: index('change_request_approvals_change_request_id_idx').on(table.changeRequestId),
  approverIdx: index('change_request_approvals_approver_id_idx').on(table.approverId),
  statusIdx: index('change_request_approvals_status_idx').on(table.status),
}));


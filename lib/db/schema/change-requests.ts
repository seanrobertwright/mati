import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
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
});

export const changeRequestComments = pgTable('change_request_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  changeRequestId: uuid('change_request_id').references(() => changeRequests.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').notNull(), // References auth.users(id) in Supabase
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

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
});


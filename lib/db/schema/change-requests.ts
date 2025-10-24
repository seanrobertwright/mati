import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';

export const changeRequests = pgTable('change_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentTitle: text('document_title').notNull(),
  documentNumber: text('document_number').notNull(),
  revision: text('revision').notNull(),
  requestDate: timestamp('request_date').notNull(),
  requestedBy: text('requested_by').notNull(),
  department: text('department').notNull(),
  changeType: text('change_type', {
    enum: ['revision', 'addition', 'deletion', 'clarification']
  }).notNull(),
  reason: text('reason').notNull(),
  description: text('description').notNull(),
  priority: text('priority', {
    enum: ['low', 'medium', 'high', 'critical']
  }).default('medium'),
  impactAssessment: text('impact_assessment').notNull(),
  affectedDocuments: text('affected_documents'),
  proposedBy: text('proposed_by'),
  reviewedBy: text('reviewed_by'),
  approvedBy: text('approved_by'),
  implementationDate: timestamp('implementation_date'),
  trainingRequired: text('training_required'),
  retrainingRequired: text('retraining_required'),
  additionalNotes: text('additional_notes'),
  status: text('status', {
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'implemented']
  }).notNull().default('draft'),
  implementedVersionId: uuid('implemented_version_id'), // References document_versions.id when implemented
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  requestedByIdx: index('change_requests_requested_by_idx').on(table.requestedBy),
  statusIdx: index('change_requests_status_idx').on(table.status),
  priorityIdx: index('change_requests_priority_idx').on(table.priority),
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


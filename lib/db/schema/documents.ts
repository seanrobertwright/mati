import { pgTable, text, timestamp, uuid, integer, index } from 'drizzle-orm/pg-core';
import { directories } from './directories';

export const documentCategories = pgTable('document_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  defaultReviewFrequencyDays: integer('default_review_frequency_days'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  categoryId: uuid('category_id').references(() => documentCategories.id),
  directoryId: uuid('directory_id').references(() => directories.id, { onDelete: 'cascade' }),
  currentVersionId: uuid('current_version_id'), // References document_versions.id (set after version created)
  ownerId: uuid('owner_id').notNull(), // References auth.users(id) in Supabase
  status: text('status', {
    enum: ['draft', 'pending_review', 'pending_approval', 'approved', 'under_review', 'archived']
  }).notNull().default('draft'),
  effectiveDate: timestamp('effective_date'),
  reviewFrequencyDays: integer('review_frequency_days'),
  nextReviewDate: timestamp('next_review_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Indexes for common query patterns
  statusIdx: index('documents_status_idx').on(table.status),
  ownerIdx: index('documents_owner_id_idx').on(table.ownerId),
  directoryIdx: index('documents_directory_id_idx').on(table.directoryId),
  categoryIdx: index('documents_category_id_idx').on(table.categoryId),
  nextReviewDateIdx: index('documents_next_review_date_idx').on(table.nextReviewDate),
  createdAtIdx: index('documents_created_at_idx').on(table.createdAt),
  updatedAtIdx: index('documents_updated_at_idx').on(table.updatedAt),
  // Composite index for filtering by directory and status
  directoryStatusIdx: index('documents_directory_status_idx').on(table.directoryId, table.status),
}));

export const documentVersions = pgTable('document_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  versionNumber: integer('version_number').notNull(),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  fileHash: text('file_hash').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type'),
  uploadedBy: uuid('uploaded_by').notNull(), // References auth.users(id) in Supabase
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Index for version lookups
  documentIdx: index('document_versions_document_id_idx').on(table.documentId),
  fileHashIdx: index('document_versions_file_hash_idx').on(table.fileHash),
}));

export const documentPermissions = pgTable('document_permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').notNull(), // References auth.users(id) in Supabase
  role: text('role', {
    enum: ['owner', 'approver', 'reviewer', 'viewer']
  }).notNull(),
  grantedBy: uuid('granted_by').notNull(), // References auth.users(id) in Supabase
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
}, (table) => ({
  // Composite index for permission checks
  documentUserIdx: index('document_permissions_document_user_idx').on(table.documentId, table.userId),
  userIdx: index('document_permissions_user_id_idx').on(table.userId),
}));

export const documentApprovals = pgTable('document_approvals', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  versionId: uuid('version_id').references(() => documentVersions.id).notNull(),
  approverId: uuid('approver_id').notNull(), // References auth.users(id) in Supabase
  role: text('role', {
    enum: ['reviewer', 'approver']
  }).notNull(),
  status: text('status', {
    enum: ['pending', 'approved', 'rejected', 'changes_requested']
  }).notNull().default('pending'),
  notes: text('notes'),
  decidedAt: timestamp('decided_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Indexes for approval queries
  documentIdx: index('document_approvals_document_id_idx').on(table.documentId),
  approverIdx: index('document_approvals_approver_id_idx').on(table.approverId),
  statusIdx: index('document_approvals_status_idx').on(table.status),
  // Composite index for finding pending approvals by user
  approverStatusIdx: index('document_approvals_approver_status_idx').on(table.approverId, table.status),
}));


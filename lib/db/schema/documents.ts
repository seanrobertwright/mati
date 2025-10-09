import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
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
});

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
});

export const documentPermissions = pgTable('document_permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').notNull(), // References auth.users(id) in Supabase
  role: text('role', {
    enum: ['owner', 'approver', 'reviewer', 'viewer']
  }).notNull(),
  grantedBy: uuid('granted_by').notNull(), // References auth.users(id) in Supabase
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
});

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
});


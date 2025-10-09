import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { directories } from './directories';

export const directoryPermissions = pgTable('directory_permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  directoryId: uuid('directory_id').references(() => directories.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').notNull(), // References auth.users(id) in Supabase
  role: text('role', {
    enum: ['owner', 'approver', 'reviewer', 'viewer']
  }).notNull(),
  grantedBy: uuid('granted_by').notNull(), // References auth.users(id) in Supabase
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
});


import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';

export const directories = pgTable('directories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  parentId: uuid('parent_id').references(() => directories.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').notNull(), // References auth.users(id) in Supabase
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Index for tree queries
  parentIdx: index('directories_parent_id_idx').on(table.parentId),
  createdByIdx: index('directories_created_by_idx').on(table.createdBy),
}));


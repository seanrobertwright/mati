import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const directories = pgTable('directories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  parentId: uuid('parent_id').references(() => directories.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').notNull(), // References auth.users(id) in Supabase
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const incidents = pgTable('incidents', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity', { 
    enum: ['low', 'medium', 'high', 'critical'] 
  }).notNull(),
  status: text('status', { 
    enum: ['open', 'investigating', 'resolved', 'closed'] 
  }).notNull(),
  reportedBy: text('reported_by').notNull(),
  userId: uuid('user_id').notNull(), // References auth.users(id) in Supabase
  reportedAt: timestamp('reported_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


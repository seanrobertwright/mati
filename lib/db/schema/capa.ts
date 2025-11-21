import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const capas = pgTable('capas', {
  id: uuid('id').defaultRandom().primaryKey(),
  number: text('number').notNull().unique(), // Auto-generated CAPA number
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type', {
    enum: ['corrective', 'preventive']
  }).notNull(),
  priority: text('priority', {
    enum: ['low', 'medium', 'high', 'critical']
  }).notNull(),
  severity: text('severity', {
    enum: ['minor', 'moderate', 'major', 'critical']
  }).notNull(),
  status: text('status', {
    enum: ['draft', 'investigation', 'action', 'verification', 'closed']
  }).notNull().default('draft'),
  currentStep: text('current_step').notNull().default('identification'),
  initiatedBy: uuid('initiated_by').notNull(), // References auth.users(id)
  initiatedAt: timestamp('initiated_at').defaultNow().notNull(),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  closedAt: timestamp('closed_at'),
  category: text('category'), // e.g., 'Quality', 'Safety', 'Environmental'
  department: text('department'), // Department responsible
  affectedAreas: text('affected_areas'), // JSON string of affected areas
});

export const capaInvestigations = pgTable('capa_investigations', {
  id: uuid('id').defaultRandom().primaryKey(),
  capaId: uuid('capa_id').notNull().references(() => capas.id),
  investigatorId: uuid('investigator_id').notNull(), // References auth.users(id)
  methodology: text('methodology', {
    enum: ['5-why', 'fishbone', 'fmea', 'other']
  }).notNull(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  targetCompletionDate: timestamp('target_completion_date'),
  status: text('status', {
    enum: ['in_progress', 'completed', 'cancelled']
  }).notNull().default('in_progress'),
  completedAt: timestamp('completed_at'),
  findingsSummary: text('findings_summary'),
});

export const capaRootCauses = pgTable('capa_root_causes', {
  id: uuid('id').defaultRandom().primaryKey(),
  investigationId: uuid('investigation_id').notNull().references(() => capaInvestigations.id),
  category: text('category', {
    enum: ['people', 'process', 'equipment', 'materials', 'environment', 'management', 'other']
  }).notNull(),
  description: text('description').notNull(),
  evidence: text('evidence'), // Supporting evidence or references
  confidenceLevel: integer('confidence_level').notNull(), // 1-5 scale
  toolUsed: text('tool_used', {
    enum: ['5-why', 'fishbone', 'fmea', 'other']
  }),
  toolData: text('tool_data'), // JSON string with tool-specific data
});

export const capaActions = pgTable('capa_actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  capaId: uuid('capa_id').notNull().references(() => capas.id),
  type: text('type', {
    enum: ['corrective', 'preventive']
  }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  assignedTo: uuid('assigned_to').notNull(), // References auth.users(id)
  dueDate: timestamp('due_date'),
  priority: text('priority', {
    enum: ['low', 'medium', 'high', 'critical']
  }).notNull(),
  status: text('status', {
    enum: ['pending', 'in_progress', 'completed', 'cancelled']
  }).notNull().default('pending'),
  completedAt: timestamp('completed_at'),
  effectivenessCriteria: text('effectiveness_criteria'), // How to measure success
});

export const capaVerifications = pgTable('capa_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  capaId: uuid('capa_id').notNull().references(() => capas.id),
  actionId: uuid('action_id').references(() => capaActions.id), // Optional - can verify specific actions
  method: text('method', {
    enum: ['testing', 'monitoring', 'auditing', 'inspection', 'other']
  }).notNull(),
  criteria: text('criteria').notNull(), // What is being verified
  results: text('results').notNull(), // Verification results
  verifiedBy: uuid('verified_by').notNull(), // References auth.users(id)
  verificationDate: timestamp('verification_date').defaultNow().notNull(),
  nextReviewDate: timestamp('next_review_date'),
});

export const capaEffectivenessReviews = pgTable('capa_effectiveness_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  capaId: uuid('capa_id').notNull().references(() => capas.id),
  reviewerId: uuid('reviewer_id').notNull(), // References auth.users(id)
  reviewDate: timestamp('review_date').defaultNow().notNull(),
  findings: text('findings').notNull(), // Effectiveness assessment
  recommendations: text('recommendations'), // Follow-up actions if needed
  nextReviewDate: timestamp('next_review_date'),
  status: text('status', {
    enum: ['effective', 'needs_improvement', 'ineffective', 'pending']
  }).notNull().default('pending'),
});
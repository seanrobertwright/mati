import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { incidents } from './schema/incidents';

// Infer TypeScript types from Drizzle schema
export type Incident = InferSelectModel<typeof incidents>;
export type NewIncident = InferInsertModel<typeof incidents>;

// Severity and Status enums for type safety
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'open' | 'investigating' | 'resolved' | 'closed';


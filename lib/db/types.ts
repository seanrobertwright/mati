import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { incidents } from './schema/incidents';
import { capas, capaInvestigations, capaRootCauses, capaActions, capaVerifications, capaEffectivenessReviews } from './schema/capa';

// Infer TypeScript types from Drizzle schema
export type Incident = InferSelectModel<typeof incidents>;
export type NewIncident = InferInsertModel<typeof incidents>;

// CAPA Types
export type CAPA = InferSelectModel<typeof capas>;
export type NewCAPA = InferInsertModel<typeof capas>;

export type CAPAInvestigation = InferSelectModel<typeof capaInvestigations>;
export type NewCAPAInvestigation = InferInsertModel<typeof capaInvestigations>;

export type CAPARootCause = InferSelectModel<typeof capaRootCauses>;
export type NewCAPARootCause = InferInsertModel<typeof capaRootCauses>;

export type CAPAAction = InferSelectModel<typeof capaActions>;
export type NewCAPAAction = InferInsertModel<typeof capaActions>;

export type CAPAVerification = InferSelectModel<typeof capaVerifications>;
export type NewCAPAVerification = InferInsertModel<typeof capaVerifications>;

export type CAPAEffectivenessReview = InferSelectModel<typeof capaEffectivenessReviews>;
export type NewCAPAEffectivenessReview = InferInsertModel<typeof capaEffectivenessReviews>;

// Severity and Status enums for type safety
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'open' | 'investigating' | 'resolved' | 'closed';


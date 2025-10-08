/**
 * Data layer for incident reporting module
 * Uses database repository for persistent storage
 */
export * from '@/lib/db/types';
export * from '@/lib/db/repositories/incidents';

// Demo/seed data for initial database setup
export const seedIncidents = [
  {
    title: 'Slip and Fall in Warehouse',
    description: 'Employee slipped on wet floor near loading dock.',
    severity: 'medium' as const,
    status: 'investigating' as const,
    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    reportedBy: 'John Smith',
  },
  {
    title: 'Equipment Malfunction',
    description: 'Forklift brake failure reported during routine inspection.',
    severity: 'high' as const,
    status: 'open' as const,
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    reportedBy: 'Sarah Johnson',
  },
  {
    title: 'Minor Chemical Spill',
    description: 'Small cleaning solution spill, contained and cleaned immediately.',
    severity: 'low' as const,
    status: 'resolved' as const,
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    reportedBy: 'Mike Davis',
  },
];

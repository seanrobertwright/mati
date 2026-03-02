import incidentReportingModule from './incident-reporting';
import documentManagementModule from './document-management';
import capaManagementModule from './capa-management';
import type { SafetyModule } from '@/lib/safety-framework/types';

/**
 * Module manifest — the single place to register modules.
 * To add a module: import it and add it to this array.
 */
export const modules: SafetyModule[] = [
  incidentReportingModule,
  documentManagementModule,
  capaManagementModule,
];

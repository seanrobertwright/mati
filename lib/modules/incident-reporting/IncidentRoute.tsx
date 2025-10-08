import type { ModuleRouteProps } from '@/lib/safety-framework';
import IncidentList from './IncidentList';
import IncidentDetail from './IncidentDetail';

/**
 * Full page route component for the incident module
 * Handles both the list view and detail views via subpage routing
 */
export default async function IncidentRoute({ params }: ModuleRouteProps) {
  const resolvedParams = await params;
  const subpage = resolvedParams.subpage;

  // Detail view: /dashboard/incident-reporting/[id]
  if (subpage && subpage.length > 0) {
    const incidentId = subpage[0];
    return <IncidentDetail incidentId={incidentId} />;
  }

  // List view: /dashboard/incident-reporting
  return <IncidentList />;
}

import { getIncidents } from './data';
import { Badge } from '@/components/ui/badge';

/**
 * Dashboard widget showing recent incidents - Server Component with async data fetching
 * This appears on the dashboard home page
 */
export default async function IncidentWidget() {
  const allIncidents = await getIncidents();
  const recentIncidents = allIncidents.slice(0, 3);

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      case 'low':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-3">
      {recentIncidents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No incidents reported
        </p>
      ) : (
        recentIncidents.map((incident) => (
          <div
            key={incident.id}
            className="flex items-start gap-3 p-3 bg-muted/50 rounded-md"
          >
            <Badge variant={getSeverityVariant(incident.severity)}>
              {incident.severity}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {incident.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {incident.reportedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

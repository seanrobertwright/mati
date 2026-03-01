import { getIncidentById } from '@/lib/db/repositories/incidents';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IncidentActions } from './IncidentActions';

export default async function IncidentDetail({ incidentId }: { incidentId: string }) {
  const incident = await getIncidentById(incidentId);

  if (!incident) {
    return (
      <Card className="p-8 text-center">
        <CardTitle className="mb-2">Incident Not Found</CardTitle>
        <p className="text-muted-foreground">The incident you&apos;re looking for doesn&apos;t exist.</p>
      </Card>
    );
  }

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/incident-reporting">
          <Button variant="outline" size="sm">Back to List</Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{incident.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge variant={getSeverityVariant(incident.severity)}>
            {incident.severity}
          </Badge>
          <Badge variant="outline">{incident.status}</Badge>
          <span className="text-sm text-muted-foreground">
            Reported by {incident.reportedBy} on{' '}
            {incident.reportedAt.toLocaleDateString()}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{incident.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1 capitalize">{incident.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Severity</dt>
              <dd className="mt-1 capitalize">{incident.severity}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Incident ID</dt>
              <dd className="mt-1 font-mono text-sm">{incident.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">CAPA Required</dt>
              <dd className="mt-1">{incident.capaRequired ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentActions incidentId={incident.id} currentStatus={incident.status} />
        </CardContent>
      </Card>
    </div>
  );
}

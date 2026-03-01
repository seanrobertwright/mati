import { Suspense } from 'react';
import type { ModuleRouteProps } from '@/lib/safety-framework';
import IncidentList from './IncidentList';
import IncidentDetail from './IncidentDetail';
import { IncidentCreateForm } from './IncidentCreateForm';
import { Card, CardContent } from '@/components/ui/card';

function IncidentListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-8 w-12 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <div className="p-4">
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </Card>
    </div>
  );
}

export default async function IncidentRoute({ params }: ModuleRouteProps) {
  const { subpage } = await params;

  // Create view: /dashboard/incident-reporting/new
  if (subpage?.[0] === 'new') {
    return <IncidentCreateForm />;
  }

  // Detail view: /dashboard/incident-reporting/[id]
  if (subpage && subpage.length > 0) {
    const incidentId = subpage[0];
    return <IncidentDetail incidentId={incidentId} />;
  }

  // List view: /dashboard/incident-reporting
  return (
    <Suspense fallback={<IncidentListSkeleton />}>
      <IncidentList />
    </Suspense>
  );
}

import type { SafetyModule } from '@/lib/safety-framework';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardWidgetProps {
  module: SafetyModule;
}

export function DashboardWidget({ module }: DashboardWidgetProps) {
  if (!module.dashboard.widget) {
    return null;
  }

  const Widget = module.dashboard.widget;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {module.icon && (
            <div className="w-5 h-5">
              <module.icon />
            </div>
          )}
          {module.name}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
          <Widget moduleId={module.id} moduleName={module.name} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

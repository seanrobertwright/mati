import Link from 'next/link';
import type { SafetyModule } from '@/lib/safety-framework';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ModuleCardProps {
  module: SafetyModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
  // Determine the link - use first navigation item if available, otherwise moduleId
  const href = module.navigation?.[0]?.href
    ? `/dashboard${module.navigation[0].href}`
    : `/dashboard/${module.id}`;

  return (
    <Link href={href} className="block transition-transform hover:scale-[1.02]">
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start gap-4">
            {/* Icon */}
            {module.icon && (
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg text-primary">
                <module.icon />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <CardTitle className="mb-2">{module.name}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">v{module.version}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

import { notFound } from 'next/navigation';
import { registry } from '@/lib/safety-framework';
import type { ModuleRouteProps } from '@/lib/safety-framework';

export default async function ModuleSubPage(props: ModuleRouteProps) {
  const params = await props.params;
  const safetyModule = registry.getModule(params.moduleId);

  if (!safetyModule) {
    notFound();
  }

  if (!safetyModule.dashboard.route) {
    notFound();
  }

  const RouteComponent = safetyModule.dashboard.route;

  return <RouteComponent params={Promise.resolve(params)} />;
}

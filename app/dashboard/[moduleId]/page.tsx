import { notFound } from 'next/navigation';
import { registry } from '@/lib/safety-framework';
import type { ModuleRouteProps } from '@/lib/safety-framework';

export default async function ModulePage(props: ModuleRouteProps) {
  const params = await props.params;
  const safetyModule = registry.getModule(params.moduleId);

  if (!safetyModule) {
    notFound();
  }

  if (!safetyModule.dashboard.route) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{safetyModule.name}</h1>
        <p className="text-gray-600 mb-4">{safetyModule.description}</p>
        <p className="text-sm text-gray-500">
          This module does not have a route component configured.
        </p>
      </div>
    );
  }

  const RouteComponent = safetyModule.dashboard.route;

  return <RouteComponent params={Promise.resolve(params)} />;
}

// Generate static params for all modules at build time
export async function generateStaticParams() {
  const modules = registry.getAllModules();
  return modules.map((mod) => ({
    moduleId: mod.id,
  }));
}

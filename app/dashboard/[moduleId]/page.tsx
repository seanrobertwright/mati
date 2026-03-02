import { registry } from '@/lib/safety-framework';
import { createClient } from '@/lib/auth/server';
import { notFound } from 'next/navigation';
import type { ModuleRouteProps } from '@/lib/safety-framework';

export default async function ModulePage(props: ModuleRouteProps) {
  const params = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const safetyModule = registry.getModule(params.moduleId);

  if (!safetyModule) {
    notFound();
  }

  if (!registry.canUserAccessModule(user, params.moduleId)) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8">
        <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          You do not have permission to access this module. Contact your administrator if you believe this is an error.
        </p>
      </div>
    );
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

export async function generateStaticParams() {
  const { modules } = await import('@/lib/modules');
  return modules.map((mod) => ({
    moduleId: mod.id,
  }));
}

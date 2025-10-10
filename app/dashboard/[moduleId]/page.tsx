import { notFound } from 'next/navigation';
import { registry, initializeModules } from '@/lib/safety-framework';
import type { ModuleRouteProps } from '@/lib/safety-framework';
import { createClient } from '@/lib/auth/server';

export default async function ModulePage(props: ModuleRouteProps) {
  const params = await props.params;
  
  // Get the authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  // Ensure modules are initialized
  if (!registry.isInitialized()) {
    try {
      await initializeModules();
    } catch (error) {
      console.error('Failed to initialize modules:', error);
      // Continue anyway - maybe some modules loaded
    }
  }
  
  const safetyModule = registry.getModule(params.moduleId);

  if (!safetyModule) {
    console.error(`Module '${params.moduleId}' not found in registry.`);
    console.log('Registry initialized:', registry.isInitialized());
    console.log('Available modules:', registry.getAllModules().map(m => m.id));
    console.log('Module count:', registry.getModuleCount());
    notFound();
  }

  // Check if user has permission to access this module
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

// Generate static params for all modules at build time
export async function generateStaticParams() {
  const modules = registry.getAllModules();
  return modules.map((mod) => ({
    moduleId: mod.id,
  }));
}

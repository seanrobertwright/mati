import { registry } from '@/lib/safety-framework';
import { ModuleCard, DashboardWidget } from '@/components/dashboard';

export default function DashboardPage() {
  const allModules = registry.getAllModules();
  const modulesWithWidgets = registry.getModulesWithWidgets();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Safety Management Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your safety management system. Select a module to get started.
        </p>
      </div>

      {/* Dashboard widgets */}
      {modulesWithWidgets.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modulesWithWidgets.map((module) => (
              <DashboardWidget key={module.id} module={module} />
            ))}
          </div>
        </section>
      )}

      {/* Module cards */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Modules</h2>
        {allModules.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-muted-foreground">No modules available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add modules to <code className="bg-muted px-2 py-1 rounded">lib/modules/</code> to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allModules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

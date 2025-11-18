// Simple page to test module loading
import { registry } from '@/lib/safety-framework';

export default function TestModules() {
  const modules = registry.getAllModules();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Module Debug</h1>
      <div className="space-y-4">
        <div>
          <strong>Total modules found:</strong> {modules.length}
        </div>
        <div>
          <strong>Registry initialized:</strong> {registry.isInitialized() ? 'Yes' : 'No'}
        </div>
        {modules.length > 0 && (
          <div>
            <strong>Modules:</strong>
            <ul className="list-disc pl-6">
              {modules.map(module => (
                <li key={module.id}>
                  {module.name} ({module.id}) - v{module.version}
                </li>
              ))}
            </ul>
          </div>
        )}
        {modules.length === 0 && (
          <div className="text-red-600">
            ❌ No modules detected! This suggests a module loading issue.
          </div>
        )}
      </div>
    </div>
  );
}
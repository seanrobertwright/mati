import { SafetyModule } from './types';
import { validateModule } from './validation';

/**
 * Central registry for all safety modules
 */
class ModuleRegistry {
  private modules = new Map<string, SafetyModule>();
  private initialized = false;

  /**
   * Register a module with the registry
   * @throws {ModuleValidationError} if validation fails
   */
  register(module: SafetyModule): void {
    // Validate the module
    validateModule(module);

    // Check for duplicate IDs
    if (this.modules.has(module.id)) {
      throw new Error(`Module with id '${module.id}' is already registered`);
    }

    this.modules.set(module.id, module);
  }

  /**
   * Register multiple modules at once
   */
  registerAll(modules: SafetyModule[]): void {
    for (const mod of modules) {
      this.register(mod);
    }
  }

  /**
   * Get a module by its ID
   * @returns The module or undefined if not found
   */
  getModule(id: string): SafetyModule | undefined {
    return this.modules.get(id);
  }

  /**
   * Get all registered modules
   * @returns Array of all registered modules
   */
  getAllModules(): SafetyModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get modules that have dashboard widgets
   */
  getModulesWithWidgets(): SafetyModule[] {
    return this.getAllModules().filter((m) => m.dashboard.widget);
  }

  /**
   * Get modules that have navigation items
   */
  getModulesWithNavigation(): SafetyModule[] {
    return this.getAllModules().filter((m) => m.navigation && m.navigation.length > 0);
  }

  /**
   * Check if a module exists
   */
  hasModule(id: string): boolean {
    return this.modules.has(id);
  }

  /**
   * Get the number of registered modules
   */
  getModuleCount(): number {
    return this.modules.size;
  }

  /**
   * Clear all registered modules (mainly for testing)
   */
  clear(): void {
    this.modules.clear();
    this.initialized = false;
  }

  /**
   * Mark the registry as initialized
   */
  markInitialized(): void {
    this.initialized = true;
  }

  /**
   * Check if the registry has been initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Singleton instance
export const registry = new ModuleRegistry();

/**
 * Discover and register all modules from the modules directory
 * This is called at build/startup time
 */
export async function discoverModules(): Promise<void> {
  if (registry.isInitialized()) {
    return;
  }

  // Import all module files from lib/modules
  // In a real implementation, this would use dynamic imports or a build-time plugin
  // For now, we'll manually import modules as they're created
  const modules: SafetyModule[] = [];

  try {
    // Import all module files from lib/modules
    // Add new modules here as they are created
    const incidentReporting = await import('@/lib/modules/incident-reporting');
    if (incidentReporting.default) {
      modules.push(incidentReporting.default);
    }

    // Future modules can be added here:
    // const anotherModule = await import('@/lib/modules/another-module');
    // if (anotherModule.default) {
    //   modules.push(anotherModule.default);
    // }
  } catch (error) {
    // If modules don't exist yet, that's okay
    console.warn('Error loading modules:', error);
  }

  registry.registerAll(modules);
  registry.markInitialized();
}

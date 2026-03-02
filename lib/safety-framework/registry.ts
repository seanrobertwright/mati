import { SafetyModule } from './types';
import { validateModule } from './validation';
import { canAccessModule } from '@/lib/auth/permissions';
import type { User } from '@supabase/supabase-js';

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

    // Check for duplicate IDs - skip if already registered
    if (this.modules.has(module.id)) {
      console.warn(`Module with id '${module.id}' is already registered, skipping`);
      return;
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
   * Get modules accessible to the given user
   * Filters modules based on their minRole requirement
   */
  getModulesForUser(user: User | null): SafetyModule[] {
    return this.getAllModules().filter((m) => canAccessModule(user, m.minRole));
  }

  /**
   * Get modules with widgets accessible to the given user
   */
  getModulesWithWidgetsForUser(user: User | null): SafetyModule[] {
    return this.getModulesForUser(user).filter((m) => m.dashboard.widget);
  }

  /**
   * Get modules with navigation accessible to the given user
   */
  getModulesWithNavigationForUser(user: User | null): SafetyModule[] {
    return this.getModulesForUser(user).filter((m) => m.navigation && m.navigation.length > 0);
  }

  /**
   * Check if a user can access a specific module
   */
  canUserAccessModule(user: User | null, moduleId: string): boolean {
    const safetyModule = this.getModule(moduleId);
    if (!safetyModule) return false;
    return canAccessModule(user, safetyModule.minRole);
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

  const { modules } = await import('@/lib/modules');

  for (const mod of modules) {
    try {
      registry.register(mod);
    } catch (error) {
      console.error(`Failed to register module '${mod?.id ?? 'unknown'}':`, error);
      // Continue loading other modules
    }
  }

  if (registry.getModuleCount() === 0) {
    console.warn('No modules were loaded during discovery');
  }

  registry.markInitialized();
}

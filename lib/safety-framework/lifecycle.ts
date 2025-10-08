import { registry, discoverModules } from './registry';

/**
 * Initialize all modules by discovering and calling their onLoad hooks
 */
export async function initializeModules(): Promise<void> {
  // Discover and register all modules
  await discoverModules();

  // Call onLoad lifecycle hooks for all modules
  const modules = registry.getAllModules();
  const loadPromises: Promise<void>[] = [];

  for (const mod of modules) {
    if (mod.lifecycle?.onLoad) {
      try {
        const result = mod.lifecycle.onLoad();
        if (result instanceof Promise) {
          loadPromises.push(result);
        }
      } catch (error) {
        console.error(`Error loading module '${mod.id}':`, error);
        throw error;
      }
    }
  }

  // Wait for all async onLoad hooks to complete
  await Promise.all(loadPromises);
}

/**
 * Cleanup modules by calling their onUnload hooks
 */
export async function cleanupModules(): Promise<void> {
  const modules = registry.getAllModules();
  const unloadPromises: Promise<void>[] = [];

  for (const mod of modules) {
    if (mod.lifecycle?.onUnload) {
      try {
        const result = mod.lifecycle.onUnload();
        if (result instanceof Promise) {
          unloadPromises.push(result);
        }
      } catch (error) {
        console.error(`Error unloading module '${mod.id}':`, error);
        // Continue cleanup even if one module fails
      }
    }
  }

  // Wait for all async onUnload hooks to complete
  await Promise.all(unloadPromises);
}

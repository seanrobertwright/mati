/**
 * Safety Framework Public API
 *
 * This is the main entry point for the safety module framework.
 * Modules should only import from this file to ensure they use the public API.
 */

// Core types
export type {
  SafetyModule,
  WidgetProps,
  ModuleRouteProps,
  ModuleNavigation,
} from './types';

export { ModuleValidationError } from './types';

// Registry
export { registry, discoverModules } from './registry';

// Validation
export { validateModule } from './validation';

// Lifecycle management
export { initializeModules, cleanupModules } from './lifecycle';

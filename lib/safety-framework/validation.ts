import { SafetyModule, ModuleValidationError } from './types';

/**
 * Semantic version regex pattern (major.minor.patch)
 */
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

/**
 * Valid module ID pattern (kebab-case)
 */
const MODULE_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Validates that a module conforms to the SafetyModule interface
 * @throws {ModuleValidationError} if validation fails
 */
export function validateModule(module: SafetyModule): void {
  // Check that module is an object
  if (!module || typeof module !== 'object') {
    throw new ModuleValidationError(undefined, 'Module must be an object');
  }

  // Validate required string fields
  validateRequiredString(module, 'id');
  validateRequiredString(module, 'name');
  validateRequiredString(module, 'description');
  validateRequiredString(module, 'version');

  // Validate ID format
  if (!MODULE_ID_PATTERN.test(module.id)) {
    throw new ModuleValidationError(
      module.id,
      'Module ID must be kebab-case (lowercase letters, numbers, and hyphens only)'
    );
  }

  // Validate version format
  if (!SEMVER_PATTERN.test(module.version)) {
    throw new ModuleValidationError(
      module.id,
      `Version must follow semantic versioning (major.minor.patch). Got: ${module.version}`
    );
  }

  // Validate dashboard object exists
  if (!module.dashboard || typeof module.dashboard !== 'object') {
    throw new ModuleValidationError(
      module.id,
      'Module must have a dashboard object'
    );
  }

  // Validate optional icon is a function/component
  if (module.icon !== undefined && typeof module.icon !== 'function') {
    throw new ModuleValidationError(
      module.id,
      'Module icon must be a React component'
    );
  }

  // Validate optional widget is a function/component
  if (module.dashboard.widget !== undefined && typeof module.dashboard.widget !== 'function') {
    throw new ModuleValidationError(
      module.id,
      'Dashboard widget must be a React component'
    );
  }

  // Validate optional route is a function/component
  if (module.dashboard.route !== undefined && typeof module.dashboard.route !== 'function') {
    throw new ModuleValidationError(
      module.id,
      'Dashboard route must be a React component'
    );
  }

  // Validate navigation if present
  if (module.navigation !== undefined) {
    if (!Array.isArray(module.navigation)) {
      throw new ModuleValidationError(
        module.id,
        'Navigation must be an array'
      );
    }

    for (const navItem of module.navigation) {
      if (!navItem.label || typeof navItem.label !== 'string') {
        throw new ModuleValidationError(
          module.id,
          'Navigation item must have a label string'
        );
      }
      if (!navItem.href || typeof navItem.href !== 'string') {
        throw new ModuleValidationError(
          module.id,
          'Navigation item must have an href string'
        );
      }
      if (navItem.icon !== undefined && typeof navItem.icon !== 'function') {
        throw new ModuleValidationError(
          module.id,
          'Navigation item icon must be a React component'
        );
      }
    }
  }

  // Validate lifecycle hooks if present
  if (module.lifecycle) {
    if (module.lifecycle.onLoad !== undefined && typeof module.lifecycle.onLoad !== 'function') {
      throw new ModuleValidationError(
        module.id,
        'Lifecycle onLoad must be a function'
      );
    }
    if (module.lifecycle.onUnload !== undefined && typeof module.lifecycle.onUnload !== 'function') {
      throw new ModuleValidationError(
        module.id,
        'Lifecycle onUnload must be a function'
      );
    }
  }
}

/**
 * Helper to validate required string fields
 */
function validateRequiredString(module: SafetyModule, field: keyof SafetyModule): void {
  const value = module[field];
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new ModuleValidationError(
      module.id,
      `Module must have a non-empty ${field} string`
    );
  }
}

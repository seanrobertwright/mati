import { ComponentType } from 'react';
import type { UserRole } from '@/lib/auth/permissions';

/**
 * Props passed to module dashboard widgets
 */
export interface WidgetProps {
  /** The module's unique identifier */
  moduleId: string;
  /** The module's display name */
  moduleName: string;
}

/**
 * Props passed to module route components
 */
export interface ModuleRouteProps {
  /** Parameters from the dynamic route */
  params: Promise<{
    /** The module's unique identifier */
    moduleId: string;
    /** Optional sub-page path segments */
    subpage?: string[];
  }>;
}

/**
 * Navigation item configuration for a module
 */
export interface ModuleNavigation {
  /** Display label for the navigation item */
  label: string;
  /** Route path (relative to /dashboard) */
  href: string;
  /** Optional icon component */
  icon?: ComponentType;
}

/**
 * Core interface that all safety modules must implement
 */
export interface SafetyModule {
  /** Unique identifier for the module (kebab-case recommended) */
  id: string;

  /** Human-readable name */
  name: string;

  /** Brief description of the module's purpose */
  description: string;

  /** Optional icon component for the module */
  icon?: ComponentType;

  /** Semantic version (e.g., "1.0.0") */
  version: string;

  /** UI components for dashboard integration */
  dashboard: {
    /** Optional widget shown on the dashboard home page */
    widget?: ComponentType<WidgetProps>;
    /** Optional full-page route component */
    route?: ComponentType<ModuleRouteProps>;
  };

  /** Optional navigation menu configuration */
  navigation?: ModuleNavigation[];

  /** Optional minimum role required to access this module */
  minRole?: UserRole;

  /** Optional lifecycle hooks */
  lifecycle?: {
    /** Called when the module is loaded (during app initialization) */
    onLoad?: () => void | Promise<void>;
    /** Called when the application shuts down */
    onUnload?: () => void | Promise<void>;
  };
}

/**
 * Validation error for module registration
 */
export class ModuleValidationError extends Error {
  constructor(
    public moduleId: string | undefined,
    message: string
  ) {
    super(`Module validation failed${moduleId ? ` for '${moduleId}'` : ''}: ${message}`);
    this.name = 'ModuleValidationError';
  }
}

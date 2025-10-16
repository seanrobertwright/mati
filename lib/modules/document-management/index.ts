import type { SafetyModule } from '@/lib/safety-framework';
import DocumentWidget from './DocumentWidget';
import DocumentRoute from './DocumentRoute';
import DocumentRouteFallback from './DocumentRouteFallback';
import DocumentIcon from './DocumentIcon';

/**
 * Document Management Module
 * 
 * ISO 9001 and ISO 45001 compliant document control system with:
 * - Hierarchical directory structure
 * - Document lifecycle management
 * - Multi-stage approval workflows
 * - Change request system
 * - Compliance metrics and reporting
 * - Complete audit trail
 */
const documentManagementModule: SafetyModule = {
  // Required: Unique identifier (kebab-case)
  id: 'document-management',

  // Required: Human-readable name
  name: 'Document Management',

  // Required: Brief description shown on module cards
  description: 'ISO-compliant document control with version tracking, approval workflows, and compliance reporting.',

  // Optional: Icon component shown in navigation and cards
  icon: DocumentIcon,

  // Required: Semantic version
  version: '1.0.0',

  // Required: Dashboard integration
  dashboard: {
    // Optional: Widget shown on dashboard home page
    widget: DocumentWidget,

    // Optional: Full-page route component
    route: DocumentRoute,
  },

  // Optional: Navigation menu items
  navigation: [
    {
      label: 'Documents',
      href: '/document-management',
      icon: DocumentIcon,
    },
    {
      label: 'Change Requests',
      href: '/document-management/change-requests',
    },
    {
      label: 'Metrics',
      href: '/document-management/metrics',
    },
    {
      label: 'Audit Log',
      href: '/document-management/audit-log',
    },
  ],

  // Optional: Minimum role required to access this module
  minRole: 'viewer', // Viewers can view documents (read-only), employees+ can upload/edit

  // Optional: Lifecycle hooks
  lifecycle: {
    onLoad: async () => {
      console.log('Document Management module loaded');
      // TODO: Initialize file storage paths, verify database schema
    },

    onUnload: async () => {
      console.log('Document Management module unloaded');
      // TODO: Cleanup any temporary files, close connections
    },
  },
};

export default documentManagementModule;

// Export validation utilities (namespace to avoid name collisions)
export * as Validation from './validation';

// Export error handling utilities (namespace to avoid name collisions)
export * as Errors from './errors';

// Export components (namespace to avoid name collisions)
export * as Components from './components';

// Export actions (server actions for client components)
export * as DocumentActions from './actions';

// Export services (business logic)
export * as DocumentServices from './services';


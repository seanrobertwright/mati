import type { SafetyModule } from '@/lib/safety-framework';
import IncidentWidget from './IncidentWidget';
import IncidentRoute from './IncidentRoute';
import IncidentIcon from './IncidentIcon';

/**
 * Module definition
 * This object is exported and automatically discovered by the framework
 */
const incidentReportingModule: SafetyModule = {
  // Required: Unique identifier (kebab-case)
  id: 'incident-reporting',

  // Required: Human-readable name
  name: 'Incident Reporting',

  // Required: Brief description shown on module cards
  description: 'Track, manage, and analyze safety incidents across your organization.',

  // Optional: Icon component shown in navigation and cards
  icon: IncidentIcon,

  // Required: Semantic version
  version: '1.0.0',

  // Required: Dashboard integration
  dashboard: {
    // Optional: Widget shown on dashboard home page
    widget: IncidentWidget,

    // Optional: Full-page route component
    route: IncidentRoute,
  },

  // Optional: Navigation menu items
  navigation: [
    {
      label: 'Incidents',
      href: '/incident-reporting',
      icon: IncidentIcon,
    },
  ],

  // Optional: Minimum role required to access this module
  minRole: 'viewer', // Viewers can view incidents (read-only), employees+ can create/edit

  // Optional: Lifecycle hooks
  lifecycle: {
    onLoad: async () => {
      console.log('Incident Reporting module loaded');
    },

    onUnload: async () => {
      console.log('Incident Reporting module unloaded');
    },
  },
};

export default incidentReportingModule;

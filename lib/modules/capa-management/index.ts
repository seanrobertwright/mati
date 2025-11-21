import type { SafetyModule } from '@/lib/safety-framework';
import CAPAWidget from './CAPAWidget';
import CAPARoute from './CAPARoute';
import CAPAIcon from './CAPAIcon';

/**
 * CAPA Management Module
 * 
 * ISO 9001 and ISO 45001 compliant Corrective and Preventive Action system.
 * Handles the full lifecycle of CAPAs including:
 * - Identification & Risk Assessment
 * - Root Cause Analysis (5-Why, Fishbone)
 * - Action Planning & Implementation
 * - Effectiveness Verification
 */
const capaManagementModule: SafetyModule = {
    id: 'capa-management',
    name: 'CAPA Management',
    description: 'Manage Corrective and Preventive Actions with ISO-compliant workflows and effectiveness tracking.',
    version: '1.0.0',
    icon: CAPAIcon,

    dashboard: {
        widget: CAPAWidget,
        route: CAPARoute,
    },

    navigation: [
        {
            label: 'CAPA Management',
            href: '/capa-management',
            icon: CAPAIcon,
            children: [
                {
                    label: 'Active CAPAs',
                    href: '/capa-management?tab=active',
                },
                {
                    label: 'Investigations',
                    href: '/capa-management/investigations',
                },
                {
                    label: 'Metrics',
                    href: '/capa-management/metrics',
                },
            ],
        },
    ],

    minRole: 'viewer', // Viewers can see CAPAs, employees+ can create/edit

    lifecycle: {
        onLoad: async () => {
            console.log('CAPA Management module loaded');
        },
        onUnload: async () => {
            console.log('CAPA Management module unloaded');
        },
    },
};

export default capaManagementModule;

# Safety Framework Module API

This document describes how to create modules for the Safety Management System.

## Quick Start

1. Create a new file in `lib/modules/` (e.g., `lib/modules/my-module.tsx`)
2. Export a default object implementing the `SafetyModule` interface
3. The module will be automatically discovered and registered at build time

## Module Structure

```typescript
import type { SafetyModule, WidgetProps, ModuleRouteProps } from '@/lib/safety-framework';

// Optional: Create your widget component
function MyWidget({ moduleId, moduleName }: WidgetProps) {
  return <div>Widget content for {moduleName}</div>;
}

// Optional: Create your route component
function MyRoute({ params }: ModuleRouteProps) {
  return <div>Full page content</div>;
}

// Export the module definition
const myModule: SafetyModule = {
  id: 'my-module',              // Unique ID (kebab-case)
  name: 'My Module',             // Display name
  description: 'Description',    // Brief description
  version: '1.0.0',              // Semantic version

  dashboard: {
    widget: MyWidget,            // Optional: Dashboard widget
    route: MyRoute,              // Optional: Full page route
  },

  navigation: [                  // Optional: Navigation items
    {
      label: 'My Module',
      href: '/my-module',
      icon: MyIcon,              // Optional icon component
    },
  ],

  lifecycle: {                   // Optional: Lifecycle hooks
    onLoad: async () => {
      // Called when module loads
      console.log('Module loaded');
    },
    onUnload: async () => {
      // Called on shutdown
      console.log('Module unloaded');
    },
  },
};

export default myModule;
```

## Required Fields

- `id` - Unique identifier (kebab-case, lowercase)
- `name` - Human-readable name
- `description` - Brief description of the module
- `version` - Semantic version (major.minor.patch)
- `dashboard` - Object containing widget and/or route components

## Optional Fields

### Icon
A React component to display as the module's icon:
```typescript
icon: () => <svg>...</svg>
```

### Dashboard Widget
A component shown on the dashboard home page:
```typescript
dashboard: {
  widget: ({ moduleId, moduleName }) => <div>Widget</div>
}
```

### Dashboard Route
A full-page component accessed at `/dashboard/[moduleId]`:
```typescript
dashboard: {
  route: async ({ params }) => {
    const { moduleId, subpage } = await params;
    return <div>Full page for {moduleId}</div>;
  }
}
```

### Navigation
Menu items for the sidebar:
```typescript
navigation: [
  {
    label: 'Main',
    href: '/my-module',      // Relative to /dashboard
    icon: MyIcon,            // Optional
  },
  {
    label: 'Settings',
    href: '/my-module/settings',
  },
]
```

### Lifecycle Hooks
Functions called during module lifecycle:
```typescript
lifecycle: {
  onLoad: async () => {
    // Initialize module (fetch data, setup listeners, etc.)
  },
  onUnload: async () => {
    // Cleanup (close connections, clear timers, etc.)
  },
}
```

## Type Safety

Import types from the framework:
```typescript
import type {
  SafetyModule,
  WidgetProps,
  ModuleRouteProps,
  ModuleNavigation,
} from '@/lib/safety-framework';
```

## Routing

Modules can define their own sub-routes. The route component receives a `params` prop:

```typescript
async function MyRoute({ params }: ModuleRouteProps) {
  const { moduleId, subpage } = await params;

  // subpage is an array of path segments
  // /dashboard/my-module/settings/advanced
  // subpage = ['settings', 'advanced']

  if (subpage?.[0] === 'settings') {
    return <Settings />;
  }

  return <MainView />;
}
```

## Module Isolation

**Important:** Modules should only import from:
- The framework public API: `@/lib/safety-framework`
- React and Next.js
- Standard libraries
- Shared UI components in `@/components/dashboard`

Do NOT import from other modules directly. This ensures modules remain independent.

## Example Module

See `lib/modules/incident-reporting.tsx` for a complete reference implementation.

## Validation

Modules are validated at build time. Common errors:

- **Invalid ID format**: Use kebab-case (lowercase, hyphens only)
- **Invalid version**: Must be semantic version (e.g., "1.0.0")
- **Missing required fields**: id, name, description, version, dashboard are required
- **Invalid component**: Components must be functions

## Best Practices

1. **Keep modules focused**: Each module should handle one domain area
2. **Use TypeScript**: Full type safety across the framework
3. **Handle loading states**: Use Suspense boundaries for async operations
4. **Error handling**: Wrap risky operations in try-catch blocks
5. **Accessibility**: Use semantic HTML and ARIA labels
6. **Responsive design**: Use Tailwind's responsive classes (md:, lg:, etc.)

## Troubleshooting

**Module not appearing:**
- Check that the file is in `lib/modules/` and exports a default object
- Verify the module passes validation (check build output)
- Ensure the file has a `.ts` or `.tsx` extension

**Type errors:**
- Import types from `@/lib/safety-framework`
- Ensure component signatures match `WidgetProps` or `ModuleRouteProps`

**Build errors:**
- Check module ID is unique
- Verify version follows semver format
- Ensure all required fields are present

## Why

The current dashboard uses custom Tailwind components which work but lack consistency, accessibility features, and polish. Shadcn UI provides a comprehensive, accessible component library built on Radix UI primitives that will improve the user experience and development velocity. The dashboard-01 block pattern provides a proven, modern layout structure that aligns with professional dashboard UX patterns.

## What Changes

- Install and configure Shadcn UI framework following official Next.js setup
- Initialize Shadcn configuration with components.json and proper path aliases
- Refactor dashboard layout to follow dashboard-01 block pattern with SidebarProvider and AppSidebar
- Replace custom components with Shadcn UI equivalents (Button, Card, Table, Badge, etc.)
- Update module card and widget components to use Shadcn Card and other UI primitives
- Migrate incident reporting module UI to use Shadcn components
- Add proper theme configuration with CSS variables for consistent styling
- Maintain full compatibility with existing module system

## Impact

- Affected specs: `ui-components`, `dashboard-layout`
- Affected code:
  - `components/dashboard/` - All dashboard components
  - `app/dashboard/layout.tsx` - Layout structure
  - `lib/modules/incident-reporting/` - Module UI components
  - New: `components/ui/` - Shadcn UI components
  - New: `components.json` - Shadcn configuration
  - Updated: `app/globals.css` - Theme and CSS variables
- New dependencies: Shadcn UI CLI, required peer dependencies (class-variance-authority, clsx, tailwind-merge, etc.)
- **BREAKING**: Minor visual changes to existing UI, but API remains compatible

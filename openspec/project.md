# Project Context

## Purpose
This is a modular safety management application that provides a flexible, extensible platform for managing safety-related operations. The framework allows teams to compose safety management capabilities (incident reporting, risk assessments, training tracking, etc.) through reusable modules while maintaining a unified dashboard experience.

## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Node.js
- Supabase for database and file storage (planned)

## Project Conventions

### Code Style
- TypeScript strict mode enabled
- Use functional components and React hooks
- Prefer server components by default, use 'use client' only when needed
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling

### Architecture Patterns

#### Modular Architecture
The application uses a plugin-based module system where safety management capabilities are delivered as self-contained modules that plug into a common dashboard framework.

**Module Structure:**
- Modules are TypeScript objects implementing the `SafetyModule` interface
- Located in `lib/modules/` directory
- Auto-discovered and registered at build time
- Each module is independent and cannot directly import other modules

**Module Interface:**
```typescript
interface SafetyModule {
  id: string                    // Unique kebab-case identifier
  name: string                  // Human-readable name
  description: string           // Brief description
  icon?: ComponentType          // Optional icon
  version: string               // Semantic version
  dashboard: {
    widget?: ComponentType      // Dashboard home widget
    route?: ComponentType       // Full-page route
  }
  navigation?: NavigationItem[] // Sidebar navigation
  lifecycle?: {
    onLoad?: () => void | Promise<void>
    onUnload?: () => void | Promise<void>
  }
}
```

**Dashboard Architecture:**
- Dashboard shell at `/dashboard` with sidebar navigation
- Dynamic routing: `/dashboard/[moduleId]` and `/dashboard/[moduleId]/[...subpage]`
- Module registry manages all registered modules
- Responsive layout with mobile-friendly navigation

**Key Files:**
- `lib/safety-framework/` - Framework core (types, registry, validation, lifecycle)
- `lib/modules/` - Module implementations
- `components/dashboard/` - Shared dashboard UI components
- `app/dashboard/` - Dashboard routes and layouts

**Adding a New Module:**
1. Create file in `lib/modules/` (e.g., `my-module.tsx`)
2. Export default object implementing `SafetyModule`
3. Add import in `lib/safety-framework/registry.ts` `discoverModules()` function
4. Module automatically appears in dashboard

See `lib/safety-framework/README.md` for detailed module development guide.

### Testing Strategy
[Explain your testing approach and requirements]

### Git Workflow
[Describe your branching strategy and commit conventions]

## Domain Context
[Add domain-specific knowledge that AI assistants need to understand]

## Important Constraints
[List any technical, business, or regulatory constraints]

## External Dependencies
[Document key external services, APIs, or systems]

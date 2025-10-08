## Context

The safety management system needs to support diverse use cases across different organizations and industries. Rather than building a monolithic application with every possible feature, we adopt a modular architecture where capabilities are delivered as self-contained modules that plug into a common dashboard framework.

**Constraints:**
- Must work within Next.js 15 App Router architecture
- TypeScript for type safety across module boundaries
- React 19 for UI components
- Minimal external dependencies initially

**Stakeholders:**
- End users who need customizable safety management tools
- Module developers who will create domain-specific functionality
- System administrators who configure and deploy modules

## Goals / Non-Goals

**Goals:**
- Enable rapid creation of safety management modules with minimal boilerplate
- Provide consistent UX across all modules through shared dashboard framework
- Support dynamic module loading and configuration
- Ensure type-safe module API contracts

**Non-Goals:**
- Hot module replacement in production (modules loaded at build/startup time)
- Complex permission system (defer to future change)
- Multi-tenancy (defer to future change)
- Real-time collaboration features (defer to future change)

## Decisions

### Decision 1: Module as TypeScript Object Pattern
**What:** Modules are TypeScript objects conforming to a `SafetyModule` interface, not separate packages or micro-frontends.

**Why:**
- Simplest implementation path
- Full TypeScript type checking across module boundaries
- No build complexity or bundling overhead
- Easy debugging and development workflow

**Alternatives considered:**
- npm packages: Too heavy, requires publishing/versioning
- iframe-based: Poor UX, complex communication
- Web Components: Interop complexity with React

### Decision 2: File-System Based Module Discovery
**What:** Modules are TypeScript files in `lib/modules/` directory, auto-discovered at build time.

**Why:**
- Leverages Next.js conventions
- Zero configuration for developers
- Clear module location
- Type-safe imports

**Alternatives considered:**
- Database registry: Requires runtime config, deployment complexity
- Plugin manifest files: Additional configuration burden

### Decision 3: Dashboard Uses App Router Layouts
**What:** Dashboard layout is a nested layout in Next.js App Router with dynamic module routing.

**Why:**
- Native Next.js patterns
- SEO-friendly URLs
- Server component benefits
- Streaming and suspense support

**Structure:**
```
app/
  dashboard/
    layout.tsx          # Dashboard shell
    page.tsx            # Dashboard home
    [moduleId]/
      page.tsx          # Dynamic module renderer
      [subpage]/
        page.tsx        # Module sub-routes
```

### Decision 4: Module State Management
**What:** Each module manages its own state using React hooks; shared state via React Context when needed.

**Why:**
- Standard React patterns
- No external state library dependencies
- Modules remain self-contained
- Easy to understand and debug

**Alternatives considered:**
- Redux/Zustand: Premature for MVP, adds dependency
- Server state only: Limits interactivity

## Architecture

### Module Interface

```typescript
interface SafetyModule {
  id: string
  name: string
  description: string
  icon?: React.ComponentType
  version: string

  // UI Components
  dashboard: {
    widget?: React.ComponentType<WidgetProps>
    route?: React.ComponentType<ModuleRouteProps>
  }

  // Navigation
  navigation?: {
    label: string
    href: string
    icon?: React.ComponentType
  }[]

  // Lifecycle hooks
  onLoad?: () => void | Promise<void>
  onUnload?: () => void | Promise<void>
}
```

### Module Registry Flow

1. **Build time:** Registry scans `lib/modules/` for module files
2. **Module files** export default object implementing `SafetyModule`
3. **Registry** validates modules and builds internal catalog
4. **Dashboard** queries registry for active modules
5. **Router** dynamically renders module components based on URL

### Data Flow

```
User Request → Next.js Router → Dashboard Layout → Module Registry
                                                   ↓
                                        Selected Module Component
                                                   ↓
                                          Module-Specific Logic
```

## Risks / Trade-offs

**Risk:** Modules could become tightly coupled to internal APIs
- **Mitigation:** Define stable public API surface, version modules, document breaking changes

**Risk:** Performance degradation with many modules
- **Mitigation:** Lazy loading, code splitting per module, dashboard widgets use suspense

**Risk:** Inconsistent UX across modules
- **Mitigation:** Provide shared UI component library, design guidelines, example modules

**Trade-off:** Simplicity vs. flexibility
- **Decision:** Start simple with in-repo modules; add remote module loading only if needed

## Migration Plan

N/A - This is a greenfield implementation.

**Initial modules to demonstrate framework:**
1. Dashboard home/overview
2. Example "Incident Reporting" module as reference implementation

## Open Questions

1. **Module configuration:** Should modules have user-configurable settings? → Defer to future change when needed
2. **Module dependencies:** Can modules depend on each other? → Not in V1, keep independent
3. **Module testing:** What testing utilities do modules need? → Provide example tests with reference module

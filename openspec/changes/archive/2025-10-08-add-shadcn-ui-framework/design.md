## Context

The current dashboard uses vanilla Tailwind CSS with custom component implementations. While functional, this approach:
- Lacks accessibility features (ARIA labels, keyboard navigation, screen reader support)
- Requires manual maintenance of component styling
- Doesn't provide consistent design patterns
- Missing common UI patterns (dropdowns, dialogs, tooltips, etc.)

Shadcn UI addresses these issues by providing:
- Pre-built, accessible components based on Radix UI
- Consistent theming via CSS variables
- Copy-paste component code (not an npm package)
- Full TypeScript support
- Tailwind CSS integration

**Constraints:**
- Must maintain compatibility with existing module system
- Cannot break SafetyModule interface or registration flow
- Should preserve all existing functionality
- Must work with Next.js 15 App Router
- Keep bundle size reasonable

**Stakeholders:**
- End users benefit from improved accessibility and UX
- Module developers get better UI components
- System maintainers get standardized component library

## Goals / Non-Goals

**Goals:**
- Install Shadcn UI with proper configuration
- Migrate dashboard layout to dashboard-01 block pattern
- Replace custom components with Shadcn equivalents
- Maintain 100% feature compatibility
- Improve accessibility and UX consistency
- Set up theming system for future customization

**Non-Goals:**
- Complete redesign of all pages (incremental migration)
- Adding new features beyond UI improvements
- Custom theme beyond default Shadcn styling (use defaults)
- Dark mode support (defer to future change)

## Decisions

### Decision 1: Use Shadcn CLI for Installation
**What:** Use `npx shadcn@latest init` to set up Shadcn with proper configuration.

**Why:**
- Official recommended approach
- Generates correct components.json
- Sets up path aliases automatically
- Configures Tailwind properly

**Implementation:**
```bash
npx shadcn@latest init
# Select options:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### Decision 2: Adopt Dashboard-01 Block Pattern
**What:** Restructure dashboard layout to match dashboard-01: SidebarProvider + AppSidebar + main content area.

**Why:**
- Proven pattern from Shadcn blocks
- Better responsive behavior
- Built-in sidebar state management
- Professional appearance
- Supports collapsible sidebar

**Structure:**
```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <header>...</header>
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

### Decision 3: Incremental Component Migration
**What:** Migrate components in priority order: Layout → Cards → Tables → Forms.

**Why:**
- Reduces risk of breaking changes
- Allows testing at each stage
- Can ship incrementally
- Easier to review

**Migration Order:**
1. Core layout (Sidebar, SidebarProvider)
2. Dashboard cards (ModuleCard, DashboardWidget)
3. Data display (incident table, badges)
4. Interactive elements (buttons, forms)

### Decision 4: Preserve Module API Surface
**What:** SafetyModule interface and component props remain unchanged.

**Why:**
- Existing modules continue to work
- No breaking changes for module developers
- Internal implementation can use Shadcn
- Modules can gradually adopt Shadcn components

**Approach:**
- Dashboard framework uses Shadcn internally
- Module components can optionally use Shadcn
- Provide examples in incident reporting module

## Architecture

### Component Structure After Migration

```
components/
  ui/                          # Shadcn components (generated)
    button.tsx
    card.tsx
    sidebar.tsx
    table.tsx
    badge.tsx
    ...
  dashboard/                   # Dashboard-specific compositions
    app-sidebar.tsx           # Custom AppSidebar with module nav
    module-card.tsx           # Wraps Card component
    dashboard-widget.tsx      # Wraps Card component
    site-header.tsx           # Dashboard header/breadcrumbs
```

### Dashboard Layout Flow

```
DashboardLayout (app/dashboard/layout.tsx)
  ↓
SidebarProvider (manages sidebar state)
  ↓
  ├─ AppSidebar (components/dashboard/app-sidebar.tsx)
  │    ├─ Logo/Brand
  │    ├─ Module Navigation Items
  │    └─ Footer (module count)
  │
  └─ SidebarInset
       ├─ SiteHeader (breadcrumbs, user menu)
       └─ Main Content Area
            └─ {children}
```

### Theming System

CSS variables in `app/globals.css`:
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... more variables */
  }
}
```

## Risks / Trade-offs

**Risk:** Bundle size increase from additional components
- **Mitigation:** Only add components as needed, tree-shaking handles unused code

**Risk:** Visual breaking changes for existing users
- **Mitigation:** Keep layout similar, preserve color scheme, test thoroughly

**Risk:** Learning curve for Shadcn patterns
- **Mitigation:** Provide updated examples, document in README, follow Shadcn docs

**Trade-off:** Copy-paste vs npm package approach
- **Decision:** Accept copy-paste model - more flexible, easier to customize, follows Shadcn philosophy

**Risk:** Tailwind v4 compatibility
- **Mitigation:** Verify Shadcn works with Tailwind v4, adjust configuration if needed

## Migration Plan

### Phase 1: Installation & Setup
1. Run Shadcn init
2. Add core components (button, card, sidebar, badge, table)
3. Configure components.json
4. Update globals.css with theme variables

### Phase 2: Layout Migration
1. Create AppSidebar component
2. Update DashboardLayout to use SidebarProvider
3. Add SiteHeader component
4. Test navigation and responsiveness

### Phase 3: Component Migration
1. Update ModuleCard to use Card component
2. Update DashboardWidget to use Card component
3. Migrate incident reporting table to use Table component
4. Update badges and buttons throughout

### Phase 4: Testing & Documentation
1. Test all routes and interactions
2. Verify module system still works
3. Update lib/safety-framework/README.md with Shadcn examples
4. Document theme customization

## Open Questions

1. **CSS Variables:** Should we customize theme colors to match current blue scheme? → Use defaults initially, can customize later
2. **Additional components:** What other Shadcn components should we pre-install? → Start with essentials (button, card, sidebar, table, badge), add more as needed
3. **Module guidelines:** Should modules be required to use Shadcn? → Optional but recommended, provide examples

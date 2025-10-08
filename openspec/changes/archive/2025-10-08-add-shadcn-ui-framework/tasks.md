## 1. Shadcn Installation and Setup

- [x] 1.1 Run `npx shadcn@latest init` to initialize Shadcn UI with Next.js configuration
- [x] 1.2 Verify components.json is created with correct paths and configuration
- [x] 1.3 Install core components: `npx shadcn@latest add button card sidebar table badge`
- [x] 1.4 Verify components are created in components/ui/ directory
- [x] 1.5 Test that imports from @/components/ui/ work correctly

## 2. Theme and CSS Configuration

- [x] 2.1 Review and update app/globals.css with Shadcn CSS variables
- [x] 2.2 Configure theme colors (background, foreground, primary, secondary, etc.)
- [x] 2.3 Ensure Tailwind configuration is compatible with Shadcn
- [x] 2.4 Test theme variables are applied correctly across components
- [x] 2.5 Verify no visual regressions in existing pages

## 3. Sidebar Component Migration

- [x] 3.1 Create components/dashboard/app-sidebar.tsx based on dashboard-01 pattern
- [x] 3.2 Implement AppSidebar with SidebarMenu and SidebarMenuItem components
- [x] 3.3 Integrate module navigation items into AppSidebar
- [x] 3.4 Add sidebar header with branding and footer with module count
- [x] 3.5 Test sidebar collapse/expand functionality

## 4. Dashboard Layout Refactoring

- [x] 4.1 Update app/dashboard/layout.tsx to use SidebarProvider
- [x] 4.2 Wrap content with SidebarInset component
- [x] 4.3 Create components/dashboard/site-header.tsx for page headers
- [x] 4.4 Test layout on desktop, tablet, and mobile viewports
- [x] 4.5 Verify module initialization still works correctly

## 5. Component Migration - Cards

- [x] 5.1 Update components/dashboard/ModuleCard.tsx to use Shadcn Card
- [x] 5.2 Refactor to use Card, CardHeader, CardContent, CardFooter primitives
- [x] 5.3 Update components/dashboard/DashboardWidget.tsx to use Shadcn Card
- [x] 5.4 Preserve all existing card functionality and interactions
- [x] 5.5 Test cards render correctly on dashboard home page

## 6. Component Migration - Incident Module UI

- [x] 6.1 Update lib/modules/incident-reporting/IncidentList.tsx to use Table component
- [x] 6.2 Replace custom table markup with Table, TableHeader, TableBody, TableRow, TableCell
- [x] 6.3 Update status badges to use Shadcn Badge component with appropriate variants
- [x] 6.4 Update buttons to use Shadcn Button component
- [x] 6.5 Update IncidentDetail.tsx to use Card components for sections

## 7. Component Migration - Widgets

- [x] 7.1 Update IncidentWidget.tsx to use Shadcn Card internally
- [x] 7.2 Replace custom badge styling with Shadcn Badge variants
- [x] 7.3 Ensure widget loading states use Shadcn patterns
- [x] 7.4 Test widgets render correctly in dashboard home
- [x] 7.5 Verify widget functionality is unchanged

## 8. Responsive and Accessibility Testing

- [x] 8.1 Test sidebar collapse/expand on desktop
- [x] 8.2 Test mobile navigation overlay and toggle
- [x] 8.3 Verify keyboard navigation works throughout dashboard
- [x] 8.4 Test screen reader compatibility with ARIA labels
- [x] 8.5 Test on different viewport sizes (mobile, tablet, desktop)

## 9. Documentation Updates

- [x] 9.1 Update lib/safety-framework/README.md with Shadcn component examples
- [x] 9.2 Document how modules can use Shadcn UI components
- [x] 9.3 Add examples of common patterns (cards, tables, badges, buttons)
- [x] 9.4 Update project.md with Shadcn UI information
- [x] 9.5 Document theme customization approach

## 10. Build and Validation

- [x] 10.1 Run TypeScript compilation and fix any type errors
- [x] 10.2 Run production build and verify bundle size
- [x] 10.3 Test all dashboard routes work correctly
- [x] 10.4 Test incident module functionality end-to-end
- [x] 10.5 Verify no visual or functional regressions

# dashboard-layout Specification

## Purpose
TBD - created by archiving change add-shadcn-ui-framework. Update Purpose after archive.
## Requirements
### Requirement: Sidebar Provider Integration
The system SHALL integrate Shadcn's SidebarProvider to manage sidebar state and layout.

#### Scenario: SidebarProvider wraps dashboard layout
- **WHEN** a user accesses any dashboard route
- **THEN** the SidebarProvider component wraps the entire dashboard
- **AND** sidebar state is managed through React context
- **AND** sidebar can be toggled between open and collapsed states

#### Scenario: Sidebar state persists across navigation
- **WHEN** a user toggles the sidebar and navigates between pages
- **THEN** the sidebar state is preserved
- **AND** the layout adjusts smoothly without content jumping

### Requirement: AppSidebar Component
The system SHALL provide an AppSidebar component following the dashboard-01 block pattern.

#### Scenario: AppSidebar renders module navigation
- **WHEN** the dashboard loads
- **THEN** AppSidebar displays a branded header section
- **AND** navigation items are generated from registered modules
- **AND** active route is visually highlighted
- **AND** sidebar footer shows module count

#### Scenario: Sidebar supports collapsible state
- **WHEN** a user clicks the sidebar toggle
- **THEN** the sidebar collapses to icon-only mode
- **AND** labels are hidden in collapsed state
- **AND** tooltips show labels on hover in collapsed state

#### Scenario: Sidebar is responsive
- **WHEN** viewport width is below tablet breakpoint
- **THEN** sidebar is hidden by default
- **AND** a menu button appears to toggle sidebar
- **AND** sidebar overlays content when opened on mobile

### Requirement: Dashboard Layout Structure
The system SHALL structure the dashboard layout following the dashboard-01 pattern with SidebarInset and proper content areas.

#### Scenario: Layout uses SidebarInset pattern
- **WHEN** rendering dashboard content
- **THEN** content is wrapped in SidebarInset component
- **AND** content area adjusts based on sidebar state
- **AND** layout is fluid and responsive

#### Scenario: Site header is present
- **WHEN** viewing any dashboard page
- **THEN** a site header is displayed above main content
- **AND** header includes breadcrumbs or page title
- **AND** header remains accessible when scrolling

### Requirement: Component Migration to Shadcn
The system SHALL migrate existing dashboard components to use Shadcn UI primitives while maintaining functionality.

#### Scenario: ModuleCard uses Card component
- **WHEN** module cards are displayed on the dashboard home
- **THEN** cards use Shadcn Card component
- **AND** card styling follows Shadcn design system
- **AND** all existing card content and interactions are preserved

#### Scenario: DashboardWidget uses Card component
- **WHEN** dashboard widgets are rendered
- **THEN** widgets use Shadcn Card component with CardHeader and CardContent
- **AND** widget functionality remains unchanged
- **AND** loading states use Shadcn patterns

#### Scenario: Incident table uses Table component
- **WHEN** incident list is displayed
- **THEN** table uses Shadcn Table, TableHeader, TableBody, TableRow, TableCell components
- **AND** table styling is consistent with Shadcn design
- **AND** table remains responsive and functional

#### Scenario: Status badges use Badge component
- **WHEN** status indicators are shown (severity, status)
- **THEN** badges use Shadcn Badge component with appropriate variants
- **AND** color schemes match semantic meaning (error, warning, success, info)

#### Scenario: Buttons use Button component
- **WHEN** interactive buttons are rendered
- **THEN** buttons use Shadcn Button component
- **AND** buttons support variants (default, outline, ghost, destructive)
- **AND** button accessibility is maintained (keyboard navigation, screen readers)


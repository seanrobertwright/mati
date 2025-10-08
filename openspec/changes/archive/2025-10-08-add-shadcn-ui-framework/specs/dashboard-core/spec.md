## MODIFIED Requirements

### Requirement: Navigation Menu
The system SHALL generate navigation menu items from registered module metadata using Shadcn Sidebar components.

#### Scenario: Navigation items are generated from modules
- **WHEN** the navigation menu is rendered
- **THEN** menu items are created for each module with navigation metadata
- **AND** it uses SidebarMenu, SidebarMenuItem, SidebarMenuButton components
- **AND** icons and labels follow Shadcn sidebar patterns

#### Scenario: Active module is highlighted
- **WHEN** a user is viewing a specific module
- **THEN** that module's navigation item is visually highlighted
- **AND** active state styling uses Shadcn conventions

#### Scenario: Module icons are displayed
- **WHEN** a module provides an icon component
- **THEN** the icon is rendered next to the navigation label

#### Scenario: Mobile navigation uses Shadcn patterns
- **WHEN** on mobile viewport
- **THEN** sidebar toggle uses SidebarTrigger component
- **AND** overlay behavior follows Shadcn sidebar responsive patterns


## ADDED Requirements

### Requirement: Dashboard Layout
The system SHALL provide a consistent layout shell for all dashboard pages and modules.

#### Scenario: Layout renders navigation sidebar
- **WHEN** a user accesses any dashboard route
- **THEN** a navigation sidebar is displayed with links to all registered modules

#### Scenario: Layout renders main content area
- **WHEN** a user accesses any dashboard route
- **THEN** the main content area displays the appropriate page or module content

#### Scenario: Layout is responsive
- **WHEN** the viewport width is below 768px
- **THEN** the navigation sidebar collapses to a mobile-friendly menu

### Requirement: Dashboard Home Page
The system SHALL provide a home page that displays an overview of registered modules.

#### Scenario: Home page shows module cards
- **WHEN** a user visits the dashboard home page
- **THEN** module cards are displayed for each registered module showing name, description, and icon

#### Scenario: Module cards are clickable
- **WHEN** a user clicks on a module card
- **THEN** the user is navigated to that module's main route

#### Scenario: Dashboard widgets are rendered
- **WHEN** a registered module provides a dashboard widget component
- **THEN** the widget is rendered on the home page in a grid layout

### Requirement: Module Routing
The system SHALL dynamically route dashboard URLs to the appropriate module components.

#### Scenario: Module main route renders module component
- **WHEN** a user navigates to `/dashboard/[moduleId]`
- **THEN** the corresponding module's route component is rendered

#### Scenario: Non-existent module shows 404
- **WHEN** a user navigates to a moduleId that does not exist
- **THEN** a 404 not found page is displayed

#### Scenario: Module sub-routes are supported
- **WHEN** a module defines sub-routes and user navigates to `/dashboard/[moduleId]/[subpage]`
- **THEN** the module's route component receives the subpage parameter

### Requirement: Navigation Menu
The system SHALL generate navigation menu items from registered module metadata.

#### Scenario: Navigation items are generated from modules
- **WHEN** the navigation menu is rendered
- **THEN** menu items are created for each module with navigation metadata

#### Scenario: Active module is highlighted
- **WHEN** a user is viewing a specific module
- **THEN** that module's navigation item is visually highlighted

#### Scenario: Module icons are displayed
- **WHEN** a module provides an icon component
- **THEN** the icon is rendered next to the navigation label

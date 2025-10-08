## Why

Organizations need a flexible, extensible platform to manage safety-related operations without building custom solutions from scratch. A modular framework allows teams to compose safety management capabilities (incident reporting, risk assessments, training tracking, etc.) through reusable modules while maintaining a unified dashboard experience.

## What Changes

- Add module registry system that discovers and registers safety modules dynamically
- Create dashboard core infrastructure with navigation, layout, and module rendering
- Define module specification API for consistent module integration
- Implement base module types for common safety management patterns
- Add module lifecycle management (load, unload, configure)

## Impact

- Affected specs: `safety-modules`, `dashboard-core`, `module-registry`
- Affected code: New core infrastructure in `app/`, `lib/`, and `components/`
- New patterns: Module-based architecture, plugin system, dashboard framework

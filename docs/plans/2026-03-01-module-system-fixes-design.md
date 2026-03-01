# Module System Fixes — Design

**Date:** 2026-03-01
**Status:** Approved
**Goal:** Clean, simple, working modularity with no over-engineering

## Context

Mati is a safety management platform with a module system (`lib/safety-framework/`) that lets modules (incident-reporting, capa-management, document-management) register themselves and integrate into the dashboard via widgets, routes, and navigation.

Assessment found 4 categories of issues: hard-coded discovery, no error isolation, routing inconsistency, and stale file debris.

## Decisions

### 1. Manifest-based module registration

**Current:** `discoverModules()` in `registry.ts` hard-codes `await import()` for each module. Adding a module means editing framework code.

**Fix:** Create `lib/modules/index.ts` as a manifest:

```ts
import incident from './incident-reporting';
import capa from './capa-management';
import docs from './document-management';

export const modules = [incident, capa, docs];
```

Simplify `discoverModules()` to consume this array. Adding a module = one import + one array entry in `lib/modules/index.ts`. Framework code never changes.

### 2. Error isolation per module

**Current:** All module imports are in a single try/catch. One failure kills all.

**Fix:** Load and register each module independently with its own try/catch. A failing module gets logged and skipped; others still load.

### 3. Single initialization path

**Current:** `dashboard/layout.tsx` calls `initializeModules()`, and `[moduleId]/page.tsx` has a redundant fallback check.

**Fix:** Keep `layout.tsx` as the single initialization point. Remove the redundant check from `[moduleId]/page.tsx`.

### 4. Remove document-management hard-coded routes

**Current:** `app/dashboard/document-management/` has hard-coded route folders (audit-log, change-requests, metrics) that bypass the dynamic `[moduleId]` routing.

**Fix:** Delete `app/dashboard/document-management/`. All modules use the dynamic `[moduleId]/[...subpage]` routing consistently.

### 5. Fix document-management barrel exports

**Current:** `lib/modules/document-management/index.ts` re-exports all internals (`* from ./validation`, `* from ./errors`, etc.) while other modules only export their default module definition.

**Fix:** Remove wildcard re-exports. Keep only the default module export to match the pattern.

### 6. Delete stale documentation

**Delete:** `Implementation/` (47 files), `documents/` (24 files) — session artifacts preserved in git history.

**Keep:** `docs/plans/`, `openspec/`, `README.md`.

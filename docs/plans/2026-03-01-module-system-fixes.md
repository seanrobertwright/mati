# Module System Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix module discovery, error isolation, routing consistency, and clean up stale files so the module system is clean and works without issues.

**Architecture:** Replace hard-coded module imports with a manifest array in `lib/modules/index.ts`. Each module loads independently with error isolation. All routing flows through the dynamic `[moduleId]` system. Stale documentation files are deleted.

**Tech Stack:** Next.js 15, TypeScript, React, Drizzle ORM, Supabase Auth

---

### Task 1: Create module manifest

**Files:**
- Create: `lib/modules/index.ts`

**Step 1: Create the manifest file**

```ts
import incidentReportingModule from './incident-reporting';
import documentManagementModule from './document-management';
import capaManagementModule from './capa-management';
import type { SafetyModule } from '@/lib/safety-framework/types';

/**
 * Module manifest — the single place to register modules.
 * To add a module: import it and add it to this array.
 */
export const modules: SafetyModule[] = [
  incidentReportingModule,
  documentManagementModule,
  capaManagementModule,
];
```

**Step 2: Commit**

```bash
git add lib/modules/index.ts
git commit -m "feat: add module manifest for explicit registration"
```

---

### Task 2: Rewrite discoverModules to use manifest + error isolation

**Files:**
- Modify: `lib/safety-framework/registry.ts` (lines 144-191)

**Step 1: Replace discoverModules implementation**

Replace the entire `discoverModules` function (lines 144-191) with:

```ts
export async function discoverModules(): Promise<void> {
  if (registry.isInitialized()) {
    return;
  }

  const { modules } = await import('@/lib/modules');

  for (const mod of modules) {
    try {
      registry.register(mod);
    } catch (error) {
      console.error(`Failed to register module '${mod?.id ?? 'unknown'}':`, error);
      // Continue loading other modules
    }
  }

  if (registry.getModuleCount() === 0) {
    console.warn('No modules were loaded during discovery');
  }

  registry.markInitialized();
}
```

Key changes:
- Imports from manifest instead of hard-coding each module
- Each module registers independently — one failure doesn't kill others
- Removed verbose console.log spam (keep only warnings/errors)

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors related to registry.ts

**Step 3: Commit**

```bash
git add lib/safety-framework/registry.ts
git commit -m "refactor: use manifest for module discovery with per-module error isolation"
```

---

### Task 3: Remove redundant initialization from [moduleId]/page.tsx

**Files:**
- Modify: `app/dashboard/[moduleId]/page.tsx` (lines 6-62)

**Step 1: Simplify ModulePage**

The layout already calls `initializeModules()`. Remove the redundant initialization check (lines 16-23). The function should become:

```ts
export default async function ModulePage(props: ModuleRouteProps) {
  const params = await props.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const safetyModule = registry.getModule(params.moduleId);

  if (!safetyModule) {
    notFound();
  }

  if (!registry.canUserAccessModule(user, params.moduleId)) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8">
        <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          You do not have permission to access this module. Contact your administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  if (!safetyModule.dashboard.route) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{safetyModule.name}</h1>
        <p className="text-gray-600 mb-4">{safetyModule.description}</p>
        <p className="text-sm text-gray-500">
          This module does not have a route component configured.
        </p>
      </div>
    );
  }

  const RouteComponent = safetyModule.dashboard.route;
  return <RouteComponent params={Promise.resolve(params)} />;
}
```

Also remove the unused `initializeModules` import if present.

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/dashboard/[moduleId]/page.tsx
git commit -m "refactor: remove redundant module initialization from dynamic route"
```

---

### Task 4: Remove document-management hard-coded routes

**Files:**
- Delete: `app/dashboard/document-management/` (entire directory)

**Context:** These hard-coded routes (audit-log: 334 lines, metrics: 288 lines, change-requests with components) bypass the module system. DocumentRoute already handles sub-routing via the `[...subpage]` catch-all — currently with "Coming soon" stubs. The hard-coded implementations are preserved in git history (commit before this one) for reference when building out those features properly within the module system.

**Step 1: Delete the hard-coded routes directory**

```bash
rm -rf app/dashboard/document-management/
```

**Step 2: Verify the dynamic route still handles document-management**

Check that `app/dashboard/[moduleId]/page.tsx` and `app/dashboard/[moduleId]/[...subpage]/page.tsx` exist and are intact.

**Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors (nothing imports from the deleted routes)

**Step 4: Commit**

```bash
git add -A app/dashboard/document-management/
git commit -m "refactor: remove hard-coded document-management routes in favor of dynamic module routing"
```

---

### Task 5: Clean up document-management barrel exports

**Files:**
- Modify: `lib/modules/document-management/index.ts` (lines 83-96)

**Step 1: Remove wildcard re-exports**

Delete lines 83-96 (the `export * from` and `export * as` lines). The file should end after `export default documentManagementModule;` (line 81), keeping only the default module export like the other modules.

**Step 2: Check for broken imports**

Run: `npx tsc --noEmit`

If anything imports from `@/lib/modules/document-management` expecting the re-exported symbols, update those imports to reference the actual source files directly (e.g., `@/lib/modules/document-management/validation` instead of `@/lib/modules/document-management`).

**Step 3: Commit**

```bash
git add lib/modules/document-management/index.ts
git commit -m "refactor: remove barrel exports from document-management to match module pattern"
```

---

### Task 6: Delete stale documentation files

**Files:**
- Delete: `Implementation/` (47 files)
- Delete: `documents/` (24 files)
- Delete: other root-level stale docs (`RETRY_FIX.md`, `ROLE_SYSTEM_DOCUMENTATION.md`, `git_status_output.txt`, `$null`, `dev-server.log`)

**Step 1: Delete stale directories and files**

```bash
rm -rf Implementation/
rm -rf documents/
rm -f RETRY_FIX.md ROLE_SYSTEM_DOCUMENTATION.md git_status_output.txt dev-server.log '$null'
```

**Step 2: Verify nothing references these files**

Run: `grep -r "Implementation/" lib/ app/ components/ --include="*.ts" --include="*.tsx" | head -5`
Run: `grep -r "documents/" lib/ app/ components/ --include="*.ts" --include="*.tsx" | head -5`

Expected: No imports or references to these documentation directories from source code.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove stale session documentation files"
```

---

### Task 7: Verify everything works

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: Clean, no errors

**Step 2: Run existing tests**

Run: `npx vitest run`
Expected: All existing tests pass

**Step 3: Build check**

Run: `npx next build`
Expected: Build succeeds without errors

**Step 4: Commit any fixes if needed**

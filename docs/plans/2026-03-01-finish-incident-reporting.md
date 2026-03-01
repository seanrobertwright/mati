# Finish Incident Reporting Module — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the incident reporting module by adding server actions, a create form, status transitions, edit capability, delete capability, and wiring the list/detail/widget to the real database (removing seed data dependency).

**Architecture:** Follow the exact same pattern used by the CAPA module — `'use server'` actions file wrapping repository calls with auth checks, client-side form components using `useRouter` + `useState`, and server components for list/detail views fetching through the actions layer. All UI uses existing shadcn components (Card, Table, Badge, Button, Input, Label, Dialog).

**Tech Stack:** Next.js 15 App Router, Drizzle ORM, Supabase Auth, React 19, shadcn/ui, Vitest

---

### Task 1: Create Server Actions File

**Files:**
- Create: `lib/modules/incident-reporting/actions.ts`

**Step 1: Create the actions file with all CRUD + status transition server actions**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/auth/server';
import {
  getIncidentsForUser,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
} from '@/lib/db/repositories/incidents';

export async function getIncidentList() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const incidents = await getIncidentsForUser(user);
    return { success: true, data: incidents };
  } catch (error) {
    console.error('Get incident list error:', error);
    return { error: 'Failed to fetch incidents' };
  }
}

export async function getIncident(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const incident = await getIncidentById(id);

    if (!incident) {
      return { error: 'Incident not found' };
    }

    return { success: true, data: incident };
  } catch (error) {
    console.error('Get incident error:', error);
    return { error: 'Failed to fetch incident' };
  }
}

export async function createNewIncident(data: {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const incident = await createIncident(
      {
        title: data.title,
        description: data.description,
        severity: data.severity,
        status: 'open',
        reportedBy: user.email || 'Unknown',
        userId: user.id,
      },
      user
    );

    revalidatePath('/dashboard/incident-reporting');
    return { success: true, data: incident };
  } catch (error) {
    console.error('Create incident error:', error);
    return { error: 'Failed to create incident' };
  }
}

export async function updateExistingIncident(
  id: string,
  data: {
    title?: string;
    description?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'open' | 'investigating' | 'resolved' | 'closed';
  }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const incident = await updateIncident(id, data, user);

    revalidatePath('/dashboard/incident-reporting');
    revalidatePath(`/dashboard/incident-reporting/${id}`);
    return { success: true, data: incident };
  } catch (error) {
    console.error('Update incident error:', error);
    return { error: 'Failed to update incident' };
  }
}

export async function deleteExistingIncident(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    await deleteIncident(id, user);

    revalidatePath('/dashboard/incident-reporting');
    return { success: true };
  } catch (error) {
    console.error('Delete incident error:', error);
    return { error: 'Failed to delete incident' };
  }
}

export async function transitionIncidentStatus(
  id: string,
  status: 'open' | 'investigating' | 'resolved' | 'closed'
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const incident = await updateIncident(id, { status }, user);

    revalidatePath('/dashboard/incident-reporting');
    revalidatePath(`/dashboard/incident-reporting/${id}`);
    return { success: true, data: incident };
  } catch (error) {
    console.error('Transition incident status error:', error);
    return { error: 'Failed to update incident status' };
  }
}
```

**Step 2: Verify the file compiles**

Run: `npx tsc --noEmit lib/modules/incident-reporting/actions.ts 2>&1 | head -20`
Expected: No errors (or only unrelated project-wide errors)

**Step 3: Commit**

```bash
git add lib/modules/incident-reporting/actions.ts
git commit -m "feat(incident-reporting): add server actions for CRUD and status transitions"
```

---

### Task 2: Create Incident Report Form

**Files:**
- Create: `lib/modules/incident-reporting/IncidentCreateForm.tsx`

**Step 1: Create the create form component (follows CAPACreateForm pattern)**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createNewIncident } from './actions';

type Severity = 'low' | 'medium' | 'high' | 'critical';

export function IncidentCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium' as Severity,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createNewIncident({
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push('/dashboard/incident-reporting');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/incident-reporting');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report New Incident</CardTitle>
        <CardDescription>
          Create a new safety incident report
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Brief description of the incident"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Provide details about what happened, where, when, and who was involved"
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity *</Label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Report Incident'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit 2>&1 | grep -i "IncidentCreateForm" | head -10`
Expected: No errors referencing this file

**Step 3: Commit**

```bash
git add lib/modules/incident-reporting/IncidentCreateForm.tsx
git commit -m "feat(incident-reporting): add incident create form component"
```

---

### Task 3: Wire IncidentList to Real Database

**Files:**
- Modify: `lib/modules/incident-reporting/IncidentList.tsx`

**Step 1: Update IncidentList to use auth-aware data fetching instead of the generic `getIncidents`**

Replace the entire file. Key changes:
- Import `getIncidentsForUser` instead of `getIncidents`
- Import `createClient` to get the authenticated user
- Use `Link` component for the "Report New Incident" button to navigate to `/dashboard/incident-reporting/new`
- Make table rows clickable to navigate to detail view

```tsx
import { getIncidentsForUser } from '@/lib/db/repositories/incidents';
import { createClient } from '@/lib/auth/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

export default async function IncidentList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const allIncidents = await getIncidentsForUser(user);

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      case 'low':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'secondary' as const;
      case 'investigating':
        return 'default' as const;
      case 'open':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incident Reports</h1>
          <p className="text-gray-600 mt-1">
            Track and manage safety incidents across your organization
          </p>
        </div>
        <Link href="/dashboard/incident-reporting/new">
          <Button>Report New Incident</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{allIncidents.length}</div>
            <p className="text-xs text-muted-foreground">Total Incidents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {allIncidents.filter(i => i.status === 'open').length}
            </div>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {allIncidents.filter(i => i.status === 'investigating').length}
            </div>
            <p className="text-xs text-muted-foreground">Investigating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-secondary-foreground">
              {allIncidents.filter(i => i.status === 'resolved').length}
            </div>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Incident</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Reporter</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No incidents reported yet.
                </TableCell>
              </TableRow>
            ) : (
              allIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/incident-reporting/${incident.id}`}
                      className="block"
                    >
                      <div className="font-medium hover:underline">{incident.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {incident.description}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityVariant(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(incident.status)}>
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {incident.reportedAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {incident.reportedBy}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit 2>&1 | grep -i "IncidentList" | head -10`
Expected: No errors

**Step 3: Commit**

```bash
git add lib/modules/incident-reporting/IncidentList.tsx
git commit -m "feat(incident-reporting): wire IncidentList to real database with auth"
```

---

### Task 4: Add Status Transition and Delete to IncidentDetail

**Files:**
- Modify: `lib/modules/incident-reporting/IncidentDetail.tsx`

**Step 1: Create a client component for the status/delete actions**

Create: `lib/modules/incident-reporting/IncidentActions.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { transitionIncidentStatus, deleteExistingIncident } from './actions';

const STATUS_FLOW: Record<string, string[]> = {
  open: ['investigating'],
  investigating: ['resolved', 'open'],
  resolved: ['closed', 'investigating'],
  closed: [],
};

export function IncidentActions({ incidentId, currentStatus }: { incidentId: string; currentStatus: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStatuses = STATUS_FLOW[currentStatus] || [];

  const handleTransition = async (newStatus: 'open' | 'investigating' | 'resolved' | 'closed') => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await transitionIncidentStatus(incidentId, newStatus);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this incident? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await deleteExistingIncident(incidentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push('/dashboard/incident-reporting');
    } catch {
      setError('Failed to delete incident');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button
            key={status}
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => handleTransition(status as 'open' | 'investigating' | 'resolved' | 'closed')}
          >
            Move to {status}
          </Button>
        ))}
        <Button
          variant="destructive"
          size="sm"
          disabled={isLoading}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
```

**Step 2: Update IncidentDetail to use IncidentActions and add a back link**

Replace the entire `IncidentDetail.tsx` file:

```tsx
import { getIncidentById } from '@/lib/db/repositories/incidents';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IncidentActions } from './IncidentActions';

export default async function IncidentDetail({ incidentId }: { incidentId: string }) {
  const incident = await getIncidentById(incidentId);

  if (!incident) {
    return (
      <Card className="p-8 text-center">
        <CardTitle className="mb-2">Incident Not Found</CardTitle>
        <p className="text-muted-foreground">The incident you&apos;re looking for doesn&apos;t exist.</p>
      </Card>
    );
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      case 'low':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/incident-reporting">
          <Button variant="outline" size="sm">Back to List</Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{incident.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge variant={getSeverityVariant(incident.severity)}>
            {incident.severity}
          </Badge>
          <Badge variant="outline">{incident.status}</Badge>
          <span className="text-sm text-muted-foreground">
            Reported by {incident.reportedBy} on{' '}
            {incident.reportedAt.toLocaleDateString()}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{incident.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1 capitalize">{incident.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Severity</dt>
              <dd className="mt-1 capitalize">{incident.severity}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Incident ID</dt>
              <dd className="mt-1 font-mono text-sm">{incident.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">CAPA Required</dt>
              <dd className="mt-1">{incident.capaRequired ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentActions incidentId={incident.id} currentStatus={incident.status} />
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add lib/modules/incident-reporting/IncidentActions.tsx lib/modules/incident-reporting/IncidentDetail.tsx
git commit -m "feat(incident-reporting): add status transitions and delete to detail view"
```

---

### Task 5: Update IncidentRoute to Handle Create and Detail Subpages

**Files:**
- Modify: `lib/modules/incident-reporting/IncidentRoute.tsx`

**Step 1: Update IncidentRoute to support `/new` subpage (follows CAPARoute pattern)**

```tsx
import { Suspense } from 'react';
import type { ModuleRouteProps } from '@/lib/safety-framework';
import IncidentList from './IncidentList';
import IncidentDetail from './IncidentDetail';
import { IncidentCreateForm } from './IncidentCreateForm';
import { Card, CardContent } from '@/components/ui/card';

function IncidentListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-40 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-8 w-12 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <div className="p-4">
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </Card>
    </div>
  );
}

export default async function IncidentRoute({ params }: ModuleRouteProps) {
  const { subpage } = await params;

  // Create view: /dashboard/incident-reporting/new
  if (subpage?.[0] === 'new') {
    return <IncidentCreateForm />;
  }

  // Detail view: /dashboard/incident-reporting/[id]
  if (subpage && subpage.length > 0) {
    const incidentId = subpage[0];
    return <IncidentDetail incidentId={incidentId} />;
  }

  // List view: /dashboard/incident-reporting
  return (
    <Suspense fallback={<IncidentListSkeleton />}>
      <IncidentList />
    </Suspense>
  );
}
```

**Step 2: Commit**

```bash
git add lib/modules/incident-reporting/IncidentRoute.tsx
git commit -m "feat(incident-reporting): add create/detail routing with loading skeleton"
```

---

### Task 6: Wire IncidentWidget to Real Database

**Files:**
- Modify: `lib/modules/incident-reporting/IncidentWidget.tsx`

**Step 1: Update IncidentWidget to use auth-aware data fetching**

```tsx
import { getIncidentsForUser } from '@/lib/db/repositories/incidents';
import { createClient } from '@/lib/auth/server';
import { Badge } from '@/components/ui/badge';

export default async function IncidentWidget() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const allIncidents = await getIncidentsForUser(user);
  const recentIncidents = allIncidents.slice(0, 3);

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      case 'low':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-3">
      {recentIncidents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No incidents reported
        </p>
      ) : (
        recentIncidents.map((incident) => (
          <div
            key={incident.id}
            className="flex items-start gap-3 p-3 bg-muted/50 rounded-md"
          >
            <Badge variant={getSeverityVariant(incident.severity)}>
              {incident.severity}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {incident.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {incident.reportedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add lib/modules/incident-reporting/IncidentWidget.tsx
git commit -m "feat(incident-reporting): wire widget to real database"
```

---

### Task 7: Clean Up Seed Data

**Files:**
- Modify: `lib/modules/incident-reporting/data.ts`

**Step 1: Remove the seed data, keep only the re-exports**

The `data.ts` file currently re-exports from repositories AND has seed data. The seed data is no longer needed since we're using the real database. Keep only the re-exports for backward compatibility.

```ts
/**
 * Data layer for incident reporting module
 * Re-exports repository functions for module use
 */
export * from '@/lib/db/types';
export * from '@/lib/db/repositories/incidents';
```

**Step 2: Commit**

```bash
git add lib/modules/incident-reporting/data.ts
git commit -m "refactor(incident-reporting): remove seed data, keep only repository re-exports"
```

---

### Task 8: Write Tests for Server Actions

**Files:**
- Create: `lib/modules/incident-reporting/__tests__/actions.test.ts`

**Step 1: Create the test file**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth server module
vi.mock('@/lib/auth/server', () => ({
  createClient: vi.fn(),
}));

// Mock the incidents repository
vi.mock('@/lib/db/repositories/incidents', () => ({
  getIncidentsForUser: vi.fn(),
  getIncidentById: vi.fn(),
  createIncident: vi.fn(),
  updateIncident: vi.fn(),
  deleteIncident: vi.fn(),
}));

import { createClient } from '@/lib/auth/server';
import {
  getIncidentsForUser,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
} from '@/lib/db/repositories/incidents';
import {
  getIncidentList,
  getIncident,
  createNewIncident,
  updateExistingIncident,
  deleteExistingIncident,
  transitionIncidentStatus,
} from '../actions';

const mockUser = { id: 'user-1', email: 'test@example.com' };

function mockAuthenticatedClient() {
  (createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: mockUser } }) },
  });
}

function mockUnauthenticatedClient() {
  (createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: null } }) },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getIncidentList', () => {
  it('returns incidents for authenticated user', async () => {
    mockAuthenticatedClient();
    const mockIncidents = [{ id: '1', title: 'Test' }];
    (getIncidentsForUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockIncidents);

    const result = await getIncidentList();

    expect(result).toEqual({ success: true, data: mockIncidents });
    expect(getIncidentsForUser).toHaveBeenCalledWith(mockUser);
  });

  it('returns error for unauthenticated user', async () => {
    mockUnauthenticatedClient();

    const result = await getIncidentList();

    expect(result).toEqual({ error: 'Unauthorized' });
  });
});

describe('getIncident', () => {
  it('returns a single incident by id', async () => {
    mockAuthenticatedClient();
    const mockIncident = { id: '1', title: 'Test' };
    (getIncidentById as ReturnType<typeof vi.fn>).mockResolvedValue(mockIncident);

    const result = await getIncident('1');

    expect(result).toEqual({ success: true, data: mockIncident });
  });

  it('returns error when incident not found', async () => {
    mockAuthenticatedClient();
    (getIncidentById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await getIncident('nonexistent');

    expect(result).toEqual({ error: 'Incident not found' });
  });
});

describe('createNewIncident', () => {
  it('creates an incident with correct data', async () => {
    mockAuthenticatedClient();
    const newIncident = { id: '1', title: 'Slip', severity: 'high', status: 'open' };
    (createIncident as ReturnType<typeof vi.fn>).mockResolvedValue(newIncident);

    const result = await createNewIncident({
      title: 'Slip',
      description: 'Slipped on floor',
      severity: 'high',
    });

    expect(result).toEqual({ success: true, data: newIncident });
    expect(createIncident).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Slip',
        description: 'Slipped on floor',
        severity: 'high',
        status: 'open',
      }),
      mockUser
    );
  });

  it('returns error for unauthenticated user', async () => {
    mockUnauthenticatedClient();

    const result = await createNewIncident({
      title: 'Test',
      description: 'Test',
      severity: 'low',
    });

    expect(result).toEqual({ error: 'Unauthorized' });
  });
});

describe('updateExistingIncident', () => {
  it('updates an incident', async () => {
    mockAuthenticatedClient();
    const updated = { id: '1', title: 'Updated', severity: 'low' };
    (updateIncident as ReturnType<typeof vi.fn>).mockResolvedValue(updated);

    const result = await updateExistingIncident('1', { title: 'Updated' });

    expect(result).toEqual({ success: true, data: updated });
    expect(updateIncident).toHaveBeenCalledWith('1', { title: 'Updated' }, mockUser);
  });
});

describe('deleteExistingIncident', () => {
  it('deletes an incident', async () => {
    mockAuthenticatedClient();
    (deleteIncident as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const result = await deleteExistingIncident('1');

    expect(result).toEqual({ success: true });
    expect(deleteIncident).toHaveBeenCalledWith('1', mockUser);
  });
});

describe('transitionIncidentStatus', () => {
  it('transitions incident status', async () => {
    mockAuthenticatedClient();
    const updated = { id: '1', status: 'investigating' };
    (updateIncident as ReturnType<typeof vi.fn>).mockResolvedValue(updated);

    const result = await transitionIncidentStatus('1', 'investigating');

    expect(result).toEqual({ success: true, data: updated });
    expect(updateIncident).toHaveBeenCalledWith('1', { status: 'investigating' }, mockUser);
  });
});
```

**Step 2: Run the tests**

Run: `npx vitest run lib/modules/incident-reporting/__tests__/actions.test.ts`
Expected: All 8 tests pass

**Step 3: Commit**

```bash
git add lib/modules/incident-reporting/__tests__/actions.test.ts
git commit -m "test(incident-reporting): add server action tests"
```

---

### Task 9: Smoke Test the Full Flow

**Files:** None (manual verification)

**Step 1: Start the dev server**

Run: `npm run dev`

**Step 2: Verify these routes work:**

1. `/dashboard/incident-reporting` — Shows the incident list (may be empty if no DB data)
2. `/dashboard/incident-reporting/new` — Shows the create form
3. Create an incident, verify it appears in the list
4. Click an incident row to view detail at `/dashboard/incident-reporting/[id]`
5. Use status transition buttons (Open → Investigating → Resolved → Closed)
6. Delete an incident, verify redirect back to list
7. Check dashboard widget shows recent incidents

**Step 3: Final commit if any adjustments were needed**

```bash
git add -A
git commit -m "feat(incident-reporting): complete module with CRUD, status transitions, and tests"
```

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

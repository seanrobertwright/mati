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

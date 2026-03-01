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

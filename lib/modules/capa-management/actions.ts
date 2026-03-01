'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/auth/server';
import {
  getCAPAs,
  getCAPAById,
  createCAPA,
  updateCAPA,
  deleteCAPA,
  transitionCAPAStatus,
} from '@/lib/db/repositories/capas';

export async function getCAPAList() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const capas = await getCAPAs(user);

    return { success: true, data: capas };
  } catch (error) {
    console.error('Get CAPA list error:', error);
    return { error: 'Failed to fetch CAPAs' };
  }
}

export async function getCAPA(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const capa = await getCAPAById(id);

    if (!capa) {
      return { error: 'CAPA not found' };
    }

    return { success: true, data: capa };
  } catch (error) {
    console.error('Get CAPA error:', error);
    return { error: 'Failed to fetch CAPA' };
  }
}

export async function createNewCAPA(data: {
  title: string;
  description: string;
  type: 'corrective' | 'preventive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  dueDate?: Date | null;
  category?: string | null;
  department?: string | null;
  affectedAreas?: string | null;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const capa = await createCAPA(data, user);

    revalidatePath('/dashboard/capa-management');

    return { success: true, data: capa };
  } catch (error) {
    console.error('Create CAPA error:', error);
    return { error: 'Failed to create CAPA' };
  }
}

export async function updateExistingCAPA(
  id: string,
  data: {
    title?: string;
    description?: string;
    type?: 'corrective' | 'preventive';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    severity?: 'minor' | 'moderate' | 'major' | 'critical';
    dueDate?: Date | null;
    category?: string | null;
    department?: string | null;
  }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const capa = await updateCAPA(id, data, user);

    revalidatePath('/dashboard/capa-management');
    revalidatePath(`/dashboard/capa-management/${id}`);

    return { success: true, data: capa };
  } catch (error) {
    console.error('Update CAPA error:', error);
    return { error: 'Failed to update CAPA' };
  }
}

export async function deleteExistingCAPA(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    await deleteCAPA(id, user);

    revalidatePath('/dashboard/capa-management');

    return { success: true };
  } catch (error) {
    console.error('Delete CAPA error:', error);
    return { error: 'Failed to delete CAPA' };
  }
}

export async function transitionCAPA(
  id: string,
  status: 'draft' | 'investigation' | 'action' | 'verification' | 'closed',
  step: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const capa = await transitionCAPAStatus(id, status, step, user);

    revalidatePath('/dashboard/capa-management');
    revalidatePath(`/dashboard/capa-management/${id}`);

    return { success: true, data: capa };
  } catch (error) {
    console.error('Transition CAPA error:', error);
    return { error: 'Failed to transition CAPA status' };
  }
}

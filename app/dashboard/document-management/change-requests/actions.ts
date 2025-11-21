import { createChangeRequest, getAllChangeRequests } from '@/lib/db/repositories/change-requests';
import { createClient } from '@/lib/auth/server';
import { ChangeRequest } from '@/lib/db/repositories/change-requests';
import { revalidatePath } from 'next/cache';

export async function fetchChangeRequests(): Promise<ChangeRequest[]> {
  return await getAllChangeRequests();
}

export async function submitChangeRequest(formData: Omit<Parameters<typeof createChangeRequest>[0], 'requestedBy'>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const result = await createChangeRequest(formData, user);
  revalidatePath('/dashboard/document-management/change-requests');
  return result;
}

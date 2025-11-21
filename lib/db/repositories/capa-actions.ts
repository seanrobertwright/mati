import { eq, desc } from 'drizzle-orm';
import { db } from '../client';
import { capaActions } from '../schema/capa';
import { CAPAAction, NewCAPAAction } from '../types';
import type { User } from '@supabase/supabase-js';

/**
 * CAPA Actions Repository
 */

/**
 * Get actions by CAPA ID
 */
export async function getActionsByCAPAId(capaId: string): Promise<CAPAAction[]> {
    try {
        return await db
            .select()
            .from(capaActions)
            .where(eq(capaActions.capaId, capaId))
            .orderBy(desc(capaActions.dueDate));
    } catch (error) {
        console.error(`Error fetching actions for CAPA ${capaId}:`, error);
        throw new Error('Failed to fetch actions');
    }
}

/**
 * Create an action
 */
export async function createAction(
    data: Omit<NewCAPAAction, 'id' | 'status' | 'completedAt'>,
    user: User
): Promise<CAPAAction> {
    try {
        const result = await db
            .insert(capaActions)
            .values({
                ...data,
                status: 'pending',
                assignedTo: data.assignedTo || user.id,
            })
            .returning();

        return result[0];
    } catch (error) {
        console.error('Error creating action:', error);
        throw new Error('Failed to create action');
    }
}

/**
 * Update an action
 */
export async function updateAction(
    id: string,
    data: Partial<Omit<NewCAPAAction, 'id' | 'capaId'>>
): Promise<CAPAAction> {
    try {
        const updateData = { ...data };

        if (data.status === 'completed' && !data.completedAt) {
            updateData.completedAt = new Date();
        }

        const result = await db
            .update(capaActions)
            .set(updateData)
            .where(eq(capaActions.id, id))
            .returning();

        return result[0];
    } catch (error) {
        console.error(`Error updating action ${id}:`, error);
        throw new Error('Failed to update action');
    }
}

/**
 * Delete an action
 */
export async function deleteAction(id: string): Promise<void> {
    try {
        await db.delete(capaActions).where(eq(capaActions.id, id));
    } catch (error) {
        console.error(`Error deleting action ${id}:`, error);
        throw new Error('Failed to delete action');
    }
}

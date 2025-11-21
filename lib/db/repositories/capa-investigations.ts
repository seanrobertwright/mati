import { eq } from 'drizzle-orm';
import { db } from '../client';
import { capaInvestigations, capaRootCauses } from '../schema/capa';
import { CAPAInvestigation, NewCAPAInvestigation, CAPARootCause, NewCAPARootCause } from '../types';
import { hasRole } from '@/lib/auth/permissions';
import type { User } from '@supabase/supabase-js';

/**
 * CAPA Investigation Repository
 */

/**
 * Get investigation by CAPA ID
 */
export async function getInvestigationByCAPAId(capaId: string): Promise<CAPAInvestigation | null> {
    try {
        const result = await db
            .select()
            .from(capaInvestigations)
            .where(eq(capaInvestigations.capaId, capaId))
            .limit(1);

        return result[0] || null;
    } catch (error) {
        console.error(`Error fetching investigation for CAPA ${capaId}:`, error);
        throw new Error('Failed to fetch investigation');
    }
}

/**
 * Create or update investigation
 */
export async function upsertInvestigation(
    data: Omit<NewCAPAInvestigation, 'id' | 'startDate' | 'status'>,
    user: User
): Promise<CAPAInvestigation> {
    try {
        // Check if investigation exists
        const existing = await getInvestigationByCAPAId(data.capaId);

        if (existing) {
            // Update
            const result = await db
                .update(capaInvestigations)
                .set({
                    ...data,
                    investigatorId: data.investigatorId || user.id,
                })
                .where(eq(capaInvestigations.id, existing.id))
                .returning();
            return result[0];
        } else {
            // Create
            const result = await db
                .insert(capaInvestigations)
                .values({
                    ...data,
                    investigatorId: data.investigatorId || user.id,
                    status: 'in_progress',
                })
                .returning();
            return result[0];
        }
    } catch (error) {
        console.error('Error upserting investigation:', error);
        throw new Error('Failed to save investigation');
    }
}

/**
 * Get root causes for an investigation
 */
export async function getRootCauses(investigationId: string): Promise<CAPARootCause[]> {
    try {
        return await db
            .select()
            .from(capaRootCauses)
            .where(eq(capaRootCauses.investigationId, investigationId));
    } catch (error) {
        console.error(`Error fetching root causes for investigation ${investigationId}:`, error);
        throw new Error('Failed to fetch root causes');
    }
}

/**
 * Add a root cause
 */
export async function addRootCause(
    data: Omit<NewCAPARootCause, 'id'>
): Promise<CAPARootCause> {
    try {
        const result = await db
            .insert(capaRootCauses)
            .values(data)
            .returning();

        return result[0];
    } catch (error) {
        console.error('Error adding root cause:', error);
        throw new Error('Failed to add root cause');
    }
}

/**
 * Delete a root cause
 */
export async function deleteRootCause(id: string): Promise<void> {
    try {
        await db.delete(capaRootCauses).where(eq(capaRootCauses.id, id));
    } catch (error) {
        console.error(`Error deleting root cause ${id}:`, error);
        throw new Error('Failed to delete root cause');
    }
}

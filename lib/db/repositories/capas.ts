import { eq, desc, and, or, ilike } from 'drizzle-orm';
import { db } from '../client';
import { capas } from '../schema/capa';
import { CAPA, NewCAPA } from '../types';
import { hasRole } from '@/lib/auth/permissions';
import type { User } from '@supabase/supabase-js';

/**
 * CAPA Repository
 * Provides CRUD operations for CAPA records
 */

/**
 * Get all CAPAs with role-based access control
 */
export async function getCAPAs(user: User | null): Promise<CAPA[]> {
    if (!user) return [];

    try {
        // Managers and admins see all CAPAs
        if (hasRole(user, 'manager')) {
            return await db
                .select()
                .from(capas)
                .orderBy(desc(capas.initiatedAt));
        }

        // Employees see CAPAs they initiated or are assigned to (TODO: add assignment check)
        return await db
            .select()
            .from(capas)
            .where(eq(capas.initiatedBy, user.id))
            .orderBy(desc(capas.initiatedAt));
    } catch (error) {
        console.error('Error fetching CAPAs:', error);
        throw new Error('Failed to fetch CAPAs');
    }
}

/**
 * Get a single CAPA by ID
 */
export async function getCAPAById(id: string): Promise<CAPA | null> {
    try {
        const result = await db
            .select()
            .from(capas)
            .where(eq(capas.id, id))
            .limit(1);

        return result[0] || null;
    } catch (error) {
        console.error(`Error fetching CAPA ${id}:`, error);
        throw new Error('Failed to fetch CAPA');
    }
}

/**
 * Create a new CAPA
 */
export async function createCAPA(
    data: Omit<NewCAPA, 'id' | 'initiatedAt' | 'status' | 'currentStep' | 'number'>,
    user: User
): Promise<CAPA> {
    try {
        // Generate a simple sequential-like number (in a real app, use a sequence or better logic)
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const number = `CAPA-${new Date().getFullYear()}-${timestamp}-${random}`;

        const capaData = {
            ...data,
            number,
            initiatedBy: user.id,
            status: 'draft' as const,
            currentStep: 'identification',
        };

        const result = await db
            .insert(capas)
            .values(capaData)
            .returning();

        return result[0];
    } catch (error) {
        console.error('Error creating CAPA:', error);
        throw new Error('Failed to create CAPA');
    }
}

/**
 * Update a CAPA
 */
export async function updateCAPA(
    id: string,
    data: Partial<Omit<NewCAPA, 'id' | 'number' | 'initiatedBy' | 'initiatedAt'>>,
    user: User
): Promise<CAPA> {
    try {
        const existing = await getCAPAById(id);
        if (!existing) throw new Error('CAPA not found');

        // Check permissions
        if (!hasRole(user, 'manager') && existing.initiatedBy !== user.id) {
            throw new Error('Unauthorized');
        }

        const result = await db
            .update(capas)
            .set(data)
            .where(eq(capas.id, id))
            .returning();

        return result[0];
    } catch (error) {
        console.error(`Error updating CAPA ${id}:`, error);
        throw new Error('Failed to update CAPA');
    }
}

/**
 * Delete a CAPA
 */
export async function deleteCAPA(id: string, user: User): Promise<void> {
    try {
        const existing = await getCAPAById(id);
        if (!existing) throw new Error('CAPA not found');

        // Only managers can delete CAPAs
        if (!hasRole(user, 'manager')) {
            throw new Error('Unauthorized: Only managers can delete CAPAs');
        }

        await db.delete(capas).where(eq(capas.id, id));
    } catch (error) {
        console.error(`Error deleting CAPA ${id}:`, error);
        throw new Error('Failed to delete CAPA');
    }
}

/**
 * Transition CAPA status
 */
export async function transitionCAPAStatus(
    id: string,
    status: CAPA['status'],
    step: string,
    user: User
): Promise<CAPA> {
    try {
        const existing = await getCAPAById(id);
        if (!existing) throw new Error('CAPA not found');

        // Only managers/admins can transition status (except maybe draft -> investigation)
        if (!hasRole(user, 'manager') && status === 'closed') {
            throw new Error('Unauthorized: Only managers can close CAPAs');
        }

        const updateData: Partial<CAPA> = {
            status,
            currentStep: step,
        };

        if (status === 'completed') {
            updateData.completedAt = new Date();
        } else if (status === 'closed') {
            updateData.closedAt = new Date();
        }

        const result = await db
            .update(capas)
            .set(updateData)
            .where(eq(capas.id, id))
            .returning();

        return result[0];
    } catch (error) {
        console.error(`Error transitioning CAPA ${id}:`, error);
        throw new Error('Failed to transition CAPA status');
    }
}

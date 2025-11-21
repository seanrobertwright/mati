import { eq, desc } from 'drizzle-orm';
import { db } from '../client';
import { capaVerifications } from '../schema/capa';
import { CAPAVerification, NewCAPAVerification } from '../types';
import type { User } from '@supabase/supabase-js';

/**
 * CAPA Verifications Repository
 */

/**
 * Get verifications by CAPA ID
 */
export async function getVerificationsByCAPAId(capaId: string): Promise<CAPAVerification[]> {
    try {
        return await db
            .select()
            .from(capaVerifications)
            .where(eq(capaVerifications.capaId, capaId))
            .orderBy(desc(capaVerifications.verificationDate));
    } catch (error) {
        console.error(`Error fetching verifications for CAPA ${capaId}:`, error);
        throw new Error('Failed to fetch verifications');
    }
}

/**
 * Create a verification
 */
export async function createVerification(
    data: Omit<NewCAPAVerification, 'id' | 'verificationDate'>,
    user: User
): Promise<CAPAVerification> {
    try {
        const result = await db
            .insert(capaVerifications)
            .values({
                ...data,
                verifiedBy: user.id,
                verificationDate: new Date(),
            })
            .returning();

        return result[0];
    } catch (error) {
        console.error('Error creating verification:', error);
        throw new Error('Failed to create verification');
    }
}

/**
 * Update a verification
 */
export async function updateVerification(
    id: string,
    data: Partial<Omit<NewCAPAVerification, 'id' | 'capaId'>>
): Promise<CAPAVerification> {
    try {
        const result = await db
            .update(capaVerifications)
            .set(data)
            .where(eq(capaVerifications.id, id))
            .returning();

        return result[0];
    } catch (error) {
        console.error(`Error updating verification ${id}:`, error);
        throw new Error('Failed to update verification');
    }
}

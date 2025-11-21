import { eq, desc } from 'drizzle-orm';
import { db } from '../client';
import { capaEffectivenessReviews } from '../schema/capa';
import { CAPAEffectivenessReview, NewCAPAEffectivenessReview } from '../types';
import type { User } from '@supabase/supabase-js';

/**
 * CAPA Effectiveness Reviews Repository
 */

/**
 * Get effectiveness reviews by CAPA ID
 */
export async function getEffectivenessReviewsByCAPAId(capaId: string): Promise<CAPAEffectivenessReview[]> {
    try {
        return await db
            .select()
            .from(capaEffectivenessReviews)
            .where(eq(capaEffectivenessReviews.capaId, capaId))
            .orderBy(desc(capaEffectivenessReviews.reviewDate));
    } catch (error) {
        console.error(`Error fetching effectiveness reviews for CAPA ${capaId}:`, error);
        throw new Error('Failed to fetch effectiveness reviews');
    }
}

/**
 * Create an effectiveness review
 */
export async function createEffectivenessReview(
    data: Omit<NewCAPAEffectivenessReview, 'id' | 'reviewDate'>,
    user: User
): Promise<CAPAEffectivenessReview> {
    try {
        const result = await db
            .insert(capaEffectivenessReviews)
            .values({
                ...data,
                reviewerId: user.id,
                reviewDate: new Date(),
            })
            .returning();

        return result[0];
    } catch (error) {
        console.error('Error creating effectiveness review:', error);
        throw new Error('Failed to create effectiveness review');
    }
}

/**
 * Update an effectiveness review
 */
export async function updateEffectivenessReview(
    id: string,
    data: Partial<Omit<NewCAPAEffectivenessReview, 'id' | 'capaId'>>
): Promise<CAPAEffectivenessReview> {
    try {
        const result = await db
            .update(capaEffectivenessReviews)
            .set(data)
            .where(eq(capaEffectivenessReviews.id, id))
            .returning();

        return result[0];
    } catch (error) {
        console.error(`Error updating effectiveness review ${id}:`, error);
        throw new Error('Failed to update effectiveness review');
    }
}

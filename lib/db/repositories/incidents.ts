import { eq, desc } from 'drizzle-orm';
import { db } from '../client';
import { incidents } from '../schema/incidents';
import { Incident, NewIncident } from '../types';

/**
 * Incident Repository
 * Provides CRUD operations for incident reports with proper error handling
 */

/**
 * Get all incidents, ordered by most recent first
 */
export async function getIncidents(): Promise<Incident[]> {
  try {
    return await db
      .select()
      .from(incidents)
      .orderBy(desc(incidents.reportedAt));
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw new Error('Failed to fetch incidents. Please try again later.');
  }
}

/**
 * Get a single incident by ID
 * Returns null if not found
 */
export async function getIncidentById(id: string): Promise<Incident | null> {
  try {
    const result = await db
      .select()
      .from(incidents)
      .where(eq(incidents.id, id))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error(`Error fetching incident ${id}:`, error);
    throw new Error('Failed to fetch incident. Please try again later.');
  }
}

/**
 * Create a new incident
 */
export async function createIncident(
  data: Omit<NewIncident, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Incident> {
  try {
    // Validate required fields
    if (!data.title?.trim()) {
      throw new Error('Incident title is required');
    }
    if (!data.description?.trim()) {
      throw new Error('Incident description is required');
    }
    if (!data.reportedBy?.trim()) {
      throw new Error('Reporter name is required');
    }

    const result = await db
      .insert(incidents)
      .values(data)
      .returning();
    
    return result[0];
  } catch (error) {
    if (error instanceof Error && error.message.includes('required')) {
      throw error; // Re-throw validation errors
    }
    console.error('Error creating incident:', error);
    throw new Error('Failed to create incident. Please try again later.');
  }
}

/**
 * Update an existing incident
 */
export async function updateIncident(
  id: string,
  data: Partial<Omit<NewIncident, 'id' | 'createdAt'>>
): Promise<Incident> {
  try {
    const result = await db
      .update(incidents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(incidents.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error('Incident not found');
    }
    
    return result[0];
  } catch (error) {
    if (error instanceof Error && error.message === 'Incident not found') {
      throw error;
    }
    console.error(`Error updating incident ${id}:`, error);
    throw new Error('Failed to update incident. Please try again later.');
  }
}

/**
 * Delete an incident by ID
 */
export async function deleteIncident(id: string): Promise<void> {
  try {
    const result = await db
      .delete(incidents)
      .where(eq(incidents.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error('Incident not found');
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Incident not found') {
      throw error;
    }
    console.error(`Error deleting incident ${id}:`, error);
    throw new Error('Failed to delete incident. Please try again later.');
  }
}

/**
 * Execute a function within a database transaction
 * Note: Transaction type is simplified for now.
 * For complex multi-table transactions, use db.transaction directly.
 */
export async function withTransaction<T>(
  callback: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>
): Promise<T> {
  try {
    return await db.transaction(callback);
  } catch (error) {
    console.error('Transaction error:', error);
    throw new Error('Database transaction failed. Please try again later.');
  }
}


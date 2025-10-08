import { eq, desc } from 'drizzle-orm';
import { db } from '../client';
import { incidents } from '../schema/incidents';
import { Incident, NewIncident } from '../types';
import { hasRole, type UserRole } from '@/lib/auth/permissions';
import type { User } from '@supabase/supabase-js';

/**
 * Incident Repository
 * Provides CRUD operations for incident reports with proper error handling
 */

/**
 * Get all incidents, ordered by most recent first
 * @deprecated Use getIncidentsForUser instead to respect role-based access control
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
 * Get incidents filtered by user role
 * - Employees see only their own incidents
 * - Managers and Admins see all incidents
 */
export async function getIncidentsForUser(user: User | null): Promise<Incident[]> {
  if (!user) {
    return [];
  }

  try {
    // Managers and admins see all incidents
    if (hasRole(user, 'manager')) {
      return await db
        .select()
        .from(incidents)
        .orderBy(desc(incidents.reportedAt));
    }

    // Employees see only their own incidents
    return await db
      .select()
      .from(incidents)
      .where(eq(incidents.userId, user.id))
      .orderBy(desc(incidents.reportedAt));
  } catch (error) {
    console.error('Error fetching incidents for user:', error);
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
 * Create a new incident with user ownership
 */
export async function createIncident(
  data: Omit<NewIncident, 'id' | 'createdAt' | 'updatedAt'>,
  user: User
): Promise<Incident> {
  try {
    // Validate required fields
    if (!data.title?.trim()) {
      throw new Error('Incident title is required');
    }
    if (!data.description?.trim()) {
      throw new Error('Incident description is required');
    }

    // Set user information
    const incidentData = {
      ...data,
      userId: user.id,
      reportedBy: data.reportedBy || user.email || 'Unknown',
    };

    const result = await db
      .insert(incidents)
      .values(incidentData)
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
 * Update an existing incident with permission checks
 */
export async function updateIncident(
  id: string,
  data: Partial<Omit<NewIncident, 'id' | 'createdAt' | 'userId'>>,
  user: User
): Promise<Incident> {
  try {
    // Get the incident to check ownership
    const existingIncident = await getIncidentById(id);
    if (!existingIncident) {
      throw new Error('Incident not found');
    }

    // Check permissions: managers can edit any, employees can only edit their own
    if (!hasRole(user, 'manager') && existingIncident.userId !== user.id) {
      throw new Error('You do not have permission to edit this incident');
    }

    const result = await db
      .update(incidents)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(incidents.id, id))
      .returning();
    
    return result[0];
  } catch (error) {
    if (error instanceof Error && (error.message === 'Incident not found' || error.message.includes('permission'))) {
      throw error;
    }
    console.error(`Error updating incident ${id}:`, error);
    throw new Error('Failed to update incident. Please try again later.');
  }
}

/**
 * Delete an incident by ID with permission checks
 */
export async function deleteIncident(id: string, user: User): Promise<void> {
  try {
    // Get the incident to check ownership
    const existingIncident = await getIncidentById(id);
    if (!existingIncident) {
      throw new Error('Incident not found');
    }

    // Check permissions: managers can delete any, employees can only delete their own
    if (!hasRole(user, 'manager') && existingIncident.userId !== user.id) {
      throw new Error('You do not have permission to delete this incident');
    }

    const result = await db
      .delete(incidents)
      .where(eq(incidents.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error('Incident not found');
    }
  } catch (error) {
    if (error instanceof Error && (error.message === 'Incident not found' || error.message.includes('permission'))) {
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


'use server';

import { createClient } from '@/lib/auth/server';
import { createAdminClient, type AdminUserData, type UserRole } from '@/lib/auth/admin';
import { isAdmin } from '@/lib/auth/permissions';
import { revalidatePath } from 'next/cache';

/**
 * Fetch all users from Supabase Auth
 * Requires admin privileges
 */
export async function getAllUsers(): Promise<{ users: AdminUserData[]; error: string | null }> {
  try {
    // Verify current user is admin
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser || !isAdmin(currentUser)) {
      return {
        users: [],
        error: 'Unauthorized: Admin access required',
      };
    }

    // Use admin client to fetch all users
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return {
        users: [],
        error: `Failed to fetch users: ${error.message}`,
      };
    }

    // Transform user data
    const users: AdminUserData[] = data.users.map((user) => ({
      id: user.id,
      email: user.email || 'No email',
      role: (user.app_metadata?.role as UserRole) || 'employee',
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at || null,
      emailConfirmed: !!user.email_confirmed_at,
    }));

    return {
      users,
      error: null,
    };
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return {
      users: [],
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Update a user's role
 * Requires admin privileges
 * Prevents admins from changing their own role
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Verify current user is admin
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser || !isAdmin(currentUser)) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      };
    }

    // Prevent admin from changing their own role
    if (currentUser.id === userId) {
      return {
        success: false,
        error: 'Cannot change your own role',
      };
    }

    // Validate role
    const validRoles: UserRole[] = ['admin', 'manager', 'employee', 'viewer'];
    if (!validRoles.includes(newRole)) {
      return {
        success: false,
        error: 'Invalid role',
      };
    }

    // Update user role in Supabase Auth metadata
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      app_metadata: { role: newRole },
    });

    if (error) {
      console.error('Error updating user role:', error);
      return {
        success: false,
        error: `Failed to update role: ${error.message}`,
      };
    }

    // Revalidate the users page
    revalidatePath('/dashboard/admin/users');

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Delete a user
 * Requires admin privileges
 * Prevents admins from deleting themselves
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    // Verify current user is admin
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser || !isAdmin(currentUser)) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      };
    }

    // Prevent admin from deleting themselves
    if (currentUser.id === userId) {
      return {
        success: false,
        error: 'Cannot delete your own account',
      };
    }

    // Delete user from Supabase Auth
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: `Failed to delete user: ${error.message}`,
      };
    }

    // Revalidate the users page
    revalidatePath('/dashboard/admin/users');

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

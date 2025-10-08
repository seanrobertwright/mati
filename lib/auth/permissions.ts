import type { User } from '@supabase/supabase-js';

/**
 * User roles in the system, ordered from lowest to highest permission level
 */
export type UserRole = 'viewer' | 'employee' | 'manager' | 'admin';

/**
 * Role hierarchy - higher number = more permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 0,
  employee: 1,
  manager: 2,
  admin: 3,
};

/**
 * Get the user's role from their auth metadata
 * Defaults to 'employee' if no role is set
 */
export function getUserRole(user: User | null): UserRole {
  if (!user) return 'viewer';
  
  const role = user.app_metadata?.role as UserRole | undefined;
  return role || 'employee';
}

/**
 * Check if a user has at least the specified role level
 * 
 * @example
 * hasRole(user, 'manager') // true if user is manager or admin
 * hasRole(user, 'admin') // true only if user is admin
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  const userRole = getUserRole(user);
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if a user can access a module with the given minimum role requirement
 * 
 * @param user - The authenticated user
 * @param minRole - The minimum role required (undefined means any authenticated user)
 * @returns true if user can access, false otherwise
 */
export function canAccessModule(user: User | null, minRole?: UserRole): boolean {
  if (!user) return false; // Unauthenticated users can't access any modules
  if (!minRole) return true; // No role requirement = all authenticated users can access
  
  return hasRole(user, minRole);
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return ['viewer', 'employee', 'manager', 'admin'];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    viewer: 'Viewer',
    employee: 'Employee',
    manager: 'Safety Manager',
    admin: 'Administrator',
  };
  return names[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    viewer: 'Read-only access to safety records and reports',
    employee: 'Create and view own safety incidents',
    manager: 'Full access to safety records, can manage all incidents',
    admin: 'Full system access including user management',
  };
  return descriptions[role];
}

/**
 * Check if user can edit a resource owned by another user
 * 
 * @param user - The current user
 * @param resourceOwnerId - The user ID who owns the resource
 * @returns true if user can edit, false otherwise
 */
export function canEditResource(user: User | null, resourceOwnerId: string): boolean {
  if (!user) return false;
  
  // Admins and managers can edit any resource
  if (hasRole(user, 'manager')) return true;
  
  // Employees can only edit their own resources
  return user.id === resourceOwnerId;
}

/**
 * Check if user can delete a resource owned by another user
 * 
 * @param user - The current user
 * @param resourceOwnerId - The user ID who owns the resource
 * @returns true if user can delete, false otherwise
 */
export function canDeleteResource(user: User | null, resourceOwnerId: string): boolean {
  // Same rules as editing for now
  return canEditResource(user, resourceOwnerId);
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user can manage other users (assign roles, etc.)
 */
export function canManageUsers(user: User | null): boolean {
  return isAdmin(user);
}


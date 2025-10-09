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

// ============================================================================
// Document-Specific Permissions
// ============================================================================

/**
 * Document permission roles
 */
export type DocumentRole = 'owner' | 'approver' | 'reviewer' | 'viewer';

/**
 * Document permission hierarchy - higher number = more permissions
 */
const DOC_ROLE_HIERARCHY: Record<DocumentRole, number> = {
  viewer: 0,
  reviewer: 1,
  approver: 2,
  owner: 3,
};

/**
 * Check if user has admin privileges (can bypass document permissions)
 */
export function canBypassDocumentPermissions(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if a document role has at least the required permission level
 */
export function hasDocumentRole(
  userRole: DocumentRole | null,
  requiredRole: DocumentRole
): boolean {
  if (!userRole) return false;
  return DOC_ROLE_HIERARCHY[userRole] >= DOC_ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can view a document
 * Requires: viewer role or higher, OR system admin
 * 
 * @param user - The current user
 * @param documentPermission - User's permission on the document (if any)
 * @param documentOwnerId - ID of the document owner
 * @returns true if user can view
 */
export function canViewDocument(
  user: User | null,
  documentPermission: DocumentRole | null,
  documentOwnerId?: string
): boolean {
  if (!user) return false;
  
  // Admins can view all documents
  if (canBypassDocumentPermissions(user)) return true;
  
  // Document owner can always view
  if (documentOwnerId && user.id === documentOwnerId) return true;
  
  // Check document-specific permission
  return hasDocumentRole(documentPermission, 'viewer');
}

/**
 * Check if user can edit a document (metadata, not versions)
 * Requires: owner role OR system admin
 * 
 * @param user - The current user
 * @param documentPermission - User's permission on the document (if any)
 * @param documentOwnerId - ID of the document owner
 * @returns true if user can edit
 */
export function canEditDocument(
  user: User | null,
  documentPermission: DocumentRole | null,
  documentOwnerId: string
): boolean {
  if (!user) return false;
  
  // Admins can edit all documents
  if (canBypassDocumentPermissions(user)) return true;
  
  // Document owner can edit
  if (user.id === documentOwnerId) return true;
  
  // Owner role permission can edit
  return documentPermission === 'owner';
}

/**
 * Check if user can upload new versions of a document
 * Requires: owner role OR system admin
 * 
 * @param user - The current user
 * @param documentPermission - User's permission on the document (if any)
 * @param documentOwnerId - ID of the document owner
 * @returns true if user can upload versions
 */
export function canUploadDocumentVersion(
  user: User | null,
  documentPermission: DocumentRole | null,
  documentOwnerId: string
): boolean {
  // Same as edit permissions
  return canEditDocument(user, documentPermission, documentOwnerId);
}

/**
 * Check if user can review a document (during review stage)
 * Requires: reviewer role or higher OR system admin
 * 
 * @param user - The current user
 * @param documentPermission - User's permission on the document (if any)
 * @param documentStatus - Current document status
 * @returns true if user can review
 */
export function canReviewDocument(
  user: User | null,
  documentPermission: DocumentRole | null,
  documentStatus: string
): boolean {
  if (!user) return false;
  
  // Admins can review all documents
  if (canBypassDocumentPermissions(user)) return true;
  
  // Must be in pending_review status
  if (documentStatus !== 'pending_review') return false;
  
  // Reviewer role or higher can review
  return hasDocumentRole(documentPermission, 'reviewer');
}

/**
 * Check if user can approve a document (during approval stage)
 * Requires: approver role or higher OR system admin
 * 
 * @param user - The current user
 * @param documentPermission - User's permission on the document (if any)
 * @param documentStatus - Current document status
 * @param documentOwnerId - ID of the document owner
 * @returns true if user can approve
 */
export function canApproveDocument(
  user: User | null,
  documentPermission: DocumentRole | null,
  documentStatus: string,
  documentOwnerId: string
): boolean {
  if (!user) return false;
  
  // Admins can approve all documents
  if (canBypassDocumentPermissions(user)) return true;
  
  // Must be in pending_approval status
  if (documentStatus !== 'pending_approval') return false;
  
  // Cannot approve own document
  if (user.id === documentOwnerId) return false;
  
  // Approver role or higher can approve
  return hasDocumentRole(documentPermission, 'approver');
}

/**
 * Check if user can delete a document
 * Requires: owner role OR system admin
 * 
 * @param user - The current user
 * @param documentPermission - User's permission on the document (if any)
 * @param documentOwnerId - ID of the document owner
 * @returns true if user can delete
 */
export function canDeleteDocument(
  user: User | null,
  documentPermission: DocumentRole | null,
  documentOwnerId: string
): boolean {
  if (!user) return false;
  
  // Admins can delete all documents
  if (canBypassDocumentPermissions(user)) return true;
  
  // Document owner can delete
  if (user.id === documentOwnerId) return true;
  
  // Owner permission can delete
  return documentPermission === 'owner';
}

/**
 * Check if user can manage document permissions
 * Requires: owner role OR system admin
 * 
 * @param user - The current user
 * @param documentPermission - User's permission on the document (if any)
 * @param documentOwnerId - ID of the document owner
 * @returns true if user can manage permissions
 */
export function canManageDocumentPermissions(
  user: User | null,
  documentPermission: DocumentRole | null,
  documentOwnerId: string
): boolean {
  // Same as edit permissions
  return canEditDocument(user, documentPermission, documentOwnerId);
}

/**
 * Check if user can download a document
 * Requires: viewer role or higher OR system admin
 * 
 * @param user - The current user
 * @param documentPermission - User's permission on the document (if any)
 * @param documentOwnerId - ID of the document owner
 * @returns true if user can download
 */
export function canDownloadDocument(
  user: User | null,
  documentPermission: DocumentRole | null,
  documentOwnerId?: string
): boolean {
  // Same as view permissions
  return canViewDocument(user, documentPermission, documentOwnerId);
}

/**
 * Get document role display name
 */
export function getDocumentRoleDisplayName(role: DocumentRole): string {
  const names: Record<DocumentRole, string> = {
    owner: 'Owner',
    approver: 'Approver',
    reviewer: 'Reviewer',
    viewer: 'Viewer',
  };
  return names[role];
}

/**
 * Get document role description
 */
export function getDocumentRoleDescription(role: DocumentRole): string {
  const descriptions: Record<DocumentRole, string> = {
    owner: 'Full control: can edit, upload versions, assign permissions, and delete',
    approver: 'Can approve documents during approval stage and provide approval notes',
    reviewer: 'Can review documents during review stage and request changes',
    viewer: 'Read-only access to view and download approved documents',
  };
  return descriptions[role];
}

/**
 * Get all document roles
 */
export function getAllDocumentRoles(): DocumentRole[] {
  return ['viewer', 'reviewer', 'approver', 'owner'];
}

// ============================================================================
// Permission Resolution with Caching and Inheritance
// ============================================================================

import {
  getCachedDocumentPermission,
  setCachedDocumentPermission,
  getCachedDirectoryPermission,
  setCachedDirectoryPermission,
} from './permission-cache';

/**
 * Resolve document permission with caching and directory inheritance
 * This is the main function to use for checking document permissions
 * 
 * @param documentId - The document ID
 * @param directoryId - The directory ID (for inheritance)
 * @param userId - The user ID
 * @param getDocPermission - Function to fetch document permission from database
 * @param getDirPermission - Function to fetch inherited directory permission from database
 * @returns The resolved permission role or null
 */
export async function resolveDocumentPermission(
  documentId: string,
  directoryId: string | null,
  userId: string,
  getDocPermission: () => Promise<DocumentRole | null>,
  getDirPermission: () => Promise<DocumentRole | null>
): Promise<DocumentRole | null> {
  // Check cache first
  const cachedDocPermission = getCachedDocumentPermission(documentId, userId);
  if (cachedDocPermission !== undefined) {
    return cachedDocPermission;
  }

  // Fetch document-level permission
  const docPermission = await getDocPermission();
  
  // If document has explicit permission, use it
  if (docPermission) {
    setCachedDocumentPermission(documentId, userId, docPermission);
    return docPermission;
  }

  // Check directory inheritance if no document permission
  if (directoryId) {
    const cachedDirPermission = getCachedDirectoryPermission(directoryId, userId);
    if (cachedDirPermission !== undefined) {
      // Cache the inherited permission on the document too
      setCachedDocumentPermission(documentId, userId, cachedDirPermission);
      return cachedDirPermission;
    }

    const dirPermission = await getDirPermission();
    if (dirPermission) {
      setCachedDirectoryPermission(directoryId, userId, dirPermission);
      setCachedDocumentPermission(documentId, userId, dirPermission);
      return dirPermission;
    }
  }

  // No permission found
  setCachedDocumentPermission(documentId, userId, null);
  return null;
}

/**
 * Resolve directory permission with caching
 * 
 * @param directoryId - The directory ID
 * @param userId - The user ID
 * @param getDirPermission - Function to fetch directory permission (with inheritance) from database
 * @returns The resolved permission role or null
 */
export async function resolveDirectoryPermission(
  directoryId: string,
  userId: string,
  getDirPermission: () => Promise<DocumentRole | null>
): Promise<DocumentRole | null> {
  // Check cache first
  const cached = getCachedDirectoryPermission(directoryId, userId);
  if (cached !== undefined) {
    return cached;
  }

  // Fetch from database (should include parent directory inheritance)
  const permission = await getDirPermission();
  
  // Cache the result
  setCachedDirectoryPermission(directoryId, userId, permission);
  
  return permission;
}

/**
 * Compare two document roles and return the higher one
 */
export function getHigherDocumentRole(
  role1: DocumentRole | null,
  role2: DocumentRole | null
): DocumentRole | null {
  if (!role1) return role2;
  if (!role2) return role1;
  
  return DOC_ROLE_HIERARCHY[role1] >= DOC_ROLE_HIERARCHY[role2] ? role1 : role2;
}


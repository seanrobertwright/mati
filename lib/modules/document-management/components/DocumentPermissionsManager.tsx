'use client';

import { useState } from 'react';
import { UserPlus, X, Shield, Eye, CheckCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type DocumentPermissionRole = 'owner' | 'approver' | 'reviewer' | 'viewer';

export interface DocumentPermission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: DocumentPermissionRole;
  grantedBy: string;
  grantedByName?: string;
  grantedAt: Date | string;
}

interface DocumentPermissionsManagerProps {
  documentId: string;
  permissions: DocumentPermission[];
  currentUserId: string;
  canManagePermissions: boolean;
  onAddPermission?: (userId: string, role: DocumentPermissionRole) => void | Promise<void>;
  onRemovePermission?: (permissionId: string) => void | Promise<void>;
  onUpdatePermission?: (permissionId: string, role: DocumentPermissionRole) => void | Promise<void>;
  className?: string;
}

const roleConfig: Record<
  DocumentPermissionRole,
  {
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }
> = {
  owner: {
    label: 'Owner',
    description: 'Full control: edit, delete, manage permissions',
    icon: <Shield className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  approver: {
    label: 'Approver',
    description: 'Can approve or reject documents',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  reviewer: {
    label: 'Reviewer',
    description: 'Can review and request changes',
    icon: <Edit className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access',
    icon: <Eye className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 border-gray-300',
  },
};

/**
 * DocumentPermissionsManager
 * 
 * Manages document-specific permissions for users.
 * Allows adding/removing users and assigning roles (owner, approver, reviewer, viewer).
 * 
 * @example
 * ```tsx
 * <DocumentPermissionsManager
 *   documentId="doc-123"
 *   permissions={permissions}
 *   currentUserId={currentUser.id}
 *   canManagePermissions={true}
 *   onAddPermission={handleAdd}
 *   onRemovePermission={handleRemove}
 * />
 * ```
 */
export const DocumentPermissionsManager: React.FC<DocumentPermissionsManagerProps> = ({
  documentId,
  permissions,
  currentUserId,
  canManagePermissions,
  onAddPermission,
  onRemovePermission,
  onUpdatePermission,
  className,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addUserEmail, setAddUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<DocumentPermissionRole>('viewer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAddPermission = async () => {
    if (!addUserEmail.trim() || !onAddPermission) return;

    try {
      setIsSubmitting(true);
      // In a real implementation, we'd look up the user by email first
      // For now, we'll pass the email as userId (the API would handle the lookup)
      await onAddPermission(addUserEmail, selectedRole);
      setShowAddDialog(false);
      setAddUserEmail('');
      setSelectedRole('viewer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePermission = async (permissionId: string) => {
    if (!onRemovePermission) return;

    try {
      setRemovingId(permissionId);
      await onRemovePermission(permissionId);
    } finally {
      setRemovingId(null);
    }
  };

  const handleUpdateRole = async (permissionId: string, newRole: DocumentPermissionRole) => {
    if (!onUpdatePermission) return;

    try {
      await onUpdatePermission(permissionId, newRole);
    } catch (error) {
      console.error('Failed to update permission:', error);
    }
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Document Permissions</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Manage who can access this document
          </p>
        </div>
        {canManagePermissions && onAddPermission && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Permissions List */}
      <div className="space-y-2">
        {permissions.map((permission) => {
          const config = roleConfig[permission.role];
          const isCurrentUser = permission.userId === currentUserId;

          return (
            <div
              key={permission.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border bg-card',
                isCurrentUser && 'border-primary/50 bg-primary/5'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn('p-2 rounded-md', config.color)}>
                  {config.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {permission.userName}
                      {isCurrentUser && (
                        <span className="text-muted-foreground ml-1">(You)</span>
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {permission.userEmail}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Granted {formatDate(permission.grantedAt)}
                    {permission.grantedByName &&
                      ` by ${permission.grantedByName}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Role Badge/Selector */}
                {canManagePermissions && onUpdatePermission && !isCurrentUser ? (
                  <select
                    value={permission.role}
                    onChange={(e) =>
                      handleUpdateRole(
                        permission.id,
                        e.target.value as DocumentPermissionRole
                      )
                    }
                    className="text-xs border rounded px-2 py-1 bg-background"
                    aria-label={`Change role for ${permission.userName}`}
                  >
                    {Object.entries(roleConfig).map(([role, config]) => (
                      <option key={role} value={role}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge variant="outline" className={cn('text-xs', config.color)}>
                    {config.label}
                  </Badge>
                )}

                {/* Remove Button */}
                {canManagePermissions &&
                  onRemovePermission &&
                  !isCurrentUser &&
                  permission.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemovePermission(permission.id)}
                      disabled={removingId === permission.id}
                      aria-label={`Remove ${permission.userName}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            </div>
          );
        })}

        {permissions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
            <p className="text-sm">No permissions set</p>
          </div>
        )}
      </div>

      {/* Role Legend */}
      <div className="border-t pt-4">
        <h4 className="text-xs font-medium mb-2">Role Descriptions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(roleConfig).map(([role, config]) => (
            <div key={role} className="flex items-start gap-2">
              <div className={cn('p-1.5 rounded', config.color)}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{config.label}</p>
                <p className="text-xs text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Permission Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User Permission</DialogTitle>
            <DialogDescription>
              Grant a user access to this document
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail">User Email</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="user@example.com"
                value={addUserEmail}
                onChange={(e) => setAddUserEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) =>
                  setSelectedRole(e.target.value as DocumentPermissionRole)
                }
                disabled={isSubmitting}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Object.entries(roleConfig).map(([role, config]) => (
                  <option key={role} value={role}>
                    {config.label} - {config.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPermission}
              disabled={!addUserEmail.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Permission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


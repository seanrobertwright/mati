'use client';

import { useState } from 'react';
import { updateUserRole, deleteUser } from './actions';
import type { AdminUserData, UserRole } from '@/lib/auth/admin';
import { getRoleDisplayName, getRoleDescription, getAllRoles } from '@/lib/auth/permissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserListTableProps {
  users: AdminUserData[];
  currentUserId: string;
}

export function UserListTable({ users, currentUserId }: UserListTableProps) {
  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setIsLoading(true);
    const result = await updateUserRole(userId, newRole);
    setIsLoading(false);

    if (result.success) {
      alert('User role updated successfully');
      setIsRoleDialogOpen(false);
      // Reload the page to show updated data
      window.location.reload();
    } else {
      alert(result.error || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsLoading(true);
    const result = await deleteUser(userId);
    setIsLoading(false);

    if (result.success) {
      alert('User deleted successfully');
      setIsDeleteDialogOpen(false);
      // Reload the page to show updated data
      window.location.reload();
    } else {
      alert(result.error || 'Failed to delete user');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'manager':
        return 'secondary';
      case 'employee':
        return 'outline';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isCurrentUser = user.id === currentUserId;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.email}
                      {isCurrentUser && (
                        <Badge variant="outline" className="ml-2">
                          You
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.emailConfirmed ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(user.lastSignInAt)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isCurrentUser || isLoading}
                        onClick={() => {
                          setSelectedUser(user);
                          setIsRoleDialogOpen(true);
                        }}
                      >
                        Change Role
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isCurrentUser || isLoading}
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Current role: <Badge variant={getRoleBadgeVariant(selectedUser?.role || 'employee')}>
                {getRoleDisplayName(selectedUser?.role || 'employee')}
              </Badge>
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select new role:</label>
              <div className="grid gap-2">
                {getAllRoles().map((role) => (
                  <button
                    key={role}
                    className="flex items-start gap-3 rounded-lg border p-3 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => selectedUser && handleRoleChange(selectedUser.id, role)}
                    disabled={isLoading || selectedUser?.role === role}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getRoleBadgeVariant(role)}>
                          {getRoleDisplayName(role)}
                        </Badge>
                        {selectedUser?.role === role && (
                          <span className="text-xs text-gray-500">(current)</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{getRoleDescription(role)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

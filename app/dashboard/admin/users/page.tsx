import { createClient } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { isAdmin, getAllRoles, getRoleDisplayName, getRoleDescription } from '@/lib/auth/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllUsers } from './actions';
import { UserListTable } from './UserListTable';

export const metadata = {
  title: 'User Management - Safety Management',
  description: 'Manage users and their roles',
};

export default async function UserManagementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Debug: Log user info
  console.log('🔍 Admin page check:', {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
    appMetadata: user?.app_metadata,
    role: user?.app_metadata?.role,
    isAdmin: user ? isAdmin(user) : false,
  });

  // Redirect if not admin
  if (!user || !isAdmin(user)) {
    console.log('❌ Access denied - redirecting to dashboard');
    redirect('/dashboard');
  }

  // Fetch all users
  const { users, error } = await getAllUsers();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-2 text-gray-600">
          Manage user accounts and assign roles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>
            View and manage all registered users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </p>
              <p className="text-xs text-red-700 mt-2">
                Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file.
                You can find this key in your Supabase project settings under API.
              </p>
            </div>
          ) : (
            <UserListTable users={users} currentUserId={user.id} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Definitions</CardTitle>
          <CardDescription>
            Available roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {getAllRoles().map((role) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {getRoleDisplayName(role)}
                    <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                      {role}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {getRoleDescription(role)}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


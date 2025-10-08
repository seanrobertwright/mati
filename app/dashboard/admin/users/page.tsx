import { createClient } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { isAdmin, getAllRoles, getRoleDisplayName, getRoleDescription } from '@/lib/auth/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'User Management - Safety Management',
  description: 'Manage users and their roles',
};

export default async function UserManagementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect if not admin
  if (!user || !isAdmin(user)) {
    redirect('/dashboard');
  }

  // Fetch all users (Note: This requires admin API access in Supabase)
  // For now, we'll show a placeholder. In production, you'd need to:
  // 1. Set up a server action/API route that uses Supabase Admin SDK
  // 2. Or enable the auth.users table RLS for admins
  
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
          <CardTitle>Users</CardTitle>
          <CardDescription>
            View and manage all registered users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Setup Required:</strong> User list requires Supabase Admin SDK configuration.
              For now, you can manage user roles directly in the Supabase Dashboard under Authentication → Users.
            </p>
            <p className="text-xs text-yellow-700 mt-2">
              To enable full user management:
              <br />1. Set up a server action with Supabase Admin SDK
              <br />2. Or configure RLS policies to allow admins to query auth.users
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Available Roles</h3>
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
          </div>

          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-medium">Quick Links</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>
                Manage users in{' '}
                <a
                  href="https://app.supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Supabase Dashboard
                </a>
              </li>
              <li>To assign roles: Go to Authentication → Users → Select user → User Metadata → Set `role` in app_metadata</li>
              <li>First admin can be set via `INITIAL_ADMIN_EMAIL` environment variable</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


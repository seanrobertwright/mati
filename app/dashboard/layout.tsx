import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SiteHeader } from '@/components/dashboard/site-header';
import { initializeModules } from '@/lib/safety-framework';
import { createClient } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  // Initialize modules on server
  await initializeModules();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <SiteHeader user={user} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

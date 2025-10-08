import { SidebarTrigger } from "@/components/ui/sidebar"
import UserMenu from "@/components/auth/UserMenu"
import type { User } from '@supabase/supabase-js';

interface SiteHeaderProps {
  user: User;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center gap-2">
        <span className="text-sm font-medium">Dashboard</span>
      </div>
      <UserMenu user={user} />
    </header>
  )
}

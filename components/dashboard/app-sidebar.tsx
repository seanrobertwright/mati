import { Home } from "lucide-react"
import type { User } from '@supabase/supabase-js';

import { registry } from "@/lib/safety-framework"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SidebarNavItems } from "./sidebar-nav-items"

interface AppSidebarProps {
  user: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const modulesWithNav = registry.getModulesWithNavigationForUser(user)
  const accessibleModuleCount = registry.getModulesForUser(user).length
  
  // Extract navigation data (no components - can't serialize functions to client)
  const navItems = modulesWithNav.flatMap((mod) =>
    mod.navigation?.map((navItem, idx) => ({
      key: `${mod.id}-${idx}`,
      href: `/dashboard${navItem.href}`,
      label: navItem.label,
    })) || []
  )

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <a href="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Home className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Safety Dashboard</span>
                <span className="truncate text-xs">Management System</span>
              </div>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavItems navItems={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 text-xs text-sidebar-foreground/70">
          {accessibleModuleCount} {accessibleModuleCount === 1 ? "module" : "modules"} available
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

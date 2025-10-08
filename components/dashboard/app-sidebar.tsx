"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"
import type { User } from '@supabase/supabase-js';

import { registry } from "@/lib/safety-framework"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  user: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const modulesWithNav = registry.getModulesWithNavigationForUser(user)
  const accessibleModuleCount = registry.getModulesForUser(user).length

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Safety Dashboard</span>
                  <span className="truncate text-xs">Management System</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {/* Home link */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard"}
            >
              <Link href="/dashboard">
                <Home className="size-4" />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Module navigation items */}
          {modulesWithNav.map((mod) =>
            mod.navigation?.map((navItem, idx) => {
              const fullHref = `/dashboard${navItem.href}`
              const isActive = pathname.startsWith(fullHref)

              return (
                <SidebarMenuItem key={`${mod.id}-${idx}`}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                  >
                    <Link href={fullHref}>
                      {navItem.icon && <navItem.icon />}
                      <span>{navItem.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 text-xs text-sidebar-foreground/70">
          {accessibleModuleCount} {accessibleModuleCount === 1 ? "module" : "modules"} available
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

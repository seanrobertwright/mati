'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface NavItem {
  key: string;
  href: string;
  label: string;
}

interface SidebarNavItemsProps {
  navItems: NavItem[];
}

export function SidebarNavItems({ navItems }: SidebarNavItemsProps) {
  const pathname = usePathname()

  return (
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
      {navItems.map((navItem) => {
        const isActive = pathname.startsWith(navItem.href)

        return (
          <SidebarMenuItem key={navItem.key}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
            >
              <Link href={navItem.href}>
                <FileText className="size-4" />
                <span>{navItem.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}


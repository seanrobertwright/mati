'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, ChevronDown } from "lucide-react"
import { useState } from "react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface NavItem {
  key: string;
  href: string;
  label: string;
  children?: NavItem[];
}

interface SidebarNavItemsProps {
  navItems: NavItem[];
}

export function SidebarNavItems({ navItems }: SidebarNavItemsProps) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

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
        const hasChildren = navItem.children && navItem.children.length > 0

        // If has children, render as collapsible
        if (hasChildren) {
          const isOpen = openItems[navItem.key] ?? false

          return (
            <Collapsible
              key={navItem.key}
              open={isOpen}
            >
              <SidebarMenuItem>
                <div className="flex items-center w-full group/menu-item">
                  <SidebarMenuButton asChild isActive={isActive} className="flex-1">
                    <Link href={navItem.href}>
                      <FileText className="size-4" />
                      <span>{navItem.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  <CollapsibleTrigger
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={(e) => {
                      e.preventDefault()
                      toggleItem(navItem.key)
                    }}
                  >
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {navItem.children!.map((child) => {
                      const isChildActive = pathname === child.href

                      return (
                        <SidebarMenuSubItem key={child.key}>
                          <SidebarMenuSubButton asChild isActive={isChildActive}>
                            <Link href={child.href}>
                              <span>{child.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        }

        // Regular item without children
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


"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Settings,
  Bell,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

const navItems = [
  { name: "Dashboard", path: "/management", icon: LayoutDashboard },
  { name: "Accounts", path: "/management/accounts", icon: Users },
  { name: "Posts", path: "/management/posts", icon: Newspaper },
  { name: "Sponsors", path: "/management/sponsors", icon: FileText },
  { name: "Notifications", path: "/management/notifications", icon: Bell },
  { name: "Page Settings", path: "/management/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-slate-200 dark:border-slate-800">
      <SidebarHeader className="p-4 py-6 bg-navy text-white">
        <Image
          src="/logos/aec/aec-logo-reverse-horizontal.png"
          alt="AEC Admin"
          width={160}
          height={45}
          style={{ objectFit: "contain" }}
          priority
        />
      </SidebarHeader>
      <SidebarContent className="bg-navy text-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.path
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      className={isActive ? "bg-orange hover:bg-orange-hover text-white font-medium shadow-sm" : "hover:bg-navy-dark text-slate-300 hover:text-white"}
                    >
                      <Link href={item.path}>
                        <item.icon className="mr-2" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-navy p-4 text-white">
        {/* We can put user profile or theme toggle here, but standard layout has it in header */}
      </SidebarFooter>
    </Sidebar>
  )
}

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
    <Sidebar className="border-r border-slate-200 dark:border-slate-800 shadow-sm" collapsible="icon">
      <SidebarHeader className="bg-white dark:bg-slate-950 p-6 flex justify-center items-center h-20 border-b border-slate-100 dark:border-slate-800/50">
        <Link href="/management">
          <Image
            src="/logos/aec/aec-logo-reverse-horizontal.png"
            alt="AEC Admin"
            width={120}
            height={36}
            className="object-contain group-data-[collapsible=icon]:hidden hidden dark:block"
            priority
          />
          <Image
            src="/logos/aec/aec-logo-horizontal.png"
            alt="AEC Admin"
            width={120}
            height={36}
            className="object-contain group-data-[collapsible=icon]:hidden block dark:hidden"
            priority
          />
          <div className="hidden group-data-[collapsible=icon]:flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange to-orange-hover text-white font-bold text-xl shadow-md">
            A
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
        <SidebarGroup className="pt-6 px-4">
          <SidebarGroupLabel className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={item.name}
                      className={`h-11 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? "bg-orange/10 dark:bg-orange/20 text-orange dark:text-orange-400 font-semibold shadow-sm border border-orange/20" 
                          : "hover:bg-slate-200/50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Link href={item.path} className="flex items-center gap-3 px-3">
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-orange dark:text-orange-400' : ''}`} />
                        <span className="text-[14px]">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800">
      </SidebarFooter>
    </Sidebar>
  )
}

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
  Search,
  Sun,
  Moon,
  LogOut,
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "@/lib/contexts/ThemeProvider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


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
  const { theme, toggleTheme } = useTheme()
  const { data: session } = useSession()

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
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-around mb-2 group-data-[collapsible=icon]:hidden">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-white rounded-full">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-white rounded-full">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-white rounded-full">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-3 p-2 mt-2 border-t border-slate-200 dark:border-slate-800 pt-4">
              <Avatar className="h-8 w-8 rounded-lg bg-orange flex items-center justify-center text-white font-semibold text-xs shadow-sm shrink-0">
                <AvatarFallback className="bg-transparent text-white">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-navy dark:text-slate-200">
                  {session?.user?.name || "Admin"}
                </span>
                <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {session?.user?.email || "admin@aec.edu.vn"}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="h-11 rounded-xl text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all duration-200 font-medium"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[14px]">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

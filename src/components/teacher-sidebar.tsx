"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  CheckSquare,
  Users,
  Award,
  Bell,
  BarChart,
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
  { name: "Dashboard", path: "/teacher", icon: LayoutDashboard },
  { name: "Courses", path: "/teacher/courses", icon: BookOpen },
  { name: "Assignments", path: "/teacher/assignments", icon: FileText },
  { name: "Quizzes", path: "/teacher/quizzes", icon: CheckSquare },
  { name: "Students", path: "/teacher/students", icon: Users },
  { name: "Grades", path: "/teacher/grades", icon: Award },
  { name: "Announcements", path: "/teacher/announcements", icon: Bell },
  { name: "Statistics", path: "/teacher/statistics", icon: BarChart },
]

export function TeacherSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-slate-200 dark:border-slate-800">
      <SidebarHeader className="p-4 py-6 bg-navy text-white">
        <Image
          src="/logos/aec/aec-logo-reverse-horizontal.png"
          alt="AEC Teacher"
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
                // Determine active state: either exact match or sub-route
                const isActive = pathname === item.path || (pathname.startsWith(item.path + '/') && item.path !== '/teacher')
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
      </SidebarFooter>
    </Sidebar>
  )
}

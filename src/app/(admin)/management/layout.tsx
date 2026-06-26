"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "@/lib/contexts/ThemeProvider";
import { LogOut, Moon, Sun, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-slate-50/50 dark:bg-slate-950">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm z-10 sticky top-0 transition-all duration-200">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-white transition-colors" />
              <div className="hidden sm:flex items-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                <span className="text-navy dark:text-slate-200">Admin</span>
                <span className="mx-2">/</span>
                <span>Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-slate-500 hidden sm:flex rounded-full">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-500 hidden sm:flex rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1"></div>
              
              <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme" className="text-slate-500 rounded-full">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 rounded-full pl-2 pr-4 py-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 h-10 transition-all">
                    <Avatar className="h-7 w-7 bg-orange flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                      {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
                    </Avatar>
                    <span className="text-sm font-medium text-navy dark:text-slate-200 hidden sm:block">
                      {session?.user?.name || "Admin"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-navy dark:text-slate-200">{session?.user?.name || "Admin User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session?.user?.email || "admin@aec.edu.vn"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50 rounded-lg mx-1 my-1">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

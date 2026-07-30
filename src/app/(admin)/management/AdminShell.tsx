"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { LogOut, Moon, Sun } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/contexts/ThemeProvider";
import { DemoRoleSwitcher } from "@/app/(elearning)/elearning/DemoRoleSwitcher";

type AdminShellUser = {
  name: string | null;
  email: string | null;
  role: string;
};

export function AdminShell({ children, user }: { children: React.ReactNode; user: AdminShellUser }) {
  const { theme, toggleTheme } = useTheme();
  const initial = (user.name || user.email || "A").charAt(0).toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#f6f7fb] dark:bg-slate-950">
        <AppSidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3.5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" />
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-indigo-500">AEC Control Center</p>
                <h1 className="hidden text-lg font-bold text-navy dark:text-white sm:block">Learning operations</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme" className="text-slate-500">
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 rounded-full border-slate-200 bg-white py-2 pl-2 pr-4 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <Avatar className="flex h-7 w-7 items-center justify-center bg-indigo-600 text-xs font-semibold text-white">
                      {initial}
                    </Avatar>
                    <span className="hidden text-sm font-medium text-navy dark:text-slate-200 sm:block">
                      {user.name || user.email || "Admin"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Administrator</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-7 lg:p-8">
            {children}
          </div>
        </main>
        {process.env.NODE_ENV !== "production" ? <DemoRoleSwitcher currentRole={user.role} /> : null}
      </div>
    </SidebarProvider>
  );
}

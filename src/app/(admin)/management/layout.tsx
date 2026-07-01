"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0 relative bg-transparent">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-4 md:hidden backdrop-blur-sm z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-white transition-colors" />
              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                <span className="text-navy dark:text-slate-200">Admin Dashboard</span>
              </div>
            </div>
          </header>
          
          <div className="flex-1 p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto pb-12">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

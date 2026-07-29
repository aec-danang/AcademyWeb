"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { QuickActionButton } from "@/components/quick-action-button";
import { CommandPalette } from "@/components/command-palette";
import { Command, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <style dangerouslySetInnerHTML={{ __html: `body { overflow: hidden; }` }} />
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0 relative bg-transparent overflow-y-auto">
          {/* Global Header Bar */}
          <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-6 backdrop-blur-md z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-white transition-colors" />
              <div className="hidden sm:flex items-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                <span>Trung tâm Quản trị AEC</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true });
                  window.dispatchEvent(event);
                }}
                className="hidden md:flex items-center gap-2 h-9 px-3 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <Command className="h-3.5 w-3.5 text-slate-400" />
                <span>Tìm kiếm / Lệnh hệ thống</span>
                <kbd className="ml-2 font-mono text-[10px] font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-xs">Ctrl K</kbd>
              </Button>

              <QuickActionButton />
            </div>
          </header>
          
          <div className="flex-1 p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto pb-12">
              {children}
            </div>
          </div>
        </SidebarInset>
        <CommandPalette />
      </div>
    </SidebarProvider>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Calendar,
  FolderTree,
  Tags,
  Image as ImageIcon,
  BookOpen,
  GraduationCap,
  Users,
  UserCheck,
  Globe,
  Layout,
  Menu as MenuIcon,
  Search,
  Send,
  BarChart3,
  Shield,
  Settings,
  History,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  Command,
  Bell,
  MessageSquare,
  Target
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/lib/contexts/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

export interface NavGroup {
  title: string;
  items: {
    name: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
    subItems?: { name: string; path: string }[];
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Chính",
    items: [
      { name: "Tổng quan", path: "/management", icon: LayoutDashboard }
    ]
  },
  {
    title: "Nội dung",
    items: [
      { 
        name: "Bài viết & Tin tức", 
        path: "/management/posts", 
        icon: Newspaper,
        subItems: [
          { name: "Tất cả bài viết", path: "/management/posts" },
          { name: "Viết bài mới", path: "/management/posts/new" },
        ]
      },
      { name: "Chuyên mục", path: "/management/posts?type=categories", icon: FolderTree },
      { name: "Thẻ (Tags)", path: "/management/posts?type=tags", icon: Tags },
      { name: "Thư viện Media", path: "/management/media", icon: ImageIcon }
    ]
  },
  {
    title: "Học viện AEC",
    items: [
      { name: "Chương trình đào tạo", path: "/management/programs", icon: BookOpen },
      { name: "Khóa học", path: "/management/courses", icon: GraduationCap },
      { name: "Đăng ký & Liên hệ", path: "/management/submissions", icon: Target }
    ]
  },
  {
    title: "Truyền thông & Đánh giá",
    items: [
      { name: "Đối tác & Nhà tài trợ", path: "/management/sponsors", icon: FileText },
      { name: "Cảm nhận học viên", path: "/management/testimonials", icon: MessageSquare },
      { name: "Thông báo", path: "/management/notifications", icon: Bell }
    ]
  },
  {
    title: "Hệ thống & Cấu hình",
    items: [
      { name: "Tài khoản người dùng", path: "/management/accounts", icon: Users },
      { name: "Cài đặt trang", path: "/management/settings", icon: Settings }
    ]
  }
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  
  const [filterQuery, setFilterQuery] = React.useState("");
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    "Nội dung": true,
    "Học viện AEC": true
  });

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredGroups = React.useMemo(() => {
    if (!filterQuery.trim()) return navGroups;
    const q = filterQuery.toLowerCase();
    
    return navGroups.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.subItems?.some(s => s.name.toLowerCase().includes(q))
      )
    })).filter(group => group.items.length > 0);
  }, [filterQuery]);

  return (
    <Sidebar className="border-r border-slate-200 dark:border-slate-800 shadow-sm">
      {/* 1. Header Logo */}
      <SidebarHeader className="bg-white dark:bg-slate-950 p-4 flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex justify-between items-center h-12">
          <Link href="/management" className="flex items-center">
            <Image
              src="/aec/aec-logo-reverse-horizontal.png"
              alt="AEC Admin"
              width={110}
              height={32}
              className="object-contain hidden dark:block"
              priority
              style={{ height: 'auto' }}
            />
            <Image
              src="/aec/aec-logo-horizontal.png"
              alt="AEC Admin"
              width={110}
              height={32}
              className="object-contain block dark:hidden"
              priority
              style={{ height: 'auto' }}
            />
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true });
              window.dispatchEvent(event);
            }}
            className="h-8 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors gap-1.5"
            title="Command Palette (Ctrl + K)"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Ctrl+K</span>
          </Button>
        </div>

        {/* Search menu filter */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Tìm kiếm menu..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="h-8 text-xs pl-8 bg-slate-100 dark:bg-slate-900 border-0 focus-visible:ring-1 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-700 rounded-lg"
          />
          {filterQuery && (
            <button 
              onClick={() => setFilterQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* 2. Collapsible Group Navigation */}
      <SidebarContent className="bg-slate-50/70 dark:bg-slate-950 text-slate-700 dark:text-slate-300 px-2 py-3 space-y-4">
        {filteredGroups.map((group) => {
          const isGroupOpen = openGroups[group.title] ?? true;

          return (
            <SidebarGroup key={group.title} className="p-0">
              <div 
                onClick={() => toggleGroup(group.title)}
                className="flex items-center justify-between px-3 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors select-none"
              >
                <span>{group.title}</span>
                {isGroupOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </div>

              {isGroupOpen && (
                <SidebarGroupContent className="mt-1">
                  <SidebarMenu className="gap-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.path || (item.path !== "/management" && pathname.startsWith(item.path));
                      const hasSub = !!item.subItems?.length;

                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.name}
                            className={`h-9 rounded-lg transition-all duration-150 cursor-pointer ${
                              isActive
                                ? "bg-orange/10 dark:bg-orange/20 text-orange dark:text-orange-400 font-semibold shadow-xs border border-orange/20"
                                : "hover:bg-slate-200/60 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            <Link href={item.path} className="flex items-center justify-between px-3 w-full">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-orange dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`} />
                                <span className="text-[13px] truncate">{item.name}</span>
                              </div>
                              {item.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange/20 text-orange dark:text-orange-400">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>

                          {/* Subitems */}
                          {hasSub && isActive && (
                            <SidebarMenuSub className="ml-5 pl-2 border-l border-slate-200 dark:border-slate-800 space-y-1 mt-1">
                              {item.subItems!.map(sub => {
                                const isSubActive = pathname === sub.path;
                                return (
                                  <SidebarMenuSubItem key={sub.name}>
                                    <SidebarMenuSubButton 
                                      asChild 
                                      isActive={isSubActive}
                                      className={`h-7 text-xs rounded-md ${
                                        isSubActive 
                                          ? "text-orange dark:text-orange-400 font-semibold" 
                                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                      }`}
                                    >
                                      <Link href={sub.path}>{sub.name}</Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* 3. Footer User Profile & Theme */}
      <SidebarFooter className="bg-white dark:bg-slate-950 p-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="h-8 w-8 rounded-lg bg-orange flex items-center justify-center text-white font-semibold text-xs shadow-xs shrink-0">
              <AvatarFallback className="bg-transparent text-white">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-semibold text-slate-900 dark:text-slate-200 text-xs">
                {session?.user?.name || "Admin Manager"}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {session?.user?.email || "admin@aec.edu.vn"}
              </span>
            </div>
          </div>

          <div className="flex items-center shrink-0 gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md cursor-pointer"
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="h-7 w-7 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md cursor-pointer"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

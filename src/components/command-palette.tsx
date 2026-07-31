"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  BookOpen,
  Users,
  Settings,
  Target,
  MessageSquare,
  Newspaper,
  Plus,
  Command as CommandIcon,
  FolderTree,
  Tags,
  Image as ImageIcon
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CommandItem {
  id: string;
  title: string;
  category: "Điều hướng" | "Thao tác" | "Nội dung gần đây";
  href: string;
  icon: React.ElementType;
}

const commandItems: CommandItem[] = [
  // Actions
  { id: "action-new-post", title: "Viết bài tin tức / blog mới", category: "Thao tác", href: "/management/posts/new", icon: Plus },
  { id: "action-new-program", title: "Tạo chương trình đào tạo mới", category: "Thao tác", href: "/management/programs/new", icon: Plus },
  { id: "action-media", title: "Tải lên thư viện media", category: "Thao tác", href: "/management/media", icon: ImageIcon },

  // Navigation
  { id: "nav-dashboard", title: "Trang tổng quan (Dashboard)", category: "Điều hướng", href: "/management", icon: Search },
  { id: "nav-posts", title: "Quản lý bài viết & Tin tức", category: "Điều hướng", href: "/management/posts", icon: Newspaper },
  { id: "nav-categories", title: "Chuyên mục & Thẻ bài viết", category: "Điều hướng", href: "/management/posts?type=categories", icon: FolderTree },
  { id: "nav-programs", title: "Quản lý chương trình đào tạo", category: "Điều hướng", href: "/management/programs", icon: BookOpen },
  { id: "nav-submissions", title: "Đăng ký liên hệ & Tư vấn", category: "Điều hướng", href: "/management/submissions", icon: Target },
  { id: "nav-accounts", title: "Tài khoản người dùng", category: "Điều hướng", href: "/management/accounts", icon: Users },
  { id: "nav-testimonials", title: "Cảm nhận & Đánh giá học viên", category: "Điều hướng", href: "/management/testimonials", icon: MessageSquare },
  { id: "nav-settings", title: "Cài đặt & Cấu hình trang", category: "Điều hướng", href: "/management/settings", icon: Settings },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA")) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return commandItems;
    const q = search.toLowerCase();
    return commandItems.filter(
      (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [search]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setSearch("");
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex].href);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl">
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400 mr-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tên trang hoặc lệnh cần tìm (ví dụ: 'Bài viết mới', 'Cài đặt')..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-1 ml-2 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
            <span>ESC</span>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Không tìm thấy trang hoặc lệnh phù hợp.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-orange/10 dark:bg-orange/20 text-orange dark:text-orange-400 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${isSelected ? "bg-orange text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Di chuyển: <kbd className="font-sans font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">↑</kbd> <kbd className="font-sans font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">↓</kbd></span>
            <span>Chọn: <kbd className="font-sans font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">↵</kbd></span>
          </div>
          <span>Bảng lệnh điều hướng AEC CMS</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

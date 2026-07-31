"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  BookOpen,
  GraduationCap,
  Image as ImageIcon,
  Calendar,
  Users,
  Target,
  MessageSquare,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function QuickActionButton() {
  const router = useRouter();

  const actions = [
    { label: "Viết bài mới", href: "/management/posts/new", icon: FileText, desc: "Tạo bài viết blog hoặc tin tức mới" },
    { label: "Tạo chương trình đào tạo", href: "/management/programs/new", icon: BookOpen, desc: "Thêm chương trình học mới vào hệ thống" },
    { label: "Tải lên Thư viện Media", href: "/management/media", icon: ImageIcon, desc: "Tải ảnh, tập tin lên kho lưu trữ" },
    { label: "Thêm đánh giá học viên", href: "/management/testimonials", icon: MessageSquare, desc: "Thêm nhận xét & cảm nhận mới" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className="bg-orange hover:bg-orange-hover text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 gap-2 h-9 px-3.5 cursor-pointer text-xs"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Tạo mới</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900" align="end">
        <DropdownMenuLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 py-1.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-orange" />
          <span>Thao tác nhanh</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
        <DropdownMenuGroup className="space-y-1">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              onClick={() => router.push(action.href)}
              className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
            >
              <div className="p-1.5 rounded-md bg-orange/10 text-orange dark:bg-orange/20 dark:text-orange-400 mt-0.5">
                <action.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{action.label}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{action.desc}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

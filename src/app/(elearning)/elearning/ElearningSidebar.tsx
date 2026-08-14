"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Award,
  ClipboardList,
  ClipboardCheck,
  GraduationCap,
  Globe2,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Calendar,
  Megaphone,
  BookOpen,
  User,
  CheckSquare,
  ChevronDown,
  ChevronRight
} from "lucide-react";

type SidebarUser = {
  name: string | null;
  email: string | null;
  role: string;
};

type NavItem = {
  name: string;
  path: string;
  icon: any;
  subItems?: { name: string; path: string; icon: any }[];
};

const studentNavItems: NavItem[] = [
  { name: "Dashboard", path: "/elearning", icon: LayoutDashboard },
  { name: "My Courses", path: "/elearning/classrooms", icon: Users },
  { 
    name: "Homework ⭐", 
    path: "/elearning/tasks", 
    icon: ClipboardCheck,
    subItems: [
      { name: "Assignments", path: "/elearning/assignments", icon: GraduationCap },
      { name: "Quizzes", path: "/elearning/practice", icon: ClipboardList },
    ]
  },
  { name: "Calendar", path: "/elearning/calendar", icon: Calendar },
  { name: "Resources", path: "/elearning/resources", icon: BookOpen },
  { name: "Certificates", path: "/elearning/certificates", icon: Award },
  { name: "Messages", path: "/elearning/messages", icon: Megaphone },
];

const teacherNavItems: NavItem[] = [
  { name: "Dashboard", path: "/elearning", icon: LayoutDashboard },
  { 
    name: "Classrooms", 
    path: "/elearning/classrooms", 
    icon: Users,
    subItems: [
      { name: "Students", path: "/elearning/students", icon: User },
      { name: "Attendance", path: "/elearning/attendance", icon: CheckSquare },
    ]
  },
  { 
    name: "Homework ⭐", 
    path: "/elearning/tasks", 
    icon: ClipboardCheck,
    subItems: [
      { name: "Assignments", path: "/elearning/assignments", icon: GraduationCap },
      { name: "Quizzes", path: "/elearning/practice", icon: ClipboardList },
      { name: "Grades", path: "/elearning/scores", icon: Award },
    ]
  },
  { name: "Calendar", path: "/elearning/calendar", icon: Calendar },
  { name: "Announcements", path: "/elearning/announcements", icon: Megaphone },
  { name: "Resources", path: "/elearning/resources", icon: BookOpen },
];

function isActivePath(pathname: string, path: string) {
  if (path === "/elearning") return pathname === path;
  if (path === "/elearning/practice") {
    return (
      pathname.startsWith("/elearning/practice")
      || pathname.startsWith("/elearning/exercises")
      || pathname.startsWith("/elearning/tests")
      || pathname.startsWith("/elearning/wrong-questions")
    );
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavItemComponent({ item, pathname }: { item: NavItem, pathname: string }) {
  const isDirectActive = isActivePath(pathname, item.path);
  const isChildActive = item.subItems?.some(sub => isActivePath(pathname, sub.path));
  const isActive = isDirectActive || isChildActive;
  
  const [isOpen, setIsOpen] = useState(isActive);
  const Icon = item.icon;

  if (item.subItems && item.subItems.length > 0) {
    return (
      <div className="flex flex-col mb-1">
        <div className={`flex items-center justify-between w-full rounded-lg transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-slate-100'}`}>
          <Link
            href={item.path}
            className={`flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium ${isActive ? 'text-blue-700' : 'text-slate-600'}`}
          >
            <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
            {item.name}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-1.5 mr-1.5 rounded-md hover:bg-slate-200/50 transition-colors ${isActive ? 'text-blue-700' : 'text-slate-500'}`}
            aria-label={`Toggle ${item.name}`}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
        
        {isOpen && (
          <div className="flex flex-col gap-1 mt-1 ml-4 pl-4 border-l border-slate-200">
            {item.subItems.map((subItem) => {
              const SubIcon = subItem.icon;
              const isSubActive = isActivePath(pathname, subItem.path);
              return (
                <Link
                  key={subItem.path}
                  href={subItem.path}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isSubActive ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <SubIcon size={18} className={isSubActive ? 'text-blue-600' : 'text-slate-400'} />
                  {subItem.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.path}
      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg mb-1 transition-colors ${isDirectActive ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'}`}
      aria-current={isDirectActive ? "page" : undefined}
    >
      <Icon size={20} className={isDirectActive ? 'text-blue-600' : 'text-slate-400'} />
      {item.name}
    </Link>
  );
}

export function ElearningSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();
  const navItems = user.role === "STUDENT" ? studentNavItems : teacherNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen overflow-hidden shrink-0">
      <div className="p-6 pb-2 ">
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/aec/cropped-Logo-main-vertical-sRGB.png"
            alt="AEC Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <h2 className="font-bold text-lg text-slate-900 tracking-tight">AEC Portal</h2>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            {initial}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-slate-900 truncate">{user.name || user.email}</span>
            <span className="text-xs text-blue-600 font-medium">{user.role}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="E-learning navigation">
        {navItems.map((item) => (
          <NavItemComponent key={item.path} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-1">
        {process.env.NODE_ENV !== "production" && user.role !== "ADMIN" && (
          <Link href="/api/elearning/demo-role?role=ADMIN" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
            <Settings size={20} className="text-slate-400" />
            Admin View
          </Link>
        )}
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
          <Globe2 size={20} className="text-slate-400" />
          Public website
        </Link>
        <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
          <LogOut size={20} className="text-red-400" />
          Logout
        </Link>
      </div>
    </aside>
  );
}

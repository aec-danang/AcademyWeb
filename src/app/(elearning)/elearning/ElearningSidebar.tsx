"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  CheckSquare,
  Bot,
  LineChart,
  MessageSquare,
  FolderOpen,
  UserCircle,
} from "lucide-react";
import styles from "./elearning.module.css";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type SidebarUser = {
  name: string | null;
  email: string | null;
  role: string;
};

const studentNavItems = [
  { name: "Dashboard", path: "/elearning", icon: LayoutDashboard },
  { name: "Courses", path: "/elearning/courses", icon: BookOpen },
  { name: "Classrooms", path: "/elearning/classrooms", icon: Users },
  { name: "Practice", path: "/elearning/practice", icon: ClipboardList },
  { name: "Assignments", path: "/elearning/assignments", icon: GraduationCap },
  { name: "Scores", path: "/elearning/scores", icon: Award },
];

const teacherNavItems = [
  { name: "Dashboard", path: "/elearning", icon: LayoutDashboard },
  { name: "Classrooms", path: "/elearning/classrooms", icon: Users },
  { name: "Courses", path: "/elearning/teacher/courses", icon: BookOpen },
  { name: "Tasks", path: "/elearning/teacher/tasks", icon: CheckSquare },
  { name: "AI Grading", path: "/elearning/teacher/ai-grading", icon: Bot },
  { name: "Gradebook", path: "/elearning/scores", icon: Award },
  { name: "Progress", path: "/elearning/teacher/progress", icon: LineChart },
  { name: "Discussions", path: "/elearning/teacher/discussions", icon: MessageSquare },
  { name: "Resources", path: "/elearning/teacher/resources", icon: FolderOpen },
  { name: "Profile", path: "/elearning/teacher/profile", icon: UserCircle },
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

export function ElearningSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();
  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <Image
          src="/logos/aec/cropped-Logo-main-vertical-sRGB.png"
          alt="AEC Logo"
          width={72}
          height={72}
          style={{ objectFit: "contain", objectPosition: "center" }}
        />
        <h2>AEC E-Learning</h2>
      </div>

      <div className={styles.sidebarUser}>
        <p>Signed in as</p>
        <div className={styles.roleDisplay}>
          <div className={`${styles.roleAvatar} ${user.role === "STUDENT" ? styles.roleAvatarStudent : ""}`}>
            {initial}
          </div>
          <div className={styles.roleInfo}>
            <span className={styles.roleName}>{user.name || user.email}</span>
            <span className={styles.roleLabel}>{user.role}</span>
          </div>
        </div>
      </div>

      <nav className={styles.sidebarNav} aria-label="E-learning navigation">
        {(user.role === "TEACHER" || user.role === "ADMIN" ? teacherNavItems : studentNavItems).map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
        {user.role === "ADMIN" && (
          <Link
            href="/management"
            className={`${styles.navLink} ${pathname.startsWith("/management") ? styles.navLinkActive : ""}`}
          >
            <Settings size={20} />
            Management
          </Link>
        )}
      </nav>

      <div className={styles.sidebarFooter}>
        <LanguageSwitcher />
        <Link className={styles.navLink} href="/api/auth/signout">
          <LogOut size={20} />
          Logout
        </Link>
      </div>
    </aside>
  );
}

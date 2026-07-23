"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  ClipboardList,
  ClipboardCheck,
  GraduationCap,
  Globe2,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import styles from "./elearning.module.css";

type SidebarUser = {
  name: string | null;
  email: string | null;
  role: string;
};

const studentNavItems = [
  { name: "Dashboard", path: "/elearning", icon: LayoutDashboard },
  { name: "My Classrooms", path: "/elearning/classrooms", icon: Users },
  { name: "Course Content", path: "/elearning/courses", icon: BookOpen },
  { name: "My Work", path: "/elearning/assignments", icon: GraduationCap },
  { name: "Practice & Tests", path: "/elearning/practice", icon: ClipboardList },
  { name: "Results & Feedback", path: "/elearning/scores", icon: Award },
];

const teacherNavItems = [
  { name: "Workspace", path: "/elearning", icon: LayoutDashboard },
  { name: "My Classrooms", path: "/elearning/classrooms", icon: Users },
  { name: "Course Library", path: "/elearning/courses", icon: BookOpen },
  { name: "Assignments", path: "/elearning/assignments", icon: GraduationCap },
  { name: "Test Library", path: "/elearning/practice", icon: ClipboardList },
  { name: "Review & Scores", path: "/elearning/scores", icon: ClipboardCheck },
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
  const navItems = user.role === "STUDENT" ? studentNavItems : teacherNavItems;

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
        {navItems.map((item) => {
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
        <Link className={styles.navLink} href="/">
          <Globe2 size={20} />
          Public website
        </Link>
        <Link className={styles.navLink} href="/api/auth/signout">
          <LogOut size={20} />
          Logout
        </Link>
      </div>
    </aside>
  );
}

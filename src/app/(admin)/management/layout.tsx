"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Newspaper, Calendar, Settings, LogOut, Bell, Users, Moon, Sun } from "lucide-react";
import styles from "./admin.module.css";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "@/lib/contexts/ThemeProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  const navItems = [
    { name: "Dashboard", path: "/management", icon: <LayoutDashboard size={20} /> },
    { name: "Accounts", path: "/management/accounts", icon: <Users size={20} /> },
    { name: "Posts", path: "/management/posts", icon: <Newspaper size={20} /> },
    { name: "Sponsors", path: "/management/sponsors", icon: <FileText size={20} /> },
    { name: "Notifications", path: "/management/notifications", icon: <Bell size={20} /> },
    { name: "Page Settings", path: "/management/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div style={{ marginBottom: "2.5rem", paddingLeft: "1rem", marginTop: "0.5rem" }}>
          <Image
            src="/logos/aec/aec-logo-reverse-horizontal.png"
            alt="AEC Admin"
            width={160}
            height={45}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1.25rem", color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {session?.user?.name || "Admin"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{ cursor: "pointer", display: "flex", alignItems: "center", color: "rgba(255, 255, 255, 0.7)", transition: "color 0.2s" }}
                onClick={toggleTheme}
                title="Toggle Dark Mode"
              >
                {theme === "dark" ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
              </div>
              <button
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255, 255, 255, 0.7)", display: "flex", alignItems: "center", padding: 0, transition: "color 0.2s" }}
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Logout"
              >
                <LogOut size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}

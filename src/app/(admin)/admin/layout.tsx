"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Newspaper, Calendar, Settings, LogOut, Bell, Search } from "lucide-react";
import styles from "./admin.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Landing Page Content", path: "/admin/content", icon: <FileText size={20} /> },
    { name: "News & Articles", path: "/admin/news", icon: <Newspaper size={20} /> },
    { name: "Events", path: "/admin/events", icon: <Calendar size={20} /> },
    { name: "Sponsors", path: "/admin/sponsors", icon: <FileText size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
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
        <button className={styles.navLink} style={{ background: "transparent", border: "none", cursor: "pointer", marginTop: "auto", fontFamily: "inherit", fontSize: "0.95rem" }}>
          <LogOut size={20} />
          Logout
        </button>
      </aside>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header className={styles.header}>
          <h1>Overview</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#64748b" }}>
              <Search size={20} style={{ cursor: "pointer" }} />
              <div style={{ position: "relative", cursor: "pointer" }}>
                <Bell size={20} />
                <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, backgroundColor: "var(--color-orange)", borderRadius: "50%" }}></span>
              </div>
            </div>
            <div style={{ width: "1px", height: "24px", backgroundColor: "#e2e8f0" }}></div>
            <div className={styles.userProfile}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, var(--color-orange), #ff6b4a)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                A
              </div>
              Admin User
            </div>
          </div>
        </header>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}

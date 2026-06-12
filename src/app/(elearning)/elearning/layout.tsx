"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Users, ClipboardList, Award, LogOut, MessageSquare } from "lucide-react";
import styles from "./elearning.module.css";
import { useState } from "react";

export default function ElearningLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Mock role toggle for UI demonstration
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");

  const navItems = [
    { name: "Dashboard", path: "/elearning", icon: <BookOpen size={20} /> },
    { name: "Classrooms", path: "/elearning/classrooms", icon: <Users size={20} /> },
    { name: "Assignments", path: "/elearning/assignments", icon: <ClipboardList size={20} /> },
    { name: "Scores", path: "/elearning/scores", icon: <Award size={20} /> },
  ];

  return (
    <div className={styles.elearningContainer}>
      <aside className={styles.sidebar}>
        <h2>AEC E-Learning</h2>
        
        {/* Mock Role Switcher for Demo */}
        <div style={{ marginBottom: "1.5rem", padding: "0 1rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>VIEWING AS:</p>
          <div className={styles.roleToggle}>
            <button 
              className={`${styles.roleBtn} ${role === "STUDENT" ? styles.roleBtnActive : ""}`}
              onClick={() => setRole("STUDENT")}
              style={{ flex: 1 }}
            >
              Student
            </button>
            <button 
              className={`${styles.roleBtn} ${role === "TEACHER" ? styles.roleBtnActive : ""}`}
              onClick={() => setRole("TEACHER")}
              style={{ flex: 1 }}
            >
              Teacher
            </button>
          </div>
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
        <button className={styles.navLink} style={{ background: "transparent", border: "none", cursor: "pointer", marginTop: "auto" }}>
          <LogOut size={20} />
          Logout
        </button>
      </aside>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <main className={styles.mainContent}>
          {/* We pass the simulated role down using React context in a real app, but for now we just use layout components or let pages be static mock */}
          {children}
        </main>
      </div>
    </div>
  );
}

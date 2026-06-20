"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpen, Users, ClipboardList, Award, LogOut, MessageSquare, Moon, Sun } from "lucide-react";
import styles from "./elearning.module.css";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/lib/contexts/ThemeProvider";

export default function ElearningLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  // Mock role toggle for UI demonstration
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");

  const navItems = [
    { name: "Dashboard", path: "/elearning", icon: <BookOpen size={20} /> },
    { name: "Courses", path: "/elearning/courses", icon: <BookOpen size={20} /> },
    { name: "Classrooms", path: "/elearning/classrooms", icon: <Users size={20} /> },
    { name: "Exercises", path: "/elearning/exercises", icon: <ClipboardList size={20} /> },
    { name: "Assignments", path: "/elearning/assignments", icon: <ClipboardList size={20} /> },
    { name: "Scores", path: "/elearning/scores", icon: <Award size={20} /> },
  ];

  return (
    <div className={styles.elearningContainer}>
      <aside className={styles.sidebar}>
        <div style={{ paddingLeft: "1rem", marginTop: "-30px", marginBottom: "-30px", display: "flex", alignItems: "flex-start" }}>
          <Image 
            src="/logos/aec/cropped-Logo-main-vertical-sRGB.png" 
            alt="AEC Logo" 
            width={100} 
            height={100} 
            style={{ objectFit: 'contain', objectPosition: 'center' }}
          />
        </div>
        <h2 style={{ marginTop: 0, paddingLeft: "1rem" }}>AEC E-Learning</h2>
        
        {/* Role Display */}
        <div style={{ marginBottom: "1.5rem", padding: "0 1rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>ĐANG ĐĂNG NHẬP LÀ:</p>
          <div 
            className={styles.roleDisplay}
            onClick={() => setRole(role === "STUDENT" ? "TEACHER" : "STUDENT")}
            style={{ cursor: "pointer" }}
            title="Click to toggle role for testing"
          >
            <div className={`${styles.roleAvatar} ${role === "STUDENT" ? styles.roleAvatarStudent : ""}`}>
              {role === "STUDENT" ? "H" : "G"}
            </div>
            <div className={styles.roleInfo}>
              <span className={styles.roleName}>
                {role === "STUDENT" ? "Học viên" : "Giáo viên"}
              </span>
              <span className={styles.roleLabel}>
                {role === "STUDENT" ? "Student Account" : "Teacher Account"}
              </span>
            </div>
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
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button 
            className={styles.navLink} 
            style={{ background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit", fontSize: "1rem" }}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            Toggle Theme
          </button>
          <button 
            className={styles.navLink} 
            style={{ background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "inherit", fontSize: "1rem" }}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
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

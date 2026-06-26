import Link from "next/link";
import Image from "next/image";
import { Award, BookMarked, BookOpen, ClipboardList, FileCheck2, LogOut, Target, Users } from "lucide-react";
import styles from "./elearning.module.css";
import { requireUser } from "@/lib/session";

export default async function ElearningLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const navItems = [
    { name: "Dashboard", path: "/elearning", icon: <BookOpen size={20} /> },
    { name: "Courses", path: "/elearning/courses", icon: <BookOpen size={20} /> },
    { name: "Classrooms", path: "/elearning/classrooms", icon: <Users size={20} /> },
    { name: "Quizzes", path: "/elearning/exercises", icon: <ClipboardList size={20} /> },
    { name: "Practice Tests", path: "/elearning/tests", icon: <FileCheck2 size={20} /> },
    { name: "Wrong Questions", path: "/elearning/wrong-questions", icon: <Target size={20} /> },

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
            style={{ objectFit: "contain", objectPosition: "center" }}
          />
        </div>
        <h2 style={{ marginTop: 0, paddingLeft: "1rem" }}>AEC E-Learning</h2>

        <div style={{ marginBottom: "1.5rem", padding: "0 1rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>ĐANG ĐĂNG NHẬP LÀ:</p>
          <div className={styles.roleDisplay}>
            <div className={`${styles.roleAvatar} ${user.role === "STUDENT" ? styles.roleAvatarStudent : ""}`}>
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className={styles.roleInfo}>
              <span className={styles.roleName}>{user.name || user.email}</span>
              <span className={styles.roleLabel}>{user.role}</span>
            </div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
          {navItems.map((item) => (
            <Link key={item.path} href={item.path} className={styles.navLink}>
              {item.icon}
              {item.name}
            </Link>
          ))}
          {user.role === "ADMIN" && (
            <Link href="/admin/dashboard" className={styles.navLink}>
              <Users size={20} />
              Admin
            </Link>
          )}
        </nav>
        <Link className={styles.navLink} href="/api/auth/signout" style={{ marginTop: "auto" }}>
          <LogOut size={20} />
          Logout
        </Link>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}

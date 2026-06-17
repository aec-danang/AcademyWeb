import styles from "./admin.module.css";
import { Users, FileText, Newspaper, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  // Fetch real data in parallel
  const [totalStudents, totalCourses, totalLeads, newsPublished, recentUsers] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.course.count(),
    prisma.lead.count(),
    prisma.post.count({ where: { type: "post" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div>
      <div className={styles.flexBetween}>
        <h2>Overview</h2>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Total Students</h3>
            <Users size={20} color="var(--color-orange)" />
          </div>
          <div className={styles.statValue}>{totalStudents}</div>
          <p style={{ color: "#10b981", fontSize: "0.875rem", margin: 0 }}>Registered users</p>
        </div>
        
        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Total Leads</h3>
            <TrendingUp size={20} color="var(--color-navy)" />
          </div>
          <div className={styles.statValue}>{totalLeads}</div>
          <p style={{ color: "#10b981", fontSize: "0.875rem", margin: 0 }}>Collected from forms</p>
        </div>
        
        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Total Courses</h3>
            <FileText size={20} color="#8b5cf6" />
          </div>
          <div className={styles.statValue}>{totalCourses}</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>Available programs</p>
        </div>
        
        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>News Published</h3>
            <Newspaper size={20} color="#ec4899" />
          </div>
          <div className={styles.statValue}>{newsPublished}</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>Live articles</p>
        </div>
      </div>

      <div className={styles.cardPanel}>
        <h3>Recent Registrations</h3>
        <table className={styles.table} style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th>Email</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => (
              <tr key={user.id}>
                <td>New User Registered</td>
                <td>{user.name || "Unknown"}</td>
                <td>{user.email || "N/A"}</td>
                <td>
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }).format(new Date(user.createdAt))}
                </td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Completed</span></td>
              </tr>
            ))}
            {recentUsers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                  No recent registrations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

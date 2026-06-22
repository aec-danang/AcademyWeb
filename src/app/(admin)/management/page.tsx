import styles from "./admin.module.css";
import { Users, FileText, Newspaper, TrendingUp, UserRound, GraduationCap, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [totalAccounts, totalStudents, totalTeachers, totalAdmins, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        username: true,
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Total Accounts</h3>
            <div style={{ padding: "0.5rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "10px" }}>
              <Users size={20} color="var(--color-orange)" />
            </div>
          </div>
          <div className={styles.statValue}>{totalAccounts}</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>Editable roster</p>
        </div>
        
        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Students</h3>
            <div style={{ padding: "0.5rem", background: "rgba(30, 58, 138, 0.1)", borderRadius: "10px" }}>
              <GraduationCap size={20} color="var(--color-navy)" />
            </div>
          </div>
          <div className={styles.statValue}>{totalStudents}</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>Role USER</p>
        </div>
        
        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Teachers</h3>
            <div style={{ padding: "0.5rem", background: "rgba(139, 92, 246, 0.1)", borderRadius: "10px" }}>
              <UserRound size={20} color="#8b5cf6" />
            </div>
          </div>
          <div className={styles.statValue}>{totalTeachers}</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>Role TEACHER</p>
        </div>
        
        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Admin Accounts</h3>
            <div style={{ padding: "0.5rem", background: "rgba(236, 72, 153, 0.1)", borderRadius: "10px" }}>
              <ShieldCheck size={20} color="#ec4899" />
            </div>
          </div>
          <div className={styles.statValue}>{totalAdmins}</div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>Role ADMIN</p>
        </div>
      </div>

      <div className={styles.cardPanel}>
        <h3>Recent Registrations</h3>
        <table className={styles.table} style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th>Username / Email</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => (
              <tr key={user.id}>
                <td>New User Registered</td>
                <td>{user.name || "Unknown"}</td>
                <td>
                  {user.username && <span style={{ fontWeight: 500 }}>@{user.username}</span>}
                  {user.username && user.email && <br />}
                  {user.email && <span style={{ color: "#64748b", fontSize: "0.9em" }}>{user.email}</span>}
                  {!user.username && !user.email && "N/A"}
                </td>
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

import styles from "./admin.module.css";
import { Users, FileText, Newspaper, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
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
          <div className={styles.statValue}>1,248</div>
          <p style={{ color: "#10b981", fontSize: "0.875rem", margin: 0 }}>+12% this month</p>
        </div>
        
        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Landing Page Views</h3>
            <TrendingUp size={20} color="var(--color-navy)" />
          </div>
          <div className={styles.statValue}>45.2K</div>
          <p style={{ color: "#10b981", fontSize: "0.875rem", margin: 0 }}>+5.4% this week</p>
        </div>
        
        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Active Events</h3>
            <FileText size={20} color="#8b5cf6" />
          </div>
          <div className={styles.statValue}>3</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>Next event in 2 days</p>
        </div>
        
        <div className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>News Published</h3>
            <Newspaper size={20} color="#ec4899" />
          </div>
          <div className={styles.statValue}>24</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>2 drafts pending</p>
        </div>
      </div>

      <div className={styles.cardPanel}>
        <h3>Recent Activity</h3>
        <table className={styles.table} style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Updated Hero Section Text</td>
              <td>Admin User</td>
              <td>Just now</td>
              <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Completed</span></td>
            </tr>
            <tr>
              <td>Added new "Summer IELTS" Event</td>
              <td>Admin User</td>
              <td>2 hours ago</td>
              <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Completed</span></td>
            </tr>
            <tr>
              <td>Drafted News Article</td>
              <td>Content Editor</td>
              <td>Yesterday</td>
              <td><span className={`${styles.badge} ${styles.badgeWarning}`}>Pending</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from "next/link";
import styles from "./elearning.module.css";
import { BookOpen, Clock, AlertCircle } from "lucide-react";

export default function ElearningDashboard() {
  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 style={{ marginBottom: "0.5rem" }}>Welcome back, Student!</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Here's an overview of your progress and upcoming tasks.</p>
        </div>
      </div>

      <div className={styles.courseGrid}>
        <Link href="/elearning/courses/INT-704" style={{ textDecoration: "none", color: "inherit" }}>
          <div className={styles.courseCard}>
            <div className={styles.courseImage}>IELTS Masterclass</div>
            <div className={styles.courseContent}>
              <h3>IELTS Intensive 7.0+</h3>
              <p>Teacher: Mr. David Smith</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                <span>Progress</span>
                <span>65%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: "65%" }}></div>
              </div>
            </div>
          </div>
        </Link>
        
        <Link href="/elearning/courses/ENG-COM" style={{ textDecoration: "none", color: "inherit" }}>
          <div className={styles.courseCard}>
            <div className={styles.courseImage}>Speaking Fluency</div>
            <div className={styles.courseContent}>
              <h3>Advanced Communication</h3>
              <p>Teacher: Ms. Sarah Jane</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                <span>Progress</span>
                <span>32%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: "32%" }}></div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 style={{ margin: 0 }}>Upcoming Assignments</h3>
          <button className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>View All</button>
        </div>
        
        <div className={styles.assignmentItem}>
          <div className={styles.assignmentInfo}>
            <div className={styles.iconBox}><BookOpen size={20} /></div>
            <div className={styles.assignmentMeta}>
              <h4>IELTS Reading Practice Test 4</h4>
              <p>Due: Tomorrow, 11:59 PM</p>
            </div>
          </div>
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>Pending</span>
        </div>
        
        <div className={styles.assignmentItem}>
          <div className={styles.assignmentInfo}>
            <div className={styles.iconBox}><Clock size={20} /></div>
            <div className={styles.assignmentMeta}>
              <h4>Speaking Part 2 Recording</h4>
              <p>Due: Friday, 11:59 PM</p>
            </div>
          </div>
          <span className={`${styles.statusBadge} ${styles.statusPending}`}>Pending</span>
        </div>
      </div>
    </div>
  );
}

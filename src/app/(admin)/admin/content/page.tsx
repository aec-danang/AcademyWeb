"use client";

import styles from "../admin.module.css";
import { Save } from "lucide-react";

export default function AdminContent() {
  return (
    <div>
      <div className={styles.flexBetween}>
        <h2>Manage Landing Page Content</h2>
        <button className="btn-primary" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Save size={18} />
          Publish Changes
        </button>
      </div>

      <div className={styles.cardPanel}>
        <h3>Hero Section</h3>
        <form style={{ marginTop: "1.5rem" }} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.formGroup}>
            <label>Hero Headline</label>
            <input type="text" defaultValue="Learn English. Build Confidence. Become a Global Citizen." />
          </div>
          <div className={styles.formGroup}>
            <label>Hero Subheadline</label>
            <textarea rows={3} defaultValue="Join AEC Da Nang to unlock your potential with our expert teachers and proven methodology."></textarea>
          </div>
          <div className={styles.formGroup}>
            <label>Hero Background Image URL</label>
            <input type="text" defaultValue="/images/hero-bg.jpg" />
          </div>
        </form>
      </div>

      <div className={styles.cardPanel}>
        <h3>About Us Section</h3>
        <form style={{ marginTop: "1.5rem" }} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.formGroup}>
            <label>About Heading</label>
            <input type="text" defaultValue="Why Choose Academy English Center?" />
          </div>
          <div className={styles.formGroup}>
            <label>About Description</label>
            <textarea rows={5} defaultValue="At AEC, we believe that learning English is more than just passing exams; it's about connecting with the world..."></textarea>
          </div>
        </form>
      </div>
    </div>
  );
}

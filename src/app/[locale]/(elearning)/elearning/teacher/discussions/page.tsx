import { requireUser } from "@/lib/session";
import styles from "../../elearning.module.css";
import { MessageSquare } from "lucide-react";

export default async function TeacherDiscussionsPage() {
  await requireUser(["TEACHER", "ADMIN"]);

  return (
    <div className={styles.quizPageShell}>
      <section className={styles.quizHero}>
        <div>
          <span className={styles.cockpitEyebrow}><MessageSquare size={16} /> Discussion & Announcement</span>
          <h1>Communication Hub</h1>
          <p>Post announcements, moderate discussions, and answer student questions.</p>
        </div>
      </section>
      <div className={styles.dashboardMain}>
        <div className={styles.dashboardPanel}>
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Discussion UI coming soon...</p>
        </div>
      </div>
    </div>
  );
}

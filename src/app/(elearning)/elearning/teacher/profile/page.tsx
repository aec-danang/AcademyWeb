import { requireUser } from "@/lib/session";
import styles from "../../elearning.module.css";
import { UserCircle } from "lucide-react";

export default async function TeacherProfilePage() {
  const user = await requireUser(["TEACHER", "ADMIN"]);

  return (
    <div className={styles.quizPageShell}>
      <section className={styles.quizHero}>
        <div>
          <span className={styles.cockpitEyebrow}><UserCircle size={16} /> Teacher Profile</span>
          <h1>{user.name || user.email}</h1>
          <p>Update your personal information, change your password, and configure your notification settings.</p>
        </div>
      </section>
      <div className={styles.dashboardMain}>
        <div className={styles.dashboardPanel}>
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Profile settings UI coming soon...</p>
        </div>
      </div>
    </div>
  );
}

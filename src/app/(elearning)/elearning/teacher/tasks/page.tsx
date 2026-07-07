import { requireUser } from "@/lib/session";
import styles from "../../elearning.module.css";
import { CheckSquare } from "lucide-react";

export default async function TeacherTasksPage() {
  await requireUser(["TEACHER", "ADMIN"]);

  return (
    <div className={styles.quizPageShell}>
      <section className={styles.quizHero}>
        <div>
          <span className={styles.cockpitEyebrow}><CheckSquare size={16} /> Assignment & Quiz Management</span>
          <h1>Manage Tasks</h1>
          <p>Create, edit, and organize assignments and quizzes for your classes.</p>
        </div>
      </section>
      <div className={styles.dashboardMain}>
        <div className={styles.dashboardPanel}>
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Task management UI coming soon...</p>
        </div>
      </div>
    </div>
  );
}

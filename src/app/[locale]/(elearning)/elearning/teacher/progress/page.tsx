import { requireUser } from "@/lib/session";
import styles from "../../elearning.module.css";
import { LineChart } from "lucide-react";

export default async function TeacherProgressPage() {
  await requireUser(["TEACHER", "ADMIN"]);

  return (
    <div className={styles.quizPageShell}>
      <section className={styles.quizHero}>
        <div>
          <span className={styles.cockpitEyebrow}><LineChart size={16} /> Student Progress</span>
          <h1>Tracking & Analytics</h1>
          <p>Monitor student progress, completion rates, and identify learners who need support.</p>
        </div>
      </section>
      <div className={styles.dashboardMain}>
        <div className={styles.dashboardPanel}>
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Progress tracking UI coming soon...</p>
        </div>
      </div>
    </div>
  );
}

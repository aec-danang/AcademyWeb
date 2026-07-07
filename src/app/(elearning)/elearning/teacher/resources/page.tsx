import { requireUser } from "@/lib/session";
import styles from "../../elearning.module.css";
import { FolderOpen } from "lucide-react";

export default async function TeacherResourcesPage() {
  await requireUser(["TEACHER", "ADMIN"]);

  return (
    <div className={styles.quizPageShell}>
      <section className={styles.quizHero}>
        <div>
          <span className={styles.cockpitEyebrow}><FolderOpen size={16} /> Resource Library</span>
          <h1>Manage Materials</h1>
          <p>Upload, organize, and share documents, slides, and other resources with your classes.</p>
        </div>
      </section>
      <div className={styles.dashboardMain}>
        <div className={styles.dashboardPanel}>
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Resource library UI coming soon...</p>
        </div>
      </div>
    </div>
  );
}

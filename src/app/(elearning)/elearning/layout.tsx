import styles from "./elearning.module.css";
import { requireUser } from "@/lib/session";
import { AnimatedLayoutWrapper } from "./AnimatedLayoutWrapper";
import { ElearningSidebar } from "./ElearningSidebar";

export default async function ElearningLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <AnimatedLayoutWrapper>
      <div className={styles.elearningContainer}>
        <ElearningSidebar user={{ name: user.name, email: user.email, role: user.role }} />

        <div className={styles.elearningBody}>
          <main className={styles.mainContent}>{children}</main>
        </div>
      </div>
    </AnimatedLayoutWrapper>
  );
}

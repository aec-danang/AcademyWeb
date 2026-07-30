import styles from "./elearning.module.css";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { AnimatedLayoutWrapper } from "./AnimatedLayoutWrapper";
import { DemoRoleSwitcher } from "./DemoRoleSwitcher";
import { ElearningSidebar } from "./ElearningSidebar";
import { TeacherSetupProgress } from "./TeacherSetupProgress";
import { TeacherAiAgent } from "./TeacherAiAgent";

export default async function ElearningLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/management");

  return (
    <AnimatedLayoutWrapper>
      <div className={styles.elearningContainer}>
        <ElearningSidebar user={{ name: user.name, email: user.email, role: user.role }} />

          <div className={styles.elearningBody}>
            <main className={styles.mainContent}>
              {user.role === "TEACHER" ? <TeacherSetupProgress /> : null}
              {children}
            </main>
        </div>
        {user.role === "TEACHER" ? <TeacherAiAgent /> : null}
        {process.env.NODE_ENV !== "production" ? <DemoRoleSwitcher currentRole={user.role} /> : null}
      </div>
    </AnimatedLayoutWrapper>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import {
  ClipboardPlus,
  LibraryBig,
  Plus,
} from "lucide-react";
import styles from "../elearning.module.css";
import { WidgetSkeleton } from "./WorkspaceWidget";
import {
  ClassroomsWidget,
  NeedsAttentionWidget,
  RecentActivityWidget,
  TeacherOverviewStats,
} from "./TeacherWorkspaceWidgets";

export function TeacherWorkspace({ user }: { user: { id: string; name: string | null; role: string } }) {
  const firstName = user.name?.trim().split(/\s+/)[0];

  return (
    <div className={`${styles.dashboardShell} ${styles.teacherWorkspace}`}>
      <div className={styles.workspaceFrame}>
        <header className={styles.workspaceHeader}>
          <div>
            <h1>{firstName ? `Welcome back, ${firstName}` : "Welcome back"}</h1>
            <p>Everything that needs your attention, across every classroom, in one place.</p>
          </div>
          <div className={styles.workspaceHeaderTools}>
            <Link href="/elearning/assignments/new" className={styles.workspaceSecondaryAction}>
              <ClipboardPlus size={17} /> Create assignment
            </Link>
            <Link href="/elearning/practice?tab=tests" className={styles.workspaceSecondaryAction}>
              <LibraryBig size={17} /> Assign test
            </Link>
            <Link href="/elearning/classrooms/new" className={styles.workspaceHeaderAction}>
              <Plus size={18} /> Create classroom
            </Link>
          </div>
        </header>

        <Suspense fallback={<WidgetSkeleton rows={1} />}>
          <TeacherOverviewStats userId={user.id} isAdmin={user.role === "ADMIN"} />
        </Suspense>

        <div className={styles.workspaceFrameBody}>
          <Suspense fallback={<WidgetSkeleton rows={5} />}>
            <ClassroomsWidget userId={user.id} isAdmin={user.role === "ADMIN"} />
          </Suspense>
          <aside className={styles.workspaceFrameRail}>
            <Suspense fallback={<WidgetSkeleton rows={3} />}>
              <NeedsAttentionWidget userId={user.id} isAdmin={user.role === "ADMIN"} />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton rows={4} />}>
              <RecentActivityWidget userId={user.id} isAdmin={user.role === "ADMIN"} />
            </Suspense>
          </aside>
        </div>
      </div>
    </div>
  );
}

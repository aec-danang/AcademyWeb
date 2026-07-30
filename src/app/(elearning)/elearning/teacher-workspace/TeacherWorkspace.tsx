import { Suspense } from "react";
import Link from "next/link";
import {
  ClipboardPlus,
  ChevronDown,
  LibraryBig,
  ListChecks,
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
            <Link href="/elearning/tasks" className={styles.workspaceSecondaryAction}>
              <ListChecks size={17} /> Open tasks
            </Link>
            <details className={styles.workspaceCreateMenu}>
              <summary><Plus size={17} /> Create <ChevronDown size={15} /></summary>
              <div>
                <Link href="/elearning/assignments/new"><ClipboardPlus size={16} /> Assignment</Link>
                <Link href="/elearning/practice/new"><LibraryBig size={16} /> Quiz</Link>
                <Link href="/elearning/classrooms/new"><Plus size={16} /> Classroom</Link>
              </div>
            </details>
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

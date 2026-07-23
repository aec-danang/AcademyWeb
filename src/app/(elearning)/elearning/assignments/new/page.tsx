import Link from "next/link";
import { ArrowLeft, FilePlus2, Route } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../../ElearningBreadcrumbs";
import { AssignmentComposer } from "../AssignmentComposer";
import styles from "../../elearning.module.css";

export const dynamic = "force-dynamic";

export default async function CreateAssignmentPage() {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  const classrooms = await prisma.classSection.findMany({
    where: user.role === "TEACHER" ? { teacherId: user.id, status: "ACTIVE" } : { status: "ACTIVE" },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className={styles.workflowPage}>
      <ElearningBreadcrumbs items={[{ label: "Assignments", href: "/elearning/assignments" }, { label: "Create assignment" }]} />
      <header className={styles.workflowHero}>
        <div><span><Route size={16} /> Teaching workflow</span><h1>Create an assignment</h1><p>Choose the classroom, define the task and decide whether students can see it now.</p></div>
        <Link href="/elearning/assignments" className="btn-secondary"><ArrowLeft size={16} /> Back to assignments</Link>
      </header>
      <div className={styles.workflowSteps} aria-label="Assignment workflow"><span>1 <em>Classroom ready</em></span><i /><strong>2 <span>Create assignment</span></strong><i /><span>3 <em>Review submissions</em></span></div>
      <section className={styles.workflowCard}>
        <div className={styles.workflowCardHeading}><span><FilePlus2 size={18} /></span><div><p>Assignment details</p><h2>What should students complete?</h2><small>Drafts remain private. Published assignments appear immediately for enrolled students.</small></div></div>
        {classrooms.length ? <AssignmentComposer classrooms={classrooms} /> : <div className={styles.workflowEmpty}><p>You need an active classroom before creating an assignment.</p><Link href="/elearning/classrooms/new" className="btn-primary">Create classroom</Link></div>}
      </section>
    </main>
  );
}

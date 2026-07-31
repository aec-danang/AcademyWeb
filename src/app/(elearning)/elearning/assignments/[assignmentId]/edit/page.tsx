import Link from "next/link";
import { ArrowLeft, FilePenLine } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../../../ElearningBreadcrumbs";
import { AssignmentComposer } from "../../AssignmentComposer";
import styles from "../../../elearning.module.css";

export const dynamic = "force-dynamic";

export default async function EditAssignmentPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  const { assignmentId } = await params;
  const [assignment, classrooms] = await Promise.all([
    prisma.assignment.findFirst({
      where: { id: assignmentId, ...(user.role === "TEACHER" ? { classSection: { teacherId: user.id } } : {}) },
    }),
    prisma.classSection.findMany({
      where: user.role === "TEACHER" ? { teacherId: user.id, status: "ACTIVE" } : { status: "ACTIVE" },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!assignment) notFound();

  return <main className={styles.workflowPage}>
    <ElearningBreadcrumbs items={[{ label: "Assignments", href: "/elearning/assignments" }, { label: "Edit assignment" }]} />
    <header className={styles.workflowHero}><div><span><FilePenLine size={16} /> Assignment settings</span><h1>Edit assignment</h1><p>Update the brief, deadline, scoring and student visibility from one place.</p></div><Link href="/elearning/assignments" className="btn-secondary"><ArrowLeft size={16} /> Back to assignments</Link></header>
    <section className={styles.workflowCard}>
      <div className={styles.workflowCardHeading}><span><FilePenLine size={18} /></span><div><p>Editing</p><h2>{assignment.title}</h2><small>Changes to a published assignment are visible to students immediately.</small></div></div>
      <AssignmentComposer classrooms={classrooms} assignment={{
        id: assignment.id,
        classSectionId: assignment.classSectionId,
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        skill: assignment.skill,
        cefrLevel: assignment.cefrLevel,
        type: assignment.type,
        difficulty: assignment.difficulty,
        maxScore: assignment.maxScore,
        category: assignment.category,
        tags: assignment.tags,
        rubric: assignment.rubric,
        dueAt: assignment.dueAt?.toISOString() || null,
        attachmentUrl: assignment.attachmentUrl,
        allowLateSubmission: assignment.allowLateSubmission,
        allowResubmission: assignment.allowResubmission,
        status: assignment.status,
      }} />
    </section>
  </main>;
}

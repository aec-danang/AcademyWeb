import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileText, Plus } from "lucide-react";
import StudentAssignmentsBoard from "./StudentAssignmentsBoard";
import { AssignmentRowActions } from "./AssignmentRowActions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../ElearningBreadcrumbs";
import styles from "../elearning.module.css";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AssignmentsPage({ searchParams }: Props) {
  const user = await requireUser();
  const query = await searchParams;
  const classroomId = typeof query.classroom === "string" ? query.classroom : undefined;
  const createdId = typeof query.created === "string" ? query.created : undefined;
  const updatedId = typeof query.updated === "string" ? query.updated : undefined;

  if (user.role !== "STUDENT") {
    const assignments = await prisma.assignment.findMany({
      where: {
        ...(user.role === "TEACHER" ? { classSection: { teacherId: user.id } } : {}),
        ...(classroomId ? { classSectionId: classroomId } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: { classSection: true, submissions: { include: { grade: true } } },
    });

    return (
      <main className={`${styles.classroomHub} ${styles.assignmentLibraryPage}`}>
        <ElearningBreadcrumbs items={[{ label: "Assignments" }]} />
        <header className={styles.workflowHero}>
          <div><span><FileText size={16} /> Teaching work</span><h1>Assignments</h1><p>Create work once, assign it to a classroom and track submissions from one compact list.</p></div>
          <Link href="/elearning/assignments/new" className="btn-primary"><Plus size={16} /> Create assignment</Link>
        </header>
        {createdId || updatedId ? <section className={styles.assignmentSuccessBanner}><span><CheckCircle2 size={20} /></span><div><strong>{createdId ? "Assignment created" : "Changes saved"}</strong><p>{createdId ? "Students can now complete the work when it is published. The next step is reviewing submissions and feedback." : "The assignment list and student view now use the updated details."}</p></div><Link href="/elearning/scores">Review submissions <ArrowRight size={16} /></Link></section> : null}
        <section className={styles.classroomSummaryGrid}><div><FileText size={20} /><strong>{assignments.length}</strong><span>Total assignments</span></div><div><CheckCircle2 size={20} /><strong>{assignments.filter((item) => item.status === "PUBLISHED").length}</strong><span>Published</span></div><div><Clock3 size={20} /><strong>{assignments.reduce((sum, item) => sum + item.submissions.filter((submission) => submission.grade?.status !== "PUBLISHED" && submission.status !== "GRADED").length, 0)}</strong><span>Waiting for review</span></div></section>
        <section className={styles.recordPanel}>
          <header><div><span className={styles.cockpitEyebrow}><FileText size={16} /> Overview</span><h2>All assignments</h2></div></header>
          {assignments.length ? <div className={styles.recordList}>
            {assignments.map((assignment) => {
              const pending = assignment.submissions.filter((item) => item.grade?.status !== "PUBLISHED" && item.status !== "GRADED").length;
              return (
                <article className={styles.recordRow} key={assignment.id}>
                  <span className={styles.recordIcon}><FileText size={19} /></span>
                  <div className={styles.recordMain}><small>{assignment.classSection.code}</small><strong><Link href={`/elearning/classrooms/${assignment.classSectionId}?tab=assignments`}>{assignment.title}</Link></strong><p>{assignment.classSection.name}</p></div>
                  <div className={styles.recordMetric}><strong>{assignment.submissions.length}</strong><span>Submitted</span></div>
                  <div className={styles.recordMetric}><strong>{pending}</strong><span>Pending</span></div>
                  <span className={`${styles.statusBadge} ${assignment.status === "PUBLISHED" ? styles.statusCompleted : styles.statusPending}`}>{assignment.status}</span>
                  <AssignmentRowActions id={assignment.id} status={assignment.status} title={assignment.title} />
                </article>
              );
            })}
          </div> : <div className={styles.libraryEmpty}><FileText size={36} /><h3>No assignments yet</h3><p>Create the first assignment for one of your classrooms.</p><Link href="/elearning/assignments/new" className="btn-primary">Create first assignment</Link></div>}
        </section>
      </main>
    );
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      status: "PUBLISHED",
      ...(classroomId ? { classSectionId: classroomId } : {}),
      classSection: { status: "ACTIVE", enrollments: { some: { userId: user.id, status: "ACTIVE" } } },
    },
    orderBy: { dueAt: "asc" },
    include: {
      classSection: true,
      submissions: { where: { studentId: user.id }, orderBy: { submittedAt: "desc" }, include: { grade: true } },
    },
  });

  return (
    <div className={styles.classroomHub}>
      <ElearningBreadcrumbs items={[{ label: "Assignments" }]} />
      <StudentAssignmentsBoard assignments={assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      difficulty: assignment.difficulty,
      skill: assignment.skill,
      cefrLevel: assignment.cefrLevel,
      maxScore: assignment.maxScore,
      rubric: assignment.rubric,
      allowLateSubmission: assignment.allowLateSubmission,
      allowResubmission: assignment.allowResubmission,
      category: assignment.category,
      tags: assignment.tags,
      instructions: assignment.instructions,
      attachmentUrl: assignment.attachmentUrl,
      attachmentName: assignment.attachmentName,
      dueAt: assignment.dueAt && assignment.dueAt.getUTCFullYear() >= 2000 && assignment.dueAt.getUTCFullYear() <= 2100 ? assignment.dueAt.toISOString() : null,
      classroomId: assignment.classSectionId,
      classCode: assignment.classSection.code,
      courseTitle: assignment.classSection.name,
      submission: assignment.submissions[0] ? {
        id: assignment.submissions[0].id,
        content: assignment.submissions[0].content,
        fileUrl: assignment.submissions[0].fileUrl,
        status: assignment.submissions[0].status,
        submittedAt: assignment.submissions[0].submittedAt.toISOString(),
        grade: assignment.submissions[0].grade ? {
          status: assignment.submissions[0].grade.status,
          score: assignment.submissions[0].grade.score,
          feedback: assignment.submissions[0].grade.feedback,
          aiStatus: assignment.submissions[0].grade.aiStatus,
          aiScore: assignment.submissions[0].grade.aiScore,
          aiFeedback: assignment.submissions[0].grade.aiFeedback,
          aiConfidence: assignment.submissions[0].grade.aiConfidence,
        } : null,
      } : null,
      }))} />
    </div>
  );
}

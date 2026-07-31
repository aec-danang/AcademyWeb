import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileText, ListChecks, PackageOpen, TimerReset } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../ElearningBreadcrumbs";
import styles from "../elearning.module.css";

export const dynamic = "force-dynamic";

const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function TeacherTasksPage() {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  const classScope = user.role === "TEACHER" ? { teacherId: user.id } : {};
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [submissions, writtenAttempts, assignmentsDue, quizzesDue, recentAttempts, draftAssignments, draftQuizzes] = await Promise.all([
    prisma.submission.findMany({
      where: {
        status: { in: ["SUBMITTED", "PENDING"] },
        assignment: { classSection: classScope },
      },
      orderBy: { submittedAt: "asc" },
      include: { student: true, assignment: { include: { classSection: true } }, grade: true },
    }),
    prisma.attempt.findMany({
      where: {
        status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
        isReviewPractice: false,
        grades: { none: { status: "PUBLISHED" } },
        answers: { some: { question: { type: { in: ["ESSAY", "SHORT_ANSWER"] } }, isCorrect: null } },
        quizDelivery: { classSection: classScope },
      },
      orderBy: { submittedAt: "asc" },
      include: { student: true, quiz: true, quizDelivery: { include: { classSection: true } } },
    }),
    prisma.assignment.findMany({
      where: {
        status: "PUBLISHED",
        dueAt: { gte: now, lte: sevenDays },
        classSection: classScope,
      },
      orderBy: { dueAt: "asc" },
      include: { classSection: true, submissions: { select: { id: true } } },
    }),
    prisma.quizDelivery.findMany({
      where: {
        status: "PUBLISHED",
        dueAt: { gte: now, lte: sevenDays },
        classSection: classScope,
      },
      orderBy: { dueAt: "asc" },
      include: { classSection: true, quiz: true, attempts: { select: { id: true } } },
    }),
    prisma.attempt.findMany({
      where: {
        status: { in: ["SUBMITTED", "AUTO_SUBMITTED", "GRADED"] },
        isReviewPractice: false,
        quizDelivery: { classSection: classScope },
      },
      orderBy: { submittedAt: "desc" },
      take: 8,
      include: { student: true, quiz: true, quizDelivery: { include: { classSection: true } } },
    }),
    prisma.assignment.findMany({
      where: {
        status: "DRAFT",
        ...(user.role === "TEACHER" ? { classSection: { teacherId: user.id } } : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: { classSection: true },
    }),
    prisma.quiz.findMany({
      where: {
        published: false,
        ...(user.role === "TEACHER"
          ? { OR: [{ createdById: user.id }, { classSection: { teacherId: user.id } }] }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      include: { classSection: true, _count: { select: { questions: true } } },
    }),
  ]);

  const pendingByClass = Array.from(submissions.reduce((groups, submission) => {
    const classroom = submission.assignment.classSection;
    const current = groups.get(classroom.id) || { classroom, submissions: [] as typeof submissions };
    current.submissions.push(submission);
    groups.set(classroom.id, current);
    return groups;
  }, new Map<string, { classroom: (typeof submissions)[number]["assignment"]["classSection"]; submissions: typeof submissions }>()).values());
  const reviewTotal = submissions.length + writtenAttempts.length;
  const deadlineTotal = assignmentsDue.length + quizzesDue.length;
  const draftTotal = draftAssignments.length + draftQuizzes.length;

  return (
    <main className={styles.classroomHub}>
      <ElearningBreadcrumbs items={[{ label: "Tasks" }]} />
      <header className={styles.workflowHero}>
        <div><span><ListChecks size={16} /> Teacher task center</span><h1>What needs your attention?</h1><p>Review work first, then check upcoming deadlines and recent quiz activity.</p></div>
        <Link href="/elearning/scores" className="btn-primary">Open review queue <ArrowRight size={16} /></Link>
      </header>
      <section className={styles.classroomSummaryGrid}>
        <div><Clock3 size={20} /><strong>{reviewTotal}</strong><span>Waiting for review</span></div>
        <div><TimerReset size={20} /><strong>{deadlineTotal}</strong><span>Due within 7 days</span></div>
        <div><CheckCircle2 size={20} /><strong>{recentAttempts.length}</strong><span>Recent quiz submissions</span></div>
        <div><PackageOpen size={20} /><strong>{draftTotal}</strong><span>Unpublished drafts</span></div>
      </section>

      <section className={styles.recordPanel}>
        <header><div><span className={styles.cockpitEyebrow}><PackageOpen size={16} /> Unpublished work</span><h2>Drafts waiting for your decision</h2></div><strong>{draftTotal}</strong></header>
        {draftTotal ? <div className={styles.recordList}>
          {draftAssignments.map((assignment) => <article className={styles.recordRow} key={`assignment-${assignment.id}`}>
            <span className={styles.recordIcon}><FileText size={19} /></span>
            <div className={styles.recordMain}><small>{assignment.classSection.code} · Assignment draft</small><strong>{assignment.title}</strong><p>Saved {dateTime.format(assignment.updatedAt)} · Students cannot see it yet</p></div>
            <Link className="btn-secondary" href={`/elearning/assignments/${assignment.id}/edit`}>Continue editing</Link>
          </article>)}
          {draftQuizzes.map((quiz) => <article className={styles.recordRow} key={`quiz-${quiz.id}`}>
            <span className={styles.recordIcon}><ListChecks size={19} /></span>
            <div className={styles.recordMain}><small>{quiz.classSection?.code || "QUIZ LIBRARY"} · Quiz draft</small><strong>{quiz.title}</strong><p>{quiz._count.questions} questions · Saved {dateTime.format(quiz.updatedAt)}</p></div>
            <Link className="btn-secondary" href={`/elearning/practice/${quiz.id}/manage`}>Continue editing</Link>
          </article>)}
        </div> : <div className={styles.libraryEmpty}><CheckCircle2 size={36} /><h3>No unpublished drafts</h3><p>Every saved assignment and quiz has already been published.</p></div>}
      </section>

      <section className={styles.recordPanel}>
        <header><div><span className={styles.cockpitEyebrow}><FileText size={16} /> Pending assignments</span><h2>Review by classroom</h2></div><strong>{submissions.length}</strong></header>
        {pendingByClass.length ? <div className={styles.recordList}>{pendingByClass.map(({ classroom, submissions: classroomSubmissions }) => (
          <article className={styles.recordRow} key={classroom.id}>
            <span className={styles.recordIcon}><FileText size={19} /></span>
            <div className={styles.recordMain}><small>{classroom.code}</small><strong>{classroom.name}</strong><p>{classroomSubmissions.slice(0, 3).map((item) => item.student.name || item.student.email || "Student").join(", ")}</p></div>
            <div className={styles.recordMetric}><strong>{classroomSubmissions.length}</strong><span>To grade</span></div>
            <Link className="btn-secondary" href={`/elearning/scores?classroom=${classroom.id}`}>Review</Link>
          </article>
        ))}</div> : <div className={styles.libraryEmpty}><CheckCircle2 size={36} /><h3>Assignment queue is clear</h3><p>New submissions will appear here automatically.</p></div>}
      </section>

      {writtenAttempts.length ? <section className={styles.recordPanel}>
        <header><div><span className={styles.cockpitEyebrow}><AlertTriangle size={16} /> Written quiz answers</span><h2>Manual review required</h2></div><strong>{writtenAttempts.length}</strong></header>
        <div className={styles.recordList}>{writtenAttempts.map((attempt) => (
          <article className={styles.recordRow} key={attempt.id}>
            <span className={styles.recordIcon}><FileText size={19} /></span>
            <div className={styles.recordMain}><small>{attempt.quizDelivery?.classSection.code || "QUIZ"}</small><strong>{attempt.quiz.title}</strong><p>{attempt.student.name || attempt.student.email || "Student"}</p></div>
            <Link className="btn-secondary" href={`/elearning/exercises/${attempt.quizId}?attempt=${attempt.id}${attempt.quizDeliveryId ? `&delivery=${attempt.quizDeliveryId}` : ""}`}>Review</Link>
          </article>
        ))}</div>
      </section> : null}

      <section className={styles.recordPanel}>
        <header><div><span className={styles.cockpitEyebrow}><TimerReset size={16} /> Deadline watch</span><h2>Due in the next 7 days</h2></div><strong>{deadlineTotal}</strong></header>
        {deadlineTotal ? <div className={styles.recordList}>
          {assignmentsDue.map((assignment) => <article className={styles.recordRow} key={assignment.id}><span className={styles.recordIcon}><FileText size={19} /></span><div className={styles.recordMain}><small>{assignment.classSection.code} · Assignment</small><strong>{assignment.title}</strong><p>{assignment.dueAt ? dateTime.format(assignment.dueAt) : "No deadline"}</p></div><div className={styles.recordMetric}><strong>{assignment.submissions.length}</strong><span>Submitted</span></div></article>)}
          {quizzesDue.map((delivery) => <article className={styles.recordRow} key={delivery.id}><span className={styles.recordIcon}><ListChecks size={19} /></span><div className={styles.recordMain}><small>{delivery.classSection.code} · Quiz</small><strong>{delivery.quiz.title}</strong><p>{delivery.dueAt ? dateTime.format(delivery.dueAt) : "No deadline"}</p></div><div className={styles.recordMetric}><strong>{delivery.attempts.length}</strong><span>Attempts</span></div></article>)}
        </div> : <div className={styles.libraryEmpty}><CheckCircle2 size={36} /><h3>No urgent deadlines</h3><p>Nothing is due in the next seven days.</p></div>}
      </section>

      <section className={styles.recordPanel}>
        <header><div><span className={styles.cockpitEyebrow}><CheckCircle2 size={16} /> Recent quiz submissions</span><h2>Latest student activity</h2></div></header>
        {recentAttempts.length ? <div className={styles.recordList}>{recentAttempts.map((attempt) => (
          <article className={styles.recordRow} key={attempt.id}><span className={styles.recordIcon}><CheckCircle2 size={19} /></span><div className={styles.recordMain}><small>{attempt.quizDelivery?.classSection.code || "QUIZ"}</small><strong>{attempt.student.name || attempt.student.email || "Student"} completed {attempt.quiz.title}</strong><p>{dateTime.format(attempt.submittedAt || attempt.startedAt)}</p></div><div className={styles.recordMetric}><strong>{attempt.score ?? "—"}</strong><span>Score</span></div></article>
        ))}</div> : <p className={styles.classroomEmpty}>No quiz submissions yet.</p>}
      </section>
    </main>
  );
}

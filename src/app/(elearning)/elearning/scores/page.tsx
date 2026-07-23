import Link from "next/link";
import { Award, CheckCircle2, ChevronDown, Clock3, FileText, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../ElearningBreadcrumbs";
import { ReviewSubmissionForm } from "./ReviewSubmissionForm";
import { AiGradeButton } from "./AiGradeButton";
import styles from "../elearning.module.css";

export const dynamic = "force-dynamic";
const formatDate = (date: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);

export default async function ScoresPage() {
  const user = await requireUser();
  const ownership = user.role === "TEACHER" ? { classSection: { teacherId: user.id } } : {};
  const teacherGradeScope = user.role === "TEACHER" ? {
    OR: [
      { assignment: { classSection: { teacherId: user.id } } },
      { quiz: { classSection: { teacherId: user.id } } },
      { attempt: { quizDelivery: { classSection: { teacherId: user.id } } } },
    ],
  } : {};

  const grades = await prisma.grade.findMany({
    where: user.role === "STUDENT" ? { studentId: user.id, status: "PUBLISHED" } : teacherGradeScope,
    orderBy: { createdAt: "desc" },
    include: { student: true, assignment: { include: { classSection: true } }, quiz: true, gradedBy: true },
  });
  const publishedGrades = grades.filter((grade) => grade.status === "PUBLISHED");
  const asPercentage = (grade: (typeof publishedGrades)[number]) => grade.assignment ? (grade.score / grade.assignment.maxScore) * 100 : grade.score;
  const average = publishedGrades.length ? publishedGrades.reduce((sum, grade) => sum + asPercentage(grade), 0) / publishedGrades.length : 0;

  if (user.role === "STUDENT") {
    return <main className={styles.classroomHub}>
      <ElearningBreadcrumbs items={[{ label: "My scores" }]} />
      <header className={styles.workflowHero}><div><span><Award size={16} /> Learning results</span><h1>My Scores & Feedback</h1><p>Review published scores and teacher feedback across assignments and quizzes.</p></div></header>
      <section className={styles.classroomSummaryGrid}><div><Award size={20} /><strong>{average ? `${average.toFixed(1)}%` : "-"}</strong><span>Average score</span></div><div><TrendingUp size={20} /><strong>{publishedGrades.length}</strong><span>Graded items</span></div></section>
      <section className={styles.recordPanel}><header><div><span className={styles.cockpitEyebrow}><CheckCircle2 size={16} /> Published</span><h2>Recent results</h2></div></header>{grades.length ? <div className={styles.scoreResultList}>{grades.map((grade) => <article key={grade.id}><div><strong>{grade.assignment?.title || grade.quiz?.title || "Manual grade"}</strong><p>{grade.assignment ? `${grade.assignment.skill} · ${grade.assignment.cefrLevel || "No CEFR"} · ` : ""}{formatDate(grade.createdAt)} · {grade.feedback || "No written feedback"}</p></div><b>{grade.assignment ? `${grade.score}/${grade.assignment.maxScore}` : grade.score}</b></article>)}</div> : <p className={styles.classroomEmpty}>No scores have been published yet.</p>}</section>
    </main>;
  }

  const pending = await prisma.submission.findMany({
    where: { status: { in: ["SUBMITTED", "PENDING"] }, assignment: ownership },
    orderBy: { submittedAt: "asc" },
    include: { student: true, grade: true, assignment: { include: { classSection: true } } },
  });
  const pendingQuizAttempts = await prisma.attempt.findMany({
    where: {
      status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
      answers: { some: { question: { type: { in: ["ESSAY", "SHORT_ANSWER"] } }, isCorrect: null } },
      ...(user.role === "TEACHER" ? { quizDelivery: { classSection: { teacherId: user.id } } } : {}),
    },
    orderBy: { submittedAt: "asc" },
    include: { student: true, quiz: true, quizDelivery: { include: { classSection: true } } },
  });

  return <main className={styles.classroomHub}>
    <ElearningBreadcrumbs items={[{ label: "Review & Scores" }]} />
    <header className={styles.workflowHero}><div><span><Award size={16} /> Assessment workflow</span><h1>Review & Scores</h1><p>Start with the queue, open only one response when you are ready to grade it.</p></div></header>
    <section className={styles.classroomSummaryGrid}><div><Clock3 size={20} /><strong>{pending.length + pendingQuizAttempts.length}</strong><span>Waiting for review</span></div><div><CheckCircle2 size={20} /><strong>{publishedGrades.length}</strong><span>Published scores</span></div><div><TrendingUp size={20} /><strong>{average ? `${average.toFixed(1)}%` : "-"}</strong><span>Average score</span></div></section>

    <section className={styles.recordPanel}>
      <header><div><span className={styles.cockpitEyebrow}><Clock3 size={16} /> Needs attention</span><h2>Review queue</h2></div><strong>{pending.length + pendingQuizAttempts.length}</strong></header>
      {pending.length || pendingQuizAttempts.length ? <div className={styles.reviewDisclosureList}>
        {pending.map((submission) => <details key={submission.id} className={styles.reviewDisclosure}>
          <summary><span className={styles.recordIcon}><FileText size={18} /></span><div><small>{submission.assignment.classSection.code} · {submission.assignment.skill}</small><strong>{submission.assignment.title}</strong><p>{submission.student.name || submission.student.email || "Student"} · {formatDate(submission.submittedAt)}</p></div><ChevronDown size={18} /></summary>
          <div className={styles.reviewDisclosureBody}><div className={styles.submissionPreview}><strong>Student response</strong><p>{submission.content || submission.fileUrl || "No written response. Check the submitted file reference."}</p>{submission.assignment.rubric ? <small>Rubric: {submission.assignment.rubric}</small> : null}</div>{submission.assignment.type === "WRITING" || submission.assignment.skill === "WRITING" ? <AiGradeButton submissionId={submission.id} /> : null}<ReviewSubmissionForm submissionId={submission.id} maxScore={submission.assignment.maxScore} defaultScore={submission.grade?.score} defaultFeedback={submission.grade?.feedback || undefined} /></div>
        </details>)}
        {pendingQuizAttempts.map((attempt) => <article key={attempt.id} className={styles.reviewQueueRow}><span className={styles.recordIcon}><FileText size={18} /></span><div><small>{attempt.quizDelivery?.classSection.code || "Test"} · Written response</small><strong>{attempt.quiz.title}</strong><p>{attempt.student.name || attempt.student.email || "Student"} · {formatDate(attempt.submittedAt || attempt.startedAt)}</p></div><Link className="btn-secondary" href={`/elearning/exercises/${attempt.quizId}?attempt=${attempt.id}${attempt.quizDeliveryId ? `&delivery=${attempt.quizDeliveryId}` : ""}`}>Review</Link></article>)}
      </div> : <div className={styles.libraryEmpty}><CheckCircle2 size={36} /><h3>Review queue is clear</h3><p>New submissions will appear here.</p></div>}
    </section>

    <section className={styles.recordPanel}><header><div><span className={styles.cockpitEyebrow}><CheckCircle2 size={16} /> Completed</span><h2>Recently published</h2></div></header>{publishedGrades.length ? <div className={styles.scoreResultList}>{publishedGrades.slice(0, 20).map((grade) => <article key={grade.id}><div><strong>{grade.student.name || grade.student.email || "Student"} · {grade.assignment?.title || grade.quiz?.title || "Assessment"}</strong><p>{grade.feedback || "No written feedback"}</p></div><b>{grade.score}</b></article>)}</div> : <p className={styles.classroomEmpty}>No scores have been published yet.</p>}</section>
  </main>;
}

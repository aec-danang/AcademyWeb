import Link from "next/link";
import {
  AlertCircle,
  Award,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  LoaderCircle,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../ElearningBreadcrumbs";
import { ReviewSubmissionForm } from "./ReviewSubmissionForm";
import { AiGradeButton } from "./AiGradeButton";
import { ScoreFilters } from "./ScoreFilters";
import styles from "../elearning.module.css";

export const dynamic = "force-dynamic";

const formatDate = (date: Date) => new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}).format(date);

type AiRubricRow = {
  criterion: string;
  score: number;
  maxScore?: number;
  comment: string;
};

function aiRubricRows(value: unknown): AiRubricRow[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is AiRubricRow => (
    Boolean(item)
    && typeof item === "object"
    && typeof (item as AiRubricRow).criterion === "string"
    && typeof (item as AiRubricRow).score === "number"
    && typeof (item as AiRubricRow).comment === "string"
  ));
}

type ScoresPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function ScoresPage({ searchParams }: ScoresPageProps) {
  const user = await requireUser();
  const query = await searchParams;
  const selectedClassroom = queryValue(query?.classroom);
  const selectedStudent = queryValue(query?.student);
  const searchTerm = queryValue(query?.q).trim().toLowerCase();
  const ownership = user.role === "TEACHER" ? { classSection: { teacherId: user.id } } : {};
  const teacherGradeScope = user.role === "TEACHER" ? {
    OR: [
      { assignment: { classSection: { teacherId: user.id } } },
      { quiz: { classSection: { teacherId: user.id } } },
      { attempt: { quizDelivery: { classSection: { teacherId: user.id } } } },
    ],
  } : {};

  const allGrades = await prisma.grade.findMany({
    where: user.role === "STUDENT" ? { studentId: user.id, status: "PUBLISHED" } : teacherGradeScope,
    orderBy: { createdAt: "desc" },
    include: { student: true, assignment: { include: { classSection: true } }, quiz: { include: { classSection: true } }, attempt: { include: { quizDelivery: true } }, gradedBy: true },
  });
  const grades = allGrades.filter((grade) => {
    if (selectedStudent && grade.studentId !== selectedStudent) return false;
    const classroomId = grade.assignment?.classSectionId
      || grade.quiz?.classSectionId
      || grade.attempt?.quizDelivery?.classSectionId;
    if (selectedClassroom && classroomId !== selectedClassroom) return false;
    if (searchTerm && ![
      grade.student.name,
      grade.student.email,
      grade.assignment?.title,
      grade.assignment?.classSection.name,
      grade.assignment?.classSection.code,
      grade.quiz?.title,
      grade.quiz?.classSection?.name,
      grade.quiz?.classSection?.code,
    ].filter(Boolean).join(" ").toLowerCase().includes(searchTerm)) return false;
    return true;
  });
  const publishedGrades = grades.filter((grade): grade is (typeof grades)[number] & { score: number } => (
    grade.status === "PUBLISHED" && typeof grade.score === "number"
  ));
  const asPercentage = (grade: (typeof publishedGrades)[number]) => (
    grade.assignment ? (grade.score / grade.assignment.maxScore) * 100 : grade.score
  );
  const average = publishedGrades.length
    ? publishedGrades.reduce((sum, grade) => sum + asPercentage(grade), 0) / publishedGrades.length
    : 0;

  if (user.role === "STUDENT") {
    const assignmentGrades = publishedGrades.filter((grade) => Boolean(grade.assignment));
    const quizGrades = publishedGrades.filter((grade) => Boolean(grade.quiz));
    return (
      <main className={styles.classroomHub}>
        <ElearningBreadcrumbs items={[{ label: "My scores" }]} />
        <header className={styles.workflowHero}>
          <div><span><Award size={16} /> Learning results</span><h1>My Scores & Feedback</h1><p>Review scores and feedback published by your teacher.</p></div>
        </header>
        <section className={styles.classroomSummaryGrid}>
          <div><Award size={20} /><strong>{average ? `${average.toFixed(1)}%` : "-"}</strong><span>Average score</span></div>
          <div><TrendingUp size={20} /><strong>{publishedGrades.length}</strong><span>Graded items</span></div>
        </section>
        <section className={styles.recordPanel}>
          <header><div><span className={styles.cockpitEyebrow}><CheckCircle2 size={16} /> Quizzes</span><h2>Quiz results</h2></div></header>
          {quizGrades.length ? <div className={styles.scoreResultList}>{quizGrades.map((grade) => (
            <article key={grade.id}><div><strong>{grade.quiz?.title || "Quiz"}</strong><p>{formatDate(grade.createdAt)} · {grade.feedback || "No written feedback"}</p></div><b>{grade.score}</b></article>
          ))}</div> : <p className={styles.classroomEmpty}>No quiz results have been published yet.</p>}
        </section>
        <section className={styles.recordPanel}>
          <header><div><span className={styles.cockpitEyebrow}><FileText size={16} /> Assignments</span><h2>Assignment results</h2></div></header>
          {assignmentGrades.length ? <div className={styles.scoreResultList}>{assignmentGrades.map((grade) => (
            <article key={grade.id}><div><strong>{grade.assignment?.title || "Assignment"}</strong><p>{grade.assignment?.skill} · {grade.assignment?.cefrLevel || "No CEFR"} · {formatDate(grade.createdAt)} · {grade.feedback || "No written feedback"}</p></div><b>{grade.score}/{grade.assignment?.maxScore}</b></article>
          ))}</div> : <p className={styles.classroomEmpty}>No assignment results have been published yet.</p>}
        </section>
      </main>
    );
  }

  const pendingAll = await prisma.submission.findMany({
    where: { status: { in: ["SUBMITTED", "PENDING"] }, assignment: ownership },
    orderBy: { submittedAt: "asc" },
    include: { student: true, grade: true, assignment: { include: { classSection: true } } },
  });
  const pendingQuizAttemptsAll = await prisma.attempt.findMany({
    where: {
      status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
      isReviewPractice: false,
      answers: { some: { question: { type: { in: ["ESSAY", "SHORT_ANSWER"] } }, isCorrect: null } },
      ...(user.role === "TEACHER" ? { quizDelivery: { classSection: { teacherId: user.id } } } : {}),
    },
    orderBy: { submittedAt: "asc" },
    include: { student: true, quiz: true, quizDelivery: { include: { classSection: true } } },
  });
  const pending = pendingAll.filter((submission) => (
    (!selectedClassroom || submission.assignment.classSectionId === selectedClassroom)
    && (!selectedStudent || submission.studentId === selectedStudent)
    && (!searchTerm || [
      submission.student.name,
      submission.student.email,
      submission.assignment.title,
      submission.assignment.classSection.name,
      submission.assignment.classSection.code,
    ].filter(Boolean).join(" ").toLowerCase().includes(searchTerm))
  ));
  const pendingQuizAttempts = pendingQuizAttemptsAll.filter((attempt) => (
    (!selectedClassroom || attempt.quizDelivery?.classSectionId === selectedClassroom)
    && (!selectedStudent || attempt.studentId === selectedStudent)
    && (!searchTerm || [
      attempt.student.name,
      attempt.student.email,
      attempt.quiz.title,
      attempt.quizDelivery?.classSection.name,
      attempt.quizDelivery?.classSection.code,
    ].filter(Boolean).join(" ").toLowerCase().includes(searchTerm))
  ));
  const classrooms = await prisma.classSection.findMany({
    where: user.role === "TEACHER" ? { teacherId: user.id } : {},
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
      enrollments: {
        where: { status: "ACTIVE" },
        select: { student: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  const students = Array.from(new Map(
    classrooms.flatMap((classroom) => classroom.enrollments.map(({ student }) => [student.id, student] as const)),
  ).values()).sort((a, b) => (a.name || a.email || "").localeCompare(b.name || b.email || ""));

  return (
    <main className={styles.classroomHub}>
      <ElearningBreadcrumbs items={[{ label: "Review & Scores" }]} />
      <header className={styles.workflowHero}>
        <div><span><Award size={16} /> Assessment workflow</span><h1>Review & Scores</h1><p>AI prepares a first pass for Writing; the teacher publishes the official result.</p></div>
      </header>
      <section className={styles.classroomSummaryGrid}>
        <div><Clock3 size={20} /><strong>{pending.length + pendingQuizAttempts.length}</strong><span>Waiting for review</span></div>
        <div><CheckCircle2 size={20} /><strong>{publishedGrades.length}</strong><span>Published scores</span></div>
        <div><TrendingUp size={20} /><strong>{average ? `${average.toFixed(1)}%` : "-"}</strong><span>Average score</span></div>
      </section>
      <ScoreFilters
        q={queryValue(query?.q)}
        classroom={selectedClassroom}
        student={selectedStudent}
        classrooms={classrooms.map((classroom) => ({ id: classroom.id, label: `${classroom.name} (${classroom.code})` }))}
        students={students.map((student) => ({ id: student.id, label: student.name || student.email || "Student" }))}
      />

      <section className={styles.recordPanel}>
        <header><div><span className={styles.cockpitEyebrow}><Clock3 size={16} /> Needs attention</span><h2>Review queue</h2></div><strong>{pending.length + pendingQuizAttempts.length}</strong></header>
        {pending.length || pendingQuizAttempts.length ? (
          <div className={styles.reviewDisclosureList}>
            {pending.map((submission) => {
              const isWriting = submission.assignment.type === "WRITING" || submission.assignment.skill === "WRITING";
              const rubric = aiRubricRows(submission.grade?.aiRubric);
              const aiStatus = submission.grade?.aiStatus || "NOT_REQUESTED";
              const teacherHasDraft = Boolean(submission.grade?.gradedById);

              return (
                <details key={submission.id} className={styles.reviewDisclosure}>
                  <summary>
                    <span className={styles.recordIcon}><FileText size={18} /></span>
                    <div>
                      <small>{submission.assignment.classSection.code} · {submission.assignment.skill}</small>
                      <strong>{submission.assignment.title}</strong>
                      <p>{submission.student.name || submission.student.email || "Student"} · {formatDate(submission.submittedAt)}</p>
                    </div>
                    <ChevronDown size={18} />
                  </summary>
                  <div className={styles.reviewDisclosureBody}>
                    <div className={styles.submissionPreview}>
                      <strong>Student response</strong>
                      <p>{submission.content || submission.fileUrl || "No written response. Check the submitted file reference."}</p>
                      {submission.assignment.rubric ? <small>Teacher rubric: {submission.assignment.rubric}</small> : null}
                    </div>

                    {isWriting ? (
                      <section className={`${styles.aiSuggestionPanel} ${styles[`aiSuggestion${aiStatus}`] || ""}`}>
                        <header>
                          <div>
                            <span><Bot size={16} /> AI first pass</span>
                            <h3>{aiStatus === "COMPLETED" ? "Suggestion ready" : aiStatus === "PENDING" ? "Analyzing the response" : "No AI suggestion yet"}</h3>
                          </div>
                          {aiStatus === "COMPLETED" && typeof submission.grade?.aiScore === "number" ? (
                            <strong>{submission.grade.aiScore}/{submission.assignment.maxScore}</strong>
                          ) : aiStatus === "PENDING" ? <LoaderCircle className={styles.spinner} size={22} /> : <AlertCircle size={22} />}
                        </header>
                        {aiStatus === "COMPLETED" ? (
                          <>
                            <p className={styles.aiAdvisory}>Advisory only · Confidence {Math.round((submission.grade?.aiConfidence || 0) * 100)}% · {submission.grade?.aiModel || "AI model"}</p>
                            {rubric.length ? (
                              <div className={styles.aiRubricGrid}>
                                {rubric.map((item) => (
                                  <article key={item.criterion}>
                                    <div><strong>{item.criterion}</strong><b>{item.score}{typeof item.maxScore === "number" ? `/${item.maxScore}` : ""}</b></div>
                                    <p>{item.comment}</p>
                                  </article>
                                ))}
                              </div>
                            ) : null}
                            {submission.grade?.aiFeedback ? <p className={styles.aiFeedback}>{submission.grade.aiFeedback}</p> : null}
                          </>
                        ) : (
                          <p className={styles.aiAdvisory}>{aiStatus === "PENDING" ? "The submission is safe; AI runs after the upload finishes." : submission.grade?.aiError || "The teacher can grade manually or retry AI."}</p>
                        )}
                        <AiGradeButton submissionId={submission.id} />
                      </section>
                    ) : null}

                    <ReviewSubmissionForm
                      submissionId={submission.id}
                      maxScore={submission.assignment.maxScore}
                      defaultScore={teacherHasDraft ? submission.grade?.score : null}
                      defaultFeedback={teacherHasDraft ? submission.grade?.feedback || undefined : undefined}
                      aiScore={submission.grade?.aiScore}
                      aiFeedback={submission.grade?.aiFeedback}
                    />
                  </div>
                </details>
              );
            })}
            {pendingQuizAttempts.map((attempt) => (
              <article key={attempt.id} className={styles.reviewQueueRow}>
                <span className={styles.recordIcon}><FileText size={18} /></span>
                <div><small>{attempt.quizDelivery?.classSection.code || "Test"} · Written response</small><strong>{attempt.quiz.title}</strong><p>{attempt.student.name || attempt.student.email || "Student"} · {formatDate(attempt.submittedAt || attempt.startedAt)}</p></div>
                <Link className="btn-secondary" href={`/elearning/exercises/${attempt.quizId}?attempt=${attempt.id}${attempt.quizDeliveryId ? `&delivery=${attempt.quizDeliveryId}` : ""}`}>Review</Link>
              </article>
            ))}
          </div>
        ) : <div className={styles.libraryEmpty}><CheckCircle2 size={36} /><h3>Review queue is clear</h3><p>New submissions will appear here.</p></div>}
      </section>

      <section className={styles.recordPanel}>
        <header><div><span className={styles.cockpitEyebrow}><CheckCircle2 size={16} /> Completed</span><h2>Recently published</h2></div></header>
        {publishedGrades.length ? (
          <div className={styles.scoreResultList}>
            {publishedGrades.slice(0, 20).map((grade) => (
              <article key={grade.id}>
                <div><strong>{grade.student.name || grade.student.email || "Student"} · {grade.assignment?.title || grade.quiz?.title || "Assessment"}</strong><p>{grade.feedback || "No written feedback"}</p></div>
                <b>{grade.score}</b>
              </article>
            ))}
          </div>
        ) : <p className={styles.classroomEmpty}>No scores have been published yet.</p>}
      </section>
    </main>
  );
}

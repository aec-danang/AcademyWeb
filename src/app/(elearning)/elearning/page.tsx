import Link from "next/link";
import styles from "./elearning.module.css";
import {
  Activity,
  ArrowRight,
  Award,
    CheckCircle2,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  ListTodo,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { TeacherWorkspace } from "./teacher-workspace/TeacherWorkspace";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: Date | null | undefined) {
  if (!value) return "No deadline";
  return dateFormatter.format(value);
}

function formatDateTime(value: Date | null | undefined) {
  if (!value) return "Not submitted";
  return dateTimeFormatter.format(value);
}

function scoreLabel(value: number | null | undefined) {
  return typeof value === "number" ? value.toFixed(value % 1 === 0 ? 0 : 1) : "Pending";
}

function scoreTone(score: number | null) {
  if (score === null) return "Pending review";
  if (score >= 8) return "Excellent";
  if (score >= 6.5) return "On track";
  return "Needs practice";
}

export default async function ElearningDashboard() {
  const user = await requireUser();
  const isStudent = user.role === "STUDENT";

  if (!isStudent) {
    return <TeacherWorkspace user={{ id: user.id, name: user.name, role: user.role }} />;
  }

  if (isStudent) {
    const [
      assignments,
      quizzes,
      practiceTests,
      recentAttempts,
      grades,
      recentSubmissions,
    ] = await Promise.all([
      prisma.assignment.findMany({
        where: {
          status: "PUBLISHED",
          classSection: { status: "ACTIVE", enrollments: { some: { userId: user.id, status: "ACTIVE" } } },
        },
        orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
        include: {
          classSection: true,
          submissions: {
            where: { studentId: user.id },
            orderBy: { submittedAt: "desc" },
          },
        },
      }),
      prisma.quiz.findMany({
        where: {
          isPracticeTest: false,
          published: true,
          OR: [
            { isOpenQuiz: true },
            { classSection: { status: "ACTIVE", enrollments: { some: { userId: user.id, status: "ACTIVE" } } } },
            { deliveries: { some: { status: "PUBLISHED", classSection: { status: "ACTIVE", enrollments: { some: { userId: user.id, status: "ACTIVE" } } } } } },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: {
          program: true,
          classSection: true,
          questions: true,
          deliveries: {
            where: { status: "PUBLISHED", classSection: { status: "ACTIVE", enrollments: { some: { userId: user.id, status: "ACTIVE" } } } },
            orderBy: { dueAt: "asc" },
          },
          attempts: {
            where: { studentId: user.id, isReviewPractice: false },
            orderBy: { startedAt: "desc" },
          },
        },
      }),
      prisma.quiz.findMany({
        where: {
          isPracticeTest: true,
          published: true,
          deliveries: { some: { status: "PUBLISHED", classSection: { status: "ACTIVE", enrollments: { some: { userId: user.id, status: "ACTIVE" } } } } },
        },
        orderBy: { createdAt: "desc" },
        include: {
          classSection: true,
          questions: true,
          deliveries: {
            where: { status: "PUBLISHED", classSection: { status: "ACTIVE", enrollments: { some: { userId: user.id, status: "ACTIVE" } } } },
            orderBy: { dueAt: "asc" },
          },
          attempts: {
            where: { studentId: user.id, isReviewPractice: false },
            orderBy: { startedAt: "desc" },
          },
        },
      }),
      prisma.attempt.findMany({
        where: { studentId: user.id, isReviewPractice: false },
        orderBy: { startedAt: "desc" },
        take: 6,
        include: {
          quiz: {
            include: {
              program: true,
              classSection: true,
            },
          },
        },
      }),
      prisma.grade.findMany({
        where: { studentId: user.id, status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          assignment: true,
          quiz: true,
          gradedBy: true,
        },
      }),
      prisma.submission.findMany({
        where: { studentId: user.id },
        orderBy: { submittedAt: "desc" },
        take: 5,
        include: {
          assignment: {
            include: {
              classSection: true,
            },
          },
        },
      }),
    ]);

    const pendingAssignments = assignments
      .filter((assignment) => assignment.submissions.length === 0)
      .sort((a, b) => {
        const dueA = a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const dueB = b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return dueA - dueB || b.createdAt.getTime() - a.createdAt.getTime();
      });
    const submittedAssignments = assignments.length - pendingAssignments.length;
    const completedQuizzes = quizzes.filter((quiz) => quiz.attempts.some((attempt) => attempt.status !== "IN_PROGRESS")).length;
    const completedPracticeTests = practiceTests.filter((test) => test.attempts.some((attempt) => attempt.status !== "IN_PROGRESS")).length;
    const pendingQuizCount = quizzes.filter((quiz) => quiz.attempts.length === 0).length;
    const pendingPracticeTestCount = practiceTests.filter((test) => test.attempts.length === 0).length;
    const pendingLearningCount = pendingAssignments.length + pendingQuizCount + pendingPracticeTestCount;
    const availableQuizCount = quizzes.length + practiceTests.length;
    const finishedLearningItems = submittedAssignments + completedQuizzes + completedPracticeTests;
    const totalLearningItems = assignments.length + availableQuizCount;
    const overallProgress = totalLearningItems ? Math.round((finishedLearningItems / totalLearningItems) * 100) : 0;
    const averageScore = grades.length ? grades.reduce((sum, grade) => sum + (grade.score ?? 0), 0) / grades.length : null;

    const firstInProgressAttempt = recentAttempts.find((attempt) => attempt.status === "IN_PROGRESS");
    const pendingItems = [
      ...pendingAssignments.map((assignment) => ({
        kind: "assignment" as const,
        dueAt: assignment.dueAt,
        href: "/elearning/assignments",
        title: assignment.title,
        meta: `${assignment.classSection.code} | ${assignment.dueAt ? `Due ${formatDate(assignment.dueAt)}` : "No deadline"}`,
        icon: <ListTodo size={22} />,
      })),
      ...quizzes.filter((quiz) => quiz.attempts.length === 0).map((quiz) => ({
        kind: "quiz" as const,
        dueAt: quiz.deliveries[0]?.dueAt || null,
        href: `/elearning/exercises/${quiz.id}${quiz.deliveries[0] ? `?delivery=${quiz.deliveries[0].id}` : ""}`,
        title: quiz.title,
        meta: `${quiz.program?.code || "General"} | ${quiz.questions.length} questions${quiz.deliveries[0]?.dueAt ? ` | Due ${formatDate(quiz.deliveries[0].dueAt)}` : ""}`,
        icon: <ClipboardList size={22} />,
      })),
      ...practiceTests.filter((test) => test.attempts.length === 0).map((test) => ({
        kind: "quiz" as const,
        dueAt: test.deliveries[0]?.dueAt || null,
        href: `/elearning/exercises/${test.id}${test.deliveries[0] ? `?delivery=${test.deliveries[0].id}` : ""}`,
        title: test.title,
        meta: `${test.examType} | ${test.skill}${test.deliveries[0]?.dueAt ? ` | Due ${formatDate(test.deliveries[0].dueAt)}` : ""}`,
        icon: <FileCheck2 size={22} />,
      })),
    ].sort((a, b) => (a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER));
    const nextPendingItem = pendingItems[0];
    const continueLearning = firstInProgressAttempt
      ? {
          href: firstInProgressAttempt.quiz.isPracticeTest
            ? `/elearning/exercises/${firstInProgressAttempt.quiz.id}?attempt=${firstInProgressAttempt.id}`
            : `/elearning/exercises/${firstInProgressAttempt.quiz.id}`,
          eyebrow: "Continue attempt",
          title: firstInProgressAttempt.quiz.title,
          meta: `${firstInProgressAttempt.quiz.classSection?.code || "Open practice"} | Started ${formatDateTime(firstInProgressAttempt.startedAt)}`,
          action: "Resume now",
          icon: <PlayCircle size={22} />,
        }
      : nextPendingItem
        ? {
            href: nextPendingItem.href,
            eyebrow: "Next up",
            title: nextPendingItem.title,
            meta: `${nextPendingItem.meta}${pendingItems.length > 1 ? ` | +${pendingItems.length - 1} more assignments & quizzes` : ""}`,
            action: nextPendingItem.kind === "assignment" ? "Open assignment" : "Start quiz",
            icon: nextPendingItem.icon,
          }
        : {
                  href: "/elearning/classrooms",
                  eyebrow: "No active task",
                  title: "Check your classrooms",
                  meta: "Assignments and quizzes will appear as your teacher publishes them.",
                  action: "Open classrooms",
                  icon: <GraduationCap size={22} />,
          };

    const taskCards = [
      ...pendingAssignments.slice(0, 4).map((assignment) => ({
        key: `assignment-${assignment.id}`,
        href: "/elearning/assignments",
        title: assignment.title,
        meta: `${assignment.classSection.code} | ${assignment.classSection.name}`,
        due: assignment.dueAt ? `Due ${formatDateTime(assignment.dueAt)}` : "No deadline",
        badge: "Assignment",
        icon: <ListTodo size={18} />,
      })),
      ...quizzes.filter((quiz) => quiz.attempts.length === 0).slice(0, 3).map((quiz) => ({
        key: `quiz-${quiz.id}`,
        href: `/elearning/exercises/${quiz.id}`,
        title: quiz.title,
        meta: `${quiz.program?.code || "General"} | ${quiz.classSection?.code || "Open quiz"}`,
        due: quiz.timeLimit ? `${quiz.timeLimit} min` : "No time limit",
        badge: "Quiz",
        icon: <ClipboardList size={18} />,
      })),
      ...practiceTests.filter((test) => test.attempts.length === 0).slice(0, 3).map((test) => ({
        key: `test-${test.id}`,
        href: `/elearning/exercises/${test.id}`,
        title: test.title,
        meta: `${test.examType} | ${test.skill}`,
        due: test.timeLimit ? `${test.timeLimit} min` : "Quiz",
        badge: "Practice",
        icon: <FileCheck2 size={18} />,
      })),
    ].slice(0, 6);

    const timeline = [
      ...recentAttempts.map((attempt) => ({
        key: `attempt-${attempt.id}`,
        date: attempt.submittedAt || attempt.startedAt,
        title: attempt.status === "IN_PROGRESS" ? "Started quiz" : "Completed quiz",
        detail: `${attempt.quiz.title} | ${scoreLabel(attempt.score)}`,
        href: `/elearning/exercises/${attempt.quizId}?attempt=${attempt.id}`,
        icon: <ClipboardList size={16} />,
      })),
      ...recentSubmissions.map((submission) => ({
        key: `submission-${submission.id}`,
        date: submission.submittedAt,
        title: "Submitted assignment",
        detail: `${submission.assignment.title} | ${submission.assignment.classSection.code}`,
        href: "/elearning/assignments",
        icon: <CheckCircle2 size={16} />,
      })),
      ...grades.map((grade) => ({
        key: `grade-${grade.id}`,
        date: grade.createdAt,
        title: "New grade posted",
        detail: `${grade.assignment?.title || grade.quiz?.title || "Grade"} | ${scoreLabel(grade.score ?? 0)}`,
        href: "/elearning/scores",
        icon: <Award size={16} />,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);

    const studentActions = [
      {
        href: "/elearning/practice",
        title: "Practice library",
        detail: `${availableQuizCount} quizzes available`,
        icon: <ClipboardList size={20} />,
      },
      {
        href: "/elearning/scores",
        title: "Scores",
        detail: averageScore === null ? "Waiting for first grade" : `${averageScore.toFixed(1)} average`,
        icon: <Trophy size={20} />,
      },
    ];

    const latestGrade = grades[0];
    return (
      <div className={styles.dashboardShell}>
        <section className={styles.dashboardHero}>
          <div className={styles.dashboardHeroCopy}>
            <span className={styles.cockpitEyebrow}><Sparkles size={16} /> Student dashboard</span>
            <h1>{user.name || "Student"}, start with one thing.</h1>
            <p>Your dashboard now prioritizes the next useful action, then keeps progress and recent feedback close by.</p>
          </div>
          <Link href={continueLearning.href} className={styles.dashboardPrimaryAction}>
            <div className={styles.dashboardActionIcon}>{continueLearning.icon}</div>
            <span>{continueLearning.eyebrow}</span>
            <strong>{continueLearning.title}</strong>
            <p>{continueLearning.meta}</p>
            <em>{continueLearning.action} <ArrowRight size={16} /></em>
          </Link>
        </section>

        <section className={styles.dashboardStats} aria-label="Learning status">
          <div>
            <span>Progress</span>
            <strong>{overallProgress}%</strong>
            <p>{finishedLearningItems}/{totalLearningItems || 0} done</p>
          </div>
          <div>
            <span>Pending</span>
            <strong>{pendingLearningCount}</strong>
            <p>Assignments and quizzes</p>
          </div>
          <div>
            <span>Average</span>
            <strong>{averageScore === null ? "-" : averageScore.toFixed(1)}</strong>
            <p>{averageScore === null ? "No scores yet" : scoreTone(averageScore)}</p>
          </div>
        </section>

        <section className={styles.actionHub} aria-label="Quick actions">
          {studentActions.map((action) => (
            <Link href={action.href} className={styles.actionHubItem} key={action.title}>
              <div>{action.icon}</div>
              <strong>{action.title}</strong>
              <p>{action.detail}</p>
              <ArrowRight size={16} />
            </Link>
          ))}
          <Link href="/elearning/scores" className={`${styles.actionHubItem} ${styles.snapshotHubItem}`}>
            <span
              className={styles.snapshotMiniRing}
              style={{ background: `conic-gradient(#10b981 ${overallProgress * 3.6}deg, #e2e8f0 0deg)` }}
            >
              <b>{overallProgress}%</b>
            </span>
            <span className={styles.snapshotHubCopy}>
              <small><Target size={13} /> Snapshot</small>
              <strong>{latestGrade ? scoreLabel(latestGrade.score ?? 0) : "No grade yet"}</strong>
              <p>{latestGrade?.assignment?.title || latestGrade?.quiz?.title || "Complete a task to start your progress pulse."}</p>
            </span>
            <ArrowRight size={16} />
          </Link>
        </section>

        <section className={`${styles.dashboardPanel} ${styles.attentionPanel}`}>
            <div className={styles.dashboardPanelHeader}>
              <div>
                <span className={styles.cockpitEyebrow}><ListTodo size={16} /> Needs attention</span>
                <h2>Do next</h2>
              </div>
              <Link href="/elearning/practice">Open practice</Link>
            </div>
            {taskCards.length > 0 ? (
              <div className={styles.focusList}>
                {taskCards.slice(0, 5).map((task) => (
                  <Link href={task.href} key={task.key} className={styles.focusItem}>
                    <div className={styles.taskIcon}>{task.icon}</div>
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.meta}</p>
                    </div>
                    <span>{task.due}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyStateInline}>
                <CheckCircle2 size={32} />
                <p>You are caught up. New work will appear here when it is published.</p>
              </div>
            )}
        </section>

        <section className={styles.dashboardPanel}>
          <div className={styles.dashboardPanelHeader}>
            <div>
              <span className={styles.cockpitEyebrow}><Activity size={16} /> Recent movement</span>
              <h2>Activity</h2>
            </div>
          </div>
          {timeline.length > 0 ? (
            <div className={styles.timelineList}>
              {timeline.slice(0, 5).map((item) => (
                <Link href={item.href} key={item.key} className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>{item.icon}</div>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <time>{formatDateTime(item.date)}</time>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyStateInline}>
              <Activity size={32} />
              <p>Your quiz attempts, submissions, and new grades will appear here.</p>
            </div>
          )}
        </section>
      </div>
    );
  }

}

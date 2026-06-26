import Link from "next/link";
import styles from "./elearning.module.css";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  LineChart,
  ListTodo,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

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

function buildChartPath(points: { score: number }[]) {
  if (points.length === 0) return { line: "", dots: [], maxScore: 0 };

  const maxScore = Math.max(10, ...points.map((point) => point.score));
  const dots = points.map((point, index) => {
    const x = points.length === 1 ? 180 : 24 + (index * 312) / (points.length - 1);
    const y = 126 - (Math.max(0, point.score) / maxScore) * 92;
    return { x, y, score: point.score };
  });

  return {
    line: dots.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" "),
    dots,
    maxScore,
  };
}

export default async function ElearningDashboard() {
  const user = await requireUser();
  const isStudent = user.role === "STUDENT";
  const classWhere = user.role === "TEACHER" ? { teacherId: user.id } : {};

  if (isStudent) {
    const [
      enrollments,
      assignments,
      quizzes,
      practiceTests,
      recentAttempts,
      grades,
      recentSubmissions,
    ] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        include: {
          classSection: {
            include: {
              course: {
                include: {
                  lessons: {
                    where: { published: true },
                    orderBy: { order: "asc" },
                    take: 3,
                  },
                },
              },
              teacher: true,
            },
          },
        },
      }),
      prisma.assignment.findMany({
        where: {
          status: "PUBLISHED",
          classSection: { enrollments: { some: { userId: user.id, status: "ACTIVE" } } },
        },
        orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
        include: {
          classSection: { include: { course: true } },
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
            { classSection: { enrollments: { some: { userId: user.id, status: "ACTIVE" } } } },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: {
          program: true,
          classSection: { include: { course: true } },
          questions: true,
          attempts: {
            where: { studentId: user.id },
            orderBy: { startedAt: "desc" },
          },
        },
      }),
      prisma.quiz.findMany({
        where: {
          isPracticeTest: true,
          published: true,
          classSection: { enrollments: { some: { userId: user.id, status: "ACTIVE" } } },
        },
        orderBy: { createdAt: "desc" },
        include: {
          classSection: { include: { course: true } },
          questions: true,
          attempts: {
            where: { studentId: user.id },
            orderBy: { startedAt: "desc" },
          },
        },
      }),
      prisma.attempt.findMany({
        where: { studentId: user.id },
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
        where: { studentId: user.id },
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

    const pendingAssignments = assignments.filter((assignment) => assignment.submissions.length === 0);
    const submittedAssignments = assignments.length - pendingAssignments.length;
    const completedQuizzes = quizzes.filter((quiz) => quiz.attempts.some((attempt) => attempt.status !== "IN_PROGRESS")).length;
    const completedPracticeTests = practiceTests.filter((test) => test.attempts.some((attempt) => attempt.status !== "IN_PROGRESS")).length;
    const availableQuizCount = quizzes.length + practiceTests.length;
    const finishedLearningItems = submittedAssignments + completedQuizzes + completedPracticeTests;
    const totalLearningItems = assignments.length + availableQuizCount;
    const overallProgress = totalLearningItems ? Math.round((finishedLearningItems / totalLearningItems) * 100) : 0;
    const averageScore = grades.length ? grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length : null;

    const gradedAttemptIds = new Set(grades.map((grade) => grade.attemptId).filter(Boolean));
    const attemptScorePoints = recentAttempts
      .filter((attempt) => typeof attempt.score === "number" && !gradedAttemptIds.has(attempt.id))
      .map((attempt) => ({
        label: attempt.quiz.title,
        date: attempt.submittedAt || attempt.startedAt,
        score: attempt.score || 0,
      }));
    const gradeScorePoints = grades.map((grade) => ({
      label: grade.assignment?.title || grade.quiz?.title || "Grade",
      date: grade.createdAt,
      score: grade.score,
    }));
    const scoreSeries = [...gradeScorePoints, ...attemptScorePoints]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-8);
    const chart = buildChartPath(scoreSeries);

    const firstInProgressAttempt = recentAttempts.find((attempt) => attempt.status === "IN_PROGRESS");
    const nextQuiz = quizzes.find((quiz) => quiz.attempts.length === 0);
    const nextPracticeTest = practiceTests.find((test) => test.attempts.length === 0);
    const nextLesson = enrollments.flatMap((enrollment) => enrollment.classSection.course.lessons)[0];
    const continueLearning = firstInProgressAttempt
      ? {
          href: firstInProgressAttempt.quiz.isPracticeTest
            ? `/elearning/tests/${firstInProgressAttempt.quiz.id}?attempt=${firstInProgressAttempt.id}`
            : `/elearning/exercises/${firstInProgressAttempt.quiz.id}`,
          eyebrow: "Continue attempt",
          title: firstInProgressAttempt.quiz.title,
          meta: `${firstInProgressAttempt.quiz.classSection.code} | Started ${formatDateTime(firstInProgressAttempt.startedAt)}`,
          action: "Resume now",
          icon: <PlayCircle size={22} />,
        }
      : pendingAssignments[0]
        ? {
            href: "/elearning/assignments",
            eyebrow: "Next assignment",
            title: pendingAssignments[0].title,
            meta: `${pendingAssignments[0].classSection.code} | Due ${formatDate(pendingAssignments[0].dueAt)}`,
            action: "Open assignments",
            icon: <ListTodo size={22} />,
          }
        : nextQuiz
          ? {
              href: `/elearning/exercises/${nextQuiz.id}`,
              eyebrow: "Next quiz",
              title: nextQuiz.title,
              meta: `${nextQuiz.program?.code || "General"} | ${nextQuiz.questions.length} questions`,
              action: "Start quiz",
              icon: <ClipboardList size={22} />,
            }
          : nextPracticeTest
            ? {
                href: `/elearning/tests/${nextPracticeTest.id}`,
                eyebrow: "Next practice test",
                title: nextPracticeTest.title,
                meta: `${nextPracticeTest.examType} | ${nextPracticeTest.skill} | ${nextPracticeTest.questions.length} questions`,
                action: "Start test",
                icon: <FileCheck2 size={22} />,
              }
            : nextLesson
              ? {
                  href: `/elearning/learn/${nextLesson.id}`,
                  eyebrow: "Next lesson",
                  title: nextLesson.title,
                  meta: "Keep your course momentum going",
                  action: "Open lesson",
                  icon: <GraduationCap size={22} />,
                }
              : {
                  href: "/elearning/courses",
                  eyebrow: "No active task",
                  title: "Explore your courses",
                  meta: "Courses, quizzes, and assignments will appear here as teachers publish them.",
                  action: "Browse courses",
                  icon: <BookOpen size={22} />,
                };

    const taskCards = [
      ...pendingAssignments.slice(0, 4).map((assignment) => ({
        key: `assignment-${assignment.id}`,
        href: "/elearning/assignments",
        title: assignment.title,
        meta: `${assignment.classSection.code} | ${assignment.classSection.course.title}`,
        due: assignment.dueAt ? `Due ${formatDateTime(assignment.dueAt)}` : "No deadline",
        badge: "Assignment",
        icon: <ListTodo size={18} />,
      })),
      ...quizzes.filter((quiz) => quiz.attempts.length === 0).slice(0, 3).map((quiz) => ({
        key: `quiz-${quiz.id}`,
        href: `/elearning/exercises/${quiz.id}`,
        title: quiz.title,
        meta: `${quiz.program?.code || "General"} | ${quiz.classSection.code}`,
        due: quiz.timeLimit ? `${quiz.timeLimit} min` : "No time limit",
        badge: "Quiz",
        icon: <ClipboardList size={18} />,
      })),
      ...practiceTests.filter((test) => test.attempts.length === 0).slice(0, 3).map((test) => ({
        key: `test-${test.id}`,
        href: `/elearning/tests/${test.id}`,
        title: test.title,
        meta: `${test.examType} | ${test.skill}`,
        due: test.timeLimit ? `${test.timeLimit} min` : "Practice test",
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
        href: attempt.quiz.isPracticeTest ? `/elearning/tests/${attempt.quizId}` : `/elearning/exercises/${attempt.quizId}?attempt=${attempt.id}`,
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
        detail: `${grade.assignment?.title || grade.quiz?.title || "Grade"} | ${scoreLabel(grade.score)}`,
        href: "/elearning/scores",
        icon: <Award size={16} />,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);

    return (
      <div className={styles.cockpitShell}>
        <section className={styles.cockpitHero}>
          <div className={styles.cockpitHeroContent}>
            <span className={styles.cockpitEyebrow}><Sparkles size={16} /> Learning Cockpit</span>
            <h1>Welcome back, {user.name || "Student"}.</h1>
            <p>
              Your dashboard is powered by your real enrollments, quizzes, assignments, attempts, and grades.
              Keep an eye on what matters next.
            </p>
            <div className={styles.heroQuickStats}>
              <span>{enrollments.length} active class{enrollments.length === 1 ? "" : "es"}</span>
              <span>{availableQuizCount} quiz/test{availableQuizCount === 1 ? "" : "s"}</span>
              <span>{grades.length} grade{grades.length === 1 ? "" : "s"}</span>
            </div>
          </div>
          <Link href={continueLearning.href} className={styles.continueCard}>
            <div className={styles.continueIcon}>{continueLearning.icon}</div>
            <span>{continueLearning.eyebrow}</span>
            <h2>{continueLearning.title}</h2>
            <p>{continueLearning.meta}</p>
            <strong>{continueLearning.action} <ArrowRight size={16} /></strong>
          </Link>
        </section>

        <section className={styles.metricGrid} aria-label="Learning summary">
          <div className={styles.metricCard}>
            <div className={styles.metricTop}><Target size={20} /><span>Overall Progress</span></div>
            <strong>{overallProgress}%</strong>
            <div className={styles.progressBarLarge}><div style={{ width: `${overallProgress}%` }} /></div>
            <p>{finishedLearningItems}/{totalLearningItems || 0} learning items completed</p>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricTop}><Trophy size={20} /><span>Average Score</span></div>
            <strong>{averageScore === null ? "-" : averageScore.toFixed(1)}</strong>
            <p>{averageScore === null ? "No graded work yet" : scoreTone(averageScore)}</p>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricTop}><ClipboardList size={20} /><span>Completed Quizzes</span></div>
            <strong>{completedQuizzes}</strong>
            <p>{quizzes.length - completedQuizzes} quiz{quizzes.length - completedQuizzes === 1 ? "" : "zes"} still open</p>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricTop}><Clock size={20} /><span>Pending Assignments</span></div>
            <strong>{pendingAssignments.length}</strong>
            <p>{submittedAssignments} assignment{submittedAssignments === 1 ? "" : "s"} submitted</p>
          </div>
        </section>

        <section className={styles.cockpitGrid}>
          <div className={styles.cockpitPanel}>
            <div className={styles.cockpitPanelHeader}>
              <div>
                <span className={styles.cockpitEyebrow}><LineChart size={16} /> Score trend</span>
                <h2>Performance over time</h2>
              </div>
              <Link href="/elearning/scores">View scores</Link>
            </div>
            {scoreSeries.length > 0 ? (
              <div className={styles.scoreChart}>
                <svg viewBox="0 0 360 150" role="img" aria-label="Score trend chart">
                  <line x1="24" y1="126" x2="336" y2="126" />
                  <line x1="24" y1="34" x2="24" y2="126" />
                  <polyline points={chart.line} />
                  {chart.dots.map((dot, index) => (
                    <circle key={`${dot.x}-${index}`} cx={dot.x} cy={dot.y} r="4.5" />
                  ))}
                </svg>
                <div className={styles.chartLegend}>
                  <span>Last {scoreSeries.length} score{scoreSeries.length === 1 ? "" : "s"}</span>
                  <strong>Peak {chart.maxScore.toFixed(chart.maxScore % 1 === 0 ? 0 : 1)}</strong>
                </div>
              </div>
            ) : (
              <div className={styles.emptyStateInline}>
                <BarChart3 size={32} />
                <p>No scores yet. Submit quizzes or assignments to build your trend.</p>
              </div>
            )}
          </div>

          <div className={styles.cockpitPanel}>
            <div className={styles.cockpitPanelHeader}>
              <div>
                <span className={styles.cockpitEyebrow}><ListTodo size={16} /> Upcoming tasks</span>
                <h2>Pending work</h2>
              </div>
              <Link href="/elearning/assignments">Assignments</Link>
            </div>
            {taskCards.length > 0 ? (
              <div className={styles.taskList}>
                {taskCards.map((task) => (
                  <Link href={task.href} key={task.key} className={styles.taskItem}>
                    <div className={styles.taskIcon}>{task.icon}</div>
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.meta}</p>
                      <small>{task.due}</small>
                    </div>
                    <span>{task.badge}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyStateInline}>
                <CheckCircle2 size={32} />
                <p>You are all caught up. New tasks will appear here when your teacher publishes them.</p>
              </div>
            )}
          </div>
        </section>

        <section className={styles.cockpitGrid}>
          <div className={styles.cockpitPanel}>
            <div className={styles.cockpitPanelHeader}>
              <div>
                <span className={styles.cockpitEyebrow}><Activity size={16} /> Recent quiz attempts</span>
                <h2>Quiz activity</h2>
              </div>
              <Link href="/elearning/exercises">Open quizzes</Link>
            </div>
            {recentAttempts.length > 0 ? (
              <div className={styles.compactRows}>
                {recentAttempts.map((attempt) => (
                  <Link
                    href={attempt.quiz.isPracticeTest ? `/elearning/tests/${attempt.quizId}` : `/elearning/exercises/${attempt.quizId}?attempt=${attempt.id}`}
                    key={attempt.id}
                    className={styles.compactRow}
                  >
                    <div>
                      <strong>{attempt.quiz.title}</strong>
                      <p>{attempt.quiz.isPracticeTest ? "Practice Test" : attempt.quiz.program?.code || "Quiz"} | {formatDateTime(attempt.startedAt)}</p>
                    </div>
                    <span className={attempt.status === "IN_PROGRESS" ? styles.statusPending : styles.statusCompleted}>
                      {attempt.status === "IN_PROGRESS" ? "In progress" : scoreLabel(attempt.score)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyStateInline}>
                <ClipboardList size={32} />
                <p>No quiz attempts yet. Your completed attempts will show up here.</p>
              </div>
            )}
          </div>

          <div className={styles.cockpitPanel}>
            <div className={styles.cockpitPanelHeader}>
              <div>
                <span className={styles.cockpitEyebrow}><Award size={16} /> Recent grades</span>
                <h2>Feedback</h2>
              </div>
              <Link href="/elearning/scores">All grades</Link>
            </div>
            {grades.length > 0 ? (
              <div className={styles.compactRows}>
                {grades.slice(0, 5).map((grade) => (
                  <Link href="/elearning/scores" key={grade.id} className={styles.compactRow}>
                    <div>
                      <strong>{grade.assignment?.title || grade.quiz?.title || "Manual grade"}</strong>
                      <p>{formatDate(grade.createdAt)} | {grade.feedback || "No feedback yet"}</p>
                    </div>
                    <span className={styles.scorePill}>{scoreLabel(grade.score)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyStateInline}>
                <Award size={32} />
                <p>No grades yet. Scores and teacher feedback will appear here.</p>
              </div>
            )}
          </div>
        </section>

        <section className={styles.cockpitPanel}>
          <div className={styles.cockpitPanelHeader}>
            <div>
              <span className={styles.cockpitEyebrow}><Activity size={16} /> Learning timeline</span>
              <h2>Recent activity</h2>
            </div>
          </div>
          {timeline.length > 0 ? (
            <div className={styles.timelineList}>
              {timeline.map((item) => (
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
              <p>Your quiz attempts, assignment submissions, and new grades will create a timeline here.</p>
            </div>
          )}
        </section>
      </div>
    );
  }

  const [classes, submissions, assignments, grades] = await Promise.all([
    prisma.classSection.findMany({ where: classWhere, include: { enrollments: { where: { status: "ACTIVE" } } } }),
    prisma.submission.findMany({ where: user.role === "TEACHER" ? { assignment: { classSection: { teacherId: user.id } } } : {} }),
    prisma.assignment.findMany({ where: user.role === "TEACHER" ? { classSection: { teacherId: user.id } } : {} }),
    prisma.grade.findMany({ where: user.role === "TEACHER" ? { assignment: { classSection: { teacherId: user.id } } } : {} }),
  ]);
  const studentCount = classes.reduce((sum, classSection) => sum + classSection.enrollments.length, 0);
  const average = grades.length ? grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length : 0;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 style={{ marginBottom: "0.5rem" }}>{user.role} Dashboard</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Statistics are loaded from ClassSection, Enrollment, Submission, and Grade tables.</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
        <div className={styles.panel}><Users size={24} color="var(--color-orange)" /><h3>{studentCount}</h3><p>Active students</p></div>
        <div className={styles.panel}><BookOpen size={24} color="var(--color-navy)" /><h3>{assignments.length}</h3><p>Assignments</p></div>
        <div className={styles.panel}><Clock size={24} color="#0891b2" /><h3>{submissions.length}</h3><p>Submitted work</p></div>
        <div className={styles.panel}><Award size={24} color="#10b981" /><h3>{average ? average.toFixed(1) : "-"}</h3><p>Average grade</p></div>
      </div>
    </div>
  );
}

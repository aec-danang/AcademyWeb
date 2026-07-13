import Link from "next/link";
import styles from "./elearning.module.css";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Award,
  BookPlus,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  ClipboardList,
  FileText,
  FileCheck2,
  GraduationCap,
  ListTodo,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
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

    const studentActions = [
      {
        href: "/elearning/practice",
        title: "Practice library",
        detail: `${availableQuizCount} quizzes and tests available`,
        icon: <ClipboardList size={20} />,
      },
      {
        href: "/elearning/scores",
        title: "Scores",
        detail: averageScore === null ? "Waiting for first grade" : `${averageScore.toFixed(1)} average`,
        icon: <Trophy size={20} />,
      },
      {
        href: "/elearning/courses",
        title: "Courses",
        detail: `${enrollments.length} active class${enrollments.length === 1 ? "" : "es"}`,
        icon: <BookOpen size={20} />,
      },
    ];

    const latestGrade = grades[0];
    const latestAttempt = recentAttempts[0];

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
            <strong>{pendingAssignments.length + taskCards.filter((task) => task.badge !== "Assignment").length}</strong>
            <p>Assignments, quizzes, tests</p>
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
        </section>

        <section className={styles.dashboardMain}>
          <div className={styles.dashboardPanel}>
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
          </div>

          <aside className={styles.dashboardPanel}>
            <div className={styles.dashboardPanelHeader}>
              <div>
                <span className={styles.cockpitEyebrow}><Target size={16} /> Snapshot</span>
                <h2>Progress pulse</h2>
              </div>
              <Link href="/elearning/scores">Scores</Link>
            </div>
            <div className={styles.progressPulse}>
              <div className={styles.progressRing} style={{ background: `conic-gradient(#10b981 ${overallProgress * 3.6}deg, #e2e8f0 0deg)` }}>
                <strong>{overallProgress}%</strong>
              </div>
              <div>
                <strong>{latestGrade ? scoreLabel(latestGrade.score) : "No grade"}</strong>
                <p>{latestGrade?.assignment?.title || latestGrade?.quiz?.title || "Complete a quiz to start your score history."}</p>
              </div>
            </div>
            {latestAttempt ? (
              <Link
                href={latestAttempt.quiz.isPracticeTest ? `/elearning/tests/${latestAttempt.quizId}` : `/elearning/exercises/${latestAttempt.quizId}?attempt=${latestAttempt.id}`}
                className={styles.snapshotRow}
              >
                <ClipboardList size={18} />
                <div>
                  <strong>{latestAttempt.quiz.title}</strong>
                  <p>{latestAttempt.status === "IN_PROGRESS" ? "In progress" : `Score ${scoreLabel(latestAttempt.score)}`}</p>
                </div>
              </Link>
            ) : null}
          </aside>
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

  const teacherScopedWhere = user.role === "TEACHER" ? { classSection: { teacherId: user.id } } : {};
  const [
    classes,
    submissions,
    grades,
    recentActivity,
  ] = await Promise.all([
    prisma.classSection.findMany({
      where: classWhere,
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        enrollments: {
          include: { student: true },
          orderBy: { requestedAt: "desc" },
        },
      },
    }),
    prisma.submission.findMany({
      where: user.role === "TEACHER" ? { assignment: { classSection: { teacherId: user.id } } } : {},
      orderBy: { submittedAt: "desc" },
      take: 50,
      include: {
        grade: true,
        student: true,
        assignment: {
          include: {
            classSection: { include: { course: true } },
          },
        },
      },
    }),
    prisma.grade.findMany({
      where: user.role === "TEACHER"
        ? { OR: [{ assignment: teacherScopedWhere }, { quiz: teacherScopedWhere }] }
        : {},
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { assignment: true, quiz: true, student: true },
    }),
    prisma.activityLog.findMany({
      where: user.role === "TEACHER" ? { actorId: user.id } : {},
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { actor: true },
    }),
  ]);

  const activeStudentIds = new Set(
    classes.flatMap((classSection) => (
      classSection.enrollments
        .filter((enrollment) => enrollment.status === "ACTIVE")
        .map((enrollment) => enrollment.userId)
    )),
  );
  const pendingEnrollmentRequests = classes.flatMap((classSection) => (
    classSection.enrollments
      .filter((enrollment) => enrollment.status === "REQUESTED")
      .map((enrollment) => ({ ...enrollment, classSection }))
  ));
  const submissionsToGrade = submissions.filter((submission) => submission.status !== "GRADED" && !submission.grade);
  const average = grades.length ? grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length : null;

  const actionCards = [
    { href: "/elearning/courses/new", label: "Create class", detail: "Open a new course section", icon: <BookPlus size={18} /> },
    { href: "/elearning/classrooms", label: "Review enrollments", detail: `${pendingEnrollmentRequests.length} pending request${pendingEnrollmentRequests.length === 1 ? "" : "s"}`, icon: <UserPlus size={18} /> },
    { href: "/elearning/classrooms", label: "Create assignment", detail: "Use a class as the starting point", icon: <FileText size={18} /> },
    { href: "/elearning/practice?tab=quizzes", label: "Build quiz", detail: "Manage class quiz library", icon: <ClipboardList size={18} /> },
    { href: "/elearning/practice?tab=tests", label: "Practice tests", detail: "Review imported test sets", icon: <FileCheck2 size={18} /> },
    { href: "/elearning/scores", label: "Open scores", detail: `${submissionsToGrade.length} submission${submissionsToGrade.length === 1 ? "" : "s"} need review`, icon: <Award size={18} /> },
  ];

  const activityHref = (entityType: string) => {
    if (entityType === "Enrollment" || entityType === "ClassSection") return "/elearning/classrooms";
    if (entityType === "Quiz" || entityType === "Attempt" || entityType === "Question") return "/elearning/practice";
    if (entityType === "Grade" || entityType === "Submission") return "/elearning/scores";
    if (entityType === "Assignment") return "/elearning/classrooms";
    return "/elearning";
  };

  const primaryTeacherAction = submissionsToGrade[0]
    ? {
        href: "/elearning/scores",
        eyebrow: "Grade next",
        title: submissionsToGrade[0].assignment.title,
        meta: `${submissionsToGrade[0].student.name || submissionsToGrade[0].student.email} | ${submissionsToGrade[0].assignment.classSection.code}`,
        icon: <CheckSquare size={22} />,
      }
    : pendingEnrollmentRequests[0]
      ? {
          href: "/elearning/classrooms",
          eyebrow: "Enrollment request",
          title: pendingEnrollmentRequests[0].student.name || pendingEnrollmentRequests[0].student.email || "New student",
          meta: `${pendingEnrollmentRequests[0].classSection.code} | ${pendingEnrollmentRequests.length} pending`,
          icon: <UserPlus size={22} />,
        }
      : {
          href: "/elearning/classrooms",
          eyebrow: "Open workspace",
          title: "Manage classrooms",
          meta: `${classes.length} class${classes.length === 1 ? "" : "es"} | ${activeStudentIds.size} active students`,
          icon: <Users size={22} />,
        };

  return (
    <div className={styles.dashboardShell}>
      <section className={`${styles.dashboardHero} ${styles.dashboardHeroTeacher}`}>
        <div className={styles.dashboardHeroCopy}>
          <span className={styles.cockpitEyebrow}><Activity size={16} /> {user.role === "ADMIN" ? "Admin dashboard" : "Teacher dashboard"}</span>
          <h1>Control the classroom flow.</h1>
          <p>Queues, class health, and creation tools are grouped around what needs a decision now.</p>
        </div>
        <Link href={primaryTeacherAction.href} className={styles.dashboardPrimaryAction}>
          <div className={styles.dashboardActionIcon}>{primaryTeacherAction.icon}</div>
          <span>{primaryTeacherAction.eyebrow}</span>
          <strong>{primaryTeacherAction.title}</strong>
          <p>{primaryTeacherAction.meta}</p>
          <em>Open <ArrowRight size={16} /></em>
        </Link>
      </section>

      <section className={styles.dashboardStats} aria-label="Teaching status">
        <div>
          <span>Classes</span>
          <strong>{classes.filter((classSection) => classSection.status === "ACTIVE").length}</strong>
          <p>{classes.length} total</p>
        </div>
        <div>
          <span>Students</span>
          <strong>{activeStudentIds.size}</strong>
          <p>Active learners</p>
        </div>
        <div>
          <span>Queue</span>
          <strong>{submissionsToGrade.length + pendingEnrollmentRequests.length}</strong>
          <p>Needs action</p>
        </div>
      </section>

      <section className={styles.actionHub} aria-label="Teaching actions">
        {actionCards.slice(0, 4).map((action) => (
          <Link href={action.href} key={action.label} className={styles.actionHubItem}>
            <div>{action.icon}</div>
            <strong>{action.label}</strong>
            <p>{action.detail}</p>
            <ArrowRight size={16} />
          </Link>
        ))}
      </section>

      <section className={styles.dashboardMain}>
        <div className={styles.dashboardPanel}>
          <div className={styles.dashboardPanelHeader}>
            <div>
              <span className={styles.cockpitEyebrow}><CheckSquare size={16} /> Decision queue</span>
              <h2>Needs review</h2>
            </div>
            <Link href="/elearning/scores">Scores</Link>
          </div>
          {submissionsToGrade.length > 0 || pendingEnrollmentRequests.length > 0 ? (
            <div className={styles.focusList}>
              {submissionsToGrade.slice(0, 4).map((submission) => (
                <Link href="/elearning/scores" key={submission.id} className={styles.focusItem}>
                  <div className={styles.taskIcon}><FileText size={18} /></div>
                  <div>
                    <strong>{submission.assignment.title}</strong>
                    <p>{submission.student.name || submission.student.email} | {submission.assignment.classSection.code}</p>
                  </div>
                  <span>Grade</span>
                </Link>
              ))}
              {pendingEnrollmentRequests.slice(0, 3).map((enrollment) => (
                <Link href="/elearning/classrooms" key={enrollment.id} className={styles.focusItem}>
                  <div className={styles.taskIcon}><UserPlus size={18} /></div>
                  <div>
                    <strong>{enrollment.student.name || enrollment.student.email || "Unnamed student"}</strong>
                    <p>{enrollment.classSection.code} | {enrollment.classSection.course.title}</p>
                  </div>
                  <span>Approve</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyStateInline}>
              <CheckCircle2 size={32} />
              <p>No enrollment or grading decisions are waiting.</p>
            </div>
          )}
        </div>

        <aside className={styles.dashboardPanel}>
          <div className={styles.dashboardPanelHeader}>
            <div>
              <span className={styles.cockpitEyebrow}><Award size={16} /> Score pulse</span>
              <h2>Latest results</h2>
            </div>
            <Link href="/elearning/scores">All</Link>
          </div>
          <div className={styles.teacherPulse}>
            <strong>{average === null ? "-" : average.toFixed(1)}</strong>
            <p>Average from recent grades</p>
          </div>
          {grades.slice(0, 3).map((grade) => (
            <Link href="/elearning/scores" key={grade.id} className={styles.snapshotRow}>
              <Award size={18} />
              <div>
                <strong>{grade.assignment?.title || grade.quiz?.title || "Manual grade"}</strong>
                <p>{grade.student.name || grade.student.email} | {scoreLabel(grade.score)}</p>
              </div>
            </Link>
          ))}
        </aside>
      </section>

      <section className={styles.dashboardMain}>
        <div className={styles.dashboardPanel}>
          <div className={styles.dashboardPanelHeader}>
            <div>
              <span className={styles.cockpitEyebrow}><BookOpen size={16} /> Classes</span>
              <h2>Current classrooms</h2>
            </div>
            <Link href="/elearning/courses/new">New class</Link>
          </div>
          {classes.length > 0 ? (
            <div className={styles.focusList}>
              {classes.slice(0, 5).map((classSection) => {
                const activeCount = classSection.enrollments.filter((enrollment) => enrollment.status === "ACTIVE").length;
                const requestCount = classSection.enrollments.filter((enrollment) => enrollment.status === "REQUESTED").length;
                return (
                  <Link href={`/elearning/courses/${classSection.courseId}`} key={classSection.id} className={styles.focusItem}>
                    <div className={styles.taskIcon}><Users size={18} /></div>
                    <div>
                      <strong>{classSection.name}</strong>
                      <p>{classSection.code} | {classSection.course.title}</p>
                    </div>
                    <span>{activeCount} / {requestCount}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyStateInline}>
              <AlertCircle size={32} />
              <p>No classes found. Create a class to start enrolling students.</p>
            </div>
          )}
        </div>

        <aside className={styles.dashboardPanel}>
          <div className={styles.dashboardPanelHeader}>
            <div>
              <span className={styles.cockpitEyebrow}><Activity size={16} /> Activity</span>
              <h2>Recent movement</h2>
            </div>
          </div>
          {recentActivity.length > 0 ? (
            <div className={styles.timelineList}>
              {recentActivity.slice(0, 5).map((activity) => (
                <Link href={activityHref(activity.entityType)} key={activity.id} className={styles.timelineItem}>
                  <div className={styles.timelineIcon}><Activity size={16} /></div>
                  <div>
                    <strong>{activity.action.replaceAll("_", " ").toLowerCase()}</strong>
                    <p>{activity.entityType} | {activity.actor?.name || activity.actor?.email || "System"}</p>
                  </div>
                  <time>{formatDateTime(activity.createdAt)}</time>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyStateInline}>
              <Activity size={32} />
              <p>Activity logs will appear here as the LMS is used.</p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

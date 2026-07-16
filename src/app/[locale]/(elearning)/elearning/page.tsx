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
import { StudentDashboardView, TeacherDashboardView } from "./DashboardView";

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

    return <StudentDashboardView 
      user={user} 
      enrollments={enrollments} 
      assignments={assignments} 
      quizzes={quizzes} 
      practiceTests={practiceTests} 
      recentAttempts={recentAttempts} 
      grades={grades} 
      recentSubmissions={recentSubmissions} 
    />;
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

  return <TeacherDashboardView 
    user={user} 
    classes={classes} 
    submissions={submissions} 
    grades={grades} 
    recentActivity={recentActivity} 
  />;
}

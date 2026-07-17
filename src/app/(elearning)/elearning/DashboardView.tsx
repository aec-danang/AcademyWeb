"use client";

import { useRef } from "react";
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
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "No deadline";
  return dateFormatter.format(new Date(value));
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "Not submitted";
  return dateTimeFormatter.format(new Date(value));
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

export function StudentDashboardView({ 
  user, 
  enrollments, 
  assignments, 
  quizzes, 
  practiceTests, 
  recentAttempts, 
  grades, 
  recentSubmissions 
}: any) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(`.${styles.dashboardHero}`, { y: -20, opacity: 0, duration: 0.6, ease: "power3.out" })
      .from(`.${styles.dashboardStats} div`, { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }, "-=0.3")
      .from(`.${styles.actionHubItem}`, { y: 20, opacity: 0, stagger: 0.05, duration: 0.5, ease: "power2.out" }, "-=0.3")
      .from(`.${styles.dashboardPanel}`, { y: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" }, "-=0.2");
  }, { scope: container });

  const pendingAssignments = assignments.filter((a: any) => a.submissions.length === 0);
  const submittedAssignments = assignments.length - pendingAssignments.length;
  const completedQuizzes = quizzes.filter((q: any) => q.attempts.some((a: any) => a.status !== "IN_PROGRESS")).length;
  const completedPracticeTests = practiceTests.filter((t: any) => t.attempts.some((a: any) => a.status !== "IN_PROGRESS")).length;
  const availableQuizCount = quizzes.length + practiceTests.length;
  const finishedLearningItems = submittedAssignments + completedQuizzes + completedPracticeTests;
  const totalLearningItems = assignments.length + availableQuizCount;
  const overallProgress = totalLearningItems ? Math.round((finishedLearningItems / totalLearningItems) * 100) : 0;
  const averageScore = grades.length ? grades.reduce((sum: number, grade: any) => sum + grade.score, 0) / grades.length : null;

  const firstInProgressAttempt = recentAttempts.find((a: any) => a.status === "IN_PROGRESS");
  const nextQuiz = quizzes.find((q: any) => q.attempts.length === 0);
  const nextPracticeTest = practiceTests.find((t: any) => t.attempts.length === 0);
  const nextLesson = enrollments.flatMap((e: any) => e.classSection.course.lessons)[0];
  
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
                meta: "Courses, quizzes, and assignments will appear here.",
                action: "Browse courses",
                icon: <BookOpen size={22} />,
              };

  const taskCards = [
    ...pendingAssignments.slice(0, 4).map((a: any) => ({
      key: `assignment-${a.id}`,
      href: "/elearning/assignments",
      title: a.title,
      meta: `${a.classSection.code} | ${a.classSection.course.title}`,
      due: a.dueAt ? `Due ${formatDateTime(a.dueAt)}` : "No deadline",
      badge: "Assignment",
      icon: <ListTodo size={18} />,
    })),
    ...quizzes.filter((q: any) => q.attempts.length === 0).slice(0, 3).map((q: any) => ({
      key: `quiz-${q.id}`,
      href: `/elearning/exercises/${q.id}`,
      title: q.title,
      meta: `${q.program?.code || "General"} | ${q.classSection.code}`,
      due: q.timeLimit ? `${q.timeLimit} min` : "No time limit",
      badge: "Quiz",
      icon: <ClipboardList size={18} />,
    })),
    ...practiceTests.filter((t: any) => t.attempts.length === 0).slice(0, 3).map((t: any) => ({
      key: `test-${t.id}`,
      href: `/elearning/tests/${t.id}`,
      title: t.title,
      meta: `${t.examType} | ${t.skill}`,
      due: t.timeLimit ? `${t.timeLimit} min` : "Practice test",
      badge: "Practice",
      icon: <FileCheck2 size={18} />,
    })),
  ].slice(0, 6);

  const timeline = [
    ...recentAttempts.map((a: any) => ({
      key: `attempt-${a.id}`,
      date: new Date(a.submittedAt || a.startedAt),
      title: a.status === "IN_PROGRESS" ? "Started quiz" : "Completed quiz",
      detail: `${a.quiz.title} | ${scoreLabel(a.score)}`,
      href: a.quiz.isPracticeTest ? `/elearning/tests/${a.quizId}` : `/elearning/exercises/${a.quizId}?attempt=${a.id}`,
      icon: <ClipboardList size={16} />,
    })),
    ...recentSubmissions.map((s: any) => ({
      key: `submission-${s.id}`,
      date: new Date(s.submittedAt),
      title: "Submitted assignment",
      detail: `${s.assignment.title} | ${s.assignment.classSection.code}`,
      href: "/elearning/assignments",
      icon: <CheckCircle2 size={16} />,
    })),
    ...grades.map((g: any) => ({
      key: `grade-${g.id}`,
      date: new Date(g.createdAt),
      title: "New grade posted",
      detail: `${g.assignment?.title || g.quiz?.title || "Grade"} | ${scoreLabel(g.score)}`,
      href: "/elearning/scores",
      icon: <Award size={16} />,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);

  const studentActions = [
    { href: "/elearning/practice", title: "Practice library", detail: `${availableQuizCount} items`, icon: <ClipboardList size={20} /> },
    { href: "/elearning/scores", title: "Scores", detail: averageScore === null ? "Waiting" : `${averageScore.toFixed(1)} avg`, icon: <Trophy size={20} /> },
    { href: "/elearning/courses", title: "Courses", detail: `${enrollments.length} active`, icon: <BookOpen size={20} /> },
  ];

  const latestGrade = grades[0];
  const latestAttempt = recentAttempts[0];

  return (
    <div className={styles.dashboardShell} ref={container}>
      <section className={styles.dashboardHero}>
        <div className={styles.dashboardHeroCopy}>
          <span className={styles.cockpitEyebrow}><Sparkles size={16} /> Student dashboard</span>
          <h1>{user.name || "Student"}, start with one thing.</h1>
          <p>Your dashboard prioritizes the next useful action for your success.</p>
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
          <strong>{pendingAssignments.length + taskCards.filter((t: any) => t.badge !== "Assignment").length}</strong>
          <p>Needs action</p>
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
            <Link href="/elearning/practice">Open</Link>
          </div>
          {taskCards.length > 0 ? (
            <div className={styles.focusList}>
              {taskCards.slice(0, 5).map((task: any) => (
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
              <p>You are caught up.</p>
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
              <p>{latestGrade?.assignment?.title || latestGrade?.quiz?.title || "Complete work to get graded."}</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export function TeacherDashboardView({ user, classes, submissions, grades, recentActivity }: any) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(`.${styles.dashboardHero}`, { y: -20, opacity: 0, duration: 0.6, ease: "power3.out" })
      .from(`.${styles.dashboardStats} div`, { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }, "-=0.3")
      .from(`.${styles.actionHubItem}`, { y: 20, opacity: 0, stagger: 0.05, duration: 0.5, ease: "power2.out" }, "-=0.3")
      .from(`.${styles.dashboardPanel}`, { y: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" }, "-=0.2");
  }, { scope: container });

  const activeStudentIds = new Set(
    classes.flatMap((c: any) => c.enrollments.filter((e: any) => e.status === "ACTIVE").map((e: any) => e.userId))
  );
  
  const pendingEnrollmentRequests = classes.flatMap((c: any) => 
    c.enrollments.filter((e: any) => e.status === "REQUESTED").map((e: any) => ({ ...e, classSection: c }))
  );
  
  const submissionsToGrade = submissions.filter((s: any) => s.status !== "GRADED" && !s.grade);
  const average = grades.length ? grades.reduce((sum: number, g: any) => sum + g.score, 0) / grades.length : null;

  const actionCards = [
    { href: "/elearning/courses/new", label: "Create class", detail: "Open a new course section", icon: <BookPlus size={18} /> },
    { href: "/elearning/classrooms", label: "Review enrollments", detail: `${pendingEnrollmentRequests.length} requests`, icon: <UserPlus size={18} /> },
    { href: "/elearning/classrooms", label: "Create assignment", detail: "Start from a class", icon: <FileText size={18} /> },
    { href: "/elearning/practice?tab=quizzes", label: "Build quiz", detail: "Manage class library", icon: <ClipboardList size={18} /> },
  ];

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
          meta: `${classes.length} classes | ${activeStudentIds.size} students`,
          icon: <Users size={22} />,
        };

  return (
    <div className={styles.dashboardShell} ref={container}>
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
          <strong>{classes.filter((c: any) => c.status === "ACTIVE").length}</strong>
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
        {actionCards.map((action) => (
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
              {submissionsToGrade.slice(0, 4).map((s: any) => (
                <Link href="/elearning/scores" key={s.id} className={styles.focusItem}>
                  <div className={styles.taskIcon}><FileText size={18} /></div>
                  <div>
                    <strong>{s.assignment.title}</strong>
                    <p>{s.student.name || s.student.email} | {s.assignment.classSection.code}</p>
                  </div>
                  <span>Grade</span>
                </Link>
              ))}
              {pendingEnrollmentRequests.slice(0, 3).map((e: any) => (
                <Link href="/elearning/classrooms" key={e.id} className={styles.focusItem}>
                  <div className={styles.taskIcon}><UserPlus size={18} /></div>
                  <div>
                    <strong>{e.student.name || e.student.email || "Unnamed student"}</strong>
                    <p>{e.classSection.code} | {e.classSection.course.title}</p>
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
          {grades.slice(0, 3).map((g: any) => (
            <Link href="/elearning/scores" key={g.id} className={styles.snapshotRow}>
              <Award size={18} />
              <div>
                <strong>{g.assignment?.title || g.quiz?.title || "Manual grade"}</strong>
                <p>{g.student.name || g.student.email} | {scoreLabel(g.score)}</p>
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
              {classes.slice(0, 5).map((classSection: any) => {
                const activeCount = classSection.enrollments.filter((enrollment: any) => enrollment.status === "ACTIVE").length;
                const requestCount = classSection.enrollments.filter((enrollment: any) => enrollment.status === "REQUESTED").length;
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
              {recentActivity.slice(0, 5).map((activity: any) => (
                <Link href={activity.entityType === "CLASS_SECTION" ? "/elearning/classrooms" : "/elearning/scores"} key={activity.id} className={styles.timelineItem}>
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

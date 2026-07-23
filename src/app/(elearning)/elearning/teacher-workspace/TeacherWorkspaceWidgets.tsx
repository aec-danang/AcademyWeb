/* eslint-disable react-hooks/error-boundaries -- async server widgets render a local fallback when their own data source rejects */
import Link from "next/link";
import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileClock,
  FileText,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import styles from "../elearning.module.css";
import { WidgetEmpty, WidgetError, WorkspaceWidget } from "./WorkspaceWidget";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(value: Date) {
  return dateTimeFormatter.format(value);
}

function teacherClassWhere(userId: string, isAdmin: boolean) {
  return isAdmin ? {} : { teacherId: userId };
}

function teacherAssignmentWhere(userId: string, isAdmin: boolean) {
  return isAdmin ? {} : { classSection: { teacherId: userId } };
}

function teacherQuizWhere(userId: string, isAdmin: boolean) {
  return isAdmin ? {} : { OR: [{ classSection: { teacherId: userId } }, { deliveries: { some: { classSection: { teacherId: userId } } } }] };
}

export async function TeacherOverviewStats({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const classWhere = teacherClassWhere(userId, isAdmin);
    const assignmentWhere = teacherAssignmentWhere(userId, isAdmin);
    const quizWhere = teacherQuizWhere(userId, isAdmin);

    const [activeClasses, enrollments, assignmentReviews, quizReviews, submissionsToday, attemptsToday] = await Promise.all([
      prisma.classSection.count({ where: { status: "ACTIVE", ...classWhere } }),
      prisma.enrollment.findMany({
        where: { status: "ACTIVE", classSection: classWhere },
        select: { userId: true },
      }),
      prisma.submission.count({ where: { status: "SUBMITTED", assignment: assignmentWhere } }),
      prisma.attempt.count({ where: { status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] }, quiz: quizWhere } }),
      prisma.submission.count({ where: { submittedAt: { gte: today }, assignment: assignmentWhere } }),
      prisma.attempt.count({ where: { submittedAt: { gte: today }, quiz: quizWhere } }),
    ]);

    const stats = [
      { label: "Active classrooms", value: activeClasses, icon: Users, tone: "indigo" },
      { label: "Active students", value: new Set(enrollments.map((item) => item.userId)).size, icon: GraduationCap, tone: "cyan" },
      { label: "Waiting for review", value: assignmentReviews + quizReviews, icon: ClipboardCheck, tone: "orange" },
      { label: "Submitted today", value: submissionsToday + attemptsToday, icon: Clock3, tone: "green" },
    ];

    return (
      <section className={styles.workspaceMetricStrip} aria-label="Teaching overview">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div className={styles.workspaceMetric} key={stat.label}>
              <span className={`${styles.workspaceMetricIcon} ${styles[`workspaceMetricIcon${stat.tone}`]}`}><Icon size={18} /></span>
              <div><strong>{stat.value}</strong><span>{stat.label}</span></div>
            </div>
          );
        })}
      </section>
    );
  } catch (error) {
    console.error("Failed to load teacher overview stats:", error);
    return null;
  }
}

export async function NeedsAttentionWidget({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  try {
    const [pendingEnrollments, essays, aiConfirmations, drafts, quizSubmissions] = await Promise.all([
      prisma.enrollment.count({
        where: { status: "REQUESTED", classSection: teacherClassWhere(userId, isAdmin) },
      }),
      prisma.attempt.count({
        where: {
          status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
          quiz: teacherQuizWhere(userId, isAdmin),
          answers: { some: { question: { type: "ESSAY" } } },
        },
      }),
      prisma.grade.count({
        where: {
          status: "DRAFT",
          aiReviewedAt: { not: null },
          ...(isAdmin ? {} : { assignment: { classSection: { teacherId: userId } } }),
        },
      }),
      prisma.assignment.count({
        where: { status: "DRAFT", ...teacherAssignmentWhere(userId, isAdmin) },
      }),
      prisma.attempt.count({
        where: {
          status: "SUBMITTED",
          quiz: { isPracticeTest: false, ...teacherQuizWhere(userId, isAdmin) },
        },
      }),
    ]);

    const items = [
      { label: "Pending enrollments", count: pendingEnrollments, href: "/elearning/classrooms", icon: UserPlus, tone: "amber" },
      { label: "Essays waiting for review", count: essays, href: "/elearning/scores", icon: FileText, tone: "violet" },
      { label: "AI grading confirmations", count: aiConfirmations, href: "/elearning/scores", icon: Bot, tone: "cyan" },
      { label: "Draft assignments", count: drafts, href: "/elearning/courses", icon: FileClock, tone: "slate" },
      { label: "Quiz submissions to grade", count: quizSubmissions, href: "/elearning/scores", icon: ListChecks, tone: "orange" },
    ].filter((item) => item.count > 0);

    return (
      <WorkspaceWidget eyebrow="Highest priority" title="Needs attention" icon={ClipboardCheck} href="/elearning/scores" linkLabel="Open review queue">
        {items.length ? (
          <div className={styles.attentionList}>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link href={item.href} key={item.label} className={styles.attentionItem}>
                  <span className={`${styles.attentionIcon} ${styles[`attentionIcon${item.tone}`]}`}><Icon size={18} /></span>
                  <strong>{item.label}</strong>
                  <b>{item.count}</b>
                  <span className={styles.attentionAction}>Review</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <WidgetEmpty icon={CheckCircle2} title="You’re all caught up" message="New enrollment, grading, and publishing decisions will appear here." />
        )}
      </WorkspaceWidget>
    );
  } catch (error) {
    console.error("Failed to load teacher attention summary:", error);
    return <WorkspaceWidget eyebrow="Highest priority" title="Needs attention" icon={ClipboardCheck} href="/elearning/scores"><WidgetError /></WorkspaceWidget>;
  }
}

export async function ClassroomsWidget({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  try {
    const classrooms = await prisma.classSection.findMany({
      where: { status: "ACTIVE", ...teacherClassWhere(userId, isAdmin) },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: {
        course: true,
        enrollments: { select: { status: true, requestedAt: true } },
        assignments: {
          orderBy: { updatedAt: "desc" },
          take: 6,
          include: { submissions: { select: { status: true, submittedAt: true } } },
        },
        quizDeliveries: {
          include: { attempts: { select: { status: true, submittedAt: true } } },
        },
      },
    });

    return (
      <WorkspaceWidget eyebrow="Teaching now" title="My classrooms" icon={Users} href="/elearning/classrooms" linkLabel="All classrooms">
        {classrooms.length ? (
          <div className={styles.workspaceClassList}>
            {classrooms.map((classroom) => {
              const students = classroom.enrollments.filter((item) => item.status === "ACTIVE").length;
              const pending = classroom.assignments.flatMap((assignment) => assignment.submissions).filter((item) => item.status !== "GRADED").length;
              const submitted = classroom.assignments.flatMap((assignment) => assignment.submissions).length
                + classroom.quizDeliveries.flatMap((delivery) => delivery.attempts).filter((attempt) => attempt.status !== "IN_PROGRESS").length;
              const activityDates = [
                classroom.updatedAt,
                ...classroom.enrollments.map((item) => item.requestedAt),
                ...classroom.assignments.flatMap((assignment) => [assignment.updatedAt, ...assignment.submissions.map((item) => item.submittedAt)]),
              ];
              const latest = activityDates.sort((a, b) => b.getTime() - a.getTime())[0];

              return (
                <Link href={`/elearning/classrooms/${classroom.id}`} key={classroom.id} className={styles.workspaceClassRow}>
                  <span className={styles.workspaceClassIcon}><Users size={18} /></span>
                  <div className={styles.workspaceClassMain}>
                    <small>{classroom.code}</small>
                    <strong>{classroom.name}</strong>
                    <p>{classroom.course.title}</p>
                  </div>
                  <div className={styles.workspaceClassMetric}>
                    <strong>{students}</strong><span>Students</span>
                  </div>
                  <div className={styles.workspaceClassMetric}>
                    <strong>{submitted}</strong><span>Submitted</span>
                  </div>
                  <div className={styles.workspaceClassUpdate}>
                    {pending ? <b>{pending} to review</b> : <b className={styles.workspaceClassClear}>Up to date</b>}
                    <time>Updated {formatDateTime(latest)}</time>
                  </div>
                  <ChevronRight size={18} className={styles.workspaceClassArrow} />
                </Link>
              );
            })}
          </div>
        ) : (
          <WidgetEmpty icon={Users} title="No active classrooms" message="Create a classroom to enroll students and start assigning work." href="/elearning/classrooms/new" action="Create Classroom" />
        )}
      </WorkspaceWidget>
    );
  } catch (error) {
    console.error("Failed to load teacher classrooms summary:", error);
    return <WorkspaceWidget eyebrow="Teaching now" title="My classrooms" icon={Users} href="/elearning/classrooms"><WidgetError /></WorkspaceWidget>;
  }
}

export async function RecentActivityWidget({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  try {
    const [submissions, enrollments, grades, publications] = await Promise.all([
      prisma.submission.findMany({
        where: { assignment: teacherAssignmentWhere(userId, isAdmin) },
        orderBy: { submittedAt: "desc" }, take: 5,
        include: { student: true, assignment: { include: { classSection: true } } },
      }),
      prisma.enrollment.findMany({
        where: { classSection: teacherClassWhere(userId, isAdmin) },
        orderBy: { requestedAt: "desc" }, take: 5,
        include: { student: true, classSection: true },
      }),
      prisma.grade.findMany({
        where: { status: "PUBLISHED", ...(isAdmin ? {} : { gradedById: userId }) },
        orderBy: { createdAt: "desc" }, take: 5,
        include: { student: true, assignment: true, quiz: true },
      }),
      prisma.assignment.findMany({
        where: { status: "PUBLISHED", ...teacherAssignmentWhere(userId, isAdmin) },
        orderBy: { updatedAt: "desc" }, take: 5,
        include: { classSection: true },
      }),
    ]);

    const events = [
      ...submissions.map((item) => ({ key: `submission-${item.id}`, date: item.submittedAt, title: `${item.student.name || item.student.email || "A student"} submitted work`, detail: `${item.assignment.title} · ${item.assignment.classSection.code}`, href: "/elearning/scores", icon: FileText })),
      ...enrollments.map((item) => ({ key: `enrollment-${item.id}`, date: item.requestedAt, title: item.status === "REQUESTED" ? "New enrollment request" : "Enrollment updated", detail: `${item.student.name || item.student.email || "Student"} · ${item.classSection.code}`, href: `/elearning/classrooms/${item.classSection.id}?tab=students`, icon: UserPlus })),
      ...grades.map((item) => ({ key: `grade-${item.id}`, date: item.createdAt, title: "Score published", detail: `${item.assignment?.title || item.quiz?.title || "Manual score"} · ${item.score.toFixed(1)}`, href: "/elearning/scores", icon: ClipboardCheck })),
      ...publications.map((item) => ({ key: `publish-${item.id}`, date: item.updatedAt, title: "Assignment published", detail: `${item.title} · ${item.classSection.code}`, href: `/elearning/classrooms/${item.classSection.id}?tab=assignments`, icon: Sparkles })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

    return (
      <WorkspaceWidget eyebrow="Across your modules" title="Recent activity" icon={Activity} href="/elearning/classrooms" linkLabel="Activity logs">
        {events.length ? (
          <div className={styles.workspaceTimeline}>
            {events.map((event) => {
              const Icon = event.icon;
              return (
                <Link href={event.href} key={event.key} className={styles.workspaceTimelineItem}>
                  <span><Icon size={16} /></span>
                  <div><strong>{event.title}</strong><p>{event.detail}</p></div>
                  <time>{formatDateTime(event.date)}</time>
                </Link>
              );
            })}
          </div>
        ) : (
          <WidgetEmpty icon={Activity} title="No recent activity" message="Submissions, enrollments, grading, and publishing events will appear here." />
        )}
      </WorkspaceWidget>
    );
  } catch (error) {
    console.error("Failed to load teacher activity summary:", error);
    return <WorkspaceWidget eyebrow="Across your modules" title="Recent activity" icon={Activity} href="/elearning/classrooms"><WidgetError /></WorkspaceWidget>;
  }
}

export async function LearningInsightsWidget({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  try {
    const grades = await prisma.grade.findMany({
      where: { status: "PUBLISHED", ...(isAdmin ? {} : { OR: [{ assignment: teacherAssignmentWhere(userId, false) }, { quiz: teacherQuizWhere(userId, false) }] }) },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { assignment: true, quiz: true },
    });

    if (!grades.length) {
      return <WorkspaceWidget eyebrow="Learning signals" title="Learning insights" icon={Lightbulb} href="/elearning/scores"><WidgetEmpty icon={Lightbulb} title="Insights start with scores" message="Once work is graded, trends and learning signals will appear here." href="/elearning/scores" action="Open Scores" /></WorkspaceWidget>;
    }

    const recent = grades.slice(0, Math.min(10, grades.length));
    const previous = grades.slice(10, 20);
    const percentScore = (grade: (typeof recent)[number]) => grade.assignment ? (grade.score / grade.assignment.maxScore) * 100 : grade.score;
    const average = recent.reduce((sum, grade) => sum + percentScore(grade), 0) / recent.length;
    const previousAverage = previous.length ? previous.reduce((sum, grade) => sum + percentScore(grade), 0) / previous.length : null;
    const trend = previousAverage === null ? null : average - previousAverage;
    const lowScores = recent.filter((grade) => percentScore(grade) < 65);
    const skillScores = recent.filter((grade) => grade.assignment).reduce<Record<string, number[]>>((groups, grade) => {
      const skill = grade.assignment?.skill || "MIXED";
      (groups[skill] ||= []).push(percentScore(grade));
      return groups;
    }, {});
    const weakestSkill = Object.entries(skillScores).map(([skill, values]) => ({ skill, average: values.reduce((sum, value) => sum + value, 0) / values.length })).sort((a, b) => a.average - b.average)[0];
    const insight = lowScores.length >= Math.ceil(recent.length / 2)
      ? `${lowScores.length} of the latest ${recent.length} results are below 65%. ${weakestSkill ? `${weakestSkill.skill.toLowerCase()} needs the most support.` : "A focused review is recommended."}`
      : trend !== null && trend > 2.5
        ? `Recent results improved by ${trend.toFixed(1)} percentage points. The current learning plan appears to be working.`
        : weakestSkill ? `${weakestSkill.skill.toLowerCase()} is currently the weakest measured skill at ${weakestSkill.average.toFixed(0)}%. Consider targeted practice.` : "Performance is steady across recent work.";

    return (
      <WorkspaceWidget eyebrow="Learning signals" title="Learning insights" icon={Lightbulb} href="/elearning/scores" linkLabel="Explore scores">
        <div className={styles.insightScoreRow}>
          <div><span>Recent average</span><strong>{average.toFixed(0)}%</strong><small>Last {recent.length} published grades</small></div>
          <div className={trend === null || trend >= 0 ? styles.trendPositive : styles.trendNegative}>
            {trend === null || trend >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <strong>{trend === null ? "New" : `${trend >= 0 ? "+" : ""}${trend.toFixed(1)}%`}</strong>
            <small>{trend === null ? "Building a baseline" : "vs. previous period"}</small>
          </div>
        </div>
        <div className={styles.aiInsight}>
          <span><Bot size={17} /> Teaching insight</span>
          <p>{insight}</p>
        </div>
      </WorkspaceWidget>
    );
  } catch (error) {
    console.error("Failed to load teacher learning insights:", error);
    return <WorkspaceWidget eyebrow="Learning signals" title="Learning insights" icon={Lightbulb} href="/elearning/scores"><WidgetError /></WorkspaceWidget>;
  }
}

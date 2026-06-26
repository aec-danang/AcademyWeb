import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Headphones,
  Layers3,
  PlayCircle,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Timer,
  Trophy,
} from "lucide-react";
import styles from "../elearning.module.css";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type TestStatus = "not_started" | "in_progress" | "completed";

const programOrder = ["IEPREP", "PREIE", "IE4.0", "IE5.0", "IE5.5", "IE6.0", "IE6.5", "IE7.0"];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function searchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function programRank(code: string | null) {
  const rank = programOrder.indexOf(code || "");
  return rank === -1 ? Number.MAX_SAFE_INTEGER : rank;
}

function statusLabel(status: TestStatus) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function statusClassName(status: TestStatus) {
  if (status === "completed") return styles.quizStatusCompleted;
  if (status === "in_progress") return styles.quizStatusProgress;
  return styles.quizStatusNew;
}

function scoreLabel(score: number | null) {
  if (score === null) return "No score yet";
  return score.toFixed(score % 1 === 0 ? 0 : 1);
}

function availabilityLabel(openAt: Date | null, closeAt: Date | null, now: Date) {
  if (openAt && openAt > now) return "Not open yet";
  if (closeAt && closeAt < now) return "Closed";
  return "Open now";
}

function isAvailable(openAt: Date | null, closeAt: Date | null, now: Date) {
  return (!openAt || openAt <= now) && (!closeAt || closeAt >= now);
}

function skillIcon(skill: string) {
  if (skill === "LISTENING") return <Headphones size={22} />;
  if (skill === "READING" || skill === "WRITING") return <FileText size={22} />;
  return <ClipboardList size={22} />;
}

export default async function PracticeTestsPage({ searchParams }: Props) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const selectedProgram = searchValue(resolvedSearchParams?.program);
  const selectedCourse = searchValue(resolvedSearchParams?.course);
  const selectedUnit = searchValue(resolvedSearchParams?.unit);
  const selectedStatus = searchValue(resolvedSearchParams?.status) as TestStatus | "";
  const selectedSort = searchValue(resolvedSearchParams?.sort) || "newest";
  const searchTerm = searchValue(resolvedSearchParams?.q);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const now = new Date();

  const tests = await prisma.quiz.findMany({
    where: user.role === "STUDENT"
      ? {
          isPracticeTest: true,
          published: true,
          classSection: { enrollments: { some: { userId: user.id, status: "ACTIVE" } } },
        }
      : user.role === "TEACHER"
        ? { isPracticeTest: true, classSection: { teacherId: user.id } }
        : { isPracticeTest: true },
    orderBy: { createdAt: "desc" },
    include: {
      program: true,
      classSection: { include: { course: true } },
      questions: true,
      sections: true,
      attempts: {
        where: user.role === "STUDENT" ? { studentId: user.id } : {},
        orderBy: { startedAt: "desc" },
        include: { answers: true },
      },
    },
  });

  const cards = tests.map((test) => {
    const inProgressAttempt = test.attempts.find((attempt) => attempt.status === "IN_PROGRESS") || null;
    const completedAttempts = test.attempts.filter((attempt) => attempt.status !== "IN_PROGRESS");
    const bestScore = completedAttempts.reduce<number | null>((best, attempt) => {
      if (attempt.score === null) return best;
      return best === null ? attempt.score : Math.max(best, attempt.score);
    }, null);
    const lastAttempt = test.attempts[0] || null;
    const status: TestStatus = inProgressAttempt ? "in_progress" : completedAttempts.length > 0 ? "completed" : "not_started";
    const progress = status === "completed"
      ? 100
      : inProgressAttempt && test.questions.length > 0
        ? Math.min(100, Math.round((inProgressAttempt.answers.length / test.questions.length) * 100))
        : 0;
    const available = isAvailable(test.openAt, test.closeAt, now);
    const limitReached = user.role === "STUDENT" && test.attempts.length >= test.attemptLimit && !inProgressAttempt;

    return {
      id: test.id,
      title: test.title,
      description: test.description,
      unit: test.unit || "",
      programCode: test.program?.code || "General",
      programName: test.program?.name || "General",
      courseId: test.classSection.course.id,
      courseTitle: test.classSection.course.title,
      classCode: test.classSection.code,
      questionCount: test.questions.length,
      sectionCount: test.sections.length || 1,
      timeLimit: test.timeLimit,
      attemptCount: test.attempts.length,
      attemptLimit: test.attemptLimit,
      bestScore,
      lastAttemptAt: lastAttempt?.submittedAt || lastAttempt?.startedAt || null,
      status,
      progress,
      examType: test.examType,
      skill: test.skill,
      availability: availabilityLabel(test.openAt, test.closeAt, now),
      available,
      limitReached,
      createdAt: test.createdAt,
      searchText: [
        test.title,
        test.description,
        test.program?.code,
        test.program?.name,
        test.unit,
        test.examType,
        test.skill,
        test.classSection.code,
        test.classSection.course.title,
      ].filter(Boolean).join(" ").toLowerCase(),
    };
  });

  const programOptions = uniqueBy(
    cards
      .filter((card) => card.programCode !== "General")
      .map((card) => ({ code: card.programCode, name: card.programName })),
    (program) => program.code,
  ).sort((a, b) => programRank(a.code) - programRank(b.code) || a.code.localeCompare(b.code, "en", { numeric: true }));

  const courseOptions = uniqueBy(
    cards.map((card) => ({ id: card.courseId, title: card.courseTitle })),
    (course) => course.id,
  ).sort((a, b) => a.title.localeCompare(b.title, "en", { numeric: true }));

  const unitOptions = Array.from(new Set(cards.map((card) => card.unit).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

  const filteredCards = cards.filter((card) => {
    if (selectedProgram && card.programCode !== selectedProgram) return false;
    if (selectedCourse && card.courseId !== selectedCourse) return false;
    if (selectedUnit && card.unit !== selectedUnit) return false;
    if (selectedStatus && card.status !== selectedStatus) return false;
    if (normalizedSearch && !card.searchText.includes(normalizedSearch)) return false;
    return true;
  });

  const sortedCards = [...filteredCards].sort((a, b) => {
    if (selectedSort === "best_score") {
      return (b.bestScore ?? -1) - (a.bestScore ?? -1) || b.createdAt.getTime() - a.createdAt.getTime();
    }
    if (selectedSort === "not_started") {
      const rank: Record<TestStatus, number> = { not_started: 0, in_progress: 1, completed: 2 };
      return rank[a.status] - rank[b.status] || b.createdAt.getTime() - a.createdAt.getTime();
    }
    if (selectedSort === "program_unit") {
      return programRank(a.programCode) - programRank(b.programCode)
        || (a.unit || a.title).localeCompare(b.unit || b.title, "en", { numeric: true });
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const completedCount = cards.filter((card) => card.status === "completed").length;
  const inProgressCount = cards.filter((card) => card.status === "in_progress").length;
  const notStartedCount = cards.filter((card) => card.status === "not_started").length;
  const bestScores = cards.map((card) => card.bestScore).filter((score): score is number => score !== null);
  const averageBestScore = bestScores.length
    ? bestScores.reduce((sum, score) => sum + score, 0) / bestScores.length
    : null;

  return (
    <div className={styles.quizPageShell}>
      <section className={styles.quizHero}>
        <div>
          <span className={styles.cockpitEyebrow}><Timer size={16} /> Practice tests</span>
          <h1>Practice Tests with progress and results.</h1>
          <p>
            TOEIC, IELTS, grammar, reading, and listening tests are shown only when assigned to your active class.
          </p>
        </div>
        <div className={styles.quizHeroStats}>
          <div><strong>{cards.length}</strong><span>Total tests</span></div>
          <div><strong>{completedCount}</strong><span>Completed</span></div>
          <div><strong>{averageBestScore === null ? "-" : averageBestScore.toFixed(1)}</strong><span>Avg best score</span></div>
        </div>
      </section>

      <form className={styles.quizFilterPanel} action="/elearning/tests">
        <div className={styles.quizFilterHeader}>
          <div>
            <span className={styles.cockpitEyebrow}><SlidersHorizontal size={16} /> Filter library</span>
            <h2>Find a practice test</h2>
          </div>
          <div className={styles.quizFilterSummary}>
            <span>{notStartedCount} not started</span>
            <span>{inProgressCount} in progress</span>
            <span>{completedCount} completed</span>
          </div>
        </div>

        <div className={styles.quizFilterGrid}>
          <label className={styles.quizSearchControl}>
            <span>Search</span>
            <div>
              <Search size={16} />
              <input name="q" defaultValue={searchTerm} placeholder="Search title, exam type, class..." />
            </div>
          </label>
          <label>
            <span>Program</span>
            <select name="program" defaultValue={selectedProgram}>
              <option value="">All programs</option>
              {programOptions.map((program) => (
                <option key={program.code} value={program.code}>{program.code} - {program.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Course</span>
            <select name="course" defaultValue={selectedCourse}>
              <option value="">All courses</option>
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Unit</span>
            <select name="unit" defaultValue={selectedUnit}>
              <option value="">All units</option>
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select name="status" defaultValue={selectedStatus}>
              <option value="">All status</option>
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label>
            <span>Sort</span>
            <select name="sort" defaultValue={selectedSort}>
              <option value="newest">Newest</option>
              <option value="best_score">Best score</option>
              <option value="not_started">Not started first</option>
              <option value="program_unit">Program / unit</option>
            </select>
          </label>
        </div>

        <div className={styles.quizFilterActions}>
          <button className="btn-primary" type="submit">Apply filters</button>
          <Link href="/elearning/tests" className="btn-secondary">Clear filters</Link>
        </div>
      </form>

      {cards.length === 0 ? (
        <section className={styles.quizEmptyState}>
          <BookOpen size={42} />
          <h2>No practice tests available yet</h2>
          <p>Practice tests assigned to your active class will appear here automatically.</p>
        </section>
      ) : sortedCards.length === 0 ? (
        <section className={styles.quizEmptyState}>
          <Search size={42} />
          <h2>No results for this filter</h2>
          <p>Try a wider search or clear the filters to see every assigned practice test.</p>
          <Link href="/elearning/tests" className="btn-primary">Clear filters</Link>
        </section>
      ) : (
        <section className={styles.quizCardGrid} aria-label="Practice test list">
          {sortedCards.map((test) => (
            <Link href={`/elearning/tests/${test.id}`} key={test.id} className={styles.quizCard}>
              <div className={styles.quizCardTop}>
                <div className={styles.quizTypeIcon}>{skillIcon(test.skill)}</div>
                <span className={`${styles.quizStatusBadge} ${statusClassName(test.status)}`}>
                  {statusLabel(test.status)}
                </span>
              </div>

              <div className={styles.quizBadgeRow}>
                <span>{test.examType}</span>
                <span>{test.skill}</span>
                <span>{test.availability}</span>
              </div>

              <h2>{test.title}</h2>
              <p className={styles.quizCardDescription}>
                {test.description || `${test.courseTitle} - ${test.classCode}`}
              </p>

              <div className={styles.quizMetaGrid}>
                <div><Layers3 size={16} /><span>{test.questionCount} questions</span></div>
                <div><FileText size={16} /><span>{test.sectionCount} sections</span></div>
                <div><Clock size={16} /><span>{test.timeLimit ? `${test.timeLimit} min` : "No time limit"}</span></div>
                <div><Trophy size={16} /><span>Best {scoreLabel(test.bestScore)}</span></div>
                <div><RotateCcw size={16} /><span>{test.attemptCount}/{test.attemptLimit} attempts</span></div>
                <div><BookOpen size={16} /><span>{test.programCode} {test.unit ? `- Unit ${test.unit}` : ""}</span></div>
              </div>

              <div className={styles.quizProgressBlock}>
                <div>
                  <span>Progress</span>
                  <strong>{test.progress}%</strong>
                </div>
                <div className={styles.quizProgressTrack}>
                  <div style={{ width: `${test.progress}%` }} />
                </div>
              </div>

              <div className={styles.quizCardFooter}>
                <span>{test.lastAttemptAt ? `Last attempt ${dateFormatter.format(test.lastAttemptAt)}` : `${test.classCode} - ${test.courseTitle}`}</span>
                <strong>
                  {test.status === "in_progress" ? "Continue" : test.limitReached ? "View result" : test.available ? "Start test" : "View details"}
                  {test.status === "completed" ? <CheckCircle2 size={16} /> : <PlayCircle size={16} />}
                </strong>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  Clock,
  Layers3,
  PlayCircle,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";
import styles from "../elearning.module.css";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type QuizStatus = "not_started" | "in_progress" | "completed";

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

function statusLabel(status: QuizStatus) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function statusClassName(status: QuizStatus) {
  if (status === "completed") return styles.quizStatusCompleted;
  if (status === "in_progress") return styles.quizStatusProgress;
  return styles.quizStatusNew;
}

function scoreLabel(score: number | null) {
  if (score === null) return "No score yet";
  return score.toFixed(score % 1 === 0 ? 0 : 1);
}

export async function ClassQuizzesTab({ searchParams }: Props) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const selectedProgram = searchValue(resolvedSearchParams?.program);
  const selectedCourse = searchValue(resolvedSearchParams?.course);
  const selectedUnit = searchValue(resolvedSearchParams?.unit);
  const selectedStatus = searchValue(resolvedSearchParams?.status) as QuizStatus | "";
  const selectedSort = searchValue(resolvedSearchParams?.sort) || "newest";
  const searchTerm = searchValue(resolvedSearchParams?.q);
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const quizzes = await prisma.quiz.findMany({
    where: user.role === "STUDENT"
      ? {
          isPracticeTest: false,
          published: true,
          OR: [
            { isOpenQuiz: true },
            { classSection: { enrollments: { some: { userId: user.id, status: "ACTIVE" } } } },
          ],
        }
      : user.role === "TEACHER"
        ? { isPracticeTest: false, OR: [{ isOpenQuiz: true }, { classSection: { teacherId: user.id } }] }
        : { isPracticeTest: false },
    orderBy: { createdAt: "desc" },
    include: {
      program: true,
      classSection: { include: { course: true } },
      questions: true,
      attempts: {
        where: user.role === "STUDENT" ? { studentId: user.id } : {},
        orderBy: { startedAt: "desc" },
        include: { answers: true },
      },
    },
  });

  const cards = quizzes.map((quiz) => {
    const inProgressAttempt = quiz.attempts.find((attempt) => attempt.status === "IN_PROGRESS") || null;
    const completedAttempts = quiz.attempts.filter((attempt) => attempt.status !== "IN_PROGRESS");
    const bestScore = completedAttempts.reduce<number | null>((best, attempt) => {
      if (attempt.score === null) return best;
      return best === null ? attempt.score : Math.max(best, attempt.score);
    }, null);
    const lastAttempt = quiz.attempts[0] || null;
    const status: QuizStatus = inProgressAttempt ? "in_progress" : completedAttempts.length > 0 ? "completed" : "not_started";
    const progress = status === "completed"
      ? 100
      : inProgressAttempt && quiz.questions.length > 0
        ? Math.min(100, Math.round((inProgressAttempt.answers.length / quiz.questions.length) * 100))
        : 0;

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      unit: quiz.unit || "",
      programCode: quiz.program?.code || "General",
      programName: quiz.program?.name || "General",
      courseId: quiz.classSection?.course.id ?? "",
      courseTitle: quiz.classSection?.course.title ?? "",
      classCode: quiz.classSection?.code ?? "",
      questionCount: quiz.questions.length,
      timeLimit: quiz.timeLimit,
      attemptCount: quiz.attempts.length,
      attemptLimit: quiz.attemptLimit,
      bestScore,
      lastAttemptAt: lastAttempt?.submittedAt || lastAttempt?.startedAt || null,
      status,
      progress,
      isOpenQuiz: quiz.isOpenQuiz,
      createdAt: quiz.createdAt,
      searchText: [
        quiz.title,
        quiz.description,
        quiz.program?.code,
        quiz.program?.name,
        quiz.unit,
        quiz.classSection?.code,
        quiz.classSection?.course.title,
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
      const rank: Record<QuizStatus, number> = { not_started: 0, in_progress: 1, completed: 2 };
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
          <span className={styles.cockpitEyebrow}><ClipboardList size={16} /> Student quizzes</span>
          <h1>Quizzes built from real classroom data.</h1>
          <p>
            Filter by program, course, unit, and completion status. Your best score and latest attempt are pulled from PostgreSQL attempts.
          </p>
        </div>
        <div className={styles.quizHeroStats}>
          <div><strong>{cards.length}</strong><span>Total quizzes</span></div>
          <div><strong>{completedCount}</strong><span>Completed</span></div>
          <div><strong>{averageBestScore === null ? "-" : averageBestScore.toFixed(1)}</strong><span>Avg best score</span></div>
        </div>
      </section>

      <form className={styles.quizFilterPanel} action="/elearning/practice">
        <input type="hidden" name="tab" value="quizzes" />
        <div className={styles.quizFilterHeader}>
          <div>
            <span className={styles.cockpitEyebrow}><SlidersHorizontal size={16} /> Filter library</span>
            <h2>Find the right quiz</h2>
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
              <input name="q" defaultValue={searchTerm} placeholder="Search quiz title, class, unit..." />
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
          <Link href="/elearning/practice?tab=quizzes" className="btn-secondary">Clear filters</Link>
        </div>
      </form>

      {cards.length === 0 ? (
        <section className={styles.quizEmptyState}>
          <BookOpen size={42} />
          <h2>No quizzes available yet</h2>
          <p>When your teacher publishes class quizzes, they will appear here automatically.</p>
        </section>
      ) : sortedCards.length === 0 ? (
        <section className={styles.quizEmptyState}>
          <Search size={42} />
          <h2>No results for this filter</h2>
          <p>Try a wider search or clear the filters to see all available quizzes.</p>
          <Link href="/elearning/practice?tab=quizzes" className="btn-primary">Clear filters</Link>
        </section>
      ) : (
        <section className={styles.quizCardGrid} aria-label="Quiz list">
          {sortedCards.map((quiz) => (
            <Link href={`/elearning/exercises/${quiz.id}`} key={quiz.id} className={styles.quizCard}>
              <div className={styles.quizCardTop}>
                <div className={styles.quizTypeIcon}><ClipboardList size={22} /></div>
                <span className={`${styles.quizStatusBadge} ${statusClassName(quiz.status)}`}>
                  {statusLabel(quiz.status)}
                </span>
              </div>

              <div className={styles.quizBadgeRow}>
                <span>{quiz.programCode}</span>
                <span>{quiz.unit ? `Unit ${quiz.unit}` : "No unit"}</span>
                <span>{quiz.isOpenQuiz ? "Open quiz" : quiz.classCode}</span>
              </div>

              <h2>{quiz.title}</h2>
              <p className={styles.quizCardDescription}>
                {quiz.description || `${quiz.courseTitle} - ${quiz.classCode}`}
              </p>

              <div className={styles.quizMetaGrid}>
                <div><Layers3 size={16} /><span>{quiz.questionCount} questions</span></div>
                <div><Clock size={16} /><span>{quiz.timeLimit ? `${quiz.timeLimit} min` : "No time limit"}</span></div>
                <div><Trophy size={16} /><span>Best {scoreLabel(quiz.bestScore)}</span></div>
                <div><RotateCcw size={16} /><span>{quiz.attemptCount}/{quiz.attemptLimit} attempts</span></div>
              </div>

              <div className={styles.quizProgressBlock}>
                <div>
                  <span>Progress</span>
                  <strong>{quiz.progress}%</strong>
                </div>
                <div className={styles.quizProgressTrack}>
                  <div style={{ width: `${quiz.progress}%` }} />
                </div>
              </div>

              <div className={styles.quizCardFooter}>
                <span>{quiz.lastAttemptAt ? `Last attempt ${dateFormatter.format(quiz.lastAttemptAt)}` : "No attempts yet"}</span>
                <strong>
                  {quiz.status === "in_progress" ? "Resume" : quiz.status === "completed" ? "Review / Retake" : "Start quiz"}
                  <PlayCircle size={16} />
                </strong>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

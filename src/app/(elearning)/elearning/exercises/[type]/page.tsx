import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  ChevronLeft,
  Clock,
  RotateCcw,
  Send,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { notFound } from "next/navigation";
import styles from "../../elearning.module.css";
import { submitQuizAttemptAction } from "@/lib/lmsActions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import AutoSubmitTimer from "./AutoSubmitTimer";

type Props = {
  params: Promise<{ type: string }>;
  searchParams?: Promise<{ attempt?: string; submitted?: string }>;
};

type QuestionState = "correct" | "wrong" | "blank" | "pending";

export const dynamic = "force-dynamic";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function gridRows(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((row, index) => {
      if (!row || typeof row !== "object") return { label: String(index + 1), order: index + 1 };
      const item = row as { label?: unknown; order?: unknown };
      return {
        label: typeof item.label === "string" && item.label.trim() ? item.label : String(index + 1),
        order: typeof item.order === "number" ? item.order : index + 1,
      };
    })
    .sort((a, b) => a.order - b.order);
}

function hasAnswerText(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function formatScore(value: number | null | undefined) {
  if (typeof value !== "number") return "Pending";
  return value.toFixed(value % 1 === 0 ? 0 : 1);
}

function formatDuration(startedAt: Date, submittedAt: Date | null) {
  if (!submittedAt) return "In progress";
  const totalSeconds = Math.max(0, Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 1) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function questionStateClass(state: QuestionState) {
  if (state === "correct") return styles.reviewStateCorrect;
  if (state === "wrong") return styles.reviewStateWrong;
  if (state === "blank") return styles.reviewStateBlank;
  return styles.reviewStatePending;
}

function questionStateLabel(state: QuestionState) {
  if (state === "correct") return "Correct";
  if (state === "wrong") return "Wrong";
  if (state === "blank") return "Blank";
  return "Pending review";
}

export default async function QuizAttemptPage({ params, searchParams }: Props) {
  const user = await requireUser(["STUDENT", "TEACHER", "ADMIN"]);
  const { type: quizId } = await params;
  const resolvedSearchParams = await searchParams;
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      program: true,
      classSection: { include: { course: true, enrollments: true } },
      attempts: {
        where: { studentId: user.id },
        orderBy: { startedAt: "desc" },
        include: { answers: { include: { option: true } }, grades: true },
      },
      sections: { orderBy: { order: "asc" } },
      questions: {
        orderBy: { order: "asc" },
        include: {
          section: true,
          question: { include: { options: { orderBy: { order: "asc" } } } },
        },
      },
    },
  });

  if (!quiz || quiz.isPracticeTest) notFound();

  const isEnrolled = quiz.classSection.enrollments.some((enrollment) => enrollment.userId === user.id && enrollment.status === "ACTIVE");
  const canView = user.role !== "STUDENT" || quiz.isOpenQuiz || isEnrolled;
  if (!canView) notFound();

  const attemptCount = quiz.attempts.length;
  const selectedAttemptId = resolvedSearchParams?.attempt;
  const reviewAttempt = selectedAttemptId ? quiz.attempts.find((attempt) => attempt.id === selectedAttemptId) || null : null;
  const reviewMode = Boolean(reviewAttempt);
  const canAnswer = user.role === "STUDENT" && !reviewMode && attemptCount < quiz.attemptLimit;
  const reviewAnswerMap = new Map(reviewAttempt?.answers.map((answer) => [answer.questionId, answer]) || []);
  const totalPoints = quiz.questions.reduce((sum, link) => sum + link.points, 0);
  const reviewedQuestions = quiz.questions.map((link, index) => {
    const answer = reviewAnswerMap.get(link.question.id);
    const isBlank = !answer || (!answer.optionId && !hasAnswerText(answer.answerText));
    const state: QuestionState = isBlank
      ? "blank"
      : answer.isCorrect === true
        ? "correct"
        : answer.isCorrect === false
          ? "wrong"
          : "pending";
    return { link, answer, index: index + 1, state };
  });
  const correctCount = reviewedQuestions.filter((item) => item.state === "correct").length;
  const wrongCount = reviewedQuestions.filter((item) => item.state === "wrong").length;
  const blankCount = reviewedQuestions.filter((item) => item.state === "blank").length;
  const pendingCount = reviewedQuestions.filter((item) => item.state === "pending").length;
  const awardedPoints = reviewAttempt?.answers.reduce((sum, answer) => sum + (answer.pointsAwarded || 0), 0) || 0;
  const scoreValue = reviewAttempt?.score ?? (reviewAttempt ? awardedPoints : null);
  const scorePercent = reviewAttempt && totalPoints > 0 ? Math.round(((scoreValue || 0) / totalPoints) * 100) : 0;
  const sectionGroups = quiz.sections
    .map((section) => ({
      section,
      links: quiz.questions.filter((link) => link.sectionId === section.id),
    }))
    .filter((group) => group.links.length > 0);
  const unsectionedQuestions = quiz.questions.filter((link) => !link.sectionId);
  type QuestionLink = NonNullable<typeof quiz>["questions"][number];

  function renderQuestion(link: QuestionLink, questionNumber: number) {
    const question = link.question;
    const rows = gridRows(question.gridRows);
    const isMultipleChoice = question.type === "MULTIPLE_CHOICE" && question.options.length > 0;
    const isGrid = question.type === "GRID";
    const reviewAnswer = reviewAnswerMap.get(question.id);
    const isBlank = !reviewAnswer || (!reviewAnswer.optionId && !hasAnswerText(reviewAnswer.answerText));
    const state: QuestionState = isBlank
      ? "blank"
      : reviewAnswer.isCorrect === true
        ? "correct"
        : reviewAnswer.isCorrect === false
          ? "wrong"
          : "pending";
    const correctOptions = question.options.filter((option) => option.isCorrect);
    const correctOptionText = correctOptions.map((option) => `${option.label ? `${option.label}. ` : ""}${option.text}`).join(", ");
    const studentOptionText = reviewAnswer?.option
      ? `${reviewAnswer.option.label ? `${reviewAnswer.option.label}. ` : ""}${reviewAnswer.option.text}`
      : null;

    return (
      <article id={`question-${question.id}`} className={reviewMode ? styles.reviewQuestionCard : styles.panel} key={link.id}>
        <div className={styles.reviewQuestionHeader}>
          <div>
            <span>Question {question.sourceOrder || questionNumber}</span>
            <h3>{question.sourceType || question.type}</h3>
          </div>
          {reviewMode ? (
            <strong className={`${styles.reviewStatePill} ${questionStateClass(state)}`}>
              {questionStateLabel(state)}
            </strong>
          ) : null}
        </div>

        {question.passage ? <div className={styles.reviewPassage}>{question.passage}</div> : null}
        {question.audioUrl ? (
          <audio controls src={question.audioUrl} className={styles.reviewAudio}>
            Your browser does not support audio.
          </audio>
        ) : null}
        <p className={styles.reviewQuestionText}>{question.text}</p>

        {isMultipleChoice && (
          <div className={styles.reviewOptions}>
            {question.options.map((option) => {
              const wasSelected = reviewAnswer?.optionId === option.id;
              const isCorrectOption = option.isCorrect;
              const optionClass = reviewMode
                ? isCorrectOption
                  ? styles.reviewOptionCorrect
                  : wasSelected
                    ? styles.reviewOptionWrong
                    : ""
                : "";

              return (
                <label key={option.id} className={`${styles.reviewOption} ${optionClass}`}>
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={option.id}
                    disabled={!canAnswer}
                    required={canAnswer}
                    defaultChecked={reviewMode && wasSelected}
                  />
                  <span>
                    {option.label ? <strong>{option.label}. </strong> : null}
                    {option.text}
                  </span>
                  {reviewMode && isCorrectOption ? <em>Correct answer</em> : null}
                  {reviewMode && wasSelected ? <em>Your choice</em> : null}
                </label>
              );
            })}
          </div>
        )}

        {isGrid && (
          <div className={styles.reviewTextAnswerBlock}>
            {question.options.length > 0 && (
              <div className={styles.quizBadgeRow}>
                {question.options.map((option) => (
                  <span key={option.id}>
                    {option.label ? `${option.label}. ` : ""}
                    {option.text}
                  </span>
                ))}
              </div>
            )}
            {rows.length > 0 && (
              <div className={styles.reviewGridRows}>
                {rows.map((row) => <span key={`${question.id}-${row.order}`}>{row.label}</span>)}
              </div>
            )}
            <textarea
              name={`question_${question.id}`}
              disabled={!canAnswer}
              required={canAnswer}
              placeholder="Write your answers in order, one per line."
              defaultValue={reviewMode ? reviewAnswer?.answerText || "" : ""}
            />
          </div>
        )}

        {!isMultipleChoice && !isGrid && (
          <textarea
            className={styles.reviewTextarea}
            name={`question_${question.id}`}
            disabled={!canAnswer}
            required={canAnswer}
            placeholder="Write your answer here..."
            defaultValue={reviewMode ? reviewAnswer?.answerText || "" : ""}
          />
        )}

        {reviewMode ? (
          <div className={styles.reviewAnswerGrid}>
            <div>
              <span>Your answer</span>
              <strong>{isBlank ? "Blank" : studentOptionText || reviewAnswer?.answerText || "-"}</strong>
            </div>
            <div>
              <span>Correct answer</span>
              <strong>{correctOptionText || question.answerKey || "Pending answer key"}</strong>
            </div>
            <div>
              <span>Points</span>
              <strong>{formatScore(reviewAnswer?.pointsAwarded)} / {formatScore(link.points)}</strong>
            </div>
          </div>
        ) : null}

        {reviewMode && question.explanation ? (
          <div className={styles.reviewExplanation}>
            <strong>Explanation</strong>
            <p>{question.explanation}</p>
          </div>
        ) : null}


      </article>
    );
  }

  return (
    <div className={styles.reviewPageShell}>
      <Link href="/elearning/exercises" className={styles.reviewBackLink}>
        <ChevronLeft size={16} /> Back to quizzes
      </Link>

      <section className={styles.reviewHero}>
        <div>
          <span className={styles.cockpitEyebrow}><Target size={16} /> Quiz review</span>
          <h1>{quiz.title}</h1>
          <p>
            {quiz.program?.code || "General"} | Unit {quiz.unit || "-"} | {quiz.questions.length} questions | {quiz.sourceTitle || quiz.classSection.code}
          </p>
        </div>
        <div className={styles.reviewHeroActions}>
          {canAnswer && quiz.timeLimit ? (
            <span className={styles.reviewTimer}><Clock size={16} /><AutoSubmitTimer formId={`quiz-form-${quiz.id}`} seconds={quiz.timeLimit * 60} /></span>
          ) : (
            <span className={styles.reviewTimer}><Clock size={16} />{quiz.timeLimit ? `${quiz.timeLimit} minutes` : "No time limit"}</span>
          )}
        </div>
      </section>

      {reviewAttempt ? (
        <section className={styles.reviewSummary}>
          <div className={styles.reviewScoreDial} style={{ background: `conic-gradient(#10b981 ${scorePercent * 3.6}deg, rgba(255,255,255,0.18) 0deg)` }}>
            <div>
              <Trophy size={28} />
              <strong>{scorePercent}%</strong>
              <span>{formatScore(scoreValue)} / {formatScore(totalPoints)}</span>
            </div>
          </div>
          <div className={styles.reviewSummaryContent}>
            <span className={styles.cockpitEyebrow}>Attempt result</span>
            <h2>{pendingCount > 0 ? "Partly graded, manual review pending" : "Your quiz has been graded"}</h2>
            <div className={styles.reviewStatGrid}>
              <div><CheckCircle2 size={20} /><strong>{correctCount}</strong><span>Correct</span></div>
              <div><XCircle size={20} /><strong>{wrongCount}</strong><span>Wrong</span></div>
              <div><AlertCircle size={20} /><strong>{blankCount}</strong><span>Blank</span></div>
              <div><Clock size={20} /><strong>{formatDuration(reviewAttempt.startedAt, reviewAttempt.submittedAt)}</strong><span>Time spent</span></div>
            </div>
            <div className={styles.reviewActionRow}>
              {wrongCount > 0 ? (
                <Link href={`/elearning/wrong-questions?quiz=${quiz.id}`} className="btn-primary">
                  Practice wrong questions again <ArrowRight size={16} />
                </Link>
              ) : null}
              <Link href="/elearning/exercises" className="btn-secondary">Back to quizzes</Link>
              {attemptCount < quiz.attemptLimit && user.role === "STUDENT" ? (
                <Link href={`/elearning/exercises/${quiz.id}`} className="btn-secondary">
                  <RotateCcw size={16} /> Retake quiz
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {quiz.attempts.length > 0 && (
        <section className={styles.reviewAttemptPanel}>
          <div className={styles.cockpitPanelHeader}>
            <div>
              <span className={styles.cockpitEyebrow}>Previous attempts</span>
              <h2>Review history</h2>
            </div>
          </div>
          <div className={styles.reviewAttemptList}>
            {quiz.attempts.map((attempt) => (
              <Link
                href={`/elearning/exercises/${quiz.id}?attempt=${attempt.id}`}
                key={attempt.id}
                className={attempt.id === reviewAttempt?.id ? styles.reviewAttemptActive : ""}
              >
                <span>{attempt.status}</span>
                <strong>{formatScore(attempt.score)}</strong>
                <small>{dateTimeFormatter.format(attempt.startedAt)}</small>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!canAnswer && !reviewMode && user.role === "STUDENT" && (
        <section className={styles.quizEmptyState}>
          <Trophy size={42} />
          <h2>Attempt limit reached</h2>
          <p>You can review your previous attempts or check your score history.</p>
          <Link href="/elearning/scores" className="btn-primary">Open scores</Link>
        </section>
      )}

      {reviewMode ? (
        <div className={styles.reviewLayout}>
          <aside className={styles.reviewSidebar}>
            <h2>Question map</h2>
            <p>Jump to any question and inspect the result.</p>
            <div>
              {reviewedQuestions.map((item) => (
                <a
                  href={`#question-${item.link.question.id}`}
                  key={item.link.id}
                  className={questionStateClass(item.state)}
                  title={questionStateLabel(item.state)}
                >
                  {item.index}
                </a>
              ))}
            </div>
          </aside>
          <div className={styles.reviewQuestionList}>
            {sectionGroups.map((group) => (
              <section key={group.section.id} className={styles.reviewSection}>
                <h2>{group.section.title}</h2>
                {group.links.map((link) => renderQuestion(link, quiz.questions.findIndex((item) => item.id === link.id) + 1))}
              </section>
            ))}
            {unsectionedQuestions.map((link) => renderQuestion(link, quiz.questions.findIndex((item) => item.id === link.id) + 1))}
          </div>
        </div>
      ) : (
        <form id={`quiz-form-${quiz.id}`} action={submitQuizAttemptAction}>
          <input type="hidden" name="quizId" value={quiz.id} />
          <div className={styles.reviewQuestionList}>
            {sectionGroups.map((group) => (
              <section key={group.section.id} className={styles.reviewSection}>
                <h2>{group.section.title}</h2>
                {group.links.map((link) => renderQuestion(link, quiz.questions.findIndex((item) => item.id === link.id) + 1))}
              </section>
            ))}
            {unsectionedQuestions.map((link) => renderQuestion(link, quiz.questions.findIndex((item) => item.id === link.id) + 1))}
          </div>
          {canAnswer && (
            <div className={styles.reviewSubmitBar}>
              <button className="btn-primary" type="submit">
                Submit Attempt <Send size={16} />
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

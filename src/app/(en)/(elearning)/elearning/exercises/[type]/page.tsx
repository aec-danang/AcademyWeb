/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
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
import ReviewQuestionMap from "./ReviewQuestionMap";

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

import React from "react";

function toYoutubeEmbedUrl(url: string) {
  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }
  if (url.includes("youtu.be/")) {
    return url.replace("youtu.be/", "youtube.com/embed/");
  }
  return url;
}

function isYoutubeUrl(url: string) {
  return /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)/i.test(url);
}

function renderMediaSource(url: string, key?: React.Key) {
  if (isYoutubeUrl(url)) {
    return (
      <iframe
        key={key}
        src={toYoutubeEmbedUrl(url)}
        width="100%"
        height="315"
        frameBorder="0"
        allowFullScreen
        className={styles.mediaVideo}
      />
    );
  }

  return (
    <audio key={key} controls src={url} className={styles.reviewAudio}>
      Your browser does not support audio.
    </audio>
  );
}

function parseMediaTags(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const imgMatch = line.match(/\[Image:\s*(.+?)\]/i);
    if (imgMatch) {
      return <img key={idx} src={imgMatch[1]} alt="Media" className={styles.mediaImage} />;
    }
    const vidMatch = line.match(/\[Video:\s*(.+?)\]/i);
    if (vidMatch) {
      return renderMediaSource(vidMatch[1], idx);
    }
    const audMatch = line.match(/\[Audio:\s*(.+?)\]/i);
    if (audMatch) {
      return renderMediaSource(audMatch[1], idx);
    }
    
    const rawYoutubeMatch = line.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+)/i);
    if (rawYoutubeMatch) {
      const textWithoutUrl = line.replace(rawYoutubeMatch[0], '');
      return (
        <React.Fragment key={idx}>
          {textWithoutUrl && <span>{textWithoutUrl}</span>}
          {renderMediaSource(rawYoutubeMatch[1])}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    }
    
    return <React.Fragment key={idx}>{line}{idx < lines.length - 1 && <br />}</React.Fragment>;
  });
}

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

function answerStateClass(state: QuestionState) {
  if (state === "correct") return styles.reviewAnswerCorrect;
  if (state === "wrong") return styles.reviewAnswerWrong;
  if (state === "blank") return styles.reviewAnswerBlank;
  return styles.reviewAnswerPending;
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

  if (!quiz) notFound();

  let canView = true;
  if (user.role === "STUDENT") {
    if (!quiz.isPracticeTest && !quiz.isOpenQuiz) {
      const isEnrolled = quiz.classSection?.enrollments.some(
        (enrollment: any) => enrollment.userId === user.id && enrollment.status === "ACTIVE"
      );
      if (!isEnrolled) canView = false;
    }
  }
  
  if (!canView) notFound();

  const attemptCount = quiz.attempts.length;
  const selectedAttemptId = resolvedSearchParams?.attempt;
  const reviewAttempt = selectedAttemptId ? quiz.attempts.find((attempt: any) => attempt.id === selectedAttemptId) || null : null;
  const reviewMode = Boolean(reviewAttempt);
  const canTakeQuiz = user.role === "STUDENT" || user.role === "TEACHER" || user.role === "ADMIN";
  const canAnswer = canTakeQuiz && !reviewMode && attemptCount < quiz.attemptLimit;
  const reviewAnswerMap = new Map<string, any>(reviewAttempt?.answers.map((answer: any) => [answer.questionId, answer]) || []);
  const totalPoints = quiz.questions.reduce((sum: number, link: any) => sum + link.points, 0);
  const reviewedQuestions = quiz.questions.map((link: any, index: number) => {
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
  const scoredReviewedQuestions = reviewedQuestions.filter((item: any) => item.link.points > 0);
  const correctCount = scoredReviewedQuestions.filter((item: any) => item.state === "correct").length;
  const wrongCount = scoredReviewedQuestions.filter((item: any) => item.state === "wrong").length;
  const blankCount = scoredReviewedQuestions.filter((item: any) => item.state === "blank").length;
  const pendingCount = scoredReviewedQuestions.filter((item: any) => item.state === "pending").length;
  const awardedPoints = reviewAttempt?.answers.reduce((sum: number, answer: any) => sum + (answer.pointsAwarded || 0), 0) || 0;
  const scoreValue = reviewAttempt?.score ?? (reviewAttempt ? awardedPoints : null);
  const scorePercent = reviewAttempt && totalPoints > 0 ? Math.round(((scoreValue || 0) / totalPoints) * 100) : 0;
  const sectionGroups = quiz.sections
    .map((section: any) => ({
      section,
      links: quiz.questions.filter((link: any) => link.sectionId === section.id),
    }))
    .filter((group: any) => group.links.length > 0);
  const unsectionedQuestions = quiz.questions.filter((link: any) => !link.sectionId);
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
    const correctOptions = question.options.filter((option: any) => option.isCorrect);
    const correctOptionText = correctOptions.map((option: any) => `${option.label ? `${option.label}. ` : ""}${option.text}`).join(", ");
    const studentOptionText = reviewAnswer?.option
      ? `${reviewAnswer.option.label ? `${reviewAnswer.option.label}. ` : ""}${reviewAnswer.option.text}`
      : null;
    const isInformationalQuestion = link.points <= 0 && !question.answerKey && question.options.length === 0;

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
        {question.audioUrl ? renderMediaSource(question.audioUrl) : null}
        <div className={styles.reviewQuestionText}>{parseMediaTags(question.text)}</div>

        {isMultipleChoice && (
          <div className={styles.reviewOptions}>
            {question.options.map((option: any) => {
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
                {question.options.map((option: any) => (
                  <span key={option.id}>
                    {option.label ? `${option.label}. ` : ""}
                    {option.text}
                  </span>
                ))}
              </div>
            )}
            {rows.length > 0 && (
              <div className={styles.reviewGridRows}>
                {rows.map((row: any) => <span key={`${question.id}-${row.order}`}>{row.label}</span>)}
              </div>
            )}
            <textarea
              name={`question_${question.id}`}
              disabled={!canAnswer}
              required={canAnswer}
              placeholder="Write your answers in order, one per line."
              defaultValue={reviewMode ? reviewAnswer?.answerText || "" : ""}
              className={reviewMode ? answerStateClass(state) : undefined}
            />
          </div>
        )}

        {!isInformationalQuestion && !isMultipleChoice && !isGrid && question.type !== "READING" && (
          <textarea
            className={`${styles.reviewTextarea} ${reviewMode ? answerStateClass(state) : ""}`}
            name={`question_${question.id}`}
            disabled={!canAnswer}
            required={canAnswer}
            placeholder="Write your answer here..."
            defaultValue={reviewMode ? reviewAnswer?.answerText || "" : ""}
          />
        )}

        {reviewMode ? (
          <div className={styles.reviewAnswerGrid}>
            <div className={answerStateClass(state)}>
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
            {quiz.program?.code || "General"} | Unit {quiz.unit || "-"} | {quiz.questions.length} questions | {quiz.sourceTitle || quiz.classSection?.code || "Practice Test"}
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

      {quiz.audioUrl ? (
        <section className={styles.panel}>
          <div className={styles.cockpitPanelHeader}>
            <div>
              <span className={styles.cockpitEyebrow}>Listening media</span>
              <h2>{quiz.sourceTitle || quiz.title}</h2>
            </div>
          </div>
          {renderMediaSource(quiz.audioUrl)}
        </section>
      ) : null}

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
            {quiz.attempts.map((attempt: any) => (
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

      {!canAnswer && !reviewMode && canTakeQuiz && (
        <section className={styles.quizEmptyState}>
          <Trophy size={42} />
          <h2>Attempt limit reached</h2>
          <p>You can review your previous attempts or check your score history.</p>
          <Link href="/elearning/scores" className="btn-primary">Open scores</Link>
        </section>
      )}

      {reviewMode ? (
        <div className={styles.reviewLayout}>
          <ReviewQuestionMap>
            <h2>Question map</h2>
            <p>Jump to any question and inspect the result.</p>
            <div>
              {reviewedQuestions.map((item: any) => (
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
          </ReviewQuestionMap>
          <div className={styles.reviewQuestionList}>
            {sectionGroups.map((group: any) => (
              <section key={group.section.id} className={styles.reviewSection}>
                <h2>{group.section.title}</h2>
                {group.section.instructions ? <div className={styles.reviewQuestionText}>{parseMediaTags(group.section.instructions)}</div> : null}
                {group.section.passage ? <div className={styles.reviewPassage}>{group.section.passage}</div> : null}
                {group.section.audioUrl ? renderMediaSource(group.section.audioUrl) : null}
                {group.links.map((link: any) => renderQuestion(link, quiz.questions.findIndex((item: any) => item.id === link.id) + 1))}
              </section>
            ))}
            {unsectionedQuestions.map((link: any) => renderQuestion(link, quiz.questions.findIndex((item: any) => item.id === link.id) + 1))}
          </div>
        </div>
      ) : (
        <form id={`quiz-form-${quiz.id}`} action={submitQuizAttemptAction}>
          <input type="hidden" name="quizId" value={quiz.id} />
          <div className={styles.reviewQuestionList}>
            {sectionGroups.map((group: any) => (
              <section key={group.section.id} className={styles.reviewSection}>
                <h2>{group.section.title}</h2>
                {group.section.instructions ? <div className={styles.reviewQuestionText}>{parseMediaTags(group.section.instructions)}</div> : null}
                {group.section.passage ? <div className={styles.reviewPassage}>{group.section.passage}</div> : null}
                {group.section.audioUrl ? renderMediaSource(group.section.audioUrl) : null}
                {group.links.map((link: any) => renderQuestion(link, quiz.questions.findIndex((item: any) => item.id === link.id) + 1))}
              </section>
            ))}
            {unsectionedQuestions.map((link: any) => renderQuestion(link, quiz.questions.findIndex((item: any) => item.id === link.id) + 1))}
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

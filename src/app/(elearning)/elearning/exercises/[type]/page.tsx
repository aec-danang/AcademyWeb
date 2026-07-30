/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  LoaderCircle,
  RotateCcw,
  Send,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { notFound } from "next/navigation";
import styles from "../../elearning.module.css";
import { gradePracticeAttemptAction, startQuizReviewAttemptAction, submitQuizAttemptAction } from "@/lib/lmsActions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import AutoSubmitTimer from "./AutoSubmitTimer";
import ReviewQuestionMap from "./ReviewQuestionMap";
import AiGradeAttemptButton from "./AiGradeAttemptButton";
import AiGradeProgress from "./AiGradeProgress";
import { ElearningBreadcrumbs } from "../../ElearningBreadcrumbs";

type Props = {
  params: Promise<{ type: string }>;
  searchParams?: Promise<{ attempt?: string; submitted?: string; delivery?: string; review?: string }>;
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
      classSection: { include: { enrollments: true } },
      deliveries: {
        include: { classSection: { include: { enrollments: true } } },
        orderBy: { createdAt: "desc" },
      },
      attempts: {
        where: user.role === "STUDENT" ? { studentId: user.id } : resolvedSearchParams?.attempt ? { id: resolvedSearchParams.attempt } : { studentId: user.id },
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

  const now = new Date();
  const requestedDelivery = resolvedSearchParams?.delivery;
  const activeDelivery = quiz.deliveries.find((delivery) => {
    if (requestedDelivery && delivery.id !== requestedDelivery) return false;
    if (delivery.status !== "PUBLISHED") return false;
    if (delivery.openAt && delivery.openAt > now) return false;
    if (delivery.dueAt && delivery.dueAt < now) return false;
    return user.role !== "STUDENT" || (delivery.classSection.status === "ACTIVE" && delivery.classSection.enrollments.some(
      (enrollment) => enrollment.userId === user.id && enrollment.status === "ACTIVE",
    ));
  }) || null;

  let canView = true;
  if (user.role === "STUDENT") {
    const hasLegacyAccess = quiz.classSection?.status === "ACTIVE" && quiz.classSection.enrollments.some(
      (enrollment) => enrollment.userId === user.id && enrollment.status === "ACTIVE",
    );
    const ownsRequestedReview = resolvedSearchParams?.review === "1"
      && quiz.attempts.some((attempt) => attempt.id === resolvedSearchParams.attempt && attempt.studentId === user.id && attempt.isReviewPractice);
    if (!activeDelivery && !quiz.isOpenQuiz && !hasLegacyAccess && !ownsRequestedReview) canView = false;
  }
  
  if (!canView) notFound();

  const officialAttempts = quiz.attempts.filter((attempt) => !attempt.isReviewPractice);
  const practiceAttempts = quiz.attempts.filter((attempt) => attempt.isReviewPractice);
  const deliveryAttempts = activeDelivery
    ? officialAttempts.filter((attempt) => attempt.quizDeliveryId === activeDelivery.id)
    : officialAttempts.filter((attempt) => !attempt.quizDeliveryId);
  const attemptCount = deliveryAttempts.length;
  const attemptLimit = activeDelivery?.attemptLimit || quiz.attemptLimit;
  const selectedAttemptId = resolvedSearchParams?.attempt;
  const reviewAttempt = selectedAttemptId ? quiz.attempts.find((attempt) => attempt.id === selectedAttemptId) || null : null;
  const isReviewPracticeSession = Boolean(reviewAttempt?.isReviewPractice && reviewAttempt.status === "IN_PROGRESS");
  const reviewMode = Boolean(reviewAttempt && !isReviewPracticeSession);
  const canTakeQuiz = user.role === "STUDENT";
  const canAnswer = canTakeQuiz && (isReviewPracticeSession || (!reviewMode && attemptCount < attemptLimit));
  const activeQuestionIds = isReviewPracticeSession ? new Set(reviewAttempt?.reviewQuestionIds || []) : null;
  const activeQuestions = activeQuestionIds ? quiz.questions.filter((link) => activeQuestionIds.has(link.questionId)) : quiz.questions;
  const reviewAnswerMap = new Map(reviewAttempt?.answers.map((answer) => [answer.questionId, answer]) || []);
  const resultQuestions = reviewAttempt?.isReviewPractice
    ? quiz.questions.filter((link) => reviewAttempt.reviewQuestionIds.includes(link.questionId))
    : quiz.questions;
  const totalPoints = (reviewMode ? resultQuestions : activeQuestions).reduce((sum, link) => sum + link.points, 0);
  const reviewedQuestions = resultQuestions.map((link, index) => {
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
  const scoredReviewedQuestions = reviewedQuestions.filter((item) => item.link.points > 0);
  const correctCount = scoredReviewedQuestions.filter((item) => item.state === "correct").length;
  const wrongCount = scoredReviewedQuestions.filter((item) => item.state === "wrong").length;
  const blankCount = scoredReviewedQuestions.filter((item) => item.state === "blank").length;
  const pendingCount = scoredReviewedQuestions.filter((item) => item.state === "pending").length;
  const awardedPoints = reviewAttempt?.answers.reduce((sum, answer) => sum + (answer.pointsAwarded || 0), 0) || 0;
  const attemptGrade = reviewAttempt?.grades[0] || null;
  const officialScore = attemptGrade?.status === "PUBLISHED" && typeof attemptGrade.score === "number" ? attemptGrade.score : null;
  const scoreValue = officialScore ?? reviewAttempt?.score ?? (reviewAttempt ? awardedPoints : null);
  const scorePercent = reviewAttempt && totalPoints > 0 ? Math.round(((scoreValue || 0) / totalPoints) * 100) : 0;
  const visibleQuestions = reviewMode ? resultQuestions : activeQuestions;
  const sectionGroups = quiz.sections
    .map((section) => ({
      section,
      links: visibleQuestions.filter((link) => link.sectionId === section.id),
    }))
    .filter((group) => group.links.length > 0);
  const unsectionedQuestions = visibleQuestions.filter((link) => !link.sectionId);
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
      <ElearningBreadcrumbs items={[
        { label: "Practice", href: "/elearning/practice?tab=quizzes" },
        ...(quiz.classSection ? [{ label: quiz.classSection.code, href: `/elearning/classrooms/${quiz.classSection.id}?tab=quizzes` }] : []),
        { label: quiz.title },
      ]} />

      <section className={styles.reviewHero}>
        <div>
          <span className={styles.cockpitEyebrow}><Target size={16} /> {isReviewPracticeSession ? "Practice session" : reviewAttempt?.isReviewPractice ? "Practice result" : "Quiz review"}</span>
          <h1>{quiz.title}</h1>
          <p>
            {quiz.program?.code || "General"} | Unit {quiz.unit || "-"} | {visibleQuestions.length} questions | {quiz.sourceTitle || quiz.classSection?.code || "Quiz"}
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
            <span className={styles.cockpitEyebrow}>{reviewAttempt.isReviewPractice ? "Practice result · not counted in your official score" : "Official attempt result"}</span>
            <h2>{reviewAttempt.isReviewPractice ? "Your review practice has been saved separately" : officialScore !== null ? "Your teacher has published the final score" : pendingCount > 0 ? "Partly graded, teacher review pending" : "Your quiz has been graded"}</h2>
            <div className={styles.reviewStatGrid}>
              <div><CheckCircle2 size={20} /><strong>{correctCount}</strong><span>Correct</span></div>
              <div><XCircle size={20} /><strong>{wrongCount}</strong><span>Wrong</span></div>
              <div><AlertCircle size={20} /><strong>{blankCount}</strong><span>Blank</span></div>
              <div><Clock size={20} /><strong>{formatDuration(reviewAttempt.startedAt, reviewAttempt.submittedAt)}</strong><span>Time spent</span></div>
            </div>
            <div className={styles.reviewActionRow}>
              {wrongCount > 0 && user.role === "STUDENT" ? <form action={startQuizReviewAttemptAction}>
                <input type="hidden" name="quizId" value={quiz.id} />
                <input type="hidden" name="scope" value="wrong" />
                {activeDelivery ? <input type="hidden" name="quizDeliveryId" value={activeDelivery.id} /> : null}
                <button type="submit" className="btn-primary">Retry wrong questions <ArrowRight size={16} /></button>
              </form> : null}
              {quiz.classSection ? <Link href={`/elearning/classrooms/${quiz.classSection.id}?tab=quizzes`} className="btn-secondary">Back to classroom</Link> : <Link href="/elearning/practice?tab=quizzes" className="btn-secondary">Back to quizzes</Link>}
              {user.role === "STUDENT" ? <form action={startQuizReviewAttemptAction}>
                <input type="hidden" name="quizId" value={quiz.id} />
                <input type="hidden" name="scope" value="full" />
                {activeDelivery ? <input type="hidden" name="quizDeliveryId" value={activeDelivery.id} /> : null}
                <button type="submit" className="btn-secondary"><RotateCcw size={16} /> Practice full quiz</button>
              </form> : null}
            </div>
          </div>
        </section>
      ) : null}

      {reviewAttempt && !reviewAttempt.isReviewPractice && attemptGrade && pendingCount > 0 ? (
        <section className={`${styles.aiSuggestionPanel} ${styles[`aiSuggestion${attemptGrade.aiStatus}`] || ""}`}>
          <AiGradeProgress pending={attemptGrade.aiStatus === "PENDING"} />
          <header>
            <div>
              <span><Bot size={16} /> AI first pass</span>
              <h3>{attemptGrade.aiStatus === "COMPLETED" ? "Writing suggestion ready" : attemptGrade.aiStatus === "PENDING" ? "Analyzing written answers" : "AI suggestion unavailable"}</h3>
            </div>
            {attemptGrade.aiStatus === "COMPLETED" && typeof attemptGrade.aiScore === "number"
              ? <strong>{formatScore(attemptGrade.aiScore)}/{formatScore(totalPoints)}</strong>
              : attemptGrade.aiStatus === "PENDING"
                ? <LoaderCircle className={styles.spinner} size={22} />
                : <AlertCircle size={22} />}
          </header>
          {attemptGrade.aiStatus === "COMPLETED" ? (
            <>
              <p className={styles.aiAdvisory}>Provisional only · Confidence {Math.round((attemptGrade.aiConfidence || 0) * 100)}% · {attemptGrade.aiModel || "AI model"}</p>
              {attemptGrade.aiFeedback ? <p className={styles.aiFeedback}>{attemptGrade.aiFeedback}</p> : null}
            </>
          ) : (
            <p className={styles.aiAdvisory}>
              {attemptGrade.aiStatus === "PENDING"
                ? "Your submission is complete. AI is preparing a first pass while the teacher review stays pending."
                : user.role === "STUDENT"
                  ? "Your submission is complete and is waiting for teacher review."
                  : attemptGrade.aiError || "You can grade manually or retry AI."}
            </p>
          )}
          {user.role !== "STUDENT" ? <AiGradeAttemptButton attemptId={reviewAttempt.id} /> : null}
        </section>
      ) : null}

      {reviewAttempt && !reviewAttempt.isReviewPractice && user.role !== "STUDENT" && pendingCount > 0 ? <section className={styles.dashboardPanel}>
        <div className={styles.dashboardPanelHeader}><div><span className={styles.cockpitEyebrow}>Teacher review</span><h2>Finalize written answers</h2></div></div>
        <p className={styles.aiAdvisory}>Enter the teacher score below. The AI score above remains stored separately and is never published automatically.</p>
        <form action={gradePracticeAttemptAction} className={styles.workflowFieldGrid}>
          <input type="hidden" name="attemptId" value={reviewAttempt.id} />
          <label className={styles.workflowField}><span>Teacher score / {formatScore(totalPoints)}</span><input name="score" type="number" min="0" max={totalPoints} step="0.5" defaultValue={attemptGrade?.gradedById ? attemptGrade.score ?? undefined : undefined} placeholder={typeof attemptGrade?.aiScore === "number" ? `AI suggests ${formatScore(attemptGrade.aiScore)}` : undefined} required /></label>
          <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Teacher feedback</span><textarea name="feedback" rows={4} defaultValue={attemptGrade?.gradedById ? attemptGrade.feedback || undefined : undefined} placeholder="Review the written response and explain the final score." /></label>
          <button className="btn-primary" type="submit">Publish final score</button>
        </form>
      </section> : null}

      {(officialAttempts.length > 0 || practiceAttempts.length > 0) && (
        <section className={styles.reviewAttemptPanel}>
          <div className={styles.cockpitPanelHeader}>
            <div>
              <span className={styles.cockpitEyebrow}>Attempt history</span>
              <h2>Official results and separate practice</h2>
            </div>
          </div>
          <div className={styles.reviewAttemptList}>
            {[...officialAttempts, ...practiceAttempts].map((attempt) => (
              <Link
                href={`/elearning/exercises/${quiz.id}?attempt=${attempt.id}`}
                key={attempt.id}
                className={attempt.id === reviewAttempt?.id ? styles.reviewAttemptActive : ""}
              >
                <span>{attempt.isReviewPractice ? `PRACTICE · ${attempt.reviewScope === "WRONG_ONLY" ? "WRONG QUESTIONS" : "FULL QUIZ"}` : `OFFICIAL · ${attempt.status}`}</span>
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
          </ReviewQuestionMap>
          <div className={styles.reviewQuestionList}>
            {sectionGroups.map((group) => (
              <section key={group.section.id} className={styles.reviewSection}>
                <h2>{group.section.title}</h2>
                {group.section.instructions ? <div className={styles.reviewQuestionText}>{parseMediaTags(group.section.instructions)}</div> : null}
                {group.section.passage ? <div className={styles.reviewPassage}>{group.section.passage}</div> : null}
                {group.section.audioUrl ? renderMediaSource(group.section.audioUrl) : null}
                {group.links.map((link) => renderQuestion(link, visibleQuestions.findIndex((item) => item.id === link.id) + 1))}
              </section>
            ))}
            {unsectionedQuestions.map((link) => renderQuestion(link, visibleQuestions.findIndex((item) => item.id === link.id) + 1))}
          </div>
        </div>
      ) : (
        <form id={`quiz-form-${quiz.id}`} action={submitQuizAttemptAction}>
          <input type="hidden" name="quizId" value={quiz.id} />
          {isReviewPracticeSession && reviewAttempt ? <input type="hidden" name="reviewAttemptId" value={reviewAttempt.id} /> : null}
          {activeDelivery ? <input type="hidden" name="quizDeliveryId" value={activeDelivery.id} /> : null}
          <div className={styles.reviewQuestionList}>
            {sectionGroups.map((group) => (
              <section key={group.section.id} className={styles.reviewSection}>
                <h2>{group.section.title}</h2>
                {group.section.instructions ? <div className={styles.reviewQuestionText}>{parseMediaTags(group.section.instructions)}</div> : null}
                {group.section.passage ? <div className={styles.reviewPassage}>{group.section.passage}</div> : null}
                {group.section.audioUrl ? renderMediaSource(group.section.audioUrl) : null}
                {group.links.map((link) => renderQuestion(link, visibleQuestions.findIndex((item) => item.id === link.id) + 1))}
              </section>
            ))}
            {unsectionedQuestions.map((link) => renderQuestion(link, visibleQuestions.findIndex((item) => item.id === link.id) + 1))}
          </div>
          {canAnswer && (
            <div className={styles.reviewSubmitBar}>
              <button className="btn-primary" type="submit">
                {isReviewPracticeSession ? "Save practice result" : "Submit attempt"} <Send size={16} />
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

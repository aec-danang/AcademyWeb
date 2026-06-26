import Link from "next/link";
import { ChevronLeft, PlayCircle, Send, Timer } from "lucide-react";
import { notFound } from "next/navigation";
import styles from "../../elearning.module.css";
import { startPracticeTestAction, submitPracticeTestAttemptAction } from "@/lib/lmsActions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import AutoSubmitTestTimer from "../AutoSubmitTestTimer";
import PracticeAnswerInput from "../PracticeAnswerInput";

type Props = {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ attempt?: string }>;
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function isOpen(openAt: Date | null, closeAt: Date | null) {
  const now = new Date();
  return (!openAt || openAt <= now) && (!closeAt || closeAt >= now);
}

export default async function PracticeTestDetailPage({ params, searchParams }: Props) {
  const user = await requireUser(["STUDENT", "TEACHER", "ADMIN"]);
  const { testId } = await params;
  const { attempt: requestedAttemptId } = await searchParams;
  const test = await prisma.quiz.findUnique({
    where: { id: testId },
    include: {
      classSection: { include: { course: true, enrollments: { include: { student: true } } } },
      sections: { orderBy: { order: "asc" } },
      attempts: {
        where: user.role === "STUDENT" ? { studentId: user.id } : {},
        orderBy: { startedAt: "desc" },
        include: { answers: true, student: true },
      },
      questions: {
        orderBy: { order: "asc" },
        include: {
          section: true,
          question: { include: { options: { orderBy: { order: "asc" } } } },
        },
      },
    },
  });

  if (!test || !test.isPracticeTest) notFound();

  const canView = user.role !== "STUDENT" || test.classSection.enrollments.some((enrollment) => enrollment.userId === user.id && enrollment.status === "ACTIVE");
  if (!canView) notFound();

  const activeAttempt = user.role === "STUDENT"
    ? test.attempts.find((attempt) => attempt.id === requestedAttemptId && attempt.status === "IN_PROGRESS")
      || test.attempts.find((attempt) => attempt.status === "IN_PROGRESS")
    : null;
  const completedAttempts = test.attempts.filter((attempt) => attempt.status !== "IN_PROGRESS");
  const attemptLimitReached = user.role === "STUDENT" && test.attempts.length >= test.attemptLimit && !activeAttempt;
  const available = isOpen(test.openAt, test.closeAt);
  const unsectionedQuestions = test.questions.filter((link) => !link.sectionId);
  const submitButtonId = `submit-practice-${test.id}`;
  const autoSubmitInputId = `auto-submit-${test.id}`;
  const currentTimestamp = new Date().getTime();
  const secondsRemaining = activeAttempt && test.timeLimit
    ? Math.max(test.timeLimit * 60 - Math.floor((currentTimestamp - activeAttempt.startedAt.getTime()) / 1000), 0)
    : 0;

  return (
    <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
      <Link href="/elearning/tests" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Quay lại danh sách đề
      </Link>

      <div className={styles.panel}>
        <div className={styles.flexBetween} style={{ alignItems: "flex-start", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              <span className={styles.statusBadge} style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>{test.examType}</span>
              <span className={styles.statusBadge} style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>{test.skill}</span>
              <span className={styles.statusBadge} style={{ backgroundColor: available ? "#dcfce7" : "#fee2e2", color: available ? "#166534" : "#991b1b" }}>
                {available ? "Đang mở" : "Chưa mở / đã đóng"}
              </span>
            </div>
            <h1 style={{ margin: 0, color: "var(--color-navy)" }}>{test.title}</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
              {test.classSection.code} · {test.classSection.course.title} · {test.questions.length} câu · {test.timeLimit || "Không giới hạn"} phút
            </p>
          </div>
          {activeAttempt && test.timeLimit ? (
            <div className={styles.statusBadge} style={{ backgroundColor: "#fee2e2", color: "#991b1b", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Timer size={16} />
              <AutoSubmitTestTimer seconds={secondsRemaining} submitButtonId={submitButtonId} autoSubmitInputId={autoSubmitInputId} />
            </div>
          ) : (
            <span className={styles.statusBadge} style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>
              {test.attemptLimit} lần làm
            </span>
          )}
        </div>

        {test.description && <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>{test.description}</p>}
        {test.instructions && (
          <div style={{ marginTop: "1rem", padding: "1rem", background: "#f8fafc", borderRadius: "var(--radius-sm)", border: "1px solid #e2e8f0", whiteSpace: "pre-wrap" }}>
            {test.instructions}
          </div>
        )}
        {test.audioUrl && (
          <audio controls src={test.audioUrl} style={{ width: "100%", marginTop: "1rem" }}>
            Your browser does not support audio.
          </audio>
        )}
        {test.passage && (
          <div style={{ marginTop: "1rem", padding: "1rem", background: "#fff7ed", borderRadius: "var(--radius-sm)", whiteSpace: "pre-wrap" }}>
            {test.passage}
          </div>
        )}
      </div>

      {!activeAttempt && user.role === "STUDENT" && (
        <div className={styles.panel}>
          <div className={styles.flexBetween} style={{ gap: "1rem" }}>
            <div>
              <h3 style={{ marginTop: 0 }}>Sẵn sàng làm bài?</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
                Bấm Start Test để tạo Attempt trong database. Trong lúc làm, đáp án sẽ được tự lưu vào AttemptAnswer.
              </p>
            </div>
            <form action={startPracticeTestAction}>
              <input type="hidden" name="quizId" value={test.id} />
              <button className="btn-primary" type="submit" disabled={!available || attemptLimitReached} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <PlayCircle size={18} /> Start Test
              </button>
            </form>
          </div>
          {!available && <p style={{ color: "#991b1b", marginBottom: 0 }}>Đề này chưa trong thời gian mở.</p>}
          {attemptLimitReached && <p style={{ color: "#991b1b", marginBottom: 0 }}>Bạn đã hết số lần làm bài cho đề này.</p>}
        </div>
      )}

      {activeAttempt && (
        <form action={submitPracticeTestAttemptAction}>
          <input type="hidden" name="attemptId" value={activeAttempt.id} />
          <input id={autoSubmitInputId} type="hidden" name="autoSubmit" value="false" />

          {test.sections.map((section) => {
            const sectionQuestions = test.questions.filter((link) => link.sectionId === section.id);
            if (sectionQuestions.length === 0) return null;

            return (
              <section key={section.id} className={styles.panel}>
                <h2 style={{ marginTop: 0, color: "var(--color-navy)" }}>{section.title}</h2>
                <p style={{ color: "var(--text-muted)" }}>{section.skill}</p>
                {section.instructions && <p style={{ whiteSpace: "pre-wrap" }}>{section.instructions}</p>}
                {section.audioUrl && (
                  <audio controls src={section.audioUrl} style={{ width: "100%", marginBottom: "1rem" }}>
                    Your browser does not support audio.
                  </audio>
                )}
                {section.passage && (
                  <div style={{ padding: "1rem", background: "#fff7ed", borderRadius: "var(--radius-sm)", marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
                    {section.passage}
                  </div>
                )}
                {sectionQuestions.map((link, index) => {
                  const answer = activeAttempt.answers.find((item) => item.questionId === link.question.id);
                  return (
                    <div key={link.id} style={{ padding: "1rem 0", borderTop: "1px solid #e2e8f0" }}>
                      <h3 style={{ color: "var(--color-navy)" }}>Câu {index + 1}. {link.question.text}</h3>
                      {link.question.audioUrl && (
                        <audio controls src={link.question.audioUrl} style={{ width: "100%", marginBottom: "1rem" }}>
                          Your browser does not support audio.
                        </audio>
                      )}
                      {link.question.passage && (
                        <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "var(--radius-sm)", marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
                          {link.question.passage}
                        </div>
                      )}
                      <PracticeAnswerInput
                        attemptId={activeAttempt.id}
                        questionId={link.question.id}
                        questionType={link.question.type}
                        options={link.question.options}
                        initialOptionId={answer?.optionId}
                        initialAnswerText={answer?.answerText}
                      />
                    </div>
                  );
                })}
              </section>
            );
          })}

          {unsectionedQuestions.length > 0 && (
            <section className={styles.panel}>
              <h2 style={{ marginTop: 0, color: "var(--color-navy)" }}>Questions</h2>
              {unsectionedQuestions.map((link, index) => {
                const answer = activeAttempt.answers.find((item) => item.questionId === link.question.id);
                return (
                  <div key={link.id} style={{ padding: "1rem 0", borderTop: index === 0 ? "none" : "1px solid #e2e8f0" }}>
                    <h3 style={{ color: "var(--color-navy)" }}>Câu {index + 1}. {link.question.text}</h3>
                    {link.question.audioUrl && (
                      <audio controls src={link.question.audioUrl} style={{ width: "100%", marginBottom: "1rem" }}>
                        Your browser does not support audio.
                      </audio>
                    )}
                    {link.question.passage && (
                      <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "var(--radius-sm)", marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
                        {link.question.passage}
                      </div>
                    )}
                    <PracticeAnswerInput
                      attemptId={activeAttempt.id}
                      questionId={link.question.id}
                      questionType={link.question.type}
                      options={link.question.options}
                      initialOptionId={answer?.optionId}
                      initialAnswerText={answer?.answerText}
                    />
                  </div>
                );
              })}
            </section>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem", borderTop: "1px solid #e2e8f0", paddingTop: "2rem" }}>
            <button id={submitButtonId} className="btn-primary" type="submit" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Submit Test <Send size={16} />
            </button>
          </div>
        </form>
      )}

      {completedAttempts.length > 0 && (
        <div className={styles.panel} style={{ marginTop: "2rem" }}>
          <h3>Previous Attempts</h3>
          <table className={styles.table}>
            <thead><tr><th>Started</th><th>Status</th><th>Score</th><th>Submitted</th></tr></thead>
            <tbody>
              {completedAttempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td>{dateFormatter.format(attempt.startedAt)}</td>
                  <td>{attempt.status}</td>
                  <td><strong>{attempt.score ?? "-"}</strong></td>
                  <td>{attempt.submittedAt ? dateFormatter.format(attempt.submittedAt) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

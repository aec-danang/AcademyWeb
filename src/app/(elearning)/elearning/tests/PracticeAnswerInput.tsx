"use client";

import { useMemo, useState, useTransition } from "react";

type PracticeOption = {
  id: string;
  text: string;
  order: number;
};

type PracticeAnswerInputProps = {
  attemptId: string;
  questionId: string;
  questionType: string;
  options: PracticeOption[];
  initialOptionId?: string | null;
  initialAnswerText?: string | null;
};

const optionLabels = ["A", "B", "C", "D", "E", "F"];

export default function PracticeAnswerInput({
  attemptId,
  questionId,
  questionType,
  options,
  initialOptionId,
  initialAnswerText,
}: PracticeAnswerInputProps) {
  const [selectedOptionId, setSelectedOptionId] = useState(initialOptionId || "");
  const [answerText, setAnswerText] = useState(initialAnswerText || "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();
  const inputName = `question_${questionId}`;
  const answerName = `answer_${questionId}`;
  const isShortAnswer = useMemo(() => questionType === "FILL_BLANK", [questionType]);

  const saveAnswer = (payload: { optionId?: string | null; answerText?: string | null }) => {
    setStatus("saving");
    startTransition(() => {
      void (async () => {
        const response = await fetch("/api/elearning/tests/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            questionId,
            optionId: payload.optionId || null,
            answerText: payload.answerText || null,
          }),
        });

        setStatus(response.ok ? "saved" : "error");
      })();
    });
  };

  if (options.length > 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
        {options.map((option, index) => (
          <label key={option.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="radio"
              name={inputName}
              value={option.id}
              checked={selectedOptionId === option.id}
              onChange={() => {
                setSelectedOptionId(option.id);
                saveAnswer({ optionId: option.id });
              }}
            />
            <span>
              <strong>{optionLabels[index] || option.order}.</strong> {option.text}
            </span>
          </label>
        ))}
        <small style={{ color: status === "error" ? "#dc2626" : "var(--text-muted)" }}>
          {status === "saving" || isPending ? "Đang lưu..." : status === "saved" ? "Đã lưu đáp án." : status === "error" ? "Chưa lưu được, hãy thử lại." : "Chọn đáp án để tự lưu."}
        </small>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      {isShortAnswer ? (
        <input
          name={answerName}
          value={answerText}
          onChange={(event) => setAnswerText(event.target.value)}
          onBlur={() => saveAnswer({ answerText })}
          placeholder="Nhập đáp án"
          style={{ width: "100%", padding: "0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid #e2e8f0" }}
        />
      ) : (
        <textarea
          name={answerName}
          value={answerText}
          onChange={(event) => setAnswerText(event.target.value)}
          onBlur={() => saveAnswer({ answerText })}
          placeholder="Viết câu trả lời của bạn..."
          style={{ width: "100%", minHeight: 180, padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid #e2e8f0", fontFamily: "inherit", fontSize: "1rem" }}
        />
      )}
      <button type="button" className="btn-secondary" onClick={() => saveAnswer({ answerText })} style={{ marginTop: "0.75rem", padding: "0.5rem 0.9rem" }}>
        Lưu câu trả lời
      </button>
      <small style={{ display: "block", marginTop: "0.5rem", color: status === "error" ? "#dc2626" : "var(--text-muted)" }}>
        {status === "saving" || isPending ? "Đang lưu..." : status === "saved" ? "Đã lưu câu trả lời." : status === "error" ? "Chưa lưu được, hãy thử lại." : "Câu tự luận/điền từ sẽ lưu khi rời ô nhập hoặc bấm lưu."}
      </small>
    </div>
  );
}

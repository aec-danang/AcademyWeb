"use client";

import { useActionState, useState } from "react";
import { Bot, CheckCircle2, Loader2, RotateCcw, Save, Send } from "lucide-react";
import { gradeSubmissionWithStateAction } from "@/lib/lmsActions";
import styles from "../elearning.module.css";

type ReviewSubmissionFormProps = {
  submissionId: string;
  maxScore: number;
  defaultScore?: number | null;
  defaultFeedback?: string;
  aiScore?: number | null;
  aiFeedback?: string | null;
};

export function ReviewSubmissionForm({
  submissionId,
  maxScore,
  defaultScore,
  defaultFeedback,
  aiScore,
  aiFeedback,
}: ReviewSubmissionFormProps) {
  const [state, formAction, pending] = useActionState(gradeSubmissionWithStateAction, { ok: false, message: "" });
  const [score, setScore] = useState(defaultScore == null ? "" : String(defaultScore));
  const [feedback, setFeedback] = useState(defaultFeedback || "");
  const hasAiSuggestion = typeof aiScore === "number";

  return (
    <form action={formAction} className={styles.reviewScoreForm}>
      <input type="hidden" name="submissionId" value={submissionId} />
      <input type="hidden" name="maxScore" value={maxScore} />
      <div className={styles.teacherGradeHeading}>
        <div><strong>Teacher grade</strong><span>This is the official score shown in results.</span></div>
        {hasAiSuggestion ? (
          <button
            className={styles.useAiSuggestion}
            type="button"
            onClick={() => {
              setScore(String(aiScore));
              setFeedback(aiFeedback || "");
            }}
          >
            <Bot size={15} /> Use AI as a starting point
          </button>
        ) : null}
      </div>
      <label className={styles.workflowField}><span>Official score / {maxScore} <b>*</b></span><input name="score" type="number" min="0" max={maxScore} step="0.5" placeholder={String(Math.round(maxScore * 0.8))} value={score} onChange={(event) => setScore(event.target.value)} required /></label>
      <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Teacher feedback to student</span><textarea name="feedback" rows={4} placeholder="Highlight what was done well and what to improve next." value={feedback} onChange={(event) => setFeedback(event.target.value)} /></label>
      <div className={styles.reviewScoreFooter}>
        {state.message ? <div className={state.ok ? styles.formSuccess : styles.formError} role="status"><CheckCircle2 size={16} /> {state.message}</div> : <span />}
        <div className={styles.reviewActionGroup}><button className="btn-secondary" name="mode" value="save_draft" type="submit" disabled={pending}><Save size={16} /> Save draft</button><button className="btn-secondary" name="mode" value="request_revision" type="submit" disabled={pending}><RotateCcw size={16} /> Request revision</button><button className="btn-primary" name="mode" value="publish" type="submit" disabled={pending}>{pending ? <Loader2 size={16} className={styles.spinner} /> : <Send size={16} />}{pending ? "Saving..." : "Publish & return"}</button></div>
      </div>
    </form>
  );
}

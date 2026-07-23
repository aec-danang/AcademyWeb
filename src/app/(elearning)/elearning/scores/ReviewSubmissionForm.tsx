"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, RotateCcw, Save, Send } from "lucide-react";
import { gradeSubmissionWithStateAction } from "@/lib/lmsActions";
import styles from "../elearning.module.css";

export function ReviewSubmissionForm({ submissionId, maxScore, defaultScore, defaultFeedback }: { submissionId: string; maxScore: number; defaultScore?: number; defaultFeedback?: string }) {
  const [state, formAction, pending] = useActionState(gradeSubmissionWithStateAction, { ok: false, message: "" });

  return (
    <form action={formAction} className={styles.reviewScoreForm}>
      <input type="hidden" name="submissionId" value={submissionId} />
      <input type="hidden" name="maxScore" value={maxScore} />
      <label className={styles.workflowField}><span>Score / {maxScore} <b>*</b></span><input name="score" type="number" min="0" max={maxScore} step="0.5" placeholder={String(Math.round(maxScore * 0.8))} defaultValue={defaultScore} required /></label>
      <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Feedback to student</span><textarea name="feedback" rows={3} placeholder="Highlight what was done well and what to improve next." defaultValue={defaultFeedback} /></label>
      <div className={styles.reviewScoreFooter}>
        {state.message ? <div className={state.ok ? styles.formSuccess : styles.formError} role="status"><CheckCircle2 size={16} /> {state.message}</div> : <span />}
        <div className={styles.reviewActionGroup}><button className="btn-secondary" name="mode" value="save_draft" type="submit" disabled={pending}><Save size={16} /> Save draft</button><button className="btn-secondary" name="mode" value="request_revision" type="submit" disabled={pending}><RotateCcw size={16} /> Request revision</button><button className="btn-primary" name="mode" value="publish" type="submit" disabled={pending}>{pending ? <Loader2 size={16} className={styles.spinner} /> : <Send size={16} />}{pending ? "Saving..." : "Publish & return"}</button></div>
      </div>
    </form>
  );
}

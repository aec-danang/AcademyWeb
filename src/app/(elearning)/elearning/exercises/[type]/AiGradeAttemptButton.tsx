"use client";

import { useActionState } from "react";
import { Bot, Loader2 } from "lucide-react";
import { aiGradeWritingAttemptAction } from "@/lib/lmsActions";
import styles from "../../elearning.module.css";

export default function AiGradeAttemptButton({ attemptId }: { attemptId: string }) {
  const [state, action, pending] = useActionState(aiGradeWritingAttemptAction, { ok: false, message: "" });
  return (
    <form action={action}>
      <input type="hidden" name="attemptId" value={attemptId} />
      <button className="btn-secondary" type="submit" disabled={pending}>
        {pending ? <Loader2 size={16} className={styles.spinner} /> : <Bot size={16} />}
        {pending ? "AI is grading..." : "Create AI grading draft"}
      </button>
      {state.message ? <p className={state.ok ? styles.formSuccess : styles.formError} role="status">{state.message}</p> : null}
    </form>
  );
}

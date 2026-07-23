"use client";

import { useActionState } from "react";
import { Bot, Loader2 } from "lucide-react";
import { aiGradeWritingSubmissionAction } from "@/lib/lmsActions";
import styles from "../elearning.module.css";

export function AiGradeButton({ submissionId }: { submissionId: string }) {
  const [state, action, pending] = useActionState(aiGradeWritingSubmissionAction, { ok: false, message: "" });
  return <form action={action}>
    <input type="hidden" name="submissionId" value={submissionId} />
    <button className="btn-secondary" type="submit" disabled={pending}>{pending ? <Loader2 size={16} className={styles.spinner} /> : <Bot size={16} />} {pending ? "AI đang chấm..." : "Tạo bản chấm AI"}</button>
    {state.message ? <p className={state.ok ? styles.formSuccess : styles.formError} role="status">{state.message}</p> : null}
  </form>;
}

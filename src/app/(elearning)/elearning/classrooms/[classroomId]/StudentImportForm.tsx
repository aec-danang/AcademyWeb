"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Loader2, Mail, UserPlus } from "lucide-react";
import { addExistingStudentAction, type AddExistingStudentState } from "@/lib/lmsActions";
import styles from "../../elearning.module.css";

const initialState: AddExistingStudentState = { ok: false, message: "" };

export function StudentImportForm({ classroomId, classroomCode }: { classroomId: string; classroomCode: string }) {
  const [state, formAction, pending] = useActionState(addExistingStudentAction, initialState);
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(classroomCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={styles.rosterEntryGrid}>
      <form action={formAction} className={styles.rosterEntryCard}>
        <span className={styles.rosterEntryIcon}><Mail size={19} /></span>
        <div>
          <strong>Add an existing student</strong>
          <p>Use the exact email on an active Student account. The learner is added immediately.</p>
        </div>
        <input type="hidden" name="classSectionId" value={classroomId} />
        <label className={styles.workflowField}>
          <span>Student email</span>
          <input name="email" type="email" placeholder="student@example.com" autoComplete="off" required />
        </label>
        <button className="btn-primary" type="submit" disabled={pending}>
          {pending ? <Loader2 size={16} className={styles.spinner} /> : <UserPlus size={16} />}
          {pending ? "Adding..." : "Add student"}
        </button>
        {state.message ? <div className={state.ok ? styles.formSuccess : styles.formError} role="status">{state.message}</div> : null}
      </form>

      <section className={styles.rosterEntryCard}>
        <span className={styles.rosterEntryIcon}><UserPlus size={19} /></span>
        <div>
          <strong>Let the student request access</strong>
          <p>Share this code. The student signs in, enters it under Classes, then waits for your approval.</p>
        </div>
        <div className={styles.classCodeBox}>
          <span>Class code</span>
          <code>{classroomCode}</code>
          <button type="button" onClick={() => void copyCode()}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy"}</button>
        </div>
        <small>Having the code does not grant access until you approve the request.</small>
      </section>
    </div>
  );
}

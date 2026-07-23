"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, FileSpreadsheet, KeyRound, Loader2, Upload, UserPlus } from "lucide-react";
import { importStudentsAction, type ImportStudentsState } from "@/lib/lmsActions";
import styles from "../../elearning.module.css";

const initialState: ImportStudentsState = { ok: false, message: "", imported: 0, skipped: 0, createdAccounts: [] };

export function StudentImportForm({ classroomId }: { classroomId: string }) {
  const [state, formAction, pending] = useActionState(importStudentsAction, initialState);
  const [students, setStudents] = useState("");
  const [previewed, setPreviewed] = useState(false);
  const preview = useMemo(() => {
    const rows = students.split(/\r?\n/).map((row) => row.trim()).filter(Boolean);
    const valid = rows.filter((row) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(row));
    return { total: rows.length, valid: valid.length, invalid: rows.length - valid.length };
  }, [students]);

  const readCsv = async (file?: File) => {
    if (!file) return;
    setStudents(await file.text());
    setPreviewed(false);
  };

  return (
    <form action={formAction} className={styles.importStudentsForm}>
      <input type="hidden" name="classSectionId" value={classroomId} />
      <div className={styles.importWizardSteps}><strong>1 <span>Add list</span></strong><i /><span>2 <em>Preview</em></span><i /><span>3 <em>Confirm</em></span></div>
      <div className={styles.importStudentsGuide}><FileSpreadsheet size={22} /><div><strong>Paste a list or upload CSV</strong><p>One student per line: <code>Full name, email@example.com</code>. Maximum 200 rows.</p></div></div>
      <label className={styles.workflowField}><span>Students <b>*</b></span><textarea name="students" rows={7} value={students} onChange={(event) => { setStudents(event.target.value); setPreviewed(false); }} placeholder={"Nguyen Van A, student.a@example.com\nTran Thi B, student.b@example.com"} required /></label>
      <label className={styles.csvUploadButton}><Upload size={16} /> Upload CSV<input type="file" accept=".csv,text/csv" onChange={(event) => void readCsv(event.target.files?.[0])} /></label>

      {previewed ? <div className={styles.importPreview}><div><strong>{preview.total}</strong><span>Total rows</span></div><div><strong>{preview.valid}</strong><span>Valid emails</span></div><div className={preview.invalid ? styles.importWarning : ""}><strong>{preview.invalid}</strong><span>Need correction</span></div></div> : null}

      <div className={styles.importStudentsFooter}>
        <small>New accounts receive a unique temporary password shown once after import. Existing accounts keep their current password.</small>
        {!previewed ? <button className="btn-secondary" type="button" disabled={!preview.total} onClick={() => setPreviewed(true)}><ClipboardCheck size={16} /> Preview students</button> : <button className="btn-primary" type="submit" disabled={pending || preview.valid === 0}>{pending ? <Loader2 size={16} className={styles.spinner} /> : <UserPlus size={16} />}{pending ? "Adding students..." : `Confirm ${preview.valid} students`}</button>}
      </div>
      {state.message ? <div className={state.ok ? styles.formSuccess : styles.formError} role="status"><CheckCircle2 size={17} /> {state.message}</div> : null}
      {state.createdAccounts.length ? <section className={styles.temporaryCredentials}><header><KeyRound size={18} /><div><strong>Temporary login details</strong><p>Copy these now and share each password privately with the correct student.</p></div></header>{state.createdAccounts.map((account) => <div key={account.email}><span>{account.email}</span><code>{account.password}</code></div>)}</section> : null}
    </form>
  );
}

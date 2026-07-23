"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, FileText, GraduationCap, Loader2, Send, Settings2 } from "lucide-react";
import { createAssignmentWithStateAction } from "@/lib/lmsActions";
import styles from "../elearning.module.css";

type ClassroomOption = { id: string; name: string; code: string };
const initialState = { ok: false, message: "" };

export function AssignmentComposer({ classrooms, classroomId }: { classrooms?: ClassroomOption[]; classroomId?: string }) {
  const [state, formAction, pending] = useActionState(createAssignmentWithStateAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) formRef.current?.reset(); }, [state.ok, state.message]);

  return <form ref={formRef} action={formAction} className={styles.assignmentWorkflowForm}>
    <section className={styles.assignmentFormSection}>
      <header><FileText size={18} /><div><strong>Assignment brief</strong><span>Define what students need to complete.</span></div></header>
      <div className={styles.assignmentComposer}>
        {classroomId ? <input type="hidden" name="classSectionId" value={classroomId} /> : <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Classroom <b>*</b></span><select name="classSectionId" required defaultValue=""><option value="" disabled>Select a classroom</option>{(classrooms || []).map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select></label>}
        <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Assignment title <b>*</b></span><input name="title" placeholder="Writing task: My future goals" required /></label>
        <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Short description</span><textarea name="description" rows={2} placeholder="A concise summary shown on the student assignment card." /></label>
        <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Student instructions</span><textarea name="instructions" rows={5} placeholder="Explain the task, expected format, resources and submission requirements." /></label>
      </div>
    </section>

    <section className={styles.assignmentFormSection}>
      <header><GraduationCap size={18} /><div><strong>English learning context</strong><span>Connect the task to skill, level and assessment criteria.</span></div></header>
      <div className={styles.assignmentComposer}>
        <label className={styles.workflowField}><span>English skill</span><select name="skill" defaultValue="WRITING"><option value="LISTENING">Listening</option><option value="READING">Reading</option><option value="WRITING">Writing</option><option value="SPEAKING">Speaking</option><option value="GRAMMAR">Grammar</option><option value="VOCABULARY">Vocabulary</option><option value="PRONUNCIATION">Pronunciation</option><option value="MIXED">Mixed skills</option></select></label>
        <label className={styles.workflowField}><span>CEFR level</span><select name="cefrLevel" defaultValue="B1"><option value="A1">A1 Beginner</option><option value="A2">A2 Elementary</option><option value="B1">B1 Intermediate</option><option value="B2">B2 Upper-intermediate</option><option value="C1">C1 Advanced</option><option value="C2">C2 Proficiency</option></select></label>
        <label className={styles.workflowField}><span>Assignment type</span><select name="type" defaultValue="WRITING"><option value="HOMEWORK">Homework</option><option value="WRITING">Writing</option><option value="SPEAKING">Speaking</option><option value="FILE_UPLOAD">File upload</option></select></label>
        <label className={styles.workflowField}><span>Difficulty</span><select name="difficulty" defaultValue="MEDIUM"><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></label>
        <label className={styles.workflowField}><span>Maximum score</span><input name="maxScore" type="number" min="1" step="1" defaultValue="100" /></label>
        <label className={styles.workflowField}><span>Tags</span><input name="tags" placeholder="essay, unit-3, exam-practice" /></label>
        <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Rubric / assessment criteria</span><textarea name="rubric" rows={5} placeholder={"Task achievement: 40%\nLanguage accuracy: 25%\nVocabulary range: 20%\nOrganization: 15%"} /></label>
      </div>
    </section>

    <section className={styles.assignmentFormSection}>
      <header><Settings2 size={18} /><div><strong>Submission policy</strong><span>Control deadline, retries and publishing.</span></div></header>
      <div className={styles.assignmentComposer}>
        <label className={styles.workflowField}><span>Deadline</span><input name="dueAt" type="datetime-local" /></label>
        <label className={styles.workflowField}><span>Attachment URL</span><input name="attachmentUrl" type="url" placeholder="https://..." /></label>
        <label className={styles.workflowCheck}><input name="allowLateSubmission" type="checkbox" /><span><strong>Allow late submission</strong><small>Late work remains accepted after the deadline.</small></span></label>
        <label className={styles.workflowCheck}><input name="allowResubmission" type="checkbox" defaultChecked /><span><strong>Allow resubmission</strong><small>Students can improve and submit again when permitted.</small></span></label>
        <div className={styles.assignmentComposerFooter}><label className={styles.workflowField}><span>Publishing</span><select name="status" defaultValue="DRAFT"><option value="DRAFT">Save as draft</option><option value="PUBLISHED">Publish to students</option></select></label><button className="btn-primary" type="submit" disabled={pending}>{pending ? <Loader2 size={16} className={styles.spinner} /> : state.ok ? <CheckCircle2 size={16} /> : <Send size={16} />}{pending ? "Saving..." : "Save assignment"}</button></div>
      </div>
    </section>
    {state.message ? <div className={state.ok ? styles.formSuccess : styles.formError} role="status"><FileText size={17} /> {state.message}</div> : null}
  </form>;
}

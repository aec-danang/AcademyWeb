"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, FileText, GraduationCap, Loader2, Send, Settings2, X } from "lucide-react";
import { createAssignmentWithStateAction, updateAssignmentWithStateAction } from "@/lib/lmsActions";
import styles from "../elearning.module.css";

type ClassroomOption = { id: string; name: string; code: string };
type EditableAssignment = { id: string; classSectionId: string; title: string; description: string | null; instructions: string | null; skill: string; cefrLevel: string | null; type: string; difficulty: string; maxScore: number; category: string | null; tags: string[]; rubric: string | null; dueAt: string | null; attachmentUrl: string | null; allowLateSubmission: boolean; allowResubmission: boolean; status: string };
const initialState = { ok: false, message: "", redirectTo: "" };

function localDateTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function AssignmentComposer({ classrooms, classroomId, assignment }: { classrooms?: ClassroomOption[]; classroomId?: string; assignment?: EditableAssignment }) {
  const router = useRouter();
  const action = assignment ? updateAssignmentWithStateAction : createAssignmentWithStateAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<Record<string, string> | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState(assignment?.classSectionId || "");
  useEffect(() => {
    if (!state.ok) return;
    if (state.redirectTo) router.push(state.redirectTo);
    else if (!assignment) formRef.current?.reset();
  }, [assignment, router, state.ok, state.redirectTo]);

  const openPreview = () => {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const values = Object.fromEntries(["title", "description", "instructions", "skill", "cefrLevel", "type", "difficulty", "maxScore", "rubric", "dueAt", "status"].map((key) => [key, String(data.get(key) || "")]));
    values.classroom = classrooms?.find((item) => item.id === selectedClassroomId)?.name || "Current classroom";
    setPreview(values);
  };

  return <form ref={formRef} action={formAction} className={styles.assignmentWorkflowForm}>
    {assignment ? <input type="hidden" name="assignmentId" value={assignment.id} /> : null}
    <section className={styles.assignmentFormSection}>
      <header><FileText size={18} /><div><strong>Assignment brief</strong><span>Define what students need to complete.</span></div></header>
      <div className={styles.assignmentComposer}>
        {classroomId ? <><input type="hidden" name="classSectionId" value={classroomId} /><div className={`${styles.assignmentClassNotice} ${styles.workflowFieldWide}`}><CheckCircle2 size={18} /><div><strong>Assigned to this classroom only</strong><span>Only enrolled students in the classroom you are viewing will receive this work.</span></div></div></> : <fieldset className={`${styles.assignmentClassPicker} ${styles.workflowFieldWide}`}><legend>Choose the classroom that receives this assignment <b>*</b></legend><p>This does not create a new classroom. Select exactly one existing class below.</p><div>{(classrooms || []).map((item) => <label key={item.id} className={selectedClassroomId === item.id ? styles.assignmentClassChoiceSelected : styles.assignmentClassChoice}><input type="radio" name="classSectionId" value={item.id} checked={selectedClassroomId === item.id} onChange={() => setSelectedClassroomId(item.id)} required /><span><GraduationCap size={18} /><span><strong>{item.name}</strong><small>{item.code}</small></span></span><CheckCircle2 size={18} /></label>)}</div></fieldset>}
        <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Assignment title <b>*</b></span><input name="title" defaultValue={assignment?.title || ""} placeholder="Writing task: My future goals" required /></label>
        <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Short description</span><textarea name="description" rows={2} defaultValue={assignment?.description || ""} placeholder="A concise summary shown on the student assignment card." /></label>
        <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Student instructions</span><textarea name="instructions" rows={5} defaultValue={assignment?.instructions || ""} placeholder="Explain the task, expected format, resources and submission requirements." /></label>
      </div>
    </section>

    <section className={styles.assignmentFormSection}>
      <header><GraduationCap size={18} /><div><strong>English learning context</strong><span>Connect the task to skill, level and assessment criteria.</span></div></header>
      <div className={styles.assignmentComposer}>
        <label className={styles.workflowField}><span>English skill</span><select name="skill" defaultValue={assignment?.skill || "WRITING"}><option value="LISTENING">Listening</option><option value="READING">Reading</option><option value="WRITING">Writing</option><option value="SPEAKING">Speaking</option><option value="GRAMMAR">Grammar</option><option value="VOCABULARY">Vocabulary</option><option value="PRONUNCIATION">Pronunciation</option><option value="MIXED">Mixed skills</option></select></label>
        <label className={styles.workflowField}><span>CEFR level</span><select name="cefrLevel" defaultValue={assignment?.cefrLevel || "B1"}><option value="A1">A1 Beginner</option><option value="A2">A2 Elementary</option><option value="B1">B1 Intermediate</option><option value="B2">B2 Upper-intermediate</option><option value="C1">C1 Advanced</option><option value="C2">C2 Proficiency</option></select></label>
        <label className={styles.workflowField}><span>Assignment type</span><select name="type" defaultValue={assignment?.type || "WRITING"}><option value="HOMEWORK">Homework</option><option value="WRITING">Writing</option><option value="SPEAKING">Speaking</option><option value="FILE_UPLOAD">File upload</option></select></label>
        <label className={styles.workflowField}><span>Difficulty</span><select name="difficulty" defaultValue={assignment?.difficulty || "MEDIUM"}><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></label>
        <label className={styles.workflowField}><span>Maximum score</span><input name="maxScore" type="number" min="1" step="1" defaultValue={assignment?.maxScore || 100} /></label>
        <label className={styles.workflowField}><span>Grade category</span><select name="category" defaultValue={assignment?.category || "HOMEWORK"}><option value="HOMEWORK">Homework</option><option value="WRITING">Writing</option><option value="SPEAKING">Speaking practice</option><option value="PROJECT">Project</option><option value="FORMATIVE">Formative check</option></select></label>
        <label className={styles.workflowField}><span>Tags</span><input name="tags" defaultValue={assignment?.tags.join(", ") || ""} placeholder="essay, unit-3, exam-practice" /></label>
        <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Rubric / assessment criteria</span><textarea name="rubric" rows={5} defaultValue={assignment?.rubric || ""} placeholder={"Task achievement: 40%\nLanguage accuracy: 25%\nVocabulary range: 20%\nOrganization: 15%"} /></label>
      </div>
    </section>

    <section className={styles.assignmentFormSection}>
      <header><Settings2 size={18} /><div><strong>Submission policy</strong><span>Control deadline, retries and publishing.</span></div></header>
      <div className={styles.assignmentComposer}>
        <label className={styles.workflowField}><span>Deadline</span><input name="dueAt" type="datetime-local" min="2000-01-01T00:00" max="2100-12-31T23:59" defaultValue={localDateTime(assignment?.dueAt)} /></label>
        <label className={styles.workflowField}><span>Attachment URL</span><input name="attachmentUrl" type="url" defaultValue={assignment?.attachmentUrl || ""} placeholder="https://..." /></label>
        <label className={styles.workflowCheck}><input name="allowLateSubmission" type="checkbox" defaultChecked={assignment?.allowLateSubmission || false} /><span><strong>Allow late submission</strong><small>Late work remains accepted after the deadline.</small></span></label>
        <label className={styles.workflowCheck}><input name="allowResubmission" type="checkbox" defaultChecked={assignment?.allowResubmission ?? true} /><span><strong>Allow resubmission</strong><small>Students can improve and submit again when permitted.</small></span></label>
        <div className={styles.assignmentComposerFooter}><label className={styles.workflowField}><span>Visibility in selected classroom</span><select name="status" defaultValue={assignment?.status || "DRAFT"}><option value="DRAFT">Save privately as draft</option><option value="PUBLISHED">Publish to selected classroom</option></select></label><div className={styles.assignmentComposerActions}><button className="btn-secondary" type="button" onClick={openPreview}><Eye size={16} /> Student preview</button><button className="btn-primary" type="submit" disabled={pending}>{pending ? <Loader2 size={16} className={styles.spinner} /> : state.ok ? <CheckCircle2 size={16} /> : <Send size={16} />}{pending ? "Saving..." : assignment ? "Update assignment" : "Save for this classroom"}</button></div></div>
      </div>
    </section>
    {state.message ? <div className={state.ok ? styles.formSuccess : styles.formError} role="status"><FileText size={17} /> {state.message}</div> : null}
    {preview ? <div className={styles.assignmentPreviewBackdrop} role="dialog" aria-modal="true" aria-label="Student assignment preview"><article className={styles.assignmentPreviewModal}><header><div><span>STUDENT PREVIEW</span><h2>{preview.title || "Untitled assignment"}</h2><p>{preview.classroom} · {preview.skill} · {preview.cefrLevel}</p></div><button type="button" onClick={() => setPreview(null)} aria-label="Close preview"><X size={20} /></button></header><div className={styles.assignmentPreviewMeta}><span>{preview.type?.replaceAll("_", " ")}</span><span>{preview.difficulty}</span><span>{preview.maxScore || 100} points</span><span>{preview.dueAt ? `Due ${new Date(preview.dueAt).toLocaleString()}` : "No deadline"}</span></div><main><section><strong>Overview</strong><p>{preview.description || "No short description provided."}</p></section><section><strong>Instructions</strong><p>{preview.instructions || "No student instructions provided."}</p></section>{preview.rubric ? <section><strong>How this will be assessed</strong><pre>{preview.rubric}</pre></section> : null}</main><footer><span>{preview.status === "PUBLISHED" ? "Will be visible to students" : "Draft — not visible to students"}</span><button type="button" className="btn-primary" onClick={() => setPreview(null)}>Back to editing</button></footer></article></div> : null}
  </form>;
}

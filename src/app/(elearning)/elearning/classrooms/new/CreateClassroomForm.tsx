"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen, CalendarDays, CheckCircle2, Loader2, Plus, RotateCcw, School, Trash2, X } from "lucide-react";
import { createClassroomWithStateAction, type CreateClassroomState } from "@/lib/teacherActions";
import styles from "../../elearning.module.css";

const initialState: CreateClassroomState = { ok: false, message: "" };

type CourseOption = { id: string; title: string; program: string | null; published: boolean; _count: { lessons: number; classes: number } };
type UnfinishedClassroom = { id: string; name: string; code: string; completed: number; total: number };

export function CreateClassroomForm({ courses, defaultCourseId = "", unfinishedClassroom }: { courses: CourseOption[]; defaultCourseId?: string; unfinishedClassroom?: UnfinishedClassroom | null }) {
  const [state, formAction, pending] = useActionState(createClassroomWithStateAction, initialState);
  const [showGuard, setShowGuard] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const allowSubmitRef = useRef(false);

  const submitReplacingClassroom = () => {
    if (!unfinishedClassroom || !formRef.current || !replaceInputRef.current) return;
    replaceInputRef.current.value = unfinishedClassroom.id;
    allowSubmitRef.current = true;
    setShowGuard(false);
    formRef.current.requestSubmit();
  };

  return (
    <form ref={formRef} action={formAction} className={styles.workflowForm} onSubmit={(event) => {
      if (unfinishedClassroom && !allowSubmitRef.current) {
        event.preventDefault();
        setShowGuard(true);
      }
      allowSubmitRef.current = false;
    }}>
      <input ref={replaceInputRef} type="hidden" name="replaceClassroomId" defaultValue="" />
      <section className={styles.workflowCard}>
        <div className={styles.workflowCardHeading}>
          <span><School size={18} /></span>
          <div><p>Step 1</p><h2>Classroom identity</h2><small>This is what teachers and students will see.</small></div>
        </div>
        <div className={styles.workflowFieldGrid}>
          <label className={styles.workflowField}>
            <span>Class name <b>*</b></span>
            <input name="name" placeholder="IELTS Foundation - Evening A" required />
          </label>
          <label className={styles.workflowField}>
            <span>Join code</span>
            <input name="code" placeholder="Leave blank to generate automatically" pattern="[A-Za-z0-9-]{3,24}" />
            <small>The system generates a unique AEC code when this field is blank.</small>
          </label>
        </div>
      </section>

      <section className={styles.workflowCard}>
        <div className={styles.workflowCardHeading}>
          <span><BookOpen size={18} /></span>
          <div><p>Step 2</p><h2>Select a course template</h2><small>The template supplies lessons and curriculum; this classroom owns students, assignments and scores.</small></div>
        </div>
        {courses.length ? <div className={styles.workflowFieldGrid}>
          <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Course template <b>*</b></span><select name="courseId" required defaultValue={courses.some((course) => course.id === defaultCourseId) ? defaultCourseId : ""}><option value="" disabled>Select a reusable course template</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}{course.program ? ` · ${course.program}` : ""} · {course._count.lessons} lessons</option>)}</select></label>
          <div className={styles.courseSelectionNote}><BookOpen size={18} /><div><strong>One template, many classrooms</strong><p>Choosing a course does not copy or duplicate it. Curriculum updates remain shared across its classrooms.</p></div></div>
        </div> : <div className={styles.workflowEmpty}><p>No course templates exist yet. Create the curriculum template before opening a classroom.</p><Link href="/elearning/courses/new" className="btn-primary"><Plus size={16} /> Create course template</Link></div>}
      </section>

      <section className={styles.workflowCard}>
        <div className={styles.workflowCardHeading}>
          <span><CalendarDays size={18} /></span>
          <div><p>Step 3</p><h2>Schedule</h2><small>Dates are optional and can be changed later.</small></div>
        </div>
        <div className={styles.workflowFieldGrid}>
          <label className={styles.workflowField}><span>Start date</span><input name="startAt" type="date" /></label>
          <label className={styles.workflowField}><span>End date</span><input name="endAt" type="date" /></label>
          <input type="hidden" name="status" value="ACTIVE" />
        </div>
      </section>

      {state.message ? <div className={state.ok ? styles.formSuccess : styles.formError} role="status"><CheckCircle2 size={18} /> {state.message}</div> : null}

      <div className={styles.workflowFooter}>
        <div><strong>Next step: add students</strong><span>You will be taken directly to the classroom roster.</span></div>
        <button className="btn-primary" type="submit" disabled={pending || courses.length === 0}>
          {pending ? <Loader2 size={17} className={styles.spinner} /> : <School size={17} />}
          {pending ? "Creating classroom..." : "Create classroom"}
        </button>
      </div>
      {showGuard && unfinishedClassroom ? <div className={styles.classroomGuardBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowGuard(false); }}>
        <section className={styles.classroomGuardDialog} role="dialog" aria-modal="true" aria-labelledby="unfinished-classroom-title">
          <button type="button" className={styles.classroomGuardClose} onClick={() => setShowGuard(false)} aria-label="Close"><X size={18} /></button>
          <span className={styles.classroomGuardIcon}><AlertTriangle size={22} /></span>
          <div className={styles.classroomGuardHeading}><small>UNFINISHED CLASSROOM</small><h2 id="unfinished-classroom-title">You already have a classroom that is not fully set up.</h2><p>Would you like to continue setting it up, or delete it and create this new classroom instead?</p></div>
          <div className={styles.classroomGuardClass}><span><School size={18} /></span><div><strong>{unfinishedClassroom.name}</strong><small>{unfinishedClassroom.code} · {unfinishedClassroom.completed}/{unfinishedClassroom.total} steps completed</small></div><b>{unfinishedClassroom.completed}/{unfinishedClassroom.total}</b></div>
          <div className={styles.classroomGuardWarning}><Trash2 size={16} /><p>Deleting removes this classroom and its classroom-specific work. Student accounts are kept.</p></div>
          <div className={styles.classroomGuardActions}>
            <button type="button" className="btn-secondary" onClick={() => setShowGuard(false)}><RotateCcw size={16} /> Keep editing this form</button>
            <button type="button" className={styles.classroomGuardDelete} onClick={submitReplacingClassroom} disabled={pending}><Trash2 size={16} /> Delete & create new</button>
            <Link href={`/elearning/classrooms/${unfinishedClassroom.id}`} className="btn-primary">Continue setup <ArrowRight size={16} /></Link>
          </div>
        </section>
      </div> : null}
    </form>
  );
}

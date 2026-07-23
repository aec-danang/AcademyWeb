"use client";

import { useActionState } from "react";
import { BookOpen, CheckCircle2, Layers3, Loader2 } from "lucide-react";
import { createCourseTemplateWithStateAction, type CourseTemplateState } from "@/lib/teacherActions";
import styles from "../../elearning.module.css";

const initialState: CourseTemplateState = { ok: false, message: "" };

export function CourseTemplateForm() {
  const [state, formAction, pending] = useActionState(createCourseTemplateWithStateAction, initialState);
  return (
    <form action={formAction} className={styles.workflowForm}>
      <section className={styles.workflowCard}>
        <div className={styles.workflowCardHeading}><span><BookOpen size={18} /></span><div><p>Reusable curriculum</p><h2>Course identity</h2><small>A Course is a reusable teaching template. Students join Classrooms, not Course templates.</small></div></div>
        <div className={styles.workflowFieldGrid}>
          <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Course title <b>*</b></span><input name="title" placeholder="IELTS Foundation 5.0" required /></label>
          <label className={styles.workflowField}><span>Program / level</span><input name="program" placeholder="IELTS · CEFR B1" /></label>
          <label className={styles.workflowField}><span>Curriculum reference</span><input name="curriculum" placeholder="AEC IELTS Foundation 2026" /></label>
          <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Description</span><textarea name="description" rows={5} placeholder="Learning outcomes, target learners and course scope." /></label>
          <label className={styles.workflowCheck}><input type="checkbox" name="published" /><span><strong>Publish to the Course Library</strong><small>Teachers can select this template when creating a classroom.</small></span></label>
        </div>
      </section>
      {state.message ? <div className={state.ok ? styles.formSuccess : styles.formError}><CheckCircle2 size={17} /> {state.message}</div> : null}
      <div className={styles.workflowFooter}><div><strong>Next step: build lessons or create a classroom</strong><span>The template can be reused for multiple cohorts.</span></div><button className="btn-primary" disabled={pending}>{pending ? <Loader2 size={17} className={styles.spinner} /> : <Layers3 size={17} />}{pending ? "Creating template..." : "Create course template"}</button></div>
    </form>
  );
}

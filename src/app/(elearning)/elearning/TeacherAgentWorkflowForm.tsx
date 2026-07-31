"use client";

import { FormEvent } from "react";
import { ArrowRight, Check, WandSparkles } from "lucide-react";
import type { TeacherAgentAction, TeacherAgentValue, TeacherWorkflow } from "@/lib/teacherAgentWorkflows";
import styles from "./elearning.module.css";

function fieldValue(value: TeacherAgentValue | undefined) {
  if (typeof value === "boolean") return value;
  return value === null || value === undefined ? "" : String(value);
}

export function TeacherAgentWorkflowForm({
  action,
  workflow,
  onCancel,
  onContinue,
  onDraftChange,
}: {
  action: TeacherAgentAction;
  workflow: TeacherWorkflow;
  onCancel: () => void;
  onContinue: (action: TeacherAgentAction) => void;
  onDraftChange: (action: TeacherAgentAction) => void;
}) {
  function actionFromForm(form: HTMLFormElement, renewKey = false) {
    const formData = new FormData(form);
    const payload: Record<string, TeacherAgentValue> = { ...action.payload };
    for (const field of workflow.fields) {
      if (field.type === "checkbox") payload[field.name] = formData.get(field.name) === "on";
      else if (field.type === "number") payload[field.name] = Number(formData.get(field.name) || 0);
      else payload[field.name] = String(formData.get(field.name) || "").trim();
    }
    return { ...action, payload, ...(renewKey ? { idempotencyKey: crypto.randomUUID() } : {}) };
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onContinue(actionFromForm(event.currentTarget, true));
  }

  return (
    <form className={styles.teacherWorkflowForm} onSubmit={submit} onChange={(event) => onDraftChange(actionFromForm(event.currentTarget))}>
      <header>
        <span><WandSparkles size={18} /></span>
        <div><small>WORKFLOW ĐƯỢC HỖ TRỢ</small><strong>{workflow.title}</strong><p>{workflow.description}</p></div>
      </header>
      <div className={styles.teacherWorkflowFields}>
        {workflow.fields.map((field) => {
          const value = fieldValue(action.payload[field.name]);
          if (field.type === "checkbox") {
            return <label className={styles.teacherWorkflowCheck} key={field.name}>
              <input name={field.name} type="checkbox" defaultChecked={value === true} />
              <span><Check size={15} /><span><strong>{field.label}</strong>{field.help ? <small>{field.help}</small> : null}</span></span>
            </label>;
          }
          return <label className={field.type === "textarea" ? styles.teacherWorkflowWideField : undefined} key={field.name}>
            <span>{field.label}{field.required ? <b>*</b> : null}</span>
            {field.type === "select" ? (
              <select name={field.name} defaultValue={String(value)} required={field.required}>
                <option value="">Chọn một mục</option>
                {(field.options || []).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            ) : field.type === "textarea" ? (
              <textarea name={field.name} defaultValue={String(value)} placeholder={field.placeholder} required={field.required} rows={3} />
            ) : (
              <input name={field.name} type={field.type} defaultValue={String(value)} placeholder={field.placeholder} required={field.required} min={field.min} max={field.max} />
            )}
            {field.help ? <small>{field.help}</small> : null}
          </label>;
        })}
      </div>
      <footer>
        <button type="button" onClick={onCancel}>Hủy</button>
        <button type="submit"><span>{workflow.submitLabel}</span><ArrowRight size={16} /></button>
      </footer>
    </form>
  );
}

"use client";

import Link from "next/link";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { deleteAssignmentAction, toggleAssignmentStatusAction } from "@/lib/lmsActions";
import styles from "../elearning.module.css";

export function AssignmentRowActions({ id, status, title }: { id: string; status: string; title: string }) {
  const published = status === "PUBLISHED";
  return <div className={styles.assignmentManageActions}>
    <Link href={`/elearning/assignments/${id}/edit`}><Pencil size={15} /> Edit</Link>
    <form action={toggleAssignmentStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={published ? "DRAFT" : "PUBLISHED"} />
      <button type="submit">{published ? <EyeOff size={15} /> : <Eye size={15} />}{published ? "Unpublish" : "Publish"}</button>
    </form>
    <form action={deleteAssignmentAction} onSubmit={(event) => { if (!window.confirm(`Delete “${title}”? Submissions and grades linked to it will also be removed.`)) event.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={styles.assignmentDeleteAction}><Trash2 size={15} /> Delete</button>
    </form>
  </div>;
}

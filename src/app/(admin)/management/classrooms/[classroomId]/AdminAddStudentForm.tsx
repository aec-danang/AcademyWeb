"use client";

import { useActionState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { addExistingStudentAction, type AddExistingStudentState } from "@/lib/lmsActions";

const initialState: AddExistingStudentState = { ok: false, message: "" };

export function AdminAddStudentForm({ classroomId }: { classroomId: string }) {
  const [state, formAction, pending] = useActionState(addExistingStudentAction, initialState);
  return (
    <form action={formAction} className="grid gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <input type="hidden" name="classSectionId" value={classroomId} />
      <label className="grid gap-1.5">
        <span className="text-xs font-bold text-slate-600">Add existing student account</span>
        <input name="email" type="email" placeholder="student@example.com" required className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400" />
      </label>
      <button type="submit" disabled={pending} className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}{pending ? "Adding..." : "Add"}
      </button>
      {state.message ? <p className={`text-xs sm:col-span-2 ${state.ok ? "text-emerald-700" : "text-red-600"}`}>{state.message}</p> : null}
    </form>
  );
}

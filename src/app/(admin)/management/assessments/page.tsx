import { ClipboardCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage() {
  const assessments = await prisma.quiz.findMany({
    orderBy: [{ published: "desc" }, { updatedAt: "desc" }],
    include: { _count: { select: { questions: true, deliveries: true, attempts: true } } },
  });
  return (
    <div className="mx-auto grid w-full max-w-[1240px] gap-5">
      <AdminPageHeader eyebrow="Quality view" title="Assessments" description="A compact inventory of tests and their usage. Teachers continue to assign and review learner work." />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
        <div className="divide-y divide-slate-100">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><ClipboardCheck className="h-5 w-5" /></span>
              <span className="min-w-0"><strong className="block truncate text-sm text-navy">{assessment.title}</strong><small className="block truncate text-slate-500">{assessment.examType} · {assessment.skill}</small></span>
              <span className="flex items-center gap-5">
                <span className="hidden text-right md:block"><strong className="block text-sm text-navy">{assessment._count.questions}</strong><small className="text-xs text-slate-500">questions</small></span>
                <span className="hidden text-right md:block"><strong className="block text-sm text-navy">{assessment._count.deliveries}</strong><small className="text-xs text-slate-500">classes</small></span>
                <span className="hidden text-right lg:block"><strong className="block text-sm text-navy">{assessment._count.attempts}</strong><small className="text-xs text-slate-500">attempts</small></span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${assessment.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{assessment.published ? "Published" : "Draft"}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

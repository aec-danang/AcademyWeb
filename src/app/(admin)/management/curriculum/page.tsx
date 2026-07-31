import { BookOpenCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function CurriculumPage() {
  const courses = await prisma.course.findMany({
    orderBy: [{ published: "desc" }, { updatedAt: "desc" }],
  });
  return (
    <div className="mx-auto grid w-full max-w-[1240px] gap-5">
      <AdminPageHeader eyebrow="Read-only overview" title="Curriculum" description="Course templates and usage only. Content authoring remains outside this operational overview." />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
        <div className="divide-y divide-slate-100">
          {courses.map((course) => (
            <div key={course.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpenCheck className="h-5 w-5" /></span>
              <span className="min-w-0"><strong className="block truncate text-sm text-navy">{course.title}</strong><small className="block truncate text-slate-500">{course.program || "General program"}</small></span>
              <span className="flex items-center gap-5">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${course.published ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{course.published ? "Published" : "Draft"}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

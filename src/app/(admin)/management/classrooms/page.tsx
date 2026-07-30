import Link from "next/link";
import { ArrowRight, School } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function ClassroomsPage() {
  const classrooms = await prisma.classSection.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      enrollments: { select: { status: true } },
    },
  });
  return (
    <div className="mx-auto grid w-full max-w-[1240px] gap-5">
      <AdminPageHeader eyebrow="Oversight" title="Classrooms" description="A read-only operational list. Open a class for its roster, teacher and delivery status." />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
        <div className="divide-y divide-slate-100">
          {classrooms.map((classroom) => {
            const active = classroom.enrollments.filter((item) => item.status === "ACTIVE").length;
            const pending = classroom.enrollments.filter((item) => item.status === "REQUESTED").length;
            return (
              <Link key={classroom.id} href={`/management/classrooms/${classroom.id}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition hover:bg-indigo-50/60">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><School className="h-5 w-5" /></span>
                <span className="min-w-0"><small className="font-extrabold uppercase tracking-wide text-indigo-500">{classroom.code}</small><strong className="block truncate text-sm text-navy">{classroom.name}</strong><small className="block truncate text-slate-500">{classroom.teacher?.name || classroom.teacher?.email || "Teacher not assigned"}</small></span>
                <span className="flex items-center gap-4">
                  <span className="hidden text-right sm:block"><strong className="block text-sm text-navy">{active}</strong><small className="text-xs text-slate-500">students</small></span>
                  {pending ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{pending} pending</span> : null}
                  <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-black uppercase md:inline ${classroom.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{classroom.status}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

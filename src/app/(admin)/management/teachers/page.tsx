import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", isActive: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    include: {
      classSections: {
        include: {
          enrollments: { where: { status: "ACTIVE" }, select: { id: true } },
          _count: { select: { assignments: true, quizDeliveries: true } },
        },
      },
    },
  });

  return (
    <div className="mx-auto grid w-full max-w-[1240px] gap-5">
      <AdminPageHeader eyebrow="People" title="Teachers" description="One compact entry per teacher. Open a teacher to inspect their classes and delivery load." />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
        <div className="divide-y divide-slate-100">
          {teachers.map((teacher) => {
            const activeClasses = teacher.classSections.filter((item) => item.status === "ACTIVE");
            const students = activeClasses.reduce((sum, item) => sum + item.enrollments.length, 0);
            const activities = activeClasses.reduce((sum, item) => sum + item._count.assignments + item._count.quizDeliveries, 0);
            return (
              <Link key={teacher.id} href={`/management/teachers/${teacher.id}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition hover:bg-indigo-50/60">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><UserRound className="h-5 w-5" /></span>
                <span className="min-w-0"><strong className="block truncate text-sm text-navy">{teacher.name || "Unnamed teacher"}</strong><small className="block truncate text-slate-500">{teacher.email || "No email"}</small></span>
                <span className="flex items-center gap-6">
                  <span className="hidden text-right md:block"><strong className="block text-sm text-navy">{activeClasses.length}</strong><small className="text-xs text-slate-500">classes</small></span>
                  <span className="hidden text-right md:block"><strong className="block text-sm text-navy">{students}</strong><small className="text-xs text-slate-500">students</small></span>
                  <span className="hidden text-right lg:block"><strong className="block text-sm text-navy">{activities}</strong><small className="text-xs text-slate-500">activities</small></span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </span>
              </Link>
            );
          })}
          {!teachers.length ? <p className="px-5 py-10 text-center text-sm text-slate-500">No active teachers.</p> : null}
        </div>
      </section>
    </div>
  );
}

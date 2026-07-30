import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, School, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../../AdminPageHeader";

type Props = { params: Promise<{ teacherId: string }> };

export const dynamic = "force-dynamic";

export default async function TeacherDetailPage({ params }: Props) {
  const { teacherId } = await params;
  const teacher = await prisma.user.findFirst({
    where: { id: teacherId, role: "TEACHER" },
    include: {
      classSections: {
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        include: {
          enrollments: { select: { status: true } },
          _count: { select: { assignments: true, quizDeliveries: true } },
        },
      },
    },
  });
  if (!teacher) notFound();

  return (
    <div className="mx-auto grid w-full max-w-[1240px] gap-5">
      <AdminPageHeader
        parent={{ label: "Teachers", href: "/management/teachers" }}
        eyebrow="Teacher detail"
        title={teacher.name || "Unnamed teacher"}
        description={teacher.email || "No email address"}
      />
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-indigo-500">Classrooms</p><h3 className="mt-1 text-lg font-black text-navy">Assigned classes</h3></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{teacher.classSections.length}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {teacher.classSections.map((classroom) => {
            const active = classroom.enrollments.filter((item) => item.status === "ACTIVE").length;
            const pending = classroom.enrollments.filter((item) => item.status === "REQUESTED").length;
            const activities = classroom._count.assignments + classroom._count.quizDeliveries;
            return (
              <Link key={classroom.id} href={`/management/classrooms/${classroom.id}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition hover:bg-indigo-50/60">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><School className="h-5 w-5" /></span>
                <span className="min-w-0"><small className="font-extrabold uppercase tracking-wide text-indigo-500">{classroom.code}</small><strong className="block truncate text-sm text-navy">{classroom.name}</strong><small className="block truncate text-slate-500">{active} active students</small></span>
                <span className="flex items-center gap-5">
                  <span className="hidden text-right sm:block"><strong className="block text-sm text-navy">{active}</strong><small className="text-xs text-slate-500">students</small></span>
                  <span className="hidden text-right md:block"><strong className="block text-sm text-navy">{activities}</strong><small className="text-xs text-slate-500">activities</small></span>
                  {pending ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{pending} pending</span> : null}
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </span>
              </Link>
            );
          })}
          {!teacher.classSections.length ? <div className="grid place-items-center gap-2 px-5 py-12 text-center"><Users className="h-7 w-7 text-slate-300" /><p className="text-sm text-slate-500">No classes assigned to this teacher.</p></div> : null}
        </div>
      </section>
    </div>
  );
}

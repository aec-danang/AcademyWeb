import Link from "next/link";
import { ArrowRight, CheckCircle2, School, UserRound, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [teachers, classroomCount, studentCount, pendingCount] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TEACHER", isActive: true },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      include: {
        classSections: {
          where: { status: "ACTIVE" },
          include: { enrollments: { where: { status: "ACTIVE" }, select: { id: true } } },
        },
      },
    }),
    prisma.classSection.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    prisma.enrollment.count({ where: { status: "REQUESTED" } }),
  ]);

  const metrics = [
    { label: "Teachers", value: teachers.length, icon: UserRound },
    { label: "Active classrooms", value: classroomCount, icon: School },
    { label: "Active students", value: studentCount, icon: Users },
  ];

  return (
    <div className="mx-auto grid w-full max-w-[1240px] gap-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-600">Admin overview</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-navy sm:text-3xl">Learning at a glance</h2>
          <p className="mt-2 text-sm text-slate-500">Start with a teacher. Open a class only when you need its roster or activity.</p>
        </div>
        <Link href="/management/teachers" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800">
          View all teachers <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="grid gap-3 py-0 sm:grid-cols-3" aria-label="Learning summary">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></span>
            <div><strong className="block text-2xl font-black text-navy">{value}</strong><span className="text-sm text-slate-500">{label}</span></div>
          </article>
        ))}
      </section>

      {pendingCount > 0 ? (
        <Link href="/management/classrooms" className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <span><strong className="block text-sm text-amber-950">{pendingCount} enrollment request{pendingCount === 1 ? "" : "s"} need attention</strong><small className="text-amber-700">Open classrooms to review the requests.</small></span>
          <ArrowRight className="h-5 w-5 flex-none text-amber-700" />
        </Link>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5" /><strong>No enrollment exceptions need attention.</strong>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white py-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-indigo-500">Teachers</p><h3 className="mt-1 text-lg font-black text-navy">Teaching team</h3></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{teachers.length}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {teachers.map((teacher) => {
            const students = teacher.classSections.reduce((total, classroom) => total + classroom.enrollments.length, 0);
            return (
              <Link key={teacher.id} href={`/management/teachers/${teacher.id}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition hover:bg-indigo-50/60">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 text-sm font-black text-indigo-700">{(teacher.name || teacher.email || "T").charAt(0).toUpperCase()}</span>
                <span className="min-w-0"><strong className="block truncate text-sm text-navy">{teacher.name || "Unnamed teacher"}</strong><small className="block truncate text-slate-500">{teacher.email || "No email"}</small></span>
                <span className="flex items-center gap-5 text-right">
                  <span className="hidden sm:block"><strong className="block text-sm text-navy">{teacher.classSections.length}</strong><small className="text-xs text-slate-500">classes</small></span>
                  <span className="hidden sm:block"><strong className="block text-sm text-navy">{students}</strong><small className="text-xs text-slate-500">students</small></span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </span>
              </Link>
            );
          })}
          {!teachers.length ? <p className="px-5 py-10 text-center text-sm text-slate-500">No active teacher accounts.</p> : null}
        </div>
      </section>
    </div>
  );
}

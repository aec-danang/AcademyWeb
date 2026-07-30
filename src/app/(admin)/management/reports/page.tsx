import { CheckCircle2, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "../AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [activeStudents, activeEnrollments, gradedWork, pendingWork] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.grade.count({ where: { status: "PUBLISHED" } }),
    prisma.submission.count({ where: { status: { in: ["SUBMITTED", "PENDING"] }, grade: null } }),
  ]);
  const cards = [
    { label: "Active students", value: activeStudents, icon: GraduationCap },
    { label: "Active enrollments", value: activeEnrollments, icon: Users },
    { label: "Published grades", value: gradedWork, icon: CheckCircle2 },
    { label: "Waiting for review", value: pendingWork, icon: ClipboardCheck },
  ];
  return (
    <div className="mx-auto grid w-full max-w-[1240px] gap-5">
      <AdminPageHeader eyebrow="Reports & QA" title="System pulse" description="Only high-level operational signals are shown here. Detailed scoring and feedback remain in the teacher workflow." />
      <section className="grid gap-3 py-0 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></span>
            <strong className="mt-5 block text-3xl font-black text-navy">{value}</strong>
            <span className="mt-1 block text-sm text-slate-500">{label}</span>
          </article>
        ))}
      </section>
    </div>
  );
}

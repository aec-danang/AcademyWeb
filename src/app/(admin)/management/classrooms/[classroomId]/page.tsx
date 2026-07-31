import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardCheck, FileText, UserMinus, UserRound, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { decideEnrollmentAction } from "@/lib/lmsActions";
import { removeStudentFromClassAction } from "@/lib/teacherActions";
import { AdminPageHeader } from "../../AdminPageHeader";
import { ConfirmSubmitButton } from "@/app/(elearning)/elearning/classrooms/[classroomId]/ConfirmSubmitButton";
import { AdminAddStudentForm } from "./AdminAddStudentForm";

type Props = { params: Promise<{ classroomId: string }> };

export const dynamic = "force-dynamic";

export default async function AdminClassroomDetailPage({ params }: Props) {
  const { classroomId } = await params;
  const classroom = await prisma.classSection.findUnique({
    where: { id: classroomId },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      enrollments: { orderBy: { requestedAt: "desc" }, include: { student: { select: { name: true, email: true } } } },
      assignments: { where: { status: "PUBLISHED" }, select: { id: true } },
      quizDeliveries: { where: { status: "PUBLISHED" }, select: { id: true } },
    },
  });
  if (!classroom) notFound();

  const activeStudents = classroom.enrollments.filter((item) => item.status === "ACTIVE");
  const pendingStudents = classroom.enrollments.filter((item) => item.status === "REQUESTED");
  const metrics = [
    { label: "Students", value: activeStudents.length, icon: Users },
    { label: "Assignments", value: classroom.assignments.length, icon: FileText },
    { label: "Tests", value: classroom.quizDeliveries.length, icon: ClipboardCheck },
  ];

  return (
    <div className="mx-auto grid w-full max-w-[1240px] gap-5">
      <AdminPageHeader
        parent={{ label: "Classrooms", href: "/management/classrooms" }}
        eyebrow={`${classroom.code} · ${classroom.status}`}
        title={classroom.name}
        description="Classroom operations, roster and assessment delivery"
      />
      <section className="grid gap-3 py-0 sm:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></span>
            <div><strong className="block text-xl font-black text-navy">{value}</strong><span className="text-xs text-slate-500">{label}</span></div>
          </article>
        ))}
      </section>
      <section className="grid gap-5 py-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-indigo-500">Teacher</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-indigo-600"><UserRound className="h-5 w-5" /></span>
            <div className="min-w-0"><strong className="block truncate text-sm text-navy">{classroom.teacher?.name || "Not assigned"}</strong><small className="block truncate text-slate-500">{classroom.teacher?.email || "No teacher account"}</small></div>
          </div>
          {classroom.teacher ? <Link href={`/management/teachers/${classroom.teacher.id}`} className="mt-5 inline-flex text-sm font-bold text-indigo-600 hover:text-indigo-800">Open teacher profile</Link> : null}
        </article>
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-indigo-500">Roster</p><h3 className="mt-1 text-lg font-black text-navy">Students</h3></div>
            {pendingStudents.length ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{pendingStudents.length} pending</span> : null}
          </div>
          <AdminAddStudentForm classroomId={classroom.id} />
          <div className="divide-y divide-slate-100">
            {classroom.enrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0"><strong className="block truncate text-sm text-navy">{enrollment.student.name || "Unnamed student"}</strong><small className="block truncate text-slate-500">{enrollment.student.email || "No email"}</small></div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${enrollment.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : enrollment.status === "REQUESTED" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{enrollment.status}</span>
                  {enrollment.status === "REQUESTED" ? (
                    <form action={decideEnrollmentAction} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={enrollment.id} />
                      <button name="decision" value="approve" className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700">Approve</button>
                      <button name="decision" value="reject" className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">Reject</button>
                    </form>
                  ) : null}
                  {enrollment.status === "ACTIVE" ? (
                    <form action={removeStudentFromClassAction}>
                      <input type="hidden" name="enrollmentId" value={enrollment.id} />
                      <input type="hidden" name="classroomId" value={classroom.id} />
                      <ConfirmSubmitButton className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50" message={`Remove ${enrollment.student.name || enrollment.student.email || "this student"}? Their account and learning history will be kept.`}><UserMinus className="h-3.5 w-3.5" /> Remove</ConfirmSubmitButton>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
            {!classroom.enrollments.length ? <p className="px-5 py-10 text-center text-sm text-slate-500">No students in this classroom.</p> : null}
          </div>
        </article>
      </section>
    </div>
  );
}

import Link from "next/link";
import { CheckSquare, Users, Clock, CalendarCheck, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../ElearningBreadcrumbs";

export const dynamic = "force-dynamic";

export default async function GlobalAttendanceDashboard() {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  
  const classes = await prisma.classSection.findMany({
    where: user.role === "TEACHER" ? { teacherId: user.id, status: "ACTIVE" } : { status: "ACTIVE" },
    include: {
      enrollments: {
        where: { status: "ACTIVE" }
      },
      _count: {
        select: { enrollments: { where: { status: "ACTIVE" } } }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 w-full overflow-y-auto">
      <ElearningBreadcrumbs items={[{ label: "Attendance" }]} />
      
      <div className="mt-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="text-blue-600" />
            Attendance Management
          </h1>
          <p className="text-slate-500 mt-1">Select a class to take or review attendance.</p>
        </div>
      </div>

      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls: any) => (
            <div key={cls.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-mono font-medium">
                    {cls.code}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{cls.name}</h3>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-4">
                  <div className="flex items-center gap-1.5">
                    <Users size={16} className="text-slate-400" />
                    <span>{cls._count.enrollments} Students</span>
                  </div>
                  {cls.startAt && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-slate-400" />
                      <span>{new Date(cls.startAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 flex gap-3">
                <Link 
                  href={`/elearning/classrooms/${cls.id}?tab=attendance`}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  <CalendarCheck size={16} /> Take Attendance
                </Link>
                <Link 
                  href={`/elearning/classrooms/${cls.id}`}
                  className="flex items-center justify-center px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-colors"
                  title="View Class"
                >
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
          <CheckSquare className="text-slate-300 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No active classes found</h3>
          <p className="text-slate-500 mb-6 text-center">
            You don't have any active classes assigned yet. Once you are assigned a class, it will appear here for attendance tracking.
          </p>
          <Link href="/elearning/classrooms" className="px-6 py-2.5 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors">
            View All Classrooms
          </Link>
        </div>
      )}
    </div>
  );
}

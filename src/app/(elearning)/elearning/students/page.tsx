import Link from "next/link";
import { Users, Search, Mail, BookOpen, ChevronRight, UserCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../ElearningBreadcrumbs";

export const dynamic = "force-dynamic";

export default async function GlobalStudentsDirectory() {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  
  // Fetch enrollments to list students and their classes
  const enrollments = await prisma.enrollment.findMany({
    where: user.role === "TEACHER" ? { classSection: { teacherId: user.id } } : {},
    include: {
      student: true,
      classSection: true,
    },
    orderBy: [
      { classSection: { name: 'asc' } },
      { student: { name: 'asc' } }
    ]
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 w-full overflow-y-auto">
      <ElearningBreadcrumbs items={[{ label: "Students Directory" }]} />
      
      <div className="mt-8 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-blue-600" />
            My Students
          </h1>
          <p className="text-slate-500 mt-1">Directory of all students enrolled in your classes.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {enrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Class</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Enrolled On</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          {enrollment.student.image ? (
                            <img src={enrollment.student.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <UserCircle2 size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{enrollment.student.name || "Unknown"}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail size={12} /> {enrollment.student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <BookOpen size={14} className="text-blue-500" />
                        {enrollment.classSection.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{enrollment.classSection.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        enrollment.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        enrollment.status === 'REQUESTED' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/elearning/classrooms/${enrollment.classSectionId}?tab=students`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Manage <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Users className="text-slate-300 mb-3" size={40} />
            <h3 className="text-lg font-semibold text-slate-900">No students found</h3>
            <p className="text-slate-500 mt-1">You don't have any students enrolled in your classes yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

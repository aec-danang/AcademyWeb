import Link from "next/link";
import { ArrowRight, CheckCircle2, School, UserRound, Users, UserPlus } from "lucide-react";
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

  const kpis = [
    { label: "Học viên đang học", value: studentCount, delta: "+12 tháng này", colorVal: "text-blue-600", colorBg: "bg-blue-50", bar: 78, Icon: Users },
    { label: "Lớp đang mở", value: classroomCount, delta: "3 lớp mới tháng 8", colorVal: "text-emerald-600", colorBg: "bg-emerald-50", bar: 60, Icon: School },
    { label: "Yêu cầu ghi danh", value: pendingCount, delta: "+8 hôm nay", colorVal: "text-amber-600", colorBg: "bg-amber-50", bar: pendingCount > 0 ? 47 : 0, Icon: UserPlus },
    { label: "Giáo viên giảng dạy", value: teachers.length, delta: "Ổn định", colorVal: "text-violet-600", colorBg: "bg-violet-50", bar: 71, Icon: UserRound },
  ];

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto w-full">
      {/* Urgent Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-white text-xl">⚡</span>
          <div>
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide">Cần xử lý ngay</p>
            <p className="text-white font-semibold text-sm mt-0.5">
              {pendingCount} yêu cầu ghi danh · 2 báo nghỉ chờ duyệt · 1 bài viết cần review
            </p>
          </div>
        </div>
        <Link href="/management/classrooms" className="bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors whitespace-nowrap">
          Xử lý ngay
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-start justify-between mb-3">
              <div className={`${k.colorBg} w-9 h-9 rounded-lg flex items-center justify-center ${k.colorVal} transition-transform group-hover:scale-110 duration-200 dark:bg-slate-800`}>
                <k.Icon size={16} />
              </div>
            </div>
            <p className={`font-bold text-2xl ${k.colorVal}`}>{k.value}</p>
            <p className="text-sm text-slate-600 font-medium mt-0.5 dark:text-slate-400">{k.label}</p>
            <div className="mt-3">
              <div className="bg-slate-100 rounded-full h-1 dark:bg-slate-800">
                <div className={`h-1 rounded-full ${k.colorVal.replace("text-", "bg-")}`} style={{ width: `${k.bar}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{k.delta}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teachers Table (Styled like Leads table) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Đội ngũ Giáo viên</h3>
            <Link href="/management/teachers" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">Xem tất cả →</Link>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {teachers.slice(0, 6).map((teacher) => {
              const students = teacher.classSections.reduce((total, classroom) => total + classroom.enrollments.length, 0);
              const initial = (teacher.name || teacher.email || "?").charAt(0).toUpperCase();
              return (
                <div key={teacher.id} className="flex items-center px-5 py-3.5 hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-blue-500 shrink-0">
                    {initial}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate dark:text-slate-200">{teacher.name || "Unnamed teacher"}</p>
                    <p className="text-xs text-slate-400 truncate">{teacher.email}</p>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{teacher.classSections.length}</p>
                      <p className="text-xs text-slate-400">lớp học</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{students}</p>
                      <p className="text-xs text-slate-400">học viên</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`}>
                      Active
                    </span>
                  </div>
                </div>
              );
            })}
            {!teachers.length ? <p className="px-5 py-8 text-center text-sm text-slate-500">Chưa có giáo viên nào.</p> : null}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 dark:bg-slate-900 dark:border-slate-800">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Lối tắt thao tác</h3>
          <div className="space-y-3">
            <Link href="/management/courses" className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group dark:border-slate-800 dark:hover:border-blue-900 dark:hover:bg-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors dark:bg-blue-900/30 dark:text-blue-400">
                <School size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Quản lý lớp học</p>
                <p className="text-xs text-slate-400">Tạo mới hoặc xếp lớp</p>
              </div>
            </Link>
            <Link href="/management/posts/new" className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group dark:border-slate-800 dark:hover:border-blue-900 dark:hover:bg-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors dark:bg-blue-900/30 dark:text-blue-400">
                <UserPlus size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Viết bài mới</p>
                <p className="text-xs text-slate-400">Đăng blog, sự kiện</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

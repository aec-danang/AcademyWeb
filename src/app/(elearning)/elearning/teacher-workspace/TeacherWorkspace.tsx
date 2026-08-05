import Link from "next/link";
import {
  ClipboardCheck,
  Users,
  CheckSquare,
  MessageSquare,
  Calendar,
  ArrowRight,
  Clock,
  ChevronRight,
} from "lucide-react";

export function TeacherWorkspace({ user }: { user: { id: string; name: string | null; role: string } }) {
  const firstName = user.name?.trim().split(/\s+/)[0];

  const todaysClasses = [
    { id: '1', time: '09:00 AM', name: 'IELTS 6.5 - Morning', students: 15 },
    { id: '2', time: '02:00 PM', name: 'TOEFL Prep - A2', students: 12 },
  ];

  return (
    <div className="w-full h-full bg-slate-50 min-h-[calc(100vh-64px)] p-6 overflow-auto">
      {/* Header section */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="text-slate-500 mt-1">Here is what you need to teach and grade today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard icon={<ClipboardCheck className="text-amber-500" />} label="Homework to Grade" value="12" href="/elearning/tasks" highlight />
            <MetricCard icon={<CheckSquare className="text-emerald-500" />} label="Pending Attendance" value="2 classes" href="/elearning/attendance" />
            <MetricCard icon={<MessageSquare className="text-blue-500" />} label="Pending Questions" value="5" href="/elearning/messages" />
            <MetricCard icon={<Calendar className="text-purple-500" />} label="Upcoming Exams" value="1" href="/elearning/calendar" />
          </div>

          {/* Today's Classes */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-medium text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                Today's Classes
              </h2>
              <Link href="/elearning/classrooms" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {todaysClasses.map((cls: any) => (
                <div key={cls.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-semibold whitespace-nowrap">
                      {cls.time}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{cls.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{cls.students} Students</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/elearning/classrooms/${cls.id}/attendance`} className="px-3 py-1.5 text-sm bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      Attendance
                    </Link>
                    <Link href={`/elearning/classrooms/${cls.id}`} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      Enter Class
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Homework Needs Grading */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-medium text-slate-900 flex items-center gap-2 mb-4">
              <ClipboardCheck className="w-5 h-5 text-amber-500" />
              Priority Grading
            </h2>
            <div className="space-y-3">
              <PriorityTask 
                title="Writing Task 1 - Bar Chart"
                subtitle="IELTS 6.5 - Morning"
                count="8 ungraded"
                time="Due yesterday"
              />
              <PriorityTask 
                title="Speaking Part 2"
                subtitle="TOEFL Prep - A2"
                count="4 ungraded"
                time="Due today"
              />
            </div>
            <Link href="/elearning/tasks" className="block w-full text-center mt-4 py-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-50 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              Go to Homework Management
            </Link>
          </section>

          {/* Recent Activity */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-medium text-slate-900 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-slate-400" />
              Recent Submissions
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i: any) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" aria-hidden="true">
                    S{i}
                  </div>
                  <div>
                    <p className="text-sm text-slate-900"><span className="font-medium">Student {i}</span> submitted <span className="font-medium">Reading Practice</span></p>
                    <p className="text-xs text-slate-400 mt-0.5">10 mins ago</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, href, highlight = false }: { icon: React.ReactNode, label: string, value: string, href: string, highlight?: boolean }) {
  return (
    <Link href={href} className={`block p-4 rounded-xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${highlight ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'} transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <p className={`text-2xl font-bold ${highlight ? 'text-amber-900' : 'text-slate-900'}`}>{value}</p>
        <p className={`text-sm font-medium mt-1 ${highlight ? 'text-amber-700' : 'text-slate-500'}`}>{label}</p>
      </div>
    </Link>
  );
}

function PriorityTask({ title, subtitle, count, time }: { title: string, subtitle: string, count: string, time: string }) {
  return (
    <div className="group flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-100 transition-colors cursor-pointer">
      <div>
        <h4 className="font-medium text-slate-900 text-sm">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded">{count}</span>
          <span className="text-xs text-slate-400">{time}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
    </div>
  );
}

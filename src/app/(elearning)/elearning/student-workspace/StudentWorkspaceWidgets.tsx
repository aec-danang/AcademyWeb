import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle, Clock, SearchX, XCircle } from "lucide-react";

export async function ContinueLearningWidget({ userId }: { userId: string }) {
  // Find the first IN_PROGRESS attempt, or the first pending assignment
  const inProgressAttempt = await prisma.attempt.findFirst({
    where: { studentId: userId, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
    include: {
      quiz: { include: { classSection: true } }
    }
  });

  if (inProgressAttempt) {
    return (
      <div className="bg-blue-600 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen size={100} />
        </div>
        <h2 className="text-blue-100 font-medium mb-1">Continue Learning</h2>
        <h3 className="text-2xl font-bold mb-6">{inProgressAttempt.quiz.title}</h3>
        <Link 
          href={`/elearning/practice/${inProgressAttempt.quiz.id}?attempt=${inProgressAttempt.id}`}
          className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Continue <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // Fallback to a pending assignment
  const pendingAssignment = await prisma.assignment.findFirst({
    where: {
      status: "PUBLISHED",
      submissions: { none: { studentId: userId } },
      classSection: { enrollments: { some: { userId, status: "ACTIVE" } } }
    },
    orderBy: { dueAt: "asc" },
    include: { classSection: true }
  });

  if (pendingAssignment) {
    return (
      <div className="bg-blue-600 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen size={100} />
        </div>
        <h2 className="text-blue-100 font-medium mb-1">Next up</h2>
        <h3 className="text-2xl font-bold mb-6">{pendingAssignment.title}</h3>
        <Link 
          href={`/elearning/assignments/${pendingAssignment.id}`}
          className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Start Assignment <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
      <CheckCircle className="text-emerald-500 mb-3" size={32} />
      <h3 className="font-semibold text-slate-900">You are all caught up!</h3>
      <p className="text-slate-500 text-sm mt-1">No pending learning items right now.</p>
    </div>
  );
}

export async function StudentOverviewStats({ userId }: { userId: string }) {
  const [activeClasses, pendingSubmissions] = await Promise.all([
    prisma.enrollment.count({
      where: { userId, status: "ACTIVE" }
    }),
    prisma.assignment.count({
      where: {
        status: "PUBLISHED",
        submissions: { none: { studentId: userId } },
        classSection: { enrollments: { some: { userId, status: "ACTIVE" } } }
      }
    })
  ]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Active Classes" value={activeClasses.toString()} />
      <StatCard label="Pending Homework" value={pendingSubmissions.toString()} highlight />
      <StatCard label="Learning Time" value="12h 30m" />
      <StatCard label="Overall Score" value="8.5/10" />
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
      <p className={`text-2xl font-bold ${highlight ? 'text-amber-900' : 'text-slate-900'}`}>{value}</p>
      <p className={`text-sm font-medium mt-1 ${highlight ? 'text-amber-700' : 'text-slate-500'}`}>{label}</p>
    </div>
  );
}

export async function HomeworkStatusWidget({ userId }: { userId: string }) {
  const assignments = await prisma.assignment.findMany({
    where: {
      status: "PUBLISHED",
      classSection: { enrollments: { some: { userId, status: "ACTIVE" } } }
    },
    include: {
      classSection: true,
      submissions: { where: { studentId: userId } }
    },
    orderBy: { dueAt: "asc" }
  });

  const now = new Date();
  
  const pending = assignments.filter((a: any) => a.submissions.length === 0);
  const dueToday = pending.filter((a: any) => a.dueAt && a.dueAt.toDateString() === now.toDateString());
  const late = pending.filter((a: any) => a.dueAt && a.dueAt < now && a.dueAt.toDateString() !== now.toDateString());
  // other pending...

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="font-medium text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          Today's Homework ⭐
        </h2>
        <Link href="/elearning/tasks" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {late.length > 0 && late.map((a: any) => (
          <HomeworkItem key={a.id} assignment={a} status="Late" statusColor="text-red-600 bg-red-50" />
        ))}
        {dueToday.length > 0 && dueToday.map((a: any) => (
          <HomeworkItem key={a.id} assignment={a} status="Due Today" statusColor="text-amber-600 bg-amber-50" />
        ))}
        {dueToday.length === 0 && late.length === 0 && (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <CheckCircle className="text-slate-300 w-10 h-10 mb-3" />
            <p>No urgent homework for today!</p>
          </div>
        )}
      </div>
    </section>
  );
}

function HomeworkItem({ assignment, status, statusColor }: { assignment: any, status: string, statusColor: string }) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
      <div>
        <h3 className="font-medium text-slate-900">{assignment.title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{assignment.classSection.code}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${statusColor}`}>
          {status}
        </span>
        <Link href={`/elearning/assignments/${assignment.id}`} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          Start
        </Link>
      </div>
    </div>
  );
}

export async function RecentFeedbackWidget({ userId }: { userId: string }) {
  const grades = await prisma.grade.findMany({
    where: { studentId: userId, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      assignment: true,
      gradedBy: true
    }
  });

  if (grades.length === 0) {
    return (
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-medium text-slate-900 flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-slate-400" />
          Recent Feedback
        </h2>
        <div className="text-center text-slate-400 py-6">
          <SearchX className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent feedback</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h2 className="font-medium text-slate-900 flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-slate-400" />
        Recent Feedback
      </h2>
      <div className="space-y-4">
        {grades.map((grade: any) => (
          <div key={grade.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-slate-900 text-sm truncate pr-4">{grade.assignment?.title || "Assignment"}</h4>
              <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-xs">{grade.score}/10</span>
            </div>
            {grade.feedback && (
              <p className="text-xs text-slate-600 line-clamp-2">"{grade.feedback}"</p>
            )}
            <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
              <span>By {grade.gradedBy?.name || "Teacher"}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

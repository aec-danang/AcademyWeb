import { Suspense } from "react";
import {
  BookOpen,
  ClipboardCheck,
  Calendar,
  MessageSquare,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  ContinueLearningWidget,
  HomeworkStatusWidget,
  RecentFeedbackWidget,
  StudentOverviewStats,
} from "./StudentWorkspaceWidgets";
import { WidgetSkeleton } from "../teacher-workspace/WorkspaceWidget";

export function StudentWorkspace({ user }: { user: { id: string; name: string | null; role: string } }) {
  const firstName = user.name?.trim().split(/\s+/)[0];

  return (
    <div className="w-full h-full bg-slate-50 min-h-[calc(100vh-64px)] p-6 overflow-auto">
      {/* Header section */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Good Morning, {firstName || "Student"} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here is what you need to focus on today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Continue Learning - Big Button/Card */}
          <Suspense fallback={<WidgetSkeleton rows={2} />}>
            <ContinueLearningWidget userId={user.id} />
          </Suspense>

          {/* Quick Metrics */}
          <Suspense fallback={<WidgetSkeleton rows={1} />}>
            <StudentOverviewStats userId={user.id} />
          </Suspense>

          {/* Today's Homework */}
          <Suspense fallback={<WidgetSkeleton rows={4} />}>
            <HomeworkStatusWidget userId={user.id} />
          </Suspense>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Recent Feedback */}
          <Suspense fallback={<WidgetSkeleton rows={3} />}>
            <RecentFeedbackWidget userId={user.id} />
          </Suspense>

          {/* Announcements / Upcoming (Placeholder) */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-medium text-slate-900 flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Announcements
            </h2>
            <div className="space-y-4">
              <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900 block mb-1">IELTS Mock Test</span>
                Remember to join the mock test this Saturday at 08:00 AM.
                <span className="block mt-2 text-xs text-slate-400">1 day ago</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

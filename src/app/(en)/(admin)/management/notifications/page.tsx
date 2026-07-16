import { Bell, CheckCircle2 } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h2>
        <p className="text-slate-500 dark:text-slate-400">View your recent alerts, updates, and system messages.</p>
      </div>
      
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-2 shadow-sm border border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">You're all caught up!</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            You currently have no new notifications. Any new system alerts or updates will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

import { Calendar } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../ElearningBreadcrumbs";
import { RealTimeClock } from "./RealTimeClock";
import { CalendarBoard } from "./CalendarBoard";
import { AdminCalendarBoard } from "./AdminCalendarBoard";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 w-full overflow-y-auto">
      <ElearningBreadcrumbs items={[{ label: "Calendar" }]} />
      
      <div className="mt-8 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="text-blue-600" />
            {user.role === "ADMIN" ? "Admin Schedule" : "Schedule"}
          </h1>
          <p className="text-slate-500 mt-1">
            {user.role === "ADMIN" ? "Manage and schedule classes using drag and drop." : "View your upcoming classes and events."}
          </p>
        </div>
        
        {/* Real-time Clock Widget */}
        <RealTimeClock />
      </div>

      <div className="w-full">
        {user.role === "ADMIN" ? (
          <AdminCalendarBoard />
        ) : (
          <CalendarBoard />
        )}
      </div>
    </div>
  );
}

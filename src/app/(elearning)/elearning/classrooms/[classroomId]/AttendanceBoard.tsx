"use client";

import { useState } from "react";
import { CheckSquare, XSquare, Clock, ArrowRight, Save, UserCircle2 } from "lucide-react";
import { saveDailyAttendanceAction } from "@/lib/attendanceActions";

type AttendanceBoardProps = {
  classroomId: string;
  students: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  }[];
};

type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export function AttendanceBoard({ classroomId, students }: AttendanceBoardProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSave = async () => {
    if (Object.keys(records).length === 0) return;
    
    setIsSaving(true);
    try {
      const payload = Object.entries(records).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      
      const result = await saveDailyAttendanceAction(classroomId, date, payload);
      
      if (result.success) {
        alert("Attendance saved successfully!");
      } else {
        alert("Failed to save attendance.");
      }
    } catch (error) {
      alert("Error saving attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="text-blue-600" size={20} />
            Daily Attendance
          </h2>
          <p className="text-sm text-slate-500 mt-1">Record attendance for the selected date.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleSave}
            disabled={isSaving || Object.keys(records).length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3 text-center">Present</th>
              <th className="px-6 py-3 text-center">Late</th>
              <th className="px-6 py-3 text-center">Absent</th>
              <th className="px-6 py-3 text-center">Excused</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length > 0 ? (
              students.map((student) => {
                const currentStatus = records[student.id];
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          {student.image ? (
                            <img src={student.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <UserCircle2 size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{student.name || "Unknown"}</div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleStatusChange(student.id, "PRESENT")}
                        className={`p-2 rounded-full transition-colors ${currentStatus === "PRESENT" ? 'bg-emerald-100 text-emerald-600' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                        title="Present"
                      >
                        <CheckSquare size={20} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleStatusChange(student.id, "LATE")}
                        className={`p-2 rounded-full transition-colors ${currentStatus === "LATE" ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                        title="Late"
                      >
                        <Clock size={20} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleStatusChange(student.id, "ABSENT")}
                        className={`p-2 rounded-full transition-colors ${currentStatus === "ABSENT" ? 'bg-red-100 text-red-600' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                        title="Absent"
                      >
                        <XSquare size={20} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleStatusChange(student.id, "EXCUSED")}
                        className={`p-2 rounded-full transition-colors ${currentStatus === "EXCUSED" ? 'bg-blue-100 text-blue-600' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                        title="Excused"
                      >
                        <ArrowRight size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No active students found in this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import Link from "next/link";
import { requireUser } from "@/lib/session";
import { TeacherWorkspace } from "./teacher-workspace/TeacherWorkspace";
import { StudentWorkspace } from "./student-workspace/StudentWorkspace";

export const dynamic = "force-dynamic";

export default async function ElearningDashboard() {
  const user = await requireUser();
  const isStudent = user.role === "STUDENT";

  if (!isStudent) {
    return <TeacherWorkspace user={{ id: user.id, name: user.name, role: user.role }} />;
  }

  if (isStudent) {
    return <StudentWorkspace user={{ id: user.id, name: user.name, role: user.role }} />;
  }

  // Fallback for other roles or edge cases
  return (
    <div className="flex h-full items-center justify-center bg-slate-50 min-h-screen">
      <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome</h1>
        <p className="text-slate-500 mt-2">Your role does not have a specific dashboard yet.</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 font-medium hover:underline">
          Go back home
        </Link>
      </div>
    </div>
  );
}

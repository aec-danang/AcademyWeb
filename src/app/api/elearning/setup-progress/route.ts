import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getTeacherSetupProgress } from "@/lib/teacherSetup";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  const progress = await getTeacherSetupProgress(user.id, user.role === "ADMIN");
  return NextResponse.json(progress, { headers: { "Cache-Control": "no-store" } });
}

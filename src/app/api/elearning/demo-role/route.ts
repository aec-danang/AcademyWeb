import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/session";

const DEMO_ROLES = ["ADMIN", "TEACHER", "STUDENT"];

async function setDemoRole(role: unknown) {
  if (typeof role !== "string" || !DEMO_ROLES.includes(role)) return false;
  const cookieStore = await cookies();
  cookieStore.set("demo_role", role, { path: "/", maxAge: 60 * 60 * 24 * 7, httpOnly: true, sameSite: "lax" });
  return true;
}

export async function POST(request: Request) {
  if (!isDemoMode) return new NextResponse(null, { status: 404 });

  try {
    const { role } = await request.json();

    if (!(await setDemoRole(role))) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    return NextResponse.json({ error: "Failed to switch role" }, { status: 500 });
  }
}

// Used by plain links such as the sidebar "Admin View" shortcut.
export async function GET(request: Request) {
  if (!isDemoMode) return new NextResponse(null, { status: 404 });

  const url = new URL(request.url);
  const role = url.searchParams.get("role");

  if (!(await setDemoRole(role))) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  return NextResponse.redirect(new URL(role === "ADMIN" ? "/management" : "/elearning", url));
}

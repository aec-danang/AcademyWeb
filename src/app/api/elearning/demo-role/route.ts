import { NextResponse } from "next/server";
import { DEMO_ROLE_COOKIE, ensureDemoElearningData } from "@/lib/demoElearning";

type DemoRole = "ADMIN" | "TEACHER" | "STUDENT";

function setDemoRoleCookie(response: NextResponse, role: DemoRole) {
  response.cookies.set(DEMO_ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await ensureDemoElearningData();
  const url = new URL(request.url);
  const requestedRole = url.searchParams.get("role");
  const role: DemoRole = requestedRole === "ADMIN" || requestedRole === "STUDENT" || requestedRole === "TEACHER"
    ? requestedRole
    : "TEACHER";
  const destination = role === "ADMIN" ? "/management" : "/elearning";
  return setDemoRoleCookie(
    NextResponse.redirect(new URL(destination, request.url)),
    role,
  );
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null) as { role?: string } | null;
  const role: DemoRole | null = body?.role === "ADMIN" || body?.role === "STUDENT" || body?.role === "TEACHER"
    ? body.role
    : null;

  if (!role) {
    return NextResponse.json({ message: "Role must be ADMIN, TEACHER, or STUDENT." }, { status: 400 });
  }

  await ensureDemoElearningData();

  return setDemoRoleCookie(NextResponse.json({ ok: true, role }), role);
}

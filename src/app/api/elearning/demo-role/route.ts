import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { role } = await request.json();
    
    if (!["ADMIN", "TEACHER", "STUDENT"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set("demo_role", role, { path: "/", maxAge: 60 * 60 * 24 * 7 });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    return NextResponse.json({ error: "Failed to switch role" }, { status: 500 });
  }
}

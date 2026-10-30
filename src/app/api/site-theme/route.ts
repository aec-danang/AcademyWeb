import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isSeasonalTheme } from "@/lib/seasonalTheme";
import { getSiteTheme, getSiteThemeAdmin, SITE_THEME_KEY } from "@/lib/siteTheme.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [theme, admin] = await Promise.all([getSiteTheme(), getSiteThemeAdmin()]);
    return NextResponse.json({ theme, canManage: Boolean(admin) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Không tải được cấu hình giao diện." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).host !== request.headers.get("host")) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
    if (!(await getSiteThemeAdmin())) {
      return NextResponse.json({ error: "Chỉ admin đang đăng nhập mới được đổi chủ đề website." }, { status: 403 });
    }
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (!isSeasonalTheme(body?.theme)) {
      return NextResponse.json({ error: "Chủ đề không hợp lệ." }, { status: 400 });
    }
    await prisma.siteSetting.upsert({
      where: { key: SITE_THEME_KEY }, update: { value: body.theme },
      create: { key: SITE_THEME_KEY, value: body.theme },
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ theme: body.theme }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Không lưu được chủ đề. Vui lòng thử lại." }, { status: 500 });
  }
}

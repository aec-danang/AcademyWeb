import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { isSeasonalTheme, type SeasonalTheme } from "@/lib/seasonalTheme";

export const SITE_THEME_KEY = "site-seasonal-theme";

export async function getSiteTheme(): Promise<SeasonalTheme> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: SITE_THEME_KEY }, select: { value: true } });
    return isSeasonalTheme(setting?.value) ? setting.value : "default";
  } catch {
    // Appearance must not prevent the login page from loading during a DB outage.
    console.warn("Could not load the site appearance; using the default theme.");
    return "default";
  }
}

export async function getSiteThemeAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, isActive: true },
  });
  return user?.isActive && user.role === "ADMIN" ? user : null;
}

export async function requireSiteThemeAdmin() {
  const admin = await getSiteThemeAdmin();
  if (!admin) throw new Error("Chỉ tài khoản admin đang đăng nhập mới được thay đổi cấu hình website.");
  return admin;
}

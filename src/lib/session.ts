import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export type AppRole = "ADMIN" | "TEACHER" | "STUDENT" | "USER";

const DEMO_ROLES: AppRole[] = ["ADMIN", "TEACHER", "STUDENT"];

// Demo users exist only in local development; production always requires a real session.
export const isDemoMode = process.env.NODE_ENV !== "production";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    if (!isDemoMode) return null;

    // --- MOCK FOR E-LEARNING DEV ---
    // Reads demo_role cookie set by the DemoRoleSwitcher
    const cookieStore = await cookies();
    const demoRoleCookie = cookieStore.get("demo_role")?.value as AppRole | undefined;
    const TEST_ROLE: AppRole = demoRoleCookie && DEMO_ROLES.includes(demoRoleCookie) ? demoRoleCookie : "TEACHER";
    
    return {
      id: TEST_ROLE === "TEACHER" ? "mock-teacher-id" : TEST_ROLE === "ADMIN" ? "mock-admin-id" : "mock-student-id",
      name: TEST_ROLE === "TEACHER" ? "Teacher Sarah" : TEST_ROLE === "ADMIN" ? "Admin Manager" : "Student Minh",
      email: TEST_ROLE === "TEACHER" ? "teacher@academy.edu.vn" : TEST_ROLE === "ADMIN" ? "admin@academy.edu.vn" : "student@academy.edu.vn",
      phone: "0901234567",
      role: TEST_ROLE,
      isActive: true,
    };
    // --- END MOCK ---
  }

  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
    },
  });
}

export async function requireUser(roles?: AppRole[]): Promise<{ id: string; name: string | null; email: string | null; phone: string | null; role: AppRole; isActive: boolean }> {
  const user = await getCurrentUser();

  if (!user || !user.isActive) {
    redirect("/login");
  }

  if (roles && !roles.includes(user.role)) {
    redirect("/elearning");
  }

  return user;
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email && isDemoMode) {
    return {
      id: "mock-admin-id",
      name: "Admin Manager",
      email: "admin@academy.edu.vn",
      phone: "0901234567",
      role: "ADMIN" as AppRole,
      isActive: true,
    };
  }
  return requireUser(["ADMIN"]);
}

export async function requireTeacherOrAdmin() {
  return requireUser(["ADMIN", "TEACHER"]);
}

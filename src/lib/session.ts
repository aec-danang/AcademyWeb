import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export type AppRole = "ADMIN" | "TEACHER" | "STUDENT" | "USER";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    // --- MOCK FOR E-LEARNING DEV ---
    return {
      id: "mock-student-id",
      name: "Mock Teacher",
      email: "teacher@example.com",
      phone: "123456789",
      role: "TEACHER" as AppRole,
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
  return requireUser(["ADMIN"]);
}

export async function requireTeacherOrAdmin() {
  return requireUser(["ADMIN", "TEACHER"]);
}

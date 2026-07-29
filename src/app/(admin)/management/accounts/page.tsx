import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import AccountManagerClient from "./AccountManagerClient";

type SessionUser = {
  role?: string;
};

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUser | undefined;

  if (sessionUser?.role !== "ADMIN") {
    redirect("/login");
  }

  const [users, classSections, sitePrograms] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        enrollments: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            classSection: {
              select: {
                id: true,
                name: true,
                code: true,
                startAt: true,
                endAt: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    program: true,
                  },
                },
                teacher: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.classSection.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        startAt: true,
        endAt: true,
        course: {
          select: {
            id: true,
            title: true,
            program: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.siteProgram.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: { order: "asc" },
    }),
  ]);

  // Remove potential memory duplicates based on email & username
  const uniqueUsersMap = new Map<string, typeof users[0]>();
  for (const u of users) {
    const key = (u.email || u.username || u.id).toLowerCase();
    if (!uniqueUsersMap.has(key)) {
      uniqueUsersMap.set(key, u);
    }
  }
  const cleanUsers = Array.from(uniqueUsersMap.values());

  return (
    <AccountManagerClient
      initialUsers={cleanUsers.map((user: any) => ({
        id: user.id,
        name: user.name ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        role: user.role,
        image: user.image ?? null,
        emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        password: "",
        enrollments: user.enrollments || [],
      }))}
      classList={classSections.map((c: any) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        program: c.course?.program || "General",
        startAt: c.startAt ? c.startAt.toISOString() : null,
        endAt: c.endAt ? c.endAt.toISOString() : null,
      }))}
      programList={sitePrograms}
    />
  );
}
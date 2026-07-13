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

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <AccountManagerClient
      initialUsers={users.map((user) => ({
        ...user,
        name: user.name ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        password: "",
      }))}
    />
  );
}
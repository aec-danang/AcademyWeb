"use server";

import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

type AccountRole = "USER" | "TEACHER" | "ADMIN";

type SessionUser = {
  role?: string;
};

type AccountInput = {
  id?: string;
  name: string;
  email: string;
  role: AccountRole;
  password?: string;
};

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUser | undefined;

  if (sessionUser?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

function normalizeRole(role: string): AccountRole {
  if (role === "TEACHER" || role === "ADMIN") {
    return role;
  }

  return "USER";
}

function normalizeAccount(input: AccountInput) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || null;
  const password = input.password?.trim() || null;

  if (!email) {
    throw new Error("Email is required for every account row.");
  }

  return {
    id: input.id?.trim() || undefined,
    email,
    name,
    role: normalizeRole(input.role),
    password,
  };
}

export async function saveAccounts(accounts: AccountInput[]) {
  await requireAdmin();

  const normalizedAccounts = accounts.map(normalizeAccount);

  for (const account of normalizedAccounts) {
    if (account.id) {
      await prisma.user.update({
        where: { id: account.id },
        data: {
          name: account.name,
          email: account.email,
          role: account.role,
          ...(account.password ? { password: account.password } : {}),
          updatedAt: new Date(),
        },
      });
      continue;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: account.email },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: account.name,
          role: account.role,
          ...(account.password ? { password: account.password } : {}),
          updatedAt: new Date(),
        },
      });
      continue;
    }

    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: account.name,
        email: account.email,
        role: account.role,
        password: account.password,
        updatedAt: new Date(),
      },
    });
  }

  revalidatePath("/admin/accounts");
  revalidatePath("/admin");
}

export async function deleteAccount(id: string) {
  await requireAdmin();

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/admin/accounts");
  revalidatePath("/admin");
}
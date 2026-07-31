"use server";

import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type AccountRole = "USER" | "TEACHER" | "ADMIN" | "STUDENT";

type SessionUser = {
  role?: string;
};

type AccountInput = {
  id?: string;
  name: string;
  username?: string;
  email?: string;
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
  const email = input.email?.trim().toLowerCase() || null;
  const username = input.username?.trim() || null;
  const name = input.name.trim() || null;
  const password = input.password?.trim() || null;

  if (!email && !username) {
    throw new Error("Email or username is required for every account row.");
  }

  return {
    id: input.id?.trim() || undefined,
    email,
    username,
    name,
    role: normalizeRole(input.role),
    password,
  };
}

export async function saveAccounts(accounts: AccountInput[]) {
  await requireAdmin();

  const normalizedAccounts = accounts.map(normalizeAccount);

  for (const account of normalizedAccounts) {
    let hashedPassword = null;
    if (account.password) {
      hashedPassword = await bcrypt.hash(account.password, 10);
    }

    if (account.id) {
      await prisma.user.update({
        where: { id: account.id },
        data: {
          name: account.name,
          email: account.email,
          username: account.username,
          role: account.role,
          ...(hashedPassword ? { password: hashedPassword } : {}),
          updatedAt: new Date(),
        },
      });
      continue;
    }

    let existingUser = null;
    if (account.username) {
      existingUser = await prisma.user.findUnique({
        where: { username: account.username },
      });
    }
    if (!existingUser && account.email) {
      existingUser = await prisma.user.findUnique({
        where: { email: account.email },
      });
    }

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: account.name,
          role: account.role,
          username: account.username || existingUser.username,
          email: account.email || existingUser.email,
          ...(hashedPassword ? { password: hashedPassword } : {}),
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
        username: account.username,
        role: account.role,
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });
  }

  revalidatePath("/management/accounts");
  revalidatePath("/management");
}

export async function deleteAccount(id: string) {
  await requireAdmin();

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/management/accounts");
  revalidatePath("/management");
}
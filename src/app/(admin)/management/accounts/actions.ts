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
  phone?: string;
  role: AccountRole;
  password?: string;
  classSectionId?: string;
  startDate?: string;
  endDate?: string;
};

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUser | undefined;

  if (sessionUser?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

function normalizeRole(role: string): AccountRole {
  if (role === "TEACHER" || role === "ADMIN" || role === "STUDENT") {
    return role as AccountRole;
  }

  return "USER";
}

function parseDateString(dateStr?: string): Date | undefined {
  if (!dateStr || !dateStr.trim()) return undefined;
  const s = dateStr.trim();

  // Handle DD/MM/YYYY or DD-MM-YYYY (with optional time component)
  const ddmmyyyyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
    const year = parseInt(ddmmyyyyMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }

  // Handle YYYY-MM-DD format
  const yyyymmddMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10);
    const month = parseInt(yyyymmddMatch[2], 10) - 1;
    const day = parseInt(yyyymmddMatch[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? undefined : fallback;
}

function normalizeAccount(input: AccountInput) {
  const email = input.email?.trim().toLowerCase() || null;
  const username = input.username?.trim() || null;
  const name = input.name?.trim() || null;
  const phone = input.phone?.trim() || null;
  const password = input.password?.trim() || null;

  if (!email && !username) {
    throw new Error("Email hoặc Username là bắt buộc.");
  }

  return {
    id: input.id?.trim() || undefined,
    email,
    username,
    name,
    phone,
    role: normalizeRole(input.role),
    password,
    classSectionId: input.classSectionId?.trim() || undefined,
    startDate: parseDateString(input.startDate),
    endDate: parseDateString(input.endDate),
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

    let targetUserId = account.id;

    if (targetUserId) {
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          name: account.name,
          email: account.email,
          username: account.username,
          phone: account.phone,
          role: account.role,
          ...(hashedPassword ? { password: hashedPassword } : {}),
          updatedAt: new Date(),
        },
      });
    } else {
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
        targetUserId = existingUser.id;
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: account.name || existingUser.name,
            role: account.role,
            phone: account.phone || existingUser.phone,
            ...(hashedPassword ? { password: hashedPassword } : {}),
            updatedAt: new Date(),
          },
        });
      } else {
        const newId = randomUUID();
        targetUserId = newId;
        await prisma.user.create({
          data: {
            id: newId,
            name: account.name,
            email: account.email,
            username: account.username,
            phone: account.phone,
            role: account.role,
            password: hashedPassword,
            updatedAt: new Date(),
          },
        });
      }
    }

    // Assign to ClassSection if specified or dates provided
    if (account.role === "STUDENT" && targetUserId) {
      let resolvedClassId = account.classSectionId;

      if (resolvedClassId) {
        // Find by ID, code, or name
        let foundClass = await prisma.classSection.findUnique({
          where: { id: resolvedClassId },
        });

        if (!foundClass) {
          foundClass = await prisma.classSection.findFirst({
            where: {
              OR: [
                { code: { equals: resolvedClassId, mode: "insensitive" } },
                { name: { equals: resolvedClassId, mode: "insensitive" } },
              ],
            },
          });
        }

        if (foundClass) {
          resolvedClassId = foundClass.id;
        } else {
          // Auto create a new ClassSection with this name/code if not existing
          const newClass = await prisma.classSection.create({
            data: {
              name: resolvedClassId,
              code: resolvedClassId.toUpperCase().replace(/\s+/g, "_"),
              startAt: account.startDate || null,
              endAt: account.endDate || null,
            },
          });
          resolvedClassId = newClass.id;
        }
      } else if (account.startDate || account.endDate) {
        // If no class specified but dates are present, find or create default enrollment class
        let defaultClass = await prisma.classSection.findFirst({
          where: { name: "Lớp Tổng Hợp" },
        });
        if (!defaultClass) {
          defaultClass = await prisma.classSection.create({
            data: {
              name: "Lớp Tổng Hợp",
              code: "GENERAL_CLASS",
              startAt: account.startDate || null,
              endAt: account.endDate || null,
            },
          });
        }
        resolvedClassId = defaultClass.id;
      }

      if (resolvedClassId) {
        await prisma.enrollment.upsert({
          where: {
            userId_classSectionId: {
              userId: targetUserId,
              classSectionId: resolvedClassId,
            },
          },
          create: {
            userId: targetUserId,
            classSectionId: resolvedClassId,
            status: "ACTIVE",
          },
          update: {
            status: "ACTIVE",
          },
        });

        // Update class dates if provided
        if (account.startDate || account.endDate) {
          await prisma.classSection.update({
            where: { id: resolvedClassId },
            data: {
              ...(account.startDate ? { startAt: account.startDate } : {}),
              ...(account.endDate ? { endAt: account.endDate } : {}),
            },
          });
        }
      }
    }
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

export async function batchDeleteAccounts(ids: string[]) {
  await requireAdmin();

  await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });

  revalidatePath("/management/accounts");
  revalidatePath("/management");
}
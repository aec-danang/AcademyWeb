"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function getStudentLifeEvents() {
  return prisma.studentLifeEvent.findMany({
    orderBy: { order: "asc" }
  });
}

export async function createStudentLifeEvent(title: string, imageUrl: string, order: number) {
  const user = await requireUser(["ADMIN"]);
  if (user.role !== "ADMIN") throw new Error("Unauthorized");

  return prisma.studentLifeEvent.create({
    data: { title, imageUrl, order }
  });
}

export async function deleteStudentLifeEvent(id: string) {
  const user = await requireUser(["ADMIN"]);
  if (user.role !== "ADMIN") throw new Error("Unauthorized");

  return prisma.studentLifeEvent.delete({
    where: { id }
  });
}

export async function updateStudentLifeEventOrder(items: { id: string, order: number }[]) {
  const user = await requireUser(["ADMIN"]);
  if (user.role !== "ADMIN") throw new Error("Unauthorized");

  // Using a transaction to update multiple
  const transactions = items.map(item => 
    prisma.studentLifeEvent.update({
      where: { id: item.id },
      data: { order: item.order }
    })
  );
  
  await prisma.$transaction(transactions);
  return { success: true };
}


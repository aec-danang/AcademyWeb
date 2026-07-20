"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateLeadStatus(id: string, status: string) {
  await prisma.lead.update({
    where: { id },
    data: { status: status as any },
  });
  revalidatePath("/management/submissions");
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({
    where: { id },
  });
  revalidatePath("/management/submissions");
}

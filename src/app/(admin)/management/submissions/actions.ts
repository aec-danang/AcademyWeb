"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSubmissionStatus(id: string, status: string) {
  await prisma.contactSubmission.update({
    where: { id },
    data: { status: status as any },
  });
  revalidatePath("/management/submissions");
}

export async function deleteSubmission(id: string) {
  await prisma.contactSubmission.delete({
    where: { id },
  });
  revalidatePath("/management/submissions");
}

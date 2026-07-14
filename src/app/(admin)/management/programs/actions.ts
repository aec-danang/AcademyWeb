"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPrograms() {
  return await prisma.siteProgram.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getProgram(id: string) {
  return await prisma.siteProgram.findUnique({
    where: { id },
  });
}

export async function createProgram(data: {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  iconType: string;
  iconValue: string;
  order: number;
  published: boolean;
}) {
  const result = await prisma.siteProgram.create({
    data,
  });
  revalidatePath("/");
  revalidatePath("/programs");
  revalidatePath("/management/programs");
  return result;
}

export async function updateProgram(
  id: string,
  data: {
    title: string;
    slug: string;
    description?: string;
    content?: string;
    iconType: string;
    iconValue: string;
    order: number;
    published: boolean;
  }
) {
  const result = await prisma.siteProgram.update({
    where: { id },
    data,
  });
  revalidatePath("/");
  revalidatePath("/programs");
  revalidatePath(`/programs/${data.slug}`);
  revalidatePath("/management/programs");
  return result;
}

export async function deleteProgram(id: string) {
  const result = await prisma.siteProgram.delete({
    where: { id },
  });
  revalidatePath("/");
  revalidatePath("/programs");
  revalidatePath("/management/programs");
  return result;
}

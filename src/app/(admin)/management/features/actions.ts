"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFeature(data: { title: string; description: string; iconValue: string; order: number; published: boolean }) {
  await prisma.siteFeature.create({
    data,
  });
  revalidatePath("/management/features");
  revalidatePath("/");
}

export async function updateFeature(id: string, data: { title: string; description: string; iconValue: string; order: number; published: boolean }) {
  await prisma.siteFeature.update({
    where: { id },
    data,
  });
  revalidatePath("/management/features");
  revalidatePath("/");
}

export async function deleteFeature(id: string) {
  await prisma.siteFeature.delete({
    where: { id },
  });
  revalidatePath("/management/features");
  revalidatePath("/");
}

export async function batchDeleteFeatures(ids: string[]) {
  await prisma.siteFeature.deleteMany({
    where: { id: { in: ids } }
  });
  revalidatePath("/management/features");
  revalidatePath("/");
}

export async function batchUpdateFeatures(ids: string[], data: { published?: boolean }) {
  await prisma.siteFeature.updateMany({
    where: { id: { in: ids } },
    data
  });
  revalidatePath("/management/features");
  revalidatePath("/");
}

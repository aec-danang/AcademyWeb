"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSponsor(data: { name: string; imageUrl: string; website: string | null; order: number; published: boolean }) {
  await prisma.sponsor.create({
    data,
  });
  revalidatePath("/management/sponsors");
  revalidatePath("/");
}

export async function updateSponsor(id: string, data: { name: string; imageUrl: string; website: string | null; order: number; published: boolean }) {
  await prisma.sponsor.update({
    where: { id },
    data,
  });
  revalidatePath("/management/sponsors");
  revalidatePath("/");
}

export async function deleteSponsor(id: string) {
  await prisma.sponsor.delete({
    where: { id },
  });
  revalidatePath("/management/sponsors");
  revalidatePath("/");
}

export async function togglePublishSponsor(id: string, published: boolean) {
  await prisma.sponsor.update({
    where: { id },
    data: { published },
  });
  revalidatePath("/management/sponsors");
  revalidatePath("/");
}

export async function reorderSponsors(updates: { id: string; order: number }[]) {
  await prisma.$transaction(
    updates.map((update) =>
      prisma.sponsor.update({
        where: { id: update.id },
        data: { order: update.order },
      })
    )
  );
  revalidatePath("/management/sponsors");
  revalidatePath("/");
}

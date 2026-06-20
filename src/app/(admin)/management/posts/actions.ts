"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(data: any) {
  await prisma.post.create({
    data,
  });
  revalidatePath("/management/posts");
}

export async function updatePost(slug: string, data: any) {
  await prisma.post.update({
    where: { slug },
    data,
  });
  revalidatePath("/management/posts");
}

export async function deletePost(slug: string) {
  await prisma.post.delete({
    where: { slug },
  });
  revalidatePath("/management/posts");
}

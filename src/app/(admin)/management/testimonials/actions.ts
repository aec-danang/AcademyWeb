"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createTestimonial(data: { 
  authorName: string; 
  authorRole: string | null; 
  content: string; 
  avatarUrl: string | null; 
  rating: number; 
  published: boolean; 
  order: number; 
  score: string | null; 
  isHallOfFame: boolean; 
  isFeatured: boolean; 
}) {
  await requireAdmin();
  await prisma.testimonial.create({ data });
  revalidatePath("/management/testimonials");
  revalidatePath("/");
}

export async function updateTestimonial(id: string, data: { 
  authorName: string; 
  authorRole: string | null; 
  content: string; 
  avatarUrl: string | null; 
  rating: number; 
  published: boolean; 
  order: number; 
  score: string | null; 
  isHallOfFame: boolean; 
  isFeatured: boolean; 
}) {
  await requireAdmin();
  await prisma.testimonial.update({ where: { id }, data });
  revalidatePath("/management/testimonials");
  revalidatePath("/");
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/management/testimonials");
  revalidatePath("/");
}

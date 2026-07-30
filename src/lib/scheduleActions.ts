"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { AdjustmentType } from "@prisma/client";

export async function submitScheduleAdjustment(
  classSectionId: string, 
  type: AdjustmentType,
  dateStr: string,
  reason: string,
  evidenceUrl?: string,
  targetDateStr?: string
) {
  try {
    const user = await requireUser(["TEACHER", "ADMIN"]);
    
    // Verify permission
    const classroom = await prisma.classSection.findUnique({
      where: { id: classSectionId }
    });
    
    if (!classroom) return { success: false, error: "Classroom not found" };
    if (user.role === "TEACHER" && classroom.teacherId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const date = new Date(dateStr);
    const targetDate = targetDateStr ? new Date(targetDateStr) : null;
    
    await prisma.classScheduleAdjustment.create({
      data: {
        classSectionId,
        userId: user.id,
        type,
        date,
        targetDate,
        reason,
        evidenceUrl,
      }
    });

    revalidatePath(`/elearning/calendar`);
    return { success: true };
  } catch (error) {
    console.error("Failed to submit schedule adjustment:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { AttendanceStatus } from "@prisma/client";

type AttendancePayload = {
  studentId: string;
  status: AttendanceStatus;
}[];

export async function saveDailyAttendanceAction(classroomId: string, dateStr: string, payload: AttendancePayload) {
  try {
    const user = await requireUser(["TEACHER", "ADMIN"]);
    
    // Verify permission
    const classroom = await prisma.classSection.findUnique({
      where: { id: classroomId }
    });
    
    if (!classroom) return { success: false, error: "Classroom not found" };
    if (user.role === "TEACHER" && classroom.teacherId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const date = new Date(dateStr);
    
    // Process each student's attendance for the day
    await prisma.$transaction(
      payload.map((record) => 
        prisma.attendance.upsert({
          where: {
            classSectionId_studentId_date: {
              classSectionId: classroomId,
              studentId: record.studentId,
              date: date
            }
          },
          update: {
            status: record.status,
          },
          create: {
            classSectionId: classroomId,
            studentId: record.studentId,
            date: date,
            status: record.status,
          }
        })
      )
    );

    revalidatePath(`/elearning/classrooms/${classroomId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to save attendance:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

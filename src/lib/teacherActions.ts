"use server";

import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateClassSectionAction(classId: string, formData: FormData) {
  const user = await requireUser(["TEACHER", "ADMIN"]);

  // Verify ownership
  const classSection = await prisma.classSection.findUnique({
    where: { id: classId },
    include: { course: true },
  });

  if (!classSection) {
    throw new Error("Class not found");
  }

  if (user.role === "TEACHER" && classSection.teacherId !== user.id) {
    throw new Error("Unauthorized to edit this class");
  }

  const name = formData.get("name") as string;
  const rawStatus = formData.get("status");
  const status = rawStatus === "ARCHIVED" ? "ARCHIVED" : "ACTIVE";
  const startAt = formData.get("startAt") ? new Date(formData.get("startAt") as string) : null;
  const endAt = formData.get("endAt") ? new Date(formData.get("endAt") as string) : null;

  const courseTitle = formData.get("courseTitle") as string;
  const courseDescription = formData.get("courseDescription") as string;
  const coursePublished = formData.get("coursePublished") === "on";

  await prisma.$transaction([
    prisma.classSection.update({
      where: { id: classId },
      data: {
        name,
        status,
        startAt,
        endAt,
      },
    }),
    prisma.course.update({
      where: { id: classSection.courseId },
      data: {
        title: courseTitle,
        description: courseDescription,
        published: coursePublished,
      },
    }),
  ]);

  revalidatePath(`/elearning/courses`);
  revalidatePath(`/elearning/courses/${classSection.courseId}`);
}

export async function deleteClassSectionAction(classId: string) {
  const user = await requireUser(["TEACHER", "ADMIN"]);

  const classSection = await prisma.classSection.findUnique({
    where: { id: classId },
    include: { _count: { select: { enrollments: true } } },
  });

  if (!classSection) throw new Error("Class not found");
  if (user.role === "TEACHER" && classSection.teacherId !== user.id) throw new Error("Unauthorized");
  
  if (classSection._count.enrollments > 0) {
    throw new Error("Cannot delete a class that has enrolled students.");
  }

  await prisma.classSection.delete({
    where: { id: classId },
  });

  revalidatePath("/elearning/courses");
  revalidatePath(`/elearning/courses/${classSection.courseId}`);
  redirect("/elearning/courses");
}

export async function createLessonAction(classId: string, formData: FormData) {
  const user = await requireUser(["TEACHER", "ADMIN"]);

  const classSection = await prisma.classSection.findUnique({
    where: { id: classId },
  });

  if (!classSection) throw new Error("Class not found");
  if (user.role === "TEACHER" && classSection.teacherId !== user.id) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const published = formData.get("published") === "on";

  await prisma.lesson.create({
    data: {
      title,
      content,
      videoUrl,
      published,
      courseId: classSection.courseId,
    },
  });

  revalidatePath(`/elearning/courses/${classSection.courseId}`);
}

export async function deleteLessonAction(classId: string, lessonId: string) {
  const user = await requireUser(["TEACHER", "ADMIN"]);

  const classSection = await prisma.classSection.findUnique({
    where: { id: classId },
  });

  if (!classSection) throw new Error("Class not found");
  if (user.role === "TEACHER" && classSection.teacherId !== user.id) throw new Error("Unauthorized");

  await prisma.lesson.delete({
    where: { id: lessonId },
  });

  revalidatePath(`/elearning/courses/${classSection.courseId}`);
}

export async function createClassSectionAction(formData: FormData) {
  const user = await requireUser(["TEACHER", "ADMIN"]);

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const rawStatus = formData.get("status");
  const status = rawStatus === "ARCHIVED" ? "ARCHIVED" : "ACTIVE";
  const startAt = formData.get("startAt") ? new Date(formData.get("startAt") as string) : null;
  const endAt = formData.get("endAt") ? new Date(formData.get("endAt") as string) : null;

  const courseTitle = formData.get("courseTitle") as string;
  const courseDescription = formData.get("courseDescription") as string;
  const coursePublished = formData.get("coursePublished") === "on";

  // Create a new Course and ClassSection in a transaction
  const newCourse = await prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: {
        title: courseTitle,
        description: courseDescription,
        published: coursePublished,
      }
    });

    await tx.classSection.create({
      data: {
        name,
        code,
        status,
        startAt,
        endAt,
        teacherId: user.id,
        courseId: course.id,
      }
    });

    return course;
  });

  revalidatePath("/elearning/courses");
  redirect(`/elearning/courses/${newCourse.id}`);
}

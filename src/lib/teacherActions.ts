"use server";

import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClassSectionAction(formData: FormData) {
  const user = await requireUser(["TEACHER", "ADMIN"]);

  const name = formData.get("name") as string;
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const rawStatus = formData.get("status");
  const status = rawStatus === "ARCHIVED" ? "ARCHIVED" : "ACTIVE";
  const startAt = formData.get("startAt") ? new Date(formData.get("startAt") as string) : null;
  const endAt = formData.get("endAt") ? new Date(formData.get("endAt") as string) : null;

  const classroom = await prisma.classSection.create({
    data: { name, code, status, startAt, endAt, teacherId: user.id },
  });

  revalidatePath("/elearning/classrooms");
  revalidatePath("/elearning");
  redirect(`/elearning/classrooms/${classroom.id}?tab=students&created=1`);
}

export type CreateClassroomState = {
  ok: boolean;
  message: string;
};

export async function createClassroomWithStateAction(
  _state: CreateClassroomState,
  formData: FormData,
): Promise<CreateClassroomState> {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  const name = String(formData.get("name") || "").trim();
  const requestedCode = String(formData.get("code") || "").trim().toUpperCase();
  const startAt = String(formData.get("startAt") || "");
  const endAt = String(formData.get("endAt") || "");
  const replaceClassroomId = String(formData.get("replaceClassroomId") || "").trim();

  if (!name) {
    return { ok: false, message: "Class name is required." };
  }
  if (requestedCode && !/^[A-Z0-9-]{3,24}$/.test(requestedCode)) {
    return { ok: false, message: "Class code must be 3-24 characters using letters, numbers or hyphens." };
  }
  if (startAt && endAt && new Date(endAt) < new Date(startAt)) {
    return { ok: false, message: "End date must be after the start date." };
  }

  let code = requestedCode || `AEC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  while (await prisma.classSection.findUnique({ where: { code }, select: { id: true } })) {
    if (requestedCode) return { ok: false, message: "This class code is already in use. Please choose another code." };
    code = `AEC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
  formData.set("code", code);

  let replacement: { id: string } | null = null;
  if (replaceClassroomId) {
    const replacementCandidate = await prisma.classSection.findFirst({
      where: { id: replaceClassroomId, status: "ACTIVE", ...(user.role === "TEACHER" ? { teacherId: user.id } : {}) },
      select: {
        id: true,
        enrollments: { where: { status: "ACTIVE" }, select: { id: true } },
        assignments: { select: { id: true } },
        quizDeliveries: { select: { id: true } },
      },
    });
    const replacementCompleted = replacementCandidate
      ? 1 + Number(replacementCandidate.enrollments.length > 0) + Number(replacementCandidate.assignments.length > 0) + Number(replacementCandidate.quizDeliveries.length > 0)
      : 4;
    if (!replacementCandidate || replacementCompleted >= 4) return { ok: false, message: "The unfinished classroom no longer exists or cannot be replaced." };
    replacement = { id: replacementCandidate.id };
  }

  const classroom = await prisma.$transaction(async (tx) => {
    const created = await tx.classSection.create({
      data: { name, code, status: "ACTIVE", startAt: startAt ? new Date(startAt) : null, endAt: endAt ? new Date(endAt) : null, teacherId: user.id },
    });
    if (replacement) await tx.classSection.delete({ where: { id: replacement.id } });
    return created;
  });

  revalidatePath("/elearning/classrooms");
  revalidatePath("/elearning/classrooms/new");
  revalidatePath("/elearning");
  redirect(`/elearning/classrooms/${classroom.id}?tab=students&created=1`);
}

export type CourseTemplateState = { ok: boolean; message: string };

export async function createCourseTemplateWithStateAction(
  _state: CourseTemplateState,
  formData: FormData,
): Promise<CourseTemplateState> {
  await requireUser(["ADMIN"]);
  const title = String(formData.get("title") || "").trim();
  if (!title) return { ok: false, message: "Course title is required." };

  const course = await prisma.course.create({
    data: {
      title,
      description: String(formData.get("description") || "").trim() || null,
      program: String(formData.get("program") || "").trim() || null,
      curriculum: String(formData.get("curriculum") || "").trim() || null,
      published: formData.get("published") === "on",
    },
  });
  revalidatePath("/elearning/courses");
  revalidatePath("/elearning/classrooms/new");
  redirect(`/elearning/courses/${course.id}?created=1`);
}

export async function updateCourseTemplateAction(courseId: string, formData: FormData) {
  await requireUser(["ADMIN"]);
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  await prisma.course.update({
    where: { id: courseId },
    data: {
      title,
      description: String(formData.get("description") || "").trim() || null,
      program: String(formData.get("program") || "").trim() || null,
      curriculum: String(formData.get("curriculum") || "").trim() || null,
      published: formData.get("published") === "on",
    },
  });
  revalidatePath("/elearning/courses");
  revalidatePath(`/elearning/courses/${courseId}`);
}

async function requireClassroomManager(classroomId: string) {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  const classroom = await prisma.classSection.findUnique({
    where: { id: classroomId },
    select: { id: true, teacherId: true },
  });

  if (!classroom || (user.role === "TEACHER" && classroom.teacherId !== user.id)) {
    throw new Error("You do not have permission to manage this classroom.");
  }

  return { user, classroom };
}

export async function updateClassroomNameAction(formData: FormData) {
  const classroomId = String(formData.get("classroomId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  if (!classroomId || name.length < 2 || name.length > 100) return;
  await requireClassroomManager(classroomId);

  await prisma.classSection.update({ where: { id: classroomId }, data: { name } });
  revalidatePath("/elearning");
  revalidatePath("/elearning/classrooms");
  revalidatePath(`/elearning/classrooms/${classroomId}`);
  redirect(`/elearning/classrooms/${classroomId}?tab=settings&renamed=1`);
}

export async function addClassMeetingAction(formData: FormData) {
  const classroomId = String(formData.get("classroomId") || "").trim();
  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = String(formData.get("startTime") || "").trim();
  const endTime = String(formData.get("endTime") || "").trim();
  const location = String(formData.get("location") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;
  if (!classroomId || !Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6 || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime) || endTime <= startTime) return;
  await requireClassroomManager(classroomId);
  await prisma.classMeeting.create({ data: { classSectionId: classroomId, dayOfWeek, startTime, endTime, location, note } });
  revalidatePath(`/elearning/classrooms/${classroomId}`);
}

export async function deleteClassMeetingAction(formData: FormData) {
  const classroomId = String(formData.get("classroomId") || "").trim();
  const meetingId = String(formData.get("meetingId") || "").trim();
  if (!classroomId || !meetingId) return;
  await requireClassroomManager(classroomId);
  await prisma.classMeeting.deleteMany({ where: { id: meetingId, classSectionId: classroomId } });
  revalidatePath(`/elearning/classrooms/${classroomId}`);
}

export async function removeStudentFromClassAction(formData: FormData) {
  const enrollmentId = String(formData.get("enrollmentId") || "").trim();
  const classroomId = String(formData.get("classroomId") || "").trim();
  if (!enrollmentId || !classroomId) return;

  const { user } = await requireClassroomManager(classroomId);
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    select: { classSectionId: true },
  });
  if (!enrollment || enrollment.classSectionId !== classroomId) return;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status: "REMOVED", decidedAt: new Date(), decidedById: user.id },
  });

  await prisma.activityLog.create({
    data: { actorId: user.id, action: "REMOVE_STUDENT_FROM_CLASS", entityType: "Enrollment", entityId: enrollmentId },
  });

  revalidatePath("/elearning");
  revalidatePath("/elearning/classrooms");
  revalidatePath(`/elearning/classrooms/${classroomId}`);
  revalidatePath("/elearning/assignments");
  revalidatePath("/elearning/practice");
  revalidatePath("/management");
  revalidatePath("/management/classrooms");
  revalidatePath(`/management/classrooms/${classroomId}`);
}

export async function archiveClassroomAction(formData: FormData) {
  const classroomId = String(formData.get("classroomId") || "").trim();
  if (!classroomId) return;
  await requireClassroomManager(classroomId);

  await prisma.classSection.update({
    where: { id: classroomId },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/elearning");
  revalidatePath("/elearning/classrooms");
  revalidatePath(`/elearning/classrooms/${classroomId}`);
  redirect("/elearning/classrooms?archived=1");
}

export async function restoreClassroomAction(formData: FormData) {
  const classroomId = String(formData.get("classroomId") || "").trim();
  if (!classroomId) return;
  await requireClassroomManager(classroomId);

  await prisma.classSection.update({
    where: { id: classroomId },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/elearning");
  revalidatePath("/elearning/classrooms");
  revalidatePath(`/elearning/classrooms/${classroomId}`);
  redirect(`/elearning/classrooms/${classroomId}?tab=settings&restored=1`);
}

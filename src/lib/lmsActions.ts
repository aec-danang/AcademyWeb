"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireTeacherOrAdmin, requireUser } from "@/lib/session";
import { gradeWriting, writingGraderConfiguration } from "@/lib/writingGrading";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value || null;
}

function textListValue(formData: FormData, key: string) {
  return textValue(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalDate(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error("Please enter a valid date and time.");
  // Browser date fields accept short years such as `26`, which JavaScript
  // interprets as year 0026. Treat the common 2-digit input as 20xx.
  if (parsed.getFullYear() >= 0 && parsed.getFullYear() < 100) parsed.setFullYear(parsed.getFullYear() + 2000);
  if (parsed.getFullYear() < 2000 || parsed.getFullYear() > 2100) throw new Error("The year must be between 2000 and 2100.");
  return parsed;
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(textValue(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

function optionalNumber(formData: FormData, key: string) {
  const rawValue = textValue(formData, key);
  if (!rawValue) return null;

  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
}

function parseOptionRows(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^([A-Z])[\).:\-\s]+(.+)$/i);
      return {
        label: (match?.[1] || String.fromCharCode(65 + index)).toUpperCase(),
        text: (match?.[2] || line).trim(),
        order: index + 1,
      };
    });
}

function normalizeAnswerValue(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'");
}

function answerKeyAlternatives(answerKey: string) {
  return answerKey
    .split(/\s*(?:\||;|\n)\s*/)
    .map(normalizeAnswerValue)
    .filter(Boolean);
}

function isTextAnswerCorrect(rawAnswer: string, answerKey: string | null) {
  if (!answerKey) return null;
  const normalizedAnswer = normalizeAnswerValue(rawAnswer);
  if (!normalizedAnswer) return false;
  return answerKeyAlternatives(answerKey).includes(normalizedAnswer);
}

async function logActivity(actorId: string | undefined, action: string, entityType: string, entityId?: string) {
  await prisma.activityLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
    },
  });
}

export async function createUserAction(formData: FormData) {
  const actor = await requireAdmin();
  const email = textValue(formData, "email").toLowerCase();
  const password = textValue(formData, "password") || "123456";

  if (!email) return;

  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: optionalText(formData, "name"),
      email,
      phone: optionalText(formData, "phone"),
      role: textValue(formData, "role") as "ADMIN" | "TEACHER" | "STUDENT",
      password: await bcrypt.hash(password, 10),
    },
  });

  await logActivity(actor.id, "CREATE_USER", "User", user.id);
  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
}

export async function toggleUserActiveAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = textValue(formData, "id");
  const user = await prisma.user.findUnique({ where: { id }, select: { isActive: true } });
  if (!user) return;

  await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  await logActivity(actor.id, "TOGGLE_USER_ACTIVE", "User", id);
  revalidatePath("/admin/users");
}

export async function assignUserToClassAction(formData: FormData) {
  const actor = await requireAdmin();
  const userId = textValue(formData, "userId");
  const classSectionId = textValue(formData, "classSectionId");
  if (!userId || !classSectionId) return;

  await prisma.enrollment.upsert({
    where: { userId_classSectionId: { userId, classSectionId } },
    update: {
      status: "ACTIVE",
      decidedAt: new Date(),
      decidedById: actor.id,
    },
    create: {
      userId,
      classSectionId,
      status: "ACTIVE",
      decidedAt: new Date(),
      decidedById: actor.id,
    },
  });

  await logActivity(actor.id, "ASSIGN_USER_TO_CLASS", "Enrollment", `${userId}:${classSectionId}`);
  revalidatePath("/admin/users");
  revalidatePath("/admin/classes");
}

export async function createCourseAction(formData: FormData) {
  const actor = await requireAdmin();
  const title = textValue(formData, "title");
  if (!title) return;

  const course = await prisma.course.create({
    data: {
      title,
      description: optionalText(formData, "description"),
      price: numberValue(formData, "price"),
      published: formData.get("published") === "on",
    },
  });

  await logActivity(actor.id, "CREATE_COURSE", "Course", course.id);
  revalidatePath("/admin/courses");
  revalidatePath("/elearning/courses");
}

export async function deleteCourseAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = textValue(formData, "id");
  if (!id) return;

  await prisma.course.delete({ where: { id } });
  await logActivity(actor.id, "DELETE_COURSE", "Course", id);
  revalidatePath("/admin/courses");
  revalidatePath("/elearning/courses");
}

export async function createClassAction(formData: FormData) {
  const actor = await requireAdmin();
  const name = textValue(formData, "name");
  if (!name) return;

  const classSection = await prisma.classSection.create({
    data: {
      name,
      code: textValue(formData, "code") || `CLS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      teacherId: optionalText(formData, "teacherId"),
      startAt: optionalDate(formData, "startAt"),
      endAt: optionalDate(formData, "endAt"),
    },
  });

  await logActivity(actor.id, "CREATE_CLASS", "ClassSection", classSection.id);
  revalidatePath("/admin/classes");
  revalidatePath("/elearning/classrooms");
}

export async function deleteClassAction(formData: FormData) {
  const actor = await requireAdmin();
  const id = textValue(formData, "id");
  if (!id) return;

  await prisma.classSection.delete({ where: { id } });
  await logActivity(actor.id, "DELETE_CLASS", "ClassSection", id);
  revalidatePath("/admin/classes");
  revalidatePath("/elearning/classrooms");
}

export async function requestEnrollmentAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const classCode = textValue(formData, "classCode").toUpperCase();
  if (!classCode) redirect("/elearning/classrooms?join=missing-code");

  const classSection = await prisma.classSection.findUnique({ where: { code: classCode } });
  if (!classSection || classSection.status !== "ACTIVE") {
    redirect("/elearning/classrooms?join=not-found");
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      userId_classSectionId: {
        userId: actor.id,
        classSectionId: classSection.id,
      },
    },
  });
  if (existing?.status === "ACTIVE") {
    redirect("/elearning/classrooms?join=already-active");
  }
  if (existing?.status === "REQUESTED") {
    redirect("/elearning/classrooms?join=already-requested");
  }

  await prisma.enrollment.upsert({
    where: {
      userId_classSectionId: {
        userId: actor.id,
        classSectionId: classSection.id,
      },
    },
    update: {
      status: "REQUESTED",
      requestedAt: new Date(),
      decidedAt: null,
      decidedById: null,
    },
    create: {
      userId: actor.id,
      classSectionId: classSection.id,
      status: "REQUESTED",
    },
  });

  await logActivity(actor.id, "REQUEST_ENROLLMENT", "ClassSection", classSection.id);
  revalidatePath("/elearning/classrooms");
  revalidatePath("/admin/enrollments");
  redirect("/elearning/classrooms?join=requested");
}

export async function decideEnrollmentAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const id = textValue(formData, "id");
  const decision = textValue(formData, "decision");
  if (!id) return;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: { classSection: { select: { teacherId: true } } },
  });
  if (!enrollment) return;
  if (actor.role === "TEACHER" && enrollment.classSection.teacherId !== actor.id) {
    throw new Error("You do not have permission to manage this enrollment.");
  }

  const status = decision === "reject" ? "REJECTED" : "ACTIVE";
  await prisma.enrollment.update({
    where: { id },
    data: {
      status,
      decidedAt: new Date(),
      decidedById: actor.id,
    },
  });

  await logActivity(actor.id, `${status}_ENROLLMENT`, "Enrollment", id);
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin/classes");
  revalidatePath("/elearning/classrooms");
  revalidatePath(`/elearning/classrooms/${enrollment.classSectionId}`);
  revalidatePath("/management");
  revalidatePath("/management/classrooms");
  revalidatePath(`/management/classrooms/${enrollment.classSectionId}`);
}

export type AddExistingStudentState = {
  ok: boolean;
  message: string;
};

export async function addExistingStudentAction(
  _state: AddExistingStudentState,
  formData: FormData,
): Promise<AddExistingStudentState> {
  const actor = await requireTeacherOrAdmin();
  const classSectionId = textValue(formData, "classSectionId");
  const email = textValue(formData, "email").toLowerCase();
  if (!classSectionId || !email) return { ok: false, message: "Enter the student's account email." };

  const [classroom, student] = await Promise.all([
    prisma.classSection.findUnique({ where: { id: classSectionId }, select: { id: true, teacherId: true, status: true } }),
    prisma.user.findUnique({ where: { email }, select: { id: true, name: true, role: true, isActive: true } }),
  ]);

  if (!classroom || classroom.status !== "ACTIVE") return { ok: false, message: "This classroom is not active." };
  if (actor.role === "TEACHER" && classroom.teacherId !== actor.id) {
    return { ok: false, message: "You do not have permission to manage this classroom." };
  }
  if (!student || student.role !== "STUDENT") {
    return { ok: false, message: "No student account was found with this email. Ask the learner to use their registered email." };
  }
  if (!student.isActive) return { ok: false, message: "This student account is inactive. An administrator must reactivate it first." };

  const existing = await prisma.enrollment.findUnique({
    where: { userId_classSectionId: { userId: student.id, classSectionId } },
    select: { status: true },
  });
  if (existing?.status === "ACTIVE") {
    return { ok: true, message: `${student.name || email} is already in this classroom.` };
  }

  await prisma.enrollment.upsert({
    where: { userId_classSectionId: { userId: student.id, classSectionId } },
    update: { status: "ACTIVE", requestedAt: new Date(), decidedAt: new Date(), decidedById: actor.id },
    create: { userId: student.id, classSectionId, status: "ACTIVE", decidedAt: new Date(), decidedById: actor.id },
  });
  await logActivity(actor.id, existing?.status === "REQUESTED" ? "APPROVE_ENROLLMENT_BY_EMAIL" : "ADD_EXISTING_STUDENT", "ClassSection", classSectionId);
  revalidatePath("/elearning");
  revalidatePath("/elearning/classrooms");
  revalidatePath(`/elearning/classrooms/${classSectionId}`);
  revalidatePath("/management");
  revalidatePath("/management/classrooms");
  revalidatePath(`/management/classrooms/${classSectionId}`);
  return {
    ok: true,
    message: existing?.status === "REQUESTED"
      ? `${student.name || email}'s pending request was approved.`
      : `${student.name || email} was added to the classroom.`,
  };
}

export async function cancelEnrollmentRequestAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const enrollmentId = textValue(formData, "enrollmentId");
  const enrollment = await prisma.enrollment.findFirst({
    where: { id: enrollmentId, userId: actor.id, status: "REQUESTED" },
    select: { id: true, classSectionId: true },
  });
  if (!enrollment) redirect("/elearning/classrooms");

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { status: "CANCELLED", decidedAt: new Date(), decidedById: actor.id },
  });
  await logActivity(actor.id, "CANCEL_ENROLLMENT_REQUEST", "Enrollment", enrollment.id);
  revalidatePath("/elearning/classrooms");
  revalidatePath(`/elearning/classrooms/${enrollment.classSectionId}`);
  revalidatePath("/management");
  revalidatePath("/management/classrooms");
  redirect("/elearning/classrooms?join=cancelled");
}

export async function leaveClassroomAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const enrollmentId = textValue(formData, "enrollmentId");
  const enrollment = await prisma.enrollment.findFirst({
    where: { id: enrollmentId, userId: actor.id, status: "ACTIVE" },
    select: { id: true, classSectionId: true },
  });
  if (!enrollment) redirect("/elearning/classrooms");

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { status: "LEFT", decidedAt: new Date(), decidedById: actor.id },
  });
  await logActivity(actor.id, "LEAVE_CLASSROOM", "Enrollment", enrollment.id);
  revalidatePath("/elearning");
  revalidatePath("/elearning/classrooms");
  revalidatePath("/elearning/assignments");
  revalidatePath("/elearning/practice");
  revalidatePath("/elearning/scores");
  revalidatePath("/management");
  revalidatePath("/management/classrooms");
  redirect("/elearning/classrooms?join=left");
}

export async function createAssignmentAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const title = textValue(formData, "title");
  const classSectionId = textValue(formData, "classSectionId");
  if (!title || !classSectionId) return;
  const classSection = await prisma.classSection.findUnique({ where: { id: classSectionId }, select: { teacherId: true } });
  if (!classSection) return;
  if (actor.role === "TEACHER" && classSection.teacherId !== actor.id) {
    throw new Error("You do not have permission to create assignments for this classroom.");
  }
  const status = textValue(formData, "status") as "DRAFT" | "PUBLISHED" | "ARCHIVED";
  const difficulty = textValue(formData, "difficulty") as "EASY" | "MEDIUM" | "HARD";
  const skill = textValue(formData, "skill") as "LISTENING" | "READING" | "WRITING" | "SPEAKING" | "GRAMMAR" | "VOCABULARY" | "PRONUNCIATION" | "MIXED";

  const assignment = await prisma.assignment.create({
    data: {
      title,
      classSectionId,
      description: optionalText(formData, "description"),
      type: textValue(formData, "type") as "HOMEWORK" | "WRITING" | "SPEAKING" | "FILE_UPLOAD",
      status: ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status) ? status : "PUBLISHED",
      difficulty: ["EASY", "MEDIUM", "HARD"].includes(difficulty) ? difficulty : "MEDIUM",
      skill: ["LISTENING", "READING", "WRITING", "SPEAKING", "GRAMMAR", "VOCABULARY", "PRONUNCIATION", "MIXED"].includes(skill) ? skill : "MIXED",
      cefrLevel: optionalText(formData, "cefrLevel"),
      maxScore: Math.max(1, numberValue(formData, "maxScore", 100)),
      rubric: optionalText(formData, "rubric"),
      allowLateSubmission: formData.get("allowLateSubmission") === "on",
      allowResubmission: formData.get("allowResubmission") === "on",
      category: optionalText(formData, "category"),
      tags: textListValue(formData, "tags"),
      instructions: optionalText(formData, "instructions"),
      attachmentUrl: optionalText(formData, "attachmentUrl"),
      attachmentName: optionalText(formData, "attachmentName"),
      dueAt: optionalDate(formData, "dueAt"),
      createdById: actor.id,
    },
  });

  await logActivity(actor.id, "CREATE_ASSIGNMENT", "Assignment", assignment.id);
  revalidatePath("/admin/assignments");
  revalidatePath("/elearning/assignments");
  revalidatePath(`/elearning/classrooms/${classSectionId}`);
  revalidatePath("/elearning");
  return assignment;
}

export async function createAssignmentWithStateAction(
  _state: { ok: boolean; message: string },
  formData: FormData,
) {
  const title = textValue(formData, "title");
  const classSectionId = textValue(formData, "classSectionId");
  if (!title || !classSectionId) {
    return { ok: false, message: "Please enter a title and choose a class." };
  }

  try {
    const assignment = await createAssignmentAction(formData);
    if (!assignment) return { ok: false, message: "Could not create the assignment." };
    const status = textValue(formData, "status") || "PUBLISHED";
    return {
      ok: true,
      message: status === "DRAFT" ? "Assignment saved as draft." : "Assignment published successfully.",
      redirectTo: `/elearning/assignments?created=${assignment.id}`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not create the assignment. Please try again.",
      redirectTo: "",
    };
  }
}

export async function updateAssignmentWithStateAction(
  _state: { ok: boolean; message: string; redirectTo?: string },
  formData: FormData,
) {
  const actor = await requireTeacherOrAdmin();
  const id = textValue(formData, "assignmentId");
  const title = textValue(formData, "title");
  const classSectionId = textValue(formData, "classSectionId");
  if (!id || !title || !classSectionId) return { ok: false, message: "Please enter a title and choose a class.", redirectTo: "" };
  const existing = await prisma.assignment.findFirst({ where: { id, ...(actor.role === "TEACHER" ? { classSection: { teacherId: actor.id } } : {}) }, select: { id: true, classSectionId: true } });
  if (!existing) return { ok: false, message: "Assignment not found or you cannot edit it.", redirectTo: "" };
  const destination = await prisma.classSection.findFirst({ where: { id: classSectionId, ...(actor.role === "TEACHER" ? { teacherId: actor.id } : {}) }, select: { id: true } });
  if (!destination) return { ok: false, message: "You cannot move this assignment to that classroom.", redirectTo: "" };
  try {
    const status = textValue(formData, "status") as "DRAFT" | "PUBLISHED" | "ARCHIVED";
    const difficulty = textValue(formData, "difficulty") as "EASY" | "MEDIUM" | "HARD";
    const skill = textValue(formData, "skill") as "LISTENING" | "READING" | "WRITING" | "SPEAKING" | "GRAMMAR" | "VOCABULARY" | "PRONUNCIATION" | "MIXED";
    await prisma.assignment.update({ where: { id }, data: {
      title,
      classSectionId,
      description: optionalText(formData, "description"),
      type: textValue(formData, "type") as "HOMEWORK" | "WRITING" | "SPEAKING" | "FILE_UPLOAD",
      status: ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status) ? status : "DRAFT",
      difficulty: ["EASY", "MEDIUM", "HARD"].includes(difficulty) ? difficulty : "MEDIUM",
      skill: ["LISTENING", "READING", "WRITING", "SPEAKING", "GRAMMAR", "VOCABULARY", "PRONUNCIATION", "MIXED"].includes(skill) ? skill : "MIXED",
      cefrLevel: optionalText(formData, "cefrLevel"),
      maxScore: Math.max(1, numberValue(formData, "maxScore", 100)),
      rubric: optionalText(formData, "rubric"),
      allowLateSubmission: formData.get("allowLateSubmission") === "on",
      allowResubmission: formData.get("allowResubmission") === "on",
      category: optionalText(formData, "category"),
      tags: textListValue(formData, "tags"),
      instructions: optionalText(formData, "instructions"),
      attachmentUrl: optionalText(formData, "attachmentUrl"),
      attachmentName: optionalText(formData, "attachmentName"),
      dueAt: optionalDate(formData, "dueAt"),
    } });
    await logActivity(actor.id, "UPDATE_ASSIGNMENT", "Assignment", id);
    revalidatePath("/elearning/assignments");
    revalidatePath(`/elearning/classrooms/${existing.classSectionId}`);
    revalidatePath(`/elearning/classrooms/${classSectionId}`);
    revalidatePath("/elearning");
    return { ok: true, message: "Assignment updated.", redirectTo: `/elearning/assignments?updated=${id}` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not update the assignment.", redirectTo: "" };
  }
}

export async function toggleAssignmentStatusAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const id = textValue(formData, "id");
  const status = textValue(formData, "status");
  if (!id || !["DRAFT", "PUBLISHED"].includes(status)) return;
  const assignment = await prisma.assignment.findFirst({ where: { id, ...(actor.role === "TEACHER" ? { classSection: { teacherId: actor.id } } : {}) }, select: { id: true, classSectionId: true } });
  if (!assignment) return;
  await prisma.assignment.update({ where: { id }, data: { status: status as "DRAFT" | "PUBLISHED" } });
  await logActivity(actor.id, "UPDATE_ASSIGNMENT_STATUS", "Assignment", id);
  revalidatePath("/elearning/assignments");
  revalidatePath(`/elearning/classrooms/${assignment.classSectionId}`);
  revalidatePath("/elearning");
}

export async function deleteAssignmentAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const id = textValue(formData, "id");
  if (!id) return;
  const assignment = await prisma.assignment.findFirst({ where: { id, ...(actor.role === "TEACHER" ? { classSection: { teacherId: actor.id } } : {}) }, select: { id: true, classSectionId: true } });
  if (!assignment) return;
  await prisma.assignment.delete({ where: { id } });
  await logActivity(actor.id, "DELETE_ASSIGNMENT", "Assignment", id);
  revalidatePath("/admin/assignments");
  revalidatePath("/elearning/assignments");
  revalidatePath(`/elearning/classrooms/${assignment.classSectionId}`);
  revalidatePath("/elearning");
}

export async function submitAssignmentAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const assignmentId = textValue(formData, "assignmentId");
  if (!assignmentId) throw new Error("Assignment is missing.");

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { classSection: { include: { enrollments: true } } },
  });
  const isEnrolled = assignment?.classSection.enrollments.some(
    (item) => item.userId === actor.id && item.status === "ACTIVE",
  );
  if (!assignment || assignment.status !== "PUBLISHED" || assignment.classSection.status !== "ACTIVE") throw new Error("This assignment is no longer available.");
  if (!isEnrolled) throw new Error("You are not enrolled in this classroom.");
  if (assignment.dueAt && assignment.dueAt < new Date() && !assignment.allowLateSubmission) {
    throw new Error("The deadline has passed and late submissions are disabled.");
  }
  const existingSubmission = await prisma.submission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId: actor.id } },
    select: { id: true, status: true },
  });
  if (existingSubmission && !assignment.allowResubmission && existingSubmission.status !== "REVISION_REQUESTED") {
    throw new Error("Your teacher has disabled resubmission for this assignment.");
  }

  const content = optionalText(formData, "content");
  const submission = await prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId: actor.id,
      },
    },
    update: {
      content,
      fileUrl: optionalText(formData, "fileUrl"),
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      studentId: actor.id,
      content,
      fileUrl: optionalText(formData, "fileUrl"),
      status: "SUBMITTED",
    },
  });

  const isWriting = assignment.type === "WRITING" || assignment.skill === "WRITING";
  let aiQueued = false;
  if (isWriting) {
    const grader = writingGraderConfiguration();
    const wordCount = content?.trim().split(/\s+/).filter(Boolean).length || 0;
    const canAutoGrade = grader.configured && wordCount >= 20;
    const aiError = wordCount < 20
      ? "A written response of at least 20 words is required for AI grading."
      : grader.configured
        ? null
        : "The writing grader is not configured.";

    await prisma.grade.upsert({
      where: { submissionId: submission.id },
      update: {
        score: null,
        feedback: null,
        status: "DRAFT",
        publishedAt: null,
        gradedById: null,
        aiStatus: canAutoGrade ? "PENDING" : "FAILED",
        aiScore: null,
        aiFeedback: null,
        aiRubric: Prisma.DbNull,
        aiConfidence: null,
        aiModel: null,
        aiError,
        aiReviewedAt: null,
      },
      create: {
        submissionId: submission.id,
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        score: null,
        status: "DRAFT",
        aiStatus: canAutoGrade ? "PENDING" : "FAILED",
        aiError,
      },
    });

    if (canAutoGrade) {
      aiQueued = true;
      after(async () => {
        await autoGradeWritingSubmission(submission.id, actor.id);
      });
    }
  }

  await logActivity(actor.id, "SUBMIT_ASSIGNMENT", "Assignment", assignmentId);
  revalidatePath("/elearning/assignments");
  revalidatePath(`/elearning/classrooms/${assignment.classSectionId}`);
  revalidatePath("/elearning");
  revalidatePath("/admin/assignments");
  revalidatePath("/admin/grades");
  return { aiQueued, isWriting };
}

export type SubmitAssignmentState = {
  ok: boolean;
  message: string;
  assignmentId: string;
};

export async function submitAssignmentWithStateAction(
  _state: SubmitAssignmentState,
  formData: FormData,
): Promise<SubmitAssignmentState> {
  const assignmentId = textValue(formData, "assignmentId");

  try {
    const result = await submitAssignmentAction(formData);
    return {
      ok: true,
      assignmentId,
      message: result?.aiQueued
        ? "Your work was submitted. AI feedback is being prepared for teacher review."
        : result?.isWriting
          ? "Your work was submitted. Your teacher will review it; AI grading is not configured yet."
          : "Your work was submitted successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      assignmentId,
      message: error instanceof Error ? error.message : "Your work could not be submitted. Please try again.",
    };
  }
}

export async function createQuestionAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const text = textValue(formData, "text");
  if (!text) return;

  const optionRows = parseOptionRows(textValue(formData, "options"));
  const correctIndex = numberValue(formData, "correctIndex", 1) - 1;

  const question = await prisma.question.create({
    data: {
      text,
      type: textValue(formData, "type") as "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "GRID" | "FILL_BLANK" | "ESSAY" | "LISTENING" | "READING",
      categoryId: optionalText(formData, "categoryId"),
      answerKey: optionalText(formData, "answerKey"),
      explanation: optionalText(formData, "explanation"),
      points: numberValue(formData, "points", 1),
      createdById: actor.id,
      options: {
        create: optionRows.map((option, index) => ({
          label: option.label,
          text: option.text,
          order: option.order,
          isCorrect: index === correctIndex,
        })),
      },
    },
  });

  await logActivity(actor.id, "CREATE_QUESTION", "Question", question.id);
  revalidatePath("/admin/question-bank");
}

export async function deleteQuestionAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const id = textValue(formData, "id");
  if (!id) return;

  await prisma.question.delete({ where: { id } });
  await logActivity(actor.id, "DELETE_QUESTION", "Question", id);
  revalidatePath("/admin/question-bank");
}

export async function createQuizAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const title = textValue(formData, "title");
  const classSectionId = textValue(formData, "classSectionId");
  const questionIds = formData.getAll("questionIds").map(String);
  if (!title || !classSectionId) return;

  const quiz = await prisma.quiz.create({
    data: {
      title,
      classSectionId,
      description: optionalText(formData, "description"),
      programId: optionalText(formData, "programId"),
      unit: optionalText(formData, "unit"),
      isOpenQuiz: formData.get("isOpenQuiz") === "on",
      published: formData.get("published") !== "off",
      timeLimit: optionalNumber(formData, "timeLimit"),
      openAt: optionalDate(formData, "openAt"),
      closeAt: optionalDate(formData, "closeAt"),
      attemptLimit: numberValue(formData, "attemptLimit", 1),
      shuffleQuestions: formData.get("shuffleQuestions") === "on",
      createdById: actor.id,
      questions: {
        create: questionIds.map((questionId, index) => ({
          questionId,
          order: index + 1,
        })),
      },
    },
  });

  await logActivity(actor.id, "CREATE_QUIZ", "Quiz", quiz.id);
  revalidatePath("/admin/quizzes");
  revalidatePath("/elearning/exercises");
}

async function canManageQuiz(quizId: string, actor: { id: string; role: string }) {
  return prisma.quiz.findFirst({
    where: {
      id: quizId,
      isPracticeTest: false,
      ...(actor.role === "TEACHER" ? { OR: [{ createdById: actor.id }, { classSection: { teacherId: actor.id } }, { deliveries: { some: { classSection: { teacherId: actor.id } } } }] } : {}),
    },
    select: { id: true },
  });
}

export async function addQuizQuestionAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const quizId = textValue(formData, "quizId");
  const text = textValue(formData, "text");
  const type = textValue(formData, "type") as "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "GRID" | "FILL_BLANK" | "ESSAY" | "LISTENING" | "READING";

  if (!quizId || !text || !type) return;

  const quiz = await canManageQuiz(quizId, actor);
  if (!quiz) return;

  const order = optionalNumber(formData, "order");
  const maxOrder = await prisma.quizQuestion.aggregate({
    where: { quizId },
    _max: { order: true },
  });
  const sectionTitle = textValue(formData, "section");
  let sectionId: string | null = null;

  if (sectionTitle) {
    const existingSection = await prisma.testSection.findFirst({
      where: { quizId, title: sectionTitle },
      select: { id: true },
    });

    if (existingSection) {
      sectionId = existingSection.id;
    } else {
      const createdSection = await prisma.testSection.create({
        data: {
          quizId,
          title: sectionTitle,
          skill: "GRAMMAR",
          order: (await prisma.testSection.count({ where: { quizId } })) + 1,
        },
        select: { id: true },
      });
      sectionId = createdSection.id;
    }
  }

  const optionRows = parseOptionRows(textValue(formData, "options"));
  const correctLabel = textValue(formData, "correctLabel").toUpperCase();
  const question = await prisma.question.create({
    data: {
      text,
      section: sectionTitle || null,
      sourceOrder: order,
      sourceType: type.toLowerCase(),
      type,
      answerKey: optionalText(formData, "answerKey"),
      explanation: optionalText(formData, "explanation"),
      points: numberValue(formData, "points", 1),
      createdById: actor.id,
      options: optionRows.length > 0
        ? {
            create: optionRows.map((option) => ({
              label: option.label,
              text: option.text,
              order: option.order,
              isCorrect: Boolean(correctLabel && option.label === correctLabel),
            })),
          }
        : undefined,
    },
  });

  await prisma.quizQuestion.create({
    data: {
      quizId,
      sectionId,
      questionId: question.id,
      points: numberValue(formData, "points", 1),
      order: order || (maxOrder._max.order || 0) + 1,
    },
  });

  await logActivity(actor.id, "ADD_QUIZ_QUESTION", "Question", question.id);
  revalidatePath("/admin/quizzes");
  revalidatePath(`/elearning/exercises/${quizId}`);
  revalidatePath("/elearning/exercises");
}

export async function updateQuestionAnswerAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const quizId = textValue(formData, "quizId");
  const questionId = textValue(formData, "questionId");
  if (!quizId || !questionId) return;

  const quiz = await canManageQuiz(quizId, actor);
  if (!quiz) return;

  const correctOptionId = optionalText(formData, "correctOptionId");

  await prisma.question.update({
    where: { id: questionId },
    data: {
      answerKey: optionalText(formData, "answerKey"),
      explanation: optionalText(formData, "explanation"),
    },
  });

  await prisma.questionOption.updateMany({
    where: { questionId },
    data: { isCorrect: false },
  });

  if (correctOptionId) {
    await prisma.questionOption.updateMany({
      where: { id: correctOptionId, questionId },
      data: { isCorrect: true },
    });
  }

  await logActivity(actor.id, "UPDATE_QUESTION_ANSWER", "Question", questionId);
  revalidatePath("/admin/quizzes");
  revalidatePath(`/elearning/exercises/${quizId}`);
}

export async function deleteQuizAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const id = textValue(formData, "id");
  if (!id) return;

  await prisma.quiz.delete({ where: { id } });
  await logActivity(actor.id, "DELETE_QUIZ", "Quiz", id);
  revalidatePath("/admin/quizzes");
  revalidatePath("/elearning/exercises");
}

type ExamTypeValue = "TOEIC" | "IELTS" | "GENERAL";
type ExamSkillValue = "LISTENING" | "READING" | "WRITING" | "SPEAKING" | "GRAMMAR" | "MIXED";
type PracticeQuestionType = "MULTIPLE_CHOICE" | "FILL_BLANK" | "ESSAY" | "LISTENING" | "READING";

const examTypes = new Set(["TOEIC", "IELTS", "GENERAL"]);
const examSkills = new Set(["LISTENING", "READING", "WRITING", "SPEAKING", "GRAMMAR", "MIXED"]);
const questionTypes = new Set(["MULTIPLE_CHOICE", "FILL_BLANK", "ESSAY", "LISTENING", "READING"]);

function examTypeValue(value: string, fallback: ExamTypeValue = "GENERAL") {
  const normalized = value.toUpperCase();
  return (examTypes.has(normalized) ? normalized : fallback) as ExamTypeValue;
}

function examSkillValue(value: string, fallback: ExamSkillValue = "GRAMMAR") {
  const normalized = value.toUpperCase();
  return (examSkills.has(normalized) ? normalized : fallback) as ExamSkillValue;
}

function practiceQuestionTypeValue(value: string, fallback: PracticeQuestionType = "MULTIPLE_CHOICE") {
  const normalized = value.toUpperCase();
  return (questionTypes.has(normalized) ? normalized : fallback) as PracticeQuestionType;
}

async function canManageClassSection(classSectionId: string, actor: { id: string; role: string }) {
  return prisma.classSection.findFirst({
    where: {
      id: classSectionId,
      ...(actor.role === "TEACHER" ? { teacherId: actor.id } : {}),
    },
    select: { id: true },
  });
}

async function canManagePracticeTest(quizId: string, actor: { id: string; role: string }) {
  return prisma.quiz.findFirst({
    where: {
      id: quizId,
      isPracticeTest: true,
      ...(actor.role === "TEACHER" ? { OR: [{ createdById: actor.id }, { classSection: { teacherId: actor.id } }, { deliveries: { some: { classSection: { teacherId: actor.id } } } }] } : {}),
    },
    select: { id: true, classSectionId: true },
  });
}

function parseOptionLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[A-D][).:\-\s]+/i, "").trim());
}

export async function createPracticeTestAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const title = textValue(formData, "title");
  const classSectionId = textValue(formData, "classSectionId");
  if (!title) return;
  if (classSectionId && !await canManageClassSection(classSectionId, actor)) return;

  const test = await prisma.quiz.create({
    data: {
      title,
      classSectionId: classSectionId || null,
      description: optionalText(formData, "description"),
      isPracticeTest: true,
      examType: examTypeValue(textValue(formData, "examType")),
      skill: examSkillValue(textValue(formData, "skill"), "MIXED"),
      timeLimit: optionalNumber(formData, "timeLimitMinutes"),
      instructions: optionalText(formData, "instructions"),
      audioUrl: optionalText(formData, "audioUrl"),
      passage: optionalText(formData, "passage"),
      openAt: optionalDate(formData, "openAt"),
      closeAt: optionalDate(formData, "closeAt"),
      attemptLimit: numberValue(formData, "attemptLimit", 1),
      published: formData.get("published") !== "off",
      createdById: actor.id,
    },
  });

  await logActivity(actor.id, "CREATE_PRACTICE_TEST", "Quiz", test.id);
  revalidatePath("/admin/tests");
  revalidatePath("/elearning/practice");
}

export async function createPracticeSectionAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const quizId = textValue(formData, "quizId");
  const title = textValue(formData, "title");
  if (!quizId || !title) return;

  const test = await canManagePracticeTest(quizId, actor);
  if (!test) return;

  const section = await prisma.testSection.create({
    data: {
      quizId,
      title,
      skill: examSkillValue(textValue(formData, "skill"), "READING"),
      instructions: optionalText(formData, "instructions"),
      audioUrl: optionalText(formData, "audioUrl"),
      passage: optionalText(formData, "passage"),
      order: numberValue(formData, "order"),
    },
  });

  await logActivity(actor.id, "CREATE_TEST_SECTION", "TestSection", section.id);
  revalidatePath("/admin/tests");
  revalidatePath(`/elearning/exercises/${quizId}`);
}

export async function createPracticeQuestionAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const quizId = textValue(formData, "quizId");
  const text = textValue(formData, "text");
  if (!quizId || !text) return;

  const test = await canManagePracticeTest(quizId, actor);
  if (!test) return;

  const sectionId = optionalText(formData, "sectionId");
  if (sectionId) {
    const section = await prisma.testSection.findFirst({ where: { id: sectionId, quizId }, select: { id: true } });
    if (!section) return;
  }

  const optionLines = parseOptionLines(textValue(formData, "options"));
  const correctIndex = numberValue(formData, "correctIndex", 1) - 1;
  const question = await prisma.question.create({
    data: {
      text,
      type: practiceQuestionTypeValue(textValue(formData, "type")),
      audioUrl: optionalText(formData, "audioUrl"),
      passage: optionalText(formData, "passage"),
      answerKey: optionalText(formData, "answerKey"),
      explanation: optionalText(formData, "explanation"),
      points: numberValue(formData, "points", 1),
      createdById: actor.id,
      options: {
        create: optionLines.map((option, index) => ({
          text: option,
          order: index + 1,
          isCorrect: index === correctIndex,
        })),
      },
    },
  });

  await prisma.quizQuestion.create({
    data: {
      quizId,
      sectionId,
      questionId: question.id,
      points: numberValue(formData, "points", 1),
      order: numberValue(formData, "order", 0),
    },
  });

  await logActivity(actor.id, "CREATE_TEST_QUESTION", "Question", question.id);
  revalidatePath("/admin/tests");
  revalidatePath(`/elearning/exercises/${quizId}`);
}

export async function deletePracticeTestAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const id = textValue(formData, "id");
  if (!id) return;

  const test = await canManagePracticeTest(id, actor);
  if (!test) return;

  await prisma.quiz.delete({ where: { id } });
  await logActivity(actor.id, "DELETE_PRACTICE_TEST", "Quiz", id);
  revalidatePath("/admin/tests");
  revalidatePath("/elearning/practice");
}

type ImportedOption = string | { text?: string; isCorrect?: boolean };
type ImportedQuestion = {
  type?: string;
  text?: string;
  points?: number;
  options?: ImportedOption[];
  correctIndex?: number;
  answerKey?: string;
  explanation?: string;
  audioUrl?: string;
  passage?: string;
  order?: number;
};
type ImportedSection = {
  title?: string;
  skill?: string;
  instructions?: string;
  audioUrl?: string;
  passage?: string;
  order?: number;
  questions?: ImportedQuestion[];
};
type ImportedPracticeTest = {
  title?: string;
  description?: string;
  classSectionId?: string;
  examType?: string;
  skill?: string;
  timeLimitMinutes?: number;
  attemptLimit?: number;
  openAt?: string;
  closeAt?: string;
  published?: boolean;
  shuffleQuestions?: boolean;
  instructions?: string;
  audioUrl?: string;
  passage?: string;
  sections?: ImportedSection[];
  questions?: ImportedQuestion[];
};

function importedOptions(question: ImportedQuestion) {
  return (question.options || [])
    .map((option, index) => {
      if (typeof option === "string") {
        return {
          text: option.replace(/^[A-D][).:\-\s]+/i, "").trim(),
          order: index + 1,
          isCorrect: question.correctIndex ? index === question.correctIndex - 1 : false,
        };
      }

      return {
        text: (option.text || "").trim(),
        order: index + 1,
        isCorrect: Boolean(option.isCorrect) || Boolean(question.correctIndex && index === question.correctIndex - 1),
      };
    })
    .filter((option) => option.text);
}

async function createImportedPracticeQuestion(
  actorId: string,
  quizId: string,
  sectionId: string | null,
  question: ImportedQuestion,
  fallbackOrder: number,
) {
  const text = (question.text || "").trim();
  if (!text) return;

  const points = Number.isFinite(question.points) ? Number(question.points) : 1;
  const createdQuestion = await prisma.question.create({
    data: {
      text,
      type: practiceQuestionTypeValue(question.type || ""),
      audioUrl: question.audioUrl?.trim() || null,
      passage: question.passage?.trim() || null,
      answerKey: question.answerKey?.trim() || null,
      explanation: question.explanation?.trim() || null,
      points,
      createdById: actorId,
      options: { create: importedOptions(question) },
    },
  });

  await prisma.quizQuestion.create({
    data: {
      quizId,
      sectionId,
      questionId: createdQuestion.id,
      points,
      order: Number.isFinite(question.order) ? Number(question.order) : fallbackOrder,
    },
  });
}

export async function importPracticeTestJsonAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const rawJson = textValue(formData, "json");
  if (!rawJson) return { ok: false, message: "JSON content is required." };

  let payload: ImportedPracticeTest;
  try {
    payload = JSON.parse(rawJson) as ImportedPracticeTest;
  } catch {
    return { ok: false, message: "The JSON content is invalid." };
  }

  const classSectionId = textValue(formData, "classSectionId") || payload.classSectionId || "";
  const title = (payload.title || "").trim();
  if (!title) return { ok: false, message: "A test title is required." };
  if (classSectionId && !await canManageClassSection(classSectionId, actor)) return { ok: false, message: "You cannot manage that classroom." };

  const test = await prisma.quiz.create({
    data: {
      title,
      description: payload.description?.trim() || null,
      classSectionId: classSectionId || null,
      isPracticeTest: true,
      examType: examTypeValue(payload.examType || ""),
      skill: examSkillValue(payload.skill || "", "MIXED"),
      timeLimit: Number.isFinite(payload.timeLimitMinutes) ? Number(payload.timeLimitMinutes) : null,
      attemptLimit: Number.isFinite(payload.attemptLimit) ? Number(payload.attemptLimit) : 1,
      openAt: payload.openAt ? new Date(payload.openAt) : null,
      closeAt: payload.closeAt ? new Date(payload.closeAt) : null,
      instructions: payload.instructions?.trim() || null,
      audioUrl: payload.audioUrl?.trim() || null,
      passage: payload.passage?.trim() || null,
      published: payload.published ?? true,
      shuffleQuestions: Boolean(payload.shuffleQuestions),
      createdById: actor.id,
    },
  });

  let order = 1;
  for (const sectionPayload of payload.sections || []) {
    const section = await prisma.testSection.create({
      data: {
        quizId: test.id,
        title: sectionPayload.title?.trim() || `Section ${order}`,
        skill: examSkillValue(sectionPayload.skill || "", "READING"),
        instructions: sectionPayload.instructions?.trim() || null,
        audioUrl: sectionPayload.audioUrl?.trim() || null,
        passage: sectionPayload.passage?.trim() || null,
        order: Number.isFinite(sectionPayload.order) ? Number(sectionPayload.order) : order,
      },
    });

    let questionOrder = 1;
    for (const question of sectionPayload.questions || []) {
      await createImportedPracticeQuestion(actor.id, test.id, section.id, question, questionOrder);
      questionOrder += 1;
    }
    order += 1;
  }

  let looseQuestionOrder = order * 100;
  for (const question of payload.questions || []) {
    await createImportedPracticeQuestion(actor.id, test.id, null, question, looseQuestionOrder);
    looseQuestionOrder += 1;
  }

  await prisma.testVersion.create({
    data: {
      quizId: test.id,
      createdById: actor.id,
      version: 1,
      changeNote: "Initial test created",
      snapshot: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue,
    },
  });

  await logActivity(actor.id, "IMPORT_PRACTICE_TEST_JSON", "Quiz", test.id);
  revalidatePath("/admin/tests");
  revalidatePath("/elearning/practice");
  return { ok: true, message: "Test imported successfully.", testId: test.id };
}

export async function startPracticeTestAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const quizId = textValue(formData, "quizId");
  if (!quizId) return;

  const now = new Date();
  const test = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      isPracticeTest: true,
      published: true,
      classSection: {
        enrollments: {
          some: {
            userId: actor.id,
            status: "ACTIVE",
          },
        },
      },
    },
    include: {
      attempts: {
        where: { studentId: actor.id },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!test) return;
  if ((test.openAt && test.openAt > now) || (test.closeAt && test.closeAt < now)) return;

  const inProgressAttempt = test.attempts.find((attempt) => attempt.status === "IN_PROGRESS");
  if (inProgressAttempt) {
    redirect(`/elearning/exercises/${quizId}?attempt=${inProgressAttempt.id}`);
  }

  if (test.attempts.length >= test.attemptLimit) return;

  const attempt = await prisma.attempt.create({
    data: {
      quizId,
      studentId: actor.id,
      status: "IN_PROGRESS",
    },
  });

  await logActivity(actor.id, "START_PRACTICE_TEST", "Attempt", attempt.id);
  revalidatePath(`/elearning/exercises/${quizId}`);
  redirect(`/elearning/exercises/${quizId}?attempt=${attempt.id}`);
}

export async function savePracticeAnswerAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const attemptId = textValue(formData, "attemptId");
  const questionId = textValue(formData, "questionId");
  if (!attemptId || !questionId) return;

  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      studentId: actor.id,
      status: "IN_PROGRESS",
      quiz: {
        isPracticeTest: true,
        questions: { some: { questionId } },
      },
    },
  });
  if (!attempt) return;

  const optionId = optionalText(formData, `question_${questionId}`) || optionalText(formData, "optionId");
  const answerText = optionalText(formData, `answer_${questionId}`) || optionalText(formData, "answerText");

  await prisma.attemptAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    update: { optionId, answerText },
    create: { attemptId, questionId, optionId, answerText },
  });

  await logActivity(actor.id, "SAVE_PRACTICE_ANSWER", "AttemptAnswer", `${attemptId}:${questionId}`);
  revalidatePath(`/elearning/exercises/${attempt.quizId}`);
}

async function upsertAttemptGrade(data: {
  studentId: string;
  quizId: string;
  attemptId: string;
  score: number;
  feedback: string;
  gradedById?: string | null;
}) {
  const existingGrade = await prisma.grade.findFirst({ where: { attemptId: data.attemptId } });
  if (existingGrade) {
    await prisma.grade.update({
      where: { id: existingGrade.id },
      data: {
        score: data.score,
        feedback: data.feedback,
        gradedById: data.gradedById || null,
        status: data.gradedById ? "PUBLISHED" : existingGrade.status,
        publishedAt: data.gradedById ? new Date() : existingGrade.publishedAt,
      },
    });
    return;
  }

  await prisma.grade.create({
    data: {
      studentId: data.studentId,
      quizId: data.quizId,
      attemptId: data.attemptId,
      score: data.score,
      feedback: data.feedback,
      gradedById: data.gradedById || null,
      status: data.gradedById ? "PUBLISHED" : "DRAFT",
      publishedAt: data.gradedById ? new Date() : null,
    },
  });
}

export async function submitPracticeTestAttemptAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const attemptId = textValue(formData, "attemptId");
  if (!attemptId) return;

  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      studentId: actor.id,
      status: "IN_PROGRESS",
      quiz: { isPracticeTest: true },
    },
    include: {
      answers: true,
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { question: { include: { options: { orderBy: { order: "asc" } } } } },
          },
        },
      },
    },
  });
  if (!attempt) return;

  let score = 0;
  let requiresManualGrade = false;
  const autoSubmitted = textValue(formData, "autoSubmit") === "true";

  for (const link of attempt.quiz.questions) {
    const question = link.question;
    const existingAnswer = attempt.answers.find((answer) => answer.questionId === question.id);
    const selectedOptionId = optionalText(formData, `question_${question.id}`) || existingAnswer?.optionId || null;
    const typedAnswer = optionalText(formData, `answer_${question.id}`) || existingAnswer?.answerText || null;
    let optionId: string | null = null;
    let answerText: string | null = typedAnswer;
    let isCorrect: boolean | null = null;
    let pointsAwarded: number | null = null;

    if (question.options.length > 0) {
      optionId = selectedOptionId;
      answerText = null;
      const selectedOption = question.options.find((option) => option.id === optionId);
      isCorrect = Boolean(selectedOption?.isCorrect);
      pointsAwarded = isCorrect ? link.points : 0;
    } else if (question.type === "FILL_BLANK" || question.type === "SHORT_ANSWER" || question.type === "GRID") {
      const textCorrect = isTextAnswerCorrect(typedAnswer || "", question.answerKey);
      if (textCorrect !== null) {
        isCorrect = textCorrect;
        pointsAwarded = isCorrect ? link.points : 0;
      } else {
        requiresManualGrade = true;
        pointsAwarded = 0;
      }
    } else if (["READING", "LISTENING", "SECTION", "INFO"].includes(question.type)) {
      isCorrect = null;
      pointsAwarded = 0;
    } else {
      requiresManualGrade = true;
      pointsAwarded = 0;
    }

    score += pointsAwarded || 0;

    await prisma.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId: attempt.id, questionId: question.id } },
      update: {
        optionId,
        answerText,
        isCorrect,
        pointsAwarded,
      },
      create: {
        attemptId: attempt.id,
        questionId: question.id,
        optionId,
        answerText,
        isCorrect,
        pointsAwarded,
      },
    });
  }

  await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      submittedAt: new Date(),
      score,
      status: requiresManualGrade ? (autoSubmitted ? "AUTO_SUBMITTED" : "SUBMITTED") : "GRADED",
    },
  });

  const hasGradableWriting = attempt.quiz.questions.some((link) => {
    if (!["ESSAY", "SHORT_ANSWER"].includes(link.question.type)) return false;
    const existingAnswer = attempt.answers.find((answer) => answer.questionId === link.question.id);
    const response = optionalText(formData, `answer_${link.question.id}`) || existingAnswer?.answerText || "";
    return response.split(/\s+/).filter(Boolean).length >= 20;
  });
  const existingGrade = await prisma.grade.findFirst({ where: { attemptId: attempt.id } });

  if (requiresManualGrade) {
    const grader = writingGraderConfiguration();
    const aiStatus = hasGradableWriting ? (grader.configured ? "PENDING" : "FAILED") : "NOT_REQUESTED";
    const gradeData = {
      score: null,
      feedback: null,
      status: "DRAFT" as const,
      publishedAt: null,
      gradedById: null,
      aiStatus: aiStatus as "PENDING" | "FAILED" | "NOT_REQUESTED",
      aiError: hasGradableWriting && !grader.configured ? "The writing grader is not configured." : null,
    };
    if (existingGrade) await prisma.grade.update({ where: { id: existingGrade.id }, data: gradeData });
    else await prisma.grade.create({ data: { ...gradeData, studentId: actor.id, quizId: attempt.quizId, attemptId: attempt.id } });

    if (hasGradableWriting && grader.configured) {
      after(async () => {
        await autoGradeWritingAttempt(attempt.id, actor.id);
      });
    }
  } else {
    const gradeData = {
      score,
      feedback: "Auto-graded practice test.",
      status: "PUBLISHED" as const,
      publishedAt: new Date(),
      gradedById: null,
      aiStatus: "NOT_REQUESTED" as const,
    };
    if (existingGrade) await prisma.grade.update({ where: { id: existingGrade.id }, data: gradeData });
    else await prisma.grade.create({ data: { ...gradeData, studentId: actor.id, quizId: attempt.quizId, attemptId: attempt.id } });
  }

  await logActivity(actor.id, autoSubmitted ? "AUTO_SUBMIT_PRACTICE_TEST" : "SUBMIT_PRACTICE_TEST", "Attempt", attempt.id);
  revalidatePath("/elearning/practice");
  revalidatePath(`/elearning/exercises/${attempt.quizId}`);
  revalidatePath("/elearning/scores");
  revalidatePath("/admin/tests");
  revalidatePath("/admin/grades");
  redirect("/elearning/practice?tab=quizzes");
}

export async function gradePracticeAttemptAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const attemptId = textValue(formData, "attemptId");
  const score = numberValue(formData, "score");
  if (!attemptId) return;

  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      ...(actor.role === "TEACHER" ? { OR: [{ quizDelivery: { classSection: { teacherId: actor.id } } }, { quiz: { classSection: { teacherId: actor.id } } }] } : {}),
    },
    include: { quiz: true },
  });
  if (!attempt) return;

  await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      score,
      status: "GRADED",
    },
  });

  await upsertAttemptGrade({
    studentId: attempt.studentId,
    quizId: attempt.quizId,
    attemptId: attempt.id,
    score,
    feedback: optionalText(formData, "feedback") || "Teacher graded practice test.",
    gradedById: actor.id,
  });

  await logActivity(actor.id, "GRADE_PRACTICE_ATTEMPT", "Attempt", attempt.id);
  revalidatePath("/admin/tests");
  revalidatePath("/admin/grades");
  revalidatePath("/elearning/scores");
}

export async function submitQuizAttemptAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const quizId = textValue(formData, "quizId");
  const quizDeliveryId = textValue(formData, "quizDeliveryId") || null;
  const reviewAttemptId = textValue(formData, "reviewAttemptId");
  if (!quizId) return;

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId },
    include: {
      classSection: { include: { enrollments: true } },
      deliveries: {
        where: quizDeliveryId ? { id: quizDeliveryId } : { id: "__none__" },
        include: { classSection: { include: { enrollments: true } } },
      },
      questions: {
        orderBy: { order: "asc" },
        include: {
          question: { include: { options: true } },
        },
      },
      attempts: {
        where: { studentId: actor.id, isReviewPractice: false },
      },
    },
  });

  if (!quiz) return;

  const isEnrolled = quiz.classSection?.status === "ACTIVE" && quiz.classSection.enrollments.some(
    (enrollment) => enrollment.userId === actor.id && enrollment.status === "ACTIVE",
  );

  const delivery = quiz.deliveries[0] || null;
  const deliveryEnrollment = delivery?.classSection.enrollments.some(
    (enrollment) => enrollment.userId === actor.id && enrollment.status === "ACTIVE",
  ) || false;
  const now = new Date();
  const deliveryAvailable = delivery
    && delivery.status === "PUBLISHED"
    && delivery.classSection.status === "ACTIVE"
    && (!delivery.openAt || delivery.openAt <= now)
    && (!delivery.dueAt || delivery.dueAt >= now)
    && deliveryEnrollment;
  const scopedAttempts = quiz.attempts.filter((attempt) => attempt.quizDeliveryId === quizDeliveryId);
  const limit = delivery?.attemptLimit || quiz.attemptLimit;
  const reviewAttempt = reviewAttemptId
    ? await prisma.attempt.findFirst({
        where: {
          id: reviewAttemptId,
          quizId,
          studentId: actor.id,
          isReviewPractice: true,
          status: "IN_PROGRESS",
        },
      })
    : null;

  if (!reviewAttempt && ((!deliveryAvailable && !quiz.isOpenQuiz && !isEnrolled) || scopedAttempts.length >= limit)) return;
  if (reviewAttemptId && !reviewAttempt) return;

  let score = 0;
  let requiresManualGrade = false;
  let autoGradableQuestions = 0;

  const attempt = reviewAttempt || await prisma.attempt.create({
      data: {
        quizId,
        quizDeliveryId,
        studentId: actor.id,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
  const questionLinks = reviewAttempt
    ? quiz.questions.filter((link) => reviewAttempt.reviewQuestionIds.includes(link.questionId))
    : quiz.questions;

  for (const link of questionLinks) {
    const question = link.question;
    const fieldName = `question_${question.id}`;
    const rawAnswer = textValue(formData, fieldName);
    let optionId: string | null = null;
    let answerText: string | null = rawAnswer || null;
    let isCorrect: boolean | null = null;
    let pointsAwarded: number | null = null;

    if (link.points <= 0 && !question.answerKey && question.options.length === 0) {
      isCorrect = null;
      pointsAwarded = 0;
      answerText = null;
    } else if (question.type === "MULTIPLE_CHOICE") {
      optionId = rawAnswer || null;
      answerText = null;
      const selectedOption = question.options.find((option) => option.id === optionId);
      const hasCorrectOption = question.options.some((option) => option.isCorrect);

      if (hasCorrectOption) {
        autoGradableQuestions += 1;
        isCorrect = Boolean(selectedOption?.isCorrect);
        pointsAwarded = isCorrect ? link.points : 0;
      } else {
        requiresManualGrade = true;
      }
    } else if (question.type === "FILL_BLANK" || question.type === "SHORT_ANSWER" || question.type === "GRID") {
      const textCorrect = isTextAnswerCorrect(rawAnswer, question.answerKey);
      if (textCorrect !== null) {
        autoGradableQuestions += 1;
        isCorrect = textCorrect;
        pointsAwarded = isCorrect ? link.points : 0;
      } else {
        requiresManualGrade = true;
      }
    } else if (["READING", "LISTENING", "SECTION", "INFO"].includes(question.type)) {
      isCorrect = null;
      pointsAwarded = 0;
    } else {
      requiresManualGrade = true;
    }

    score += pointsAwarded || 0;

    await prisma.attemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId: attempt.id, questionId: question.id } },
      update: { optionId, answerText, isCorrect, pointsAwarded },
      create: {
          attemptId: attempt.id,
          questionId: question.id,
          optionId,
          answerText,
          isCorrect,
          pointsAwarded,
      },
    });
  }

  await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      score: requiresManualGrade && autoGradableQuestions === 0 ? null : score,
      status: requiresManualGrade ? "SUBMITTED" : "GRADED",
      submittedAt: new Date(),
    },
  });

  const hasGradableWriting = questionLinks.some((link) => {
    if (!["ESSAY", "SHORT_ANSWER"].includes(link.question.type)) return false;
    const response = textValue(formData, `question_${link.question.id}`);
    return response.split(/\s+/).filter(Boolean).length >= 20;
  });

  if (!reviewAttempt && requiresManualGrade && hasGradableWriting) {
    const grader = writingGraderConfiguration();
    await prisma.grade.create({
      data: {
        studentId: actor.id,
        quizId,
        attemptId: attempt.id,
        score: null,
        status: "DRAFT",
        aiStatus: grader.configured ? "PENDING" : "FAILED",
        aiError: grader.configured ? null : "The writing grader is not configured.",
      },
    });
    if (grader.configured) {
      after(async () => {
        await autoGradeWritingAttempt(attempt.id, actor.id);
      });
    }
  }

  if (!reviewAttempt && !requiresManualGrade) {
    await prisma.grade.create({
      data: {
        studentId: actor.id,
        quizId,
        attemptId: attempt.id,
        score,
        feedback: "Auto-graded multiple choice/fill blank quiz.",
      },
    });
  }

  await logActivity(actor.id, reviewAttempt ? "SUBMIT_REVIEW_PRACTICE" : "SUBMIT_ATTEMPT", "Attempt", attempt.id);
  revalidatePath("/elearning/exercises");
  revalidatePath(`/elearning/exercises/${quizId}`);
  revalidatePath("/elearning/scores");
  revalidatePath("/admin/grades");
  redirect(`/elearning/exercises/${quizId}?attempt=${attempt.id}&submitted=1${reviewAttempt ? "&review=1" : ""}${quizDeliveryId ? `&delivery=${quizDeliveryId}` : ""}`);
}

export async function startQuizReviewAttemptAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const quizId = textValue(formData, "quizId");
  const scope = textValue(formData, "scope") === "full" ? "FULL" : "WRONG_ONLY";
  const quizDeliveryId = optionalText(formData, "quizDeliveryId");
  if (!quizId) return;

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, published: true },
    include: {
      classSection: { include: { enrollments: true } },
      deliveries: {
        where: quizDeliveryId ? { id: quizDeliveryId } : undefined,
        include: { classSection: { include: { enrollments: true } } },
      },
      questions: { orderBy: { order: "asc" }, select: { questionId: true } },
      attempts: {
        where: {
          studentId: actor.id,
          isReviewPractice: false,
          status: { not: "IN_PROGRESS" },
        },
        orderBy: { submittedAt: "desc" },
        include: { answers: { where: { isCorrect: false }, select: { questionId: true } } },
      },
    },
  });
  if (!quiz) return;

  const enrolled = quiz.classSection?.enrollments.some((item) => item.userId === actor.id && item.status === "ACTIVE") || false;
  const delivery = quiz.deliveries.find((item) => item.classSection.enrollments.some((enrollment) => enrollment.userId === actor.id && enrollment.status === "ACTIVE"));
  if (!quiz.isOpenQuiz && !enrolled && !delivery) return;

  const sourceAttempt = quiz.attempts[0] || null;
  const reviewQuestionIds = scope === "FULL"
    ? quiz.questions.map((item) => item.questionId)
    : Array.from(new Set(quiz.attempts.flatMap((attempt) => attempt.answers.map((answer) => answer.questionId))));
  if (reviewQuestionIds.length === 0) {
    redirect(`/elearning/exercises/${quizId}${quizDeliveryId ? `?delivery=${quizDeliveryId}` : ""}`);
  }

  const attempt = await prisma.attempt.create({
    data: {
      quizId,
      studentId: actor.id,
      quizDeliveryId,
      isReviewPractice: true,
      reviewScope: scope,
      sourceAttemptId: sourceAttempt?.id || null,
      reviewQuestionIds,
      status: "IN_PROGRESS",
    },
  });
  await logActivity(actor.id, "START_REVIEW_PRACTICE", "Attempt", attempt.id);
  redirect(`/elearning/exercises/${quizId}?attempt=${attempt.id}&review=1${quizDeliveryId ? `&delivery=${quizDeliveryId}` : ""}`);
}

export async function startAttemptAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const quizId = textValue(formData, "quizId");
  if (!quizId) return;

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, isPracticeTest: false },
    include: {
      classSection: { include: { enrollments: true } },
      attempts: { where: { studentId: actor.id } },
    },
  });
  if (!quiz) return;

  const isEnrolled = quiz.classSection?.enrollments.some(
    (enrollment) => enrollment.userId === actor.id && enrollment.status === "ACTIVE",
  ) ?? false;
  const officialAttempts = quiz.attempts.filter((attempt) => !attempt.isReviewPractice);
  if ((!quiz.isOpenQuiz && !isEnrolled) || officialAttempts.length >= quiz.attemptLimit) return;

  const attempt = await prisma.attempt.create({
    data: {
      quizId,
      studentId: actor.id,
      status: "IN_PROGRESS",
    },
  });

  await logActivity(actor.id, "START_ATTEMPT", "Attempt", attempt.id);
  revalidatePath(`/elearning/exercises/${quizId}`);
}

export async function saveAttemptAnswerAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const attemptId = textValue(formData, "attemptId");
  const questionId = textValue(formData, "questionId");
  if (!attemptId || !questionId) return;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { quiz: true },
  });
  if (!attempt || attempt.studentId !== actor.id || attempt.status !== "IN_PROGRESS" || attempt.quiz.isPracticeTest) return;

  const optionId = optionalText(formData, "optionId");
  const answerText = optionalText(formData, "answerText");

  await prisma.attemptAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId,
      },
    },
    update: { optionId, answerText },
    create: {
      attemptId,
      questionId,
      optionId,
      answerText,
    },
  });

  await logActivity(actor.id, "SAVE_ATTEMPT_ANSWER", "Attempt", attemptId);
  revalidatePath(`/elearning/exercises/${attempt.quizId}`);
}

export async function gradeSubmissionAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const submissionId = textValue(formData, "submissionId");
  const score = numberValue(formData, "score");
  const mode = textValue(formData, "mode") || "publish";
  if (!submissionId) return;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: { include: { classSection: { select: { teacherId: true } } } } },
  });
  if (!submission) return;
  if (actor.role === "TEACHER" && submission.assignment.classSection.teacherId !== actor.id) {
    throw new Error("You do not have permission to grade this submission.");
  }

  const normalizedScore = Math.min(submission.assignment.maxScore, Math.max(0, score));
  const gradeStatus = mode === "save_draft" ? "DRAFT" : mode === "request_revision" ? "REVISION_REQUESTED" : "PUBLISHED";
  const submissionStatus = mode === "request_revision" ? "REVISION_REQUESTED" : mode === "save_draft" ? "SUBMITTED" : "GRADED";

  await prisma.$transaction([
    prisma.grade.upsert({
      where: { submissionId },
      update: { score: normalizedScore, feedback: optionalText(formData, "feedback"), gradedById: actor.id, status: gradeStatus, publishedAt: gradeStatus === "PUBLISHED" ? new Date() : null },
      create: { submissionId, studentId: submission.studentId, assignmentId: submission.assignmentId, score: normalizedScore, feedback: optionalText(formData, "feedback"), gradedById: actor.id, status: gradeStatus, publishedAt: gradeStatus === "PUBLISHED" ? new Date() : null },
    }),
    prisma.submission.update({ where: { id: submissionId }, data: { status: submissionStatus } }),
  ]);

  await logActivity(actor.id, "GRADE_SUBMISSION", "Submission", submissionId);
  revalidatePath("/admin/grades");
  revalidatePath("/elearning/scores");
  revalidatePath(`/elearning/classrooms/${submission.assignment.classSectionId}`);
  revalidatePath("/elearning");
}

export async function gradeSubmissionWithStateAction(
  _state: { ok: boolean; message: string },
  formData: FormData,
) {
  const scoreText = textValue(formData, "score");
  const score = Number(scoreText);
  const maxScore = Math.max(1, numberValue(formData, "maxScore", 100));
  if (!scoreText || !Number.isFinite(score) || score < 0 || score > maxScore) {
    return { ok: false, message: `Enter a score between 0 and ${maxScore}.` };
  }
  try {
    await gradeSubmissionAction(formData);
    const mode = textValue(formData, "mode") || "publish";
    return { ok: true, message: mode === "save_draft" ? "Grading draft saved." : mode === "request_revision" ? "Revision requested from the student." : "Score and feedback published to the student." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not publish this score." };
  }
}

export async function assignQuizToClassAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const quizId = textValue(formData, "quizId");
  const classSectionId = textValue(formData, "classSectionId");
  if (!quizId || !classSectionId) return;

  const [classroom, quiz] = await Promise.all([
    canManageClassSection(classSectionId, actor),
    prisma.quiz.findUnique({ where: { id: quizId }, select: { id: true, published: true, attemptLimit: true } }),
  ]);
  if (!classroom || !quiz || !quiz.published) throw new Error("The selected test is not available to assign.");

  await prisma.quizDelivery.upsert({
    where: { quizId_classSectionId: { quizId, classSectionId } },
    update: {
      status: "PUBLISHED",
      openAt: optionalDate(formData, "openAt"),
      dueAt: optionalDate(formData, "dueAt"),
      showAnswersAt: optionalDate(formData, "showAnswersAt"),
      attemptLimit: Math.max(1, numberValue(formData, "attemptLimit", quiz.attemptLimit)),
      assignedById: actor.id,
    },
    create: {
      quizId,
      classSectionId,
      assignedById: actor.id,
      status: "PUBLISHED",
      openAt: optionalDate(formData, "openAt"),
      dueAt: optionalDate(formData, "dueAt"),
      showAnswersAt: optionalDate(formData, "showAnswersAt"),
      attemptLimit: Math.max(1, numberValue(formData, "attemptLimit", quiz.attemptLimit)),
    },
  });

  await logActivity(actor.id, "ASSIGN_QUIZ", "QuizDelivery", `${quizId}:${classSectionId}`);
  revalidatePath(`/elearning/classrooms/${classSectionId}`);
  revalidatePath("/elearning/practice");
  revalidatePath("/elearning");
}

function aiFeedbackText(result: Awaited<ReturnType<typeof gradeWriting>>) {
  const strengths = result.strengths.length ? `\n\nStrengths:\n- ${result.strengths.join("\n- ")}` : "";
  const improvements = result.improvements.length ? `\n\nNext steps:\n- ${result.improvements.join("\n- ")}` : "";
  return `${result.feedback}${strengths}${improvements}`.trim();
}

function safeAiError(error: unknown) {
  const message = error instanceof Error ? error.message : "AI grading could not be completed.";
  return message.replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 500);
}

async function autoGradeWritingSubmission(submissionId: string, actorId?: string) {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });
    if (!submission?.content?.trim()) throw new Error("AI grading requires a written response.");

    const result = await gradeWriting({
      title: submission.assignment.title,
      instructions: submission.assignment.instructions || submission.assignment.description,
      rubric: submission.assignment.rubric,
      cefrLevel: submission.assignment.cefrLevel,
      essay: submission.content,
      maxScore: submission.assignment.maxScore,
      studentId: submission.studentId,
    });

    await prisma.grade.upsert({
      where: { submissionId },
      update: {
        aiStatus: "COMPLETED",
        aiScore: result.score,
        aiFeedback: aiFeedbackText(result),
        aiRubric: result.rubric,
        aiConfidence: result.confidence,
        aiModel: result.model,
        aiError: null,
        aiReviewedAt: new Date(),
      },
      create: {
        submissionId,
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        score: null,
        status: "DRAFT",
        aiStatus: "COMPLETED",
        aiScore: result.score,
        aiFeedback: aiFeedbackText(result),
        aiRubric: result.rubric,
        aiConfidence: result.confidence,
        aiModel: result.model,
        aiReviewedAt: new Date(),
      },
    });
    await logActivity(actorId, "AI_AUTO_GRADE_DRAFT", "Submission", submissionId);
    revalidatePath("/elearning/assignments");
    revalidatePath("/elearning/scores");
    revalidatePath("/elearning");
    return { ok: true, message: "AI suggestion is ready. The teacher score remains separate." };
  } catch (error) {
    const message = safeAiError(error);
    await prisma.grade.updateMany({
      where: { submissionId },
      data: { aiStatus: "FAILED", aiError: message, aiReviewedAt: new Date() },
    });
    revalidatePath("/elearning/assignments");
    revalidatePath("/elearning/scores");
    return { ok: false, message };
  }
}

export async function aiGradeWritingSubmissionAction(
  _state: { ok: boolean; message: string },
  formData: FormData,
) {
  const actor = await requireTeacherOrAdmin();
  const submissionId = textValue(formData, "submissionId");
  if (!submissionId) return { ok: false, message: "Submission is missing." };

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { student: true, assignment: { include: { classSection: true } } },
  });
  if (!submission || (actor.role === "TEACHER" && submission.assignment.classSection.teacherId !== actor.id)) {
    return { ok: false, message: "You do not have permission to review this submission." };
  }
  if (!submission.content?.trim()) return { ok: false, message: "AI grading requires a written response." };

  const grader = writingGraderConfiguration();
  if (!grader.configured) {
    return { ok: false, message: "Configure OPENAI_API_KEY or the optional local writing grader. Manual grading remains available." };
  }
  await prisma.grade.upsert({
    where: { submissionId },
    update: { aiStatus: "PENDING", aiError: null },
    create: {
      submissionId,
      assignmentId: submission.assignmentId,
      studentId: submission.studentId,
      score: null,
      status: "DRAFT",
      aiStatus: "PENDING",
    },
  });
  return autoGradeWritingSubmission(submissionId, actor.id);
}

async function autoGradeWritingAttempt(attemptId: string, actorId?: string) {
  try {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      student: true,
      quizDelivery: { include: { classSection: true } },
      quiz: {
        include: {
          classSection: true,
          questions: { include: { question: true } },
        },
      },
      answers: { include: { question: true } },
    },
  });
  if (!attempt) throw new Error("Attempt is missing.");

  const writtenAnswers = attempt.answers.filter((answer) =>
    Boolean(answer.answerText?.trim()) && ["ESSAY", "SHORT_ANSWER"].includes(answer.question.type),
  );
  if (!writtenAnswers.length) throw new Error("AI grading requires at least one written response.");

  const pointByQuestion = new Map(attempt.quiz.questions.map((link) => [link.questionId, link.points]));
  const writingMaxScore = writtenAnswers.reduce((sum, answer) => sum + (pointByQuestion.get(answer.questionId) || 0), 0);
  if (writingMaxScore <= 0) throw new Error("Written questions need a positive point value before AI grading.");
  const autoScore = attempt.answers
    .filter((answer) => !writtenAnswers.some((written) => written.id === answer.id))
    .reduce((sum, answer) => sum + (answer.pointsAwarded || 0), 0);
  const totalMaxScore = attempt.quiz.questions.reduce((sum, link) => sum + link.points, 0);
    const responses = writtenAnswers.map((answer, index) =>
      `Question ${index + 1} (${pointByQuestion.get(answer.questionId) || 0} points): ${answer.question.text}\nStudent response: ${answer.answerText}`,
    ).join("\n\n");
    const result = await gradeWriting({
      title: attempt.quiz.title,
      instructions: attempt.quiz.instructions || attempt.quiz.description,
      rubric: "Assess each written answer against its question and point value. Use task achievement, coherence, vocabulary, and grammar.",
      essay: responses,
      maxScore: writingMaxScore,
      studentId: attempt.studentId,
    });
    const writingScore = Math.min(writingMaxScore, Math.max(0, result.score));
    const score = Math.min(totalMaxScore, autoScore + writingScore);
    const existingGrade = await prisma.grade.findFirst({ where: { attemptId } });
    const gradeData = {
      aiStatus: "COMPLETED" as const,
      aiScore: score,
      aiFeedback: aiFeedbackText(result),
      aiRubric: {
        autoGradedScore: autoScore,
        writingMaximum: writingMaxScore,
        criteria: result.rubric,
      },
      aiConfidence: result.confidence,
      aiModel: result.model,
      aiError: null,
      aiReviewedAt: new Date(),
    };
    if (existingGrade) await prisma.grade.update({ where: { id: existingGrade.id }, data: gradeData });
    else await prisma.grade.create({
      data: {
        ...gradeData,
        score: null,
        status: "DRAFT",
        attemptId,
        quizId: attempt.quizId,
        studentId: attempt.studentId,
      },
    });

    await logActivity(actorId, "AI_AUTO_GRADE_DRAFT", "Attempt", attemptId);
    revalidatePath(`/elearning/exercises/${attempt.quizId}`);
    revalidatePath("/elearning/scores");
    revalidatePath("/elearning");
    return { ok: true, message: "AI suggestion is ready. Review it before publishing the teacher score." };
  } catch (error) {
    const message = safeAiError(error);
    await prisma.grade.updateMany({
      where: { attemptId },
      data: { aiStatus: "FAILED", aiError: message, aiReviewedAt: new Date() },
    });
    revalidatePath("/elearning/scores");
    return { ok: false, message };
  }
}

export async function aiGradeWritingAttemptAction(
  _state: { ok: boolean; message: string },
  formData: FormData,
) {
  const actor = await requireTeacherOrAdmin();
  const attemptId = textValue(formData, "attemptId");
  if (!attemptId) return { ok: false, message: "Attempt is missing." };

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quizDelivery: { include: { classSection: true } },
      quiz: { include: { classSection: true } },
    },
  });
  const teacherOwnsAttempt = attempt && (
    attempt.quizDelivery?.classSection.teacherId === actor.id || attempt.quiz.classSection?.teacherId === actor.id
  );
  if (!attempt || (actor.role === "TEACHER" && !teacherOwnsAttempt)) {
    return { ok: false, message: "You do not have permission to review this attempt." };
  }

  const grader = writingGraderConfiguration();
  if (!grader.configured) {
    return { ok: false, message: "Configure OPENAI_API_KEY or the optional local writing grader. Manual grading remains available." };
  }

  const existingGrade = await prisma.grade.findFirst({ where: { attemptId } });
  if (existingGrade) {
    await prisma.grade.update({ where: { id: existingGrade.id }, data: { aiStatus: "PENDING", aiError: null } });
  } else {
    await prisma.grade.create({
      data: {
        attemptId,
        quizId: attempt.quizId,
        studentId: attempt.studentId,
        score: null,
        status: "DRAFT",
        aiStatus: "PENDING",
      },
    });
  }
  return autoGradeWritingAttempt(attemptId, actor.id);
}



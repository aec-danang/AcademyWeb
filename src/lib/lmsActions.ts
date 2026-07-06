"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireTeacherOrAdmin, requireUser } from "@/lib/session";

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
  return value ? new Date(value) : null;
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

function limitedText(formData: FormData, key: string, maxLength: number) {
  const value = textValue(formData, key);
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function optionalLimitedText(formData: FormData, key: string, maxLength: number) {
  const value = limitedText(formData, key, maxLength);
  return value || null;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
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
  const actor = await requireTeacherOrAdmin();
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
  const courseId = textValue(formData, "courseId");
  if (!name || !courseId) return;

  const classSection = await prisma.classSection.create({
    data: {
      name,
      code: textValue(formData, "code") || `CLS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      courseId,
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
  const classSectionId = textValue(formData, "classSectionId");
  const classSection = classCode
    ? await prisma.classSection.findUnique({ where: { code: classCode } })
    : await prisma.classSection.findUnique({ where: { id: classSectionId } });

  if (!classSection) return;

  await prisma.enrollment.upsert({
    where: {
      userId_classSectionId: {
        userId: actor.id,
        classSectionId: classSection.id,
      },
    },
    update: { status: "REQUESTED", requestedAt: new Date() },
    create: {
      userId: actor.id,
      classSectionId: classSection.id,
      status: "REQUESTED",
    },
  });

  await logActivity(actor.id, "REQUEST_ENROLLMENT", "ClassSection", classSection.id);
  revalidatePath("/elearning/classrooms");
  revalidatePath("/admin/enrollments");
}

export async function decideEnrollmentAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const id = textValue(formData, "id");
  const decision = textValue(formData, "decision");
  if (!id) return;

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
}

export async function createLessonAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const title = textValue(formData, "title");
  const courseId = textValue(formData, "courseId");
  if (!title || !courseId) return;

  const lesson = await prisma.lesson.create({
    data: {
      title,
      courseId,
      content: optionalText(formData, "content"),
      videoUrl: optionalText(formData, "videoUrl"),
      order: numberValue(formData, "order"),
      published: formData.get("published") !== "off",
    },
  });

  await logActivity(actor.id, "CREATE_LESSON", "Lesson", lesson.id);
  revalidatePath("/admin/lessons");
  revalidatePath("/elearning/courses");
}

export async function deleteLessonAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const id = textValue(formData, "id");
  if (!id) return;

  await prisma.lesson.delete({ where: { id } });
  await logActivity(actor.id, "DELETE_LESSON", "Lesson", id);
  revalidatePath("/admin/lessons");
  revalidatePath("/elearning/courses");
}

export async function createAssignmentAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const title = textValue(formData, "title");
  const classSectionId = textValue(formData, "classSectionId");
  if (!title || !classSectionId) return;
  const status = textValue(formData, "status") as "DRAFT" | "PUBLISHED" | "ARCHIVED";
  const difficulty = textValue(formData, "difficulty") as "EASY" | "MEDIUM" | "HARD";

  const assignment = await prisma.assignment.create({
    data: {
      title,
      classSectionId,
      description: optionalText(formData, "description"),
      type: textValue(formData, "type") as "HOMEWORK" | "WRITING" | "SPEAKING" | "FILE_UPLOAD",
      status: ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status) ? status : "PUBLISHED",
      difficulty: ["EASY", "MEDIUM", "HARD"].includes(difficulty) ? difficulty : "MEDIUM",
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

  await createAssignmentAction(formData);
  const status = textValue(formData, "status") || "PUBLISHED";
  return {
    ok: true,
    message: status === "DRAFT" ? "Assignment saved as draft." : "Assignment published successfully.",
  };
}

export async function deleteAssignmentAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const id = textValue(formData, "id");
  if (!id) return;

  await prisma.assignment.delete({ where: { id } });
  await logActivity(actor.id, "DELETE_ASSIGNMENT", "Assignment", id);
  revalidatePath("/admin/assignments");
  revalidatePath("/elearning/assignments");
}

export async function submitAssignmentAction(formData: FormData) {
  const actor = await requireUser(["STUDENT"]);
  const assignmentId = textValue(formData, "assignmentId");
  if (!assignmentId) return;

  await prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId: actor.id,
      },
    },
    update: {
      content: optionalText(formData, "content"),
      fileUrl: optionalText(formData, "fileUrl"),
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
    create: {
      assignmentId,
      studentId: actor.id,
      content: optionalText(formData, "content"),
      fileUrl: optionalText(formData, "fileUrl"),
      status: "SUBMITTED",
    },
  });

  await logActivity(actor.id, "SUBMIT_ASSIGNMENT", "Assignment", assignmentId);
  revalidatePath("/elearning/assignments");
  revalidatePath("/admin/assignments");
  revalidatePath("/admin/grades");
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
      ...(actor.role === "TEACHER" ? { classSection: { teacherId: actor.id } } : {}),
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
      ...(actor.role === "TEACHER" ? { classSection: { teacherId: actor.id } } : {}),
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
  if (!title || !classSectionId) return;

  const classSection = await canManageClassSection(classSectionId, actor);
  if (!classSection) return;

  const test = await prisma.quiz.create({
    data: {
      title,
      classSectionId,
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
  revalidatePath("/elearning/tests");
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
  revalidatePath(`/elearning/tests/${quizId}`);
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
  revalidatePath(`/elearning/tests/${quizId}`);
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
  revalidatePath("/elearning/tests");
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
  if (!rawJson) return;

  let payload: ImportedPracticeTest;
  try {
    payload = JSON.parse(rawJson) as ImportedPracticeTest;
  } catch {
    return;
  }

  const classSectionId = textValue(formData, "classSectionId") || payload.classSectionId || "";
  const title = (payload.title || "").trim();
  if (!title || !classSectionId) return;

  const classSection = await canManageClassSection(classSectionId, actor);
  if (!classSection) return;

  const test = await prisma.quiz.create({
    data: {
      title,
      description: payload.description?.trim() || null,
      classSectionId,
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
      published: true,
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

  await logActivity(actor.id, "IMPORT_PRACTICE_TEST_JSON", "Quiz", test.id);
  revalidatePath("/admin/tests");
  revalidatePath("/elearning/tests");
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
    redirect(`/elearning/tests/${quizId}?attempt=${inProgressAttempt.id}`);
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
  revalidatePath(`/elearning/tests/${quizId}`);
  redirect(`/elearning/tests/${quizId}?attempt=${attempt.id}`);
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
  revalidatePath(`/elearning/tests/${attempt.quizId}`);
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

  await upsertAttemptGrade({
    studentId: actor.id,
    quizId: attempt.quizId,
    attemptId: attempt.id,
    score,
    feedback: requiresManualGrade
      ? "Auto score saved. Writing/essay answers need teacher grading."
      : "Auto-graded practice test.",
    gradedById: requiresManualGrade ? null : undefined,
  });

  await logActivity(actor.id, autoSubmitted ? "AUTO_SUBMIT_PRACTICE_TEST" : "SUBMIT_PRACTICE_TEST", "Attempt", attempt.id);
  revalidatePath("/elearning/tests");
  revalidatePath(`/elearning/tests/${attempt.quizId}`);
  revalidatePath("/elearning/scores");
  revalidatePath("/admin/tests");
  revalidatePath("/admin/grades");
  redirect("/elearning/tests");
}

export async function gradePracticeAttemptAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const attemptId = textValue(formData, "attemptId");
  const score = numberValue(formData, "score");
  if (!attemptId) return;

  const attempt = await prisma.attempt.findFirst({
    where: {
      id: attemptId,
      quiz: {
        isPracticeTest: true,
        ...(actor.role === "TEACHER" ? { classSection: { teacherId: actor.id } } : {}),
      },
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
  if (!quizId) return;

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId },
    include: {
      classSection: { include: { enrollments: true } },
      questions: {
        orderBy: { order: "asc" },
        include: {
          question: { include: { options: true } },
        },
      },
      attempts: {
        where: { studentId: actor.id },
      },
    },
  });

  if (!quiz) return;

  const isEnrolled = quiz.classSection?.enrollments?.some(
    (enrollment) => enrollment.userId === actor.id && enrollment.status === "ACTIVE",
  ) || false;

  if ((!quiz.isOpenQuiz && !quiz.isPracticeTest && !isEnrolled) || quiz.attempts.length >= quiz.attemptLimit) return;

  let score = 0;
  let requiresManualGrade = false;
  let autoGradableQuestions = 0;

  const attempt = await prisma.attempt.create({
    data: {
      quizId,
      studentId: actor.id,
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  for (const link of quiz.questions) {
    const question = link.question;
    const fieldName = `question_${question.id}`;
    const rawAnswer = textValue(formData, fieldName);
    let optionId: string | null = null;
    let answerText: string | null = rawAnswer || null;
    let isCorrect: boolean | null = null;
    let pointsAwarded: number | null = null;

    if (question.type === "MULTIPLE_CHOICE") {
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

    await prisma.attemptAnswer.create({
      data: {
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
    },
  });

  if (!requiresManualGrade) {
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

  await logActivity(actor.id, "SUBMIT_ATTEMPT", "Attempt", attempt.id);
  revalidatePath("/elearning/exercises");
  revalidatePath(`/elearning/exercises/${quizId}`);
  revalidatePath("/elearning/scores");
  revalidatePath("/admin/grades");
  redirect(`/elearning/exercises/${quizId}?attempt=${attempt.id}&submitted=1`);
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

  const isEnrolled = quiz.classSection.enrollments.some(
    (enrollment) => enrollment.userId === actor.id && enrollment.status === "ACTIVE",
  );
  if ((!quiz.isOpenQuiz && !isEnrolled) || quiz.attempts.length >= quiz.attemptLimit) return;

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
  if (!submissionId) return;

  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission) return;

  await prisma.grade.upsert({
    where: { submissionId },
    update: {
      score,
      feedback: optionalText(formData, "feedback"),
      gradedById: actor.id,
    },
    create: {
      submissionId,
      studentId: submission.studentId,
      assignmentId: submission.assignmentId,
      score,
      feedback: optionalText(formData, "feedback"),
      gradedById: actor.id,
    },
  });

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: "GRADED" },
  });

  await logActivity(actor.id, "GRADE_SUBMISSION", "Submission", submissionId);
  revalidatePath("/admin/grades");
  revalidatePath("/elearning/scores");
}



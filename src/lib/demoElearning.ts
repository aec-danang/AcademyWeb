import { prisma } from "@/lib/prisma";

export const DEMO_ROLE_COOKIE = "aec-demo-role";
export const DEMO_ADMIN_EMAIL = "demo.admin@academy.local";
export const DEMO_TEACHER_EMAIL = "demo.teacher@academy.local";
export const DEMO_STUDENT_EMAIL = "demo.student@academy.local";

type DemoUsers = {
  admin: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: "ADMIN";
    isActive: boolean;
  };
  teacher: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: "TEACHER";
    isActive: boolean;
  };
  student: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: "STUDENT";
    isActive: boolean;
  };
};

const globalForDemo = globalThis as typeof globalThis & {
  aecDemoDataPromise?: Promise<DemoUsers>;
  aecDemoDataVersion?: number;
};

const DEMO_DATA_VERSION = 3;

async function provisionDemoElearningData(): Promise<DemoUsers> {
  const admin = await prisma.user.upsert({
    where: { email: DEMO_ADMIN_EMAIL },
    update: { name: "Demo Admin", role: "ADMIN", isActive: true },
    create: {
      id: "aec-demo-admin",
      name: "Demo Admin",
      email: DEMO_ADMIN_EMAIL,
      role: "ADMIN",
      isActive: true,
    },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
  });

  const teacher = await prisma.user.upsert({
    where: { email: DEMO_TEACHER_EMAIL },
    update: { name: "Demo Teacher", role: "TEACHER", isActive: true },
    create: {
      id: "aec-demo-teacher",
      name: "Demo Teacher",
      email: DEMO_TEACHER_EMAIL,
      role: "TEACHER",
      isActive: true,
    },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
  });

  const student = await prisma.user.upsert({
    where: { email: DEMO_STUDENT_EMAIL },
    update: { name: "Demo Student", role: "STUDENT", isActive: true },
    create: {
      id: "aec-demo-student",
      name: "Demo Student",
      email: DEMO_STUDENT_EMAIL,
      role: "STUDENT",
      isActive: true,
    },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
  });

  const classroom = await prisma.classSection.upsert({
    where: { id: "aec-demo-classroom" },
    update: { teacherId: teacher.id, status: "ACTIVE" },
    create: {
      id: "aec-demo-classroom",
      name: "Demo Teacher–Student Classroom",
      code: "AEC-DEMO",
      status: "ACTIVE",
      teacherId: teacher.id,
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_classSectionId: {
        userId: student.id,
        classSectionId: classroom.id,
      },
    },
    update: { status: "ACTIVE", decidedAt: new Date(), decidedById: teacher.id },
    create: {
      userId: student.id,
      classSectionId: classroom.id,
      status: "ACTIVE",
      decidedAt: new Date(),
      decidedById: teacher.id,
    },
  });

  await prisma.assignment.upsert({
    where: { id: "aec-demo-assignment" },
    update: { status: "PUBLISHED", classSectionId: classroom.id, createdById: teacher.id },
    create: {
      id: "aec-demo-assignment",
      title: "Demo: Introduce yourself",
      description: "Write a short introduction so both sides can test submission and grading.",
      instructions: "Write 3–5 sentences in English.",
      type: "HOMEWORK",
      status: "PUBLISHED",
      difficulty: "EASY",
      skill: "WRITING",
      maxScore: 10,
      classSectionId: classroom.id,
      createdById: teacher.id,
    },
  });

  await prisma.classSection.upsert({
    where: { id: "aec-demo-join-classroom" },
    update: { teacherId: teacher.id, status: "ACTIVE" },
    create: {
      id: "aec-demo-join-classroom",
      name: "Join Approval Sandbox",
      code: "AEC-JOIN",
      status: "ACTIVE",
      teacherId: teacher.id,
    },
  });

  return {
    admin: { ...admin, role: "ADMIN" },
    teacher: { ...teacher, role: "TEACHER" },
    student: { ...student, role: "STUDENT" },
  };
}

export function ensureDemoElearningData() {
  if (globalForDemo.aecDemoDataVersion !== DEMO_DATA_VERSION) {
    globalForDemo.aecDemoDataPromise = undefined;
    globalForDemo.aecDemoDataVersion = DEMO_DATA_VERSION;
  }

  if (!globalForDemo.aecDemoDataPromise) {
    globalForDemo.aecDemoDataPromise = provisionDemoElearningData().catch((error) => {
      globalForDemo.aecDemoDataPromise = undefined;
      throw error;
    });
  }

  return globalForDemo.aecDemoDataPromise;
}

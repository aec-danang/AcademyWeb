import { classroomSetupRegistry, resolveTeacherClassroomStates } from "@/lib/teacherWorkflowEngine";

export type TeacherSetupStep = { key: string; label: string; detail: string; done: boolean; href: string };
export type TeacherSetupProgress = { completed: number; total: number; steps: TeacherSetupStep[]; nextStep: TeacherSetupStep | null; classroomId: string | null; classroomName: string | null; classroomCode: string | null; incompleteClassrooms: number };

export async function getTeacherSetupProgress(userId: string, isAdmin: boolean): Promise<TeacherSetupProgress> {
  const classrooms = await resolveTeacherClassroomStates(userId, isAdmin);
  // Onboarding is per classroom. Completing a step in an older class must not
  // mark the same step complete for a newly-created class.
  const progressFor = (item: (typeof classrooms)[number]) => classroomSetupRegistry
    .filter((step) => step.isComplete(item))
    .length;
  // This is a first-run teaching guide, not a permanent audit of every class.
  // Once the teacher has completed the full workflow in any classroom, the
  // guide must leave the workspace entirely. New classes can still be managed
  // from the normal classroom tabs without bringing the onboarding veil back.
  const hasCompletedClassroom = classrooms.some((item) => progressFor(item) === 4);
  if (hasCompletedClassroom) {
    return { completed: 4, total: 4, steps: [], nextStep: null, classroomId: null, classroomName: null, classroomCode: null, incompleteClassrooms: 0 };
  }

  const incomplete = classrooms.filter((item) => progressFor(item) < 4);
  // Stay with the newest classroom for all four steps so the interface never
  // jumps between unrelated classes midway through onboarding.
  const preferred = incomplete[0] || null;
  const classroomHref = preferred ? `/elearning/classrooms/${preferred.id}` : "/elearning/classrooms/new";
  const details: Record<string, string> = {
    classroom: "Set up the class that will receive assignments and tests.",
    student: "Build this classroom's roster before assigning work.",
    learning: "Give this class its first published learning activity.",
    test: "Choose a published test and create a delivery for this class.",
  };
  const tabs: Record<string, string> = {
    classroom: "",
    student: "?tab=students",
    learning: "?tab=assignments",
    test: "?tab=quizzes",
  };
  const steps: TeacherSetupStep[] = classroomSetupRegistry.map((step) => ({
    key: step.id,
    label: step.label,
    detail: details[step.id],
    done: step.isComplete(preferred),
    href: preferred ? `${classroomHref}${tabs[step.id]}` : "/elearning/classrooms/new",
  }));
  // No incomplete classroom means setup is finished globally and the guide can hide.
  if (!preferred && classrooms.length) return { completed: 4, total: 4, steps: steps.map((step) => ({ ...step, done: true })), nextStep: null, classroomId: null, classroomName: null, classroomCode: null, incompleteClassrooms: 0 };
  const completed = steps.filter((step) => step.done).length;
  return { completed, total: steps.length, steps, nextStep: steps.find((step) => !step.done) || null, classroomId: preferred?.id || null, classroomName: preferred?.name || null, classroomCode: preferred?.code || null, incompleteClassrooms: incomplete.length };
}

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../../ElearningBreadcrumbs";
import StudentSubmissionClient from "./StudentSubmissionClient";

export const dynamic = "force-dynamic";

export default async function AssignmentDetailsPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const user = await requireUser();
  const { assignmentId } = await params;

  if (user.role !== "STUDENT") {
    // For now, redirect non-students to the classroom page if they try to access this
    redirect("/elearning/assignments");
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      classSection: true,
      submissions: {
        where: { studentId: user.id },
        include: { grade: true }
      }
    }
  });

  if (!assignment) {
    notFound();
  }

  // If already submitted and we're not allowing resubmission (or it's not requested), redirect to scores view
  const submission = assignment.submissions[0];
  if (submission && submission.status !== "REVISION_REQUESTED" && !assignment.allowResubmission) {
    redirect(`/elearning/scores/${submission.id}`);
  }

  const mappedAssignment = {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    type: assignment.type,
    difficulty: assignment.difficulty,
    skill: assignment.skill,
    cefrLevel: assignment.cefrLevel,
    maxScore: assignment.maxScore,
    rubric: assignment.rubric,
    allowLateSubmission: assignment.allowLateSubmission,
    allowResubmission: assignment.allowResubmission,
    category: assignment.category,
    tags: assignment.tags,
    instructions: assignment.instructions,
    attachmentUrl: assignment.attachmentUrl,
    attachmentName: assignment.attachmentName,
    dueAt: assignment.dueAt?.toISOString() || null,
    classroomId: assignment.classSectionId,
    classCode: assignment.classSection.code,
    courseTitle: assignment.classSection.name,
    submission: submission ? {
      id: submission.id,
      content: submission.content,
      fileUrl: submission.fileUrl,
      status: submission.status,
      submittedAt: submission.submittedAt.toISOString(),
      grade: submission.grade ? {
        status: submission.grade.status,
        score: submission.grade.score,
        feedback: submission.grade.feedback,
        aiStatus: submission.grade.aiStatus,
        aiScore: submission.grade.aiScore,
        aiFeedback: submission.grade.aiFeedback,
        aiConfidence: submission.grade.aiConfidence,
      } : null
    } : null
  };

  return (
    <div className="min-h-screen bg-slate-50 w-full flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
        <ElearningBreadcrumbs items={[
          { label: "Assignments", href: "/elearning/assignments" },
          { label: assignment.title }
        ]} />
      </div>
      <div className="flex-1 overflow-hidden relative">
        <StudentSubmissionClient assignment={mappedAssignment as any} />
      </div>
    </div>
  );
}

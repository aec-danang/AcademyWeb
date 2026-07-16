import StudentAssignmentsBoard from "./StudentAssignmentsBoard";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const user = await requireUser(["STUDENT"]);
  const assignments = await prisma.assignment.findMany({
    where: {
      status: "PUBLISHED",
      classSection: {
        enrollments: {
          some: {
            userId: user.id,
            status: "ACTIVE",
          },
        },
      },
    },
    orderBy: { dueAt: "asc" },
    include: {
      classSection: { include: { course: true } },
      submissions: {
        where: { studentId: user.id },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  return (
    <StudentAssignmentsBoard
      assignments={assignments.map((assignment) => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        difficulty: assignment.difficulty,
        category: assignment.category,
        tags: assignment.tags,
        instructions: assignment.instructions,
        attachmentUrl: assignment.attachmentUrl,
        attachmentName: assignment.attachmentName,
        dueAt: assignment.dueAt?.toISOString() || null,
        classCode: assignment.classSection?.code ?? "",
        courseTitle: assignment.classSection?.course?.title ?? "",
        submission: assignment.submissions[0]
          ? {
              id: assignment.submissions[0].id,
              content: assignment.submissions[0].content,
              fileUrl: assignment.submissions[0].fileUrl,
              status: assignment.submissions[0].status,
              submittedAt: assignment.submissions[0].submittedAt.toISOString(),
            }
          : null,
      }))}
    />
  );
}

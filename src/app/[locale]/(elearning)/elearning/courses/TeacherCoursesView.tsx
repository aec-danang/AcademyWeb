import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AnimatedCourseGrid } from "./AnimatedCourseGrid";

export async function TeacherCoursesView() {
  const user = await requireUser(["TEACHER", "ADMIN"]);

  const classes = await prisma.classSection.findMany({
    where: { teacherId: user.id },
    include: {
      course: true,
      _count: {
        select: { enrollments: true, assignments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AnimatedCourseGrid classes={classes as any} />;
}

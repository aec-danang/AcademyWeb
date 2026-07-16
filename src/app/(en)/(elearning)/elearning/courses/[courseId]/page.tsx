import Link from "next/link";
import { CheckCircle, ChevronLeft, PlayCircle } from "lucide-react";
import { notFound } from "next/navigation";
import styles from "../../elearning.module.css";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { TeacherCourseEditView } from "./TeacherCourseEditView";

type Props = { params: Promise<{ courseId: string }> };

export const dynamic = "force-dynamic";

function extractMetadataValue(content: string | null, label: string) {
  if (!content) return "";
  const line = content.split(/\r?\n/).find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line?.slice(label.length + 1).trim() || "";
}

function lessonPreview(content: string | null) {
  if (!content) return "Open this lesson to view the full learning content.";

  const summaryMatch = content.match(/Summary\s*\n([\s\S]*?)(?:\n\n|$)/i);
  const rawPreview = summaryMatch?.[1] || content.replace(/Source Metadata\s*\n[\s\S]*$/i, "");
  const preview = rawPreview.replace(/Lesson Content\s*\n/i, "").replace(/\s+/g, " ").trim();

  if (!preview) return "Open this lesson to view the full learning content.";
  return preview.length > 180 ? `${preview.slice(0, 177)}...` : preview;
}

export default async function CourseDetailPage({ params }: Props) {
  const user = await requireUser();
  
  if (user.role === "TEACHER" || user.role === "ADMIN") {
    return <TeacherCourseEditView params={params} />;
  }

  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { orderBy: { order: "asc" } },
      classes: { include: { teacher: true, enrollments: true, quizzes: true, assignments: true } },
    },
  });

  if (!course) notFound();

  const hasAccess = course.classes.some((classSection: any) => classSection.teacherId === user.id)
    || course.classes.some((classSection: any) => classSection.enrollments.some((enrollment: any) => enrollment.userId === user.id && enrollment.status === "ACTIVE"));

  if (!hasAccess) notFound();

  const completedLessons = Math.min(1, course.lessons.length);
  const progress = course.lessons.length === 0 ? 0 : Math.round((completedLessons / course.lessons.length) * 100);

  return (
    <div>
      <Link href="/elearning/courses" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none", marginBottom: "1.5rem" }}>
        <ChevronLeft size={16} /> Back to Courses
      </Link>
      <div className={styles.panel} style={{ backgroundColor: "var(--color-navy)", color: "white" }}>
        <h1 style={{ margin: "0 0 1rem 0", color: "white" }}>{course.title}</h1>
        {course.description && <p style={{ margin: "0 0 1rem 0", color: "rgba(255,255,255,0.82)" }}>{course.description}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className={styles.progressBar} style={{ width: "200px", backgroundColor: "rgba(255,255,255,0.2)" }}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>
          <span>{progress}% Completed</span>
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2 style={{ marginBottom: "1rem", color: "var(--color-navy)" }}>Course Syllabus</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {course.lessons.map((lesson, index) => {
            const skill = extractMetadataValue(lesson.content, "Skill");
            const level = extractMetadataValue(lesson.content, "Level");
            const contentType = extractMetadataValue(lesson.content, "Content Type");

            return (
            <Link key={lesson.id} href={`/elearning/learn/${lesson.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className={styles.panel} style={{ marginBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
                  <PlayCircle size={18} color="var(--color-navy)" />
                  <div style={{ minWidth: 0 }}>
                    <strong>Lesson {lesson.order}: {lesson.title}</strong>
                    <p style={{ color: "var(--text-muted)", margin: "0.35rem 0 0", lineHeight: 1.5 }}>{lessonPreview(lesson.content)}</p>
                    {(skill || level || contentType) && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.65rem" }}>
                        {[skill, level, contentType].filter(Boolean).map((badge) => (
                          <span key={badge} style={{ padding: "0.25rem 0.55rem", borderRadius: "999px", background: "#eef2ff", color: "#4f46e5", fontSize: "0.72rem", fontWeight: 800, textTransform: "capitalize" }}>
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {index < completedLessons && <CheckCircle size={18} color="#166534" />}
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

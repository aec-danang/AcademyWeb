import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";
import styles from "../elearning.module.css";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const user = await requireUser();
  const courses = await prisma.course.findMany({
    where: user.role === "STUDENT"
      ? { classes: { some: { enrollments: { some: { userId: user.id, status: "ACTIVE" } } } } }
      : user.role === "TEACHER"
        ? { classes: { some: { teacherId: user.id } } }
        : {},
    orderBy: { createdAt: "desc" },
    include: {
      lessons: true,
      classes: { include: { enrollments: { where: { status: "ACTIVE" } } } },
    },
  });

  return (
    <div>
      <div className={styles.flexBetween} style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>{user.role === "STUDENT" ? "My Courses" : "Courses"}</h1>
      </div>

      <div className={styles.courseGrid}>
        {courses.map((course) => (
          <Link href={`/elearning/courses/${course.id}`} key={course.id} style={{ textDecoration: "none", color: "inherit" }}>
            <div className={styles.courseCard}>
              <div className={styles.courseImage}><BookOpen size={48} opacity={0.5} /></div>
              <div className={styles.courseContent}>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.75rem", color: "var(--text-muted)" }}>
                  <span>{course.lessons.length} lessons</span>
                  <span>{course.classes.reduce((sum, classSection) => sum + classSection.enrollments.length, 0)} enrolled</span>
                </div>
                <div className={styles.progressBar} aria-hidden="true"><div className={styles.progressFill} style={{ width: course.lessons.length > 0 ? "100%" : "0%" }} /></div>
                <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-orange)", fontWeight: 500 }}>
                  <PlayCircle size={18} /> View Course
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {courses.length === 0 && <div className={styles.panel}>No active courses found for your account.</div>}
    </div>
  );
}

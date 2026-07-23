import Link from "next/link";
import { BookOpen, CheckCircle2, Layers3, Plus, School, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../ElearningBreadcrumbs";
import styles from "../elearning.module.css";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const user = await requireUser();
  const isManager = user.role === "TEACHER" || user.role === "ADMIN";
  const courses = await prisma.course.findMany({
    where: user.role === "STUDENT" ? { published: true, classes: { some: { status: "ACTIVE", enrollments: { some: { userId: user.id, status: "ACTIVE" } } } } } : {},
    orderBy: [{ published: "desc" }, { updatedAt: "desc" }],
    include: {
      _count: { select: { lessons: true, classes: true } },
      classes: { include: { enrollments: { where: { status: "ACTIVE" }, select: { id: true } } } },
    },
  });

  return <main className={styles.courseLibraryPage}>
    <ElearningBreadcrumbs items={[{ label: isManager ? "Course Library" : "My Courses" }]} />
    <header className={styles.workflowHero}>
      <div><span><Layers3 size={16} /> {isManager ? "Reusable curriculum" : "Learning content"}</span><h1>{isManager ? "Course Library" : "My Courses"}</h1><p>{isManager ? "Create curriculum once and reuse it across different teachers, cohorts and schedules." : "Open the course content connected to your active classrooms."}</p></div>
      {isManager ? <Link href="/elearning/courses/new" className="btn-primary"><Plus size={16} /> New course template</Link> : null}
    </header>

    {courses.length ? <div className={styles.templateGrid}>{courses.map((course) => {
      const students = course.classes.reduce((sum, classroom) => sum + classroom.enrollments.length, 0);
      return <Link href={`/elearning/courses/${course.id}`} className={styles.templateCard} key={course.id}>
        <div className={styles.templateCardTop}><span><BookOpen size={18} /></span><small className={course.published ? styles.templatePublished : styles.templateDraft}>{course.published ? "Published" : "Draft"}</small></div>
        <h2>{course.title}</h2>
        <div className={styles.templateTags}>{course.program ? <span>{course.program}</span> : null}{course.curriculum ? <span>{course.curriculum}</span> : null}</div>
        <footer><span><BookOpen size={14} /> {course._count.lessons} lessons</span><span><School size={14} /> {course._count.classes} classrooms</span><span><Users size={14} /> {students} students</span></footer>
      </Link>;
    })}</div> : <div className={styles.workflowEmpty}><CheckCircle2 size={28} /><p>{isManager ? "No reusable course templates yet." : "No course content is connected to your active classrooms."}</p>{isManager ? <Link href="/elearning/courses/new" className="btn-primary">Create first course template</Link> : null}</div>}
  </main>;
}

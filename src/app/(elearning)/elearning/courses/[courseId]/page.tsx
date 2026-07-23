import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, CheckCircle2, Edit3, Plus, School, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { updateCourseTemplateAction } from "@/lib/teacherActions";
import { ElearningBreadcrumbs } from "../../ElearningBreadcrumbs";
import styles from "../../elearning.module.css";

type Props = { params: Promise<{ courseId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const { courseId } = await params;
  const query = await searchParams;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { orderBy: { order: "asc" }, include: { deliveries: { include: { classSection: { include: { enrollments: true } } } } } },
      classes: { orderBy: { createdAt: "desc" }, include: { teacher: true, enrollments: { where: { status: "ACTIVE" }, select: { id: true, userId: true } } } },
    },
  });
  if (!course) notFound();

  const isManager = user.role === "TEACHER" || user.role === "ADMIN";
  if (!isManager && !course.classes.some((item) => item.enrollments.some((enrollment) => enrollment.userId === user.id))) notFound();
  const updateCourse = updateCourseTemplateAction.bind(null, course.id);
  const visibleLessons = isManager ? course.lessons : course.lessons.filter((lesson) => lesson.deliveries.some((delivery) => delivery.status === "PUBLISHED" && (!delivery.availableAt || delivery.availableAt <= new Date()) && delivery.classSection.enrollments.some((enrollment) => enrollment.userId === user.id && enrollment.status === "ACTIVE")));

  return <main className={styles.courseLibraryPage}>
    <ElearningBreadcrumbs items={[{ label: isManager ? "Course Library" : "My Courses", href: "/elearning/courses" }, { label: course.title }]} />
    {query.created === "1" ? <div className={styles.workflowNextStep}><CheckCircle2 size={20} /><div><strong>Course template created</strong><p>You can now connect it to a classroom or begin building its lesson sequence.</p></div></div> : null}
    <header className={styles.workflowHero}><div><span><BookOpen size={16} /> {course.program || "Course template"}</span><h1>{course.title}</h1><p>{course.description || "No course description has been added yet."}</p></div>{isManager ? <Link href={`/elearning/classrooms/new?courseId=${course.id}`} className="btn-primary"><Plus size={16} /> Create classroom from this course</Link> : null}</header>

    {isManager ? <div className={styles.courseTemplateLayout}>
      <section className={styles.workflowCard}>
        <div className={styles.workflowCardHeading}><span><Edit3 size={18} /></span><div><p>Template settings</p><h2>Reusable course information</h2><small>These changes affect every classroom using this Course.</small></div></div>
        <form action={updateCourse} className={styles.workflowFieldGrid}>
          <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Course title</span><input name="title" defaultValue={course.title} required /></label>
          <label className={styles.workflowField}><span>Program / level</span><input name="program" defaultValue={course.program || ""} /></label>
          <label className={styles.workflowField}><span>Curriculum reference</span><input name="curriculum" defaultValue={course.curriculum || ""} /></label>
          <label className={`${styles.workflowField} ${styles.workflowFieldWide}`}><span>Description</span><textarea name="description" rows={4} defaultValue={course.description || ""} /></label>
          <label className={styles.workflowCheck}><input type="checkbox" name="published" defaultChecked={course.published} /><span><strong>Published in Course Library</strong><small>Available when teachers create classrooms.</small></span></label>
          <button className="btn-primary" type="submit">Save course template</button>
        </form>
      </section>
      <section className={styles.workflowCard}>
        <div className={styles.workflowCardHeading}><span><School size={18} /></span><div><p>Delivery instances</p><h2>Classrooms using this course</h2><small>Roster, schedule and assignments are managed inside each classroom.</small></div></div>
        {course.classes.length ? <div className={styles.courseClassroomList}>{course.classes.map((item) => <Link href={`/elearning/classrooms/${item.id}`} key={item.id}><div><strong>{item.name}</strong><p>{item.code} · {item.teacher?.name || item.teacher?.email || "No teacher"}</p></div><span><Users size={14} /> {item.enrollments.length}</span></Link>)}</div> : <div className={styles.workflowEmpty}><p>This template is not connected to a classroom yet.</p><Link href={`/elearning/classrooms/new?courseId=${course.id}`} className="btn-primary">Create classroom</Link></div>}
      </section>
    </div> : null}

    <section className={styles.workflowCard}>
      <div className={styles.workflowCardHeading}><span><BookOpen size={18} /></span><div><p>Curriculum</p><h2>Lesson sequence</h2><small>{isManager ? "Lessons belong to the reusable Course template." : "Continue through the lessons in order."}</small></div></div>
      {visibleLessons.length ? <div className={styles.courseLessonList}>{visibleLessons.map((lesson, index) => { const delivery = lesson.deliveries.find((item) => isManager || item.classSection.enrollments.some((enrollment) => enrollment.userId === user.id && enrollment.status === "ACTIVE")); return <Link href={`/elearning/learn/${lesson.id}${delivery ? `?delivery=${delivery.id}` : ""}`} key={lesson.id}><span>{index + 1}</span><div><strong>{lesson.title}</strong><p>{lesson.published ? "Published" : "Draft"}</p></div></Link>; })}</div> : <p className={styles.classroomEmpty}>{isManager ? "No lessons have been added to this Course template." : "No lessons have been assigned to your class yet."}</p>}
    </section>
  </main>;
}

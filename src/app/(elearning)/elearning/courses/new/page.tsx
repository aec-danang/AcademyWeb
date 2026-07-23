import Link from "next/link";
import { ArrowLeft, LibraryBig } from "lucide-react";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../../ElearningBreadcrumbs";
import { CourseTemplateForm } from "./CourseTemplateForm";
import styles from "../../elearning.module.css";

export default async function CreateCourseTemplatePage() {
  await requireUser(["TEACHER", "ADMIN"]);
  return <main className={styles.workflowPage}>
    <ElearningBreadcrumbs items={[{ label: "Course Library", href: "/elearning/courses" }, { label: "New template" }]} />
    <header className={styles.workflowHero}><div><span><LibraryBig size={16} /> Course Library</span><h1>Create a course template</h1><p>Build reusable curriculum once, then connect it to one or more classrooms.</p></div><Link href="/elearning/courses" className="btn-secondary"><ArrowLeft size={16} /> Back to library</Link></header>
    <div className={styles.courseClassExplainer}><div><strong>Course</strong><span>Reusable curriculum, lessons and learning outcomes</span></div><i>→</i><div><strong>Classroom</strong><span>Teacher, students, schedule, assignments and scores</span></div></div>
    <CourseTemplateForm />
  </main>;
}

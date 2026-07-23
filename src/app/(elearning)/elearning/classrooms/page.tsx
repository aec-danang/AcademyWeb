import Link from "next/link";
import { BookOpen, CheckCircle2, Plus, School, UserPlus, Users } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requestEnrollmentAction } from "@/lib/lmsActions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../ElearningBreadcrumbs";
import styles from "../elearning.module.css";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
type ClassroomWithRelations = Prisma.ClassSectionGetPayload<{
  include: { course: true; teacher: true; enrollments: { include: { student: true } } };
}>;
type AvailableClassroom = Prisma.ClassSectionGetPayload<{ include: { course: true } }>;

export default async function ClassroomsPage({ searchParams }: Props) {
  const user = await requireUser();
  const query = await searchParams;
  const isStudent = user.role === "STUDENT";
  let classes: ClassroomWithRelations[] = [];
  let availableClasses: AvailableClassroom[] = [];

  try {
    classes = await prisma.classSection.findMany({
      where: isStudent
        ? { status: "ACTIVE", enrollments: { some: { userId: user.id, status: { in: ["REQUESTED", "ACTIVE"] } } } }
        : user.role === "TEACHER" ? { teacherId: user.id } : {},
      include: { course: true, teacher: true, enrollments: { include: { student: true } } },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });
    availableClasses = isStudent
      ? await prisma.classSection.findMany({ where: { status: "ACTIVE" }, include: { course: true }, orderBy: { name: "asc" } })
      : [];
  } catch (error) {
    console.error("Failed to load classrooms:", error);
  }

  const activeClasses = classes.filter((item) => item.status === "ACTIVE").length;
  const activeStudents = classes.reduce((sum, item) => sum + item.enrollments.filter((enrollment) => enrollment.status === "ACTIVE").length, 0);
  const pendingEnrollments = classes.reduce((sum, item) => sum + item.enrollments.filter((enrollment) => enrollment.status === "REQUESTED").length, 0);

  return <main className={styles.classroomHub}>
    <ElearningBreadcrumbs items={[{ label: isStudent ? "My Classrooms" : "Classrooms" }]} />
    <header className={styles.workflowHero}>
      <div><span><School size={16} /> {isStudent ? "Your learning groups" : "Teaching workspace"}</span><h1>{isStudent ? "My Classrooms" : "Classrooms"}</h1><p>{isStudent ? "Open a classroom to see lessons, assignments and tests shared with your class." : "Manage rosters and open one classroom when you need to assign or review work."}</p></div>
      {!isStudent ? <Link href="/elearning/classrooms/new" className="btn-primary"><Plus size={16} /> Create classroom</Link> : null}
    </header>

    <section className={styles.classroomSummaryGrid} aria-label="Classroom summary">
      <div><School size={20} /><strong>{activeClasses}</strong><span>Active classrooms</span></div>
      <div><Users size={20} /><strong>{activeStudents}</strong><span>{isStudent ? "Classmates" : "Active students"}</span></div>
      <div><UserPlus size={20} /><strong>{pendingEnrollments}</strong><span>Pending enrollment</span></div>
    </section>

    {query.intent === "import" && !isStudent ? <div className={styles.workflowNextStep}><div><strong>Choose one classroom</strong><p>Open its Students tab to import or add learners to the roster.</p></div></div> : null}
    {query.archived === "1" && !isStudent ? <div className={styles.workflowNextStep}><div><strong>Classroom archived</strong><p>Student accounts and learning history were kept. You can restore the classroom from its Settings tab.</p></div></div> : null}

    {isStudent ? <section className={styles.enrollmentPanel}>
      <div><span><UserPlus size={16} /> Join another classroom</span><p>Enter the class code supplied by your teacher.</p></div>
      <form action={requestEnrollmentAction}>
        <input name="classCode" placeholder="Class code, e.g. INT-704" />
        <select name="classSectionId" defaultValue=""><option value="">Or choose a classroom</option>{availableClasses.map((classSection) => <option key={classSection.id} value={classSection.id}>{classSection.code} — {classSection.course.title}</option>)}</select>
        <button className="btn-primary" type="submit">Request access</button>
      </form>
    </section> : null}

    <section className={styles.recordPanel}>
      <header><div><span className={styles.cockpitEyebrow}><BookOpen size={16} /> Overview</span><h2>{classes.length} classroom{classes.length === 1 ? "" : "s"}</h2></div></header>
      {classes.length ? <div className={styles.recordList}>{classes.map((classSection) => {
        const students = classSection.enrollments.filter((enrollment) => enrollment.status === "ACTIVE").length;
        const requested = classSection.enrollments.filter((enrollment) => enrollment.status === "REQUESTED").length;
        return <article className={styles.recordRow} key={classSection.id} id={`classroom-${classSection.id}`}>
          <span className={styles.recordIcon}><School size={19} /></span>
          <div className={styles.recordMain}><small>{classSection.code}</small><strong><Link href={`/elearning/classrooms/${classSection.id}`}>{classSection.name}</Link></strong><p>{classSection.course.title}</p></div>
          <div className={styles.recordMetric}><strong>{students}</strong><span>Students</span></div>
          <div className={styles.recordMetric}><strong>{requested}</strong><span>Pending</span></div>
          <span className={`${styles.statusBadge} ${classSection.status === "ACTIVE" ? styles.statusCompleted : styles.statusPending}`}>{classSection.status}</span>
          <div className={styles.recordActions}><Link href={`/elearning/classrooms/${classSection.id}`} className="btn-secondary">Open</Link>{!isStudent ? <Link href={`/elearning/classrooms/${classSection.id}?tab=students`}>Roster</Link> : null}</div>
        </article>;
      })}</div> : <div className={styles.libraryEmpty}><CheckCircle2 size={36} /><h3>No classrooms yet</h3><p>{isStudent ? "Your classrooms appear here after enrollment." : "Create your first classroom to begin."}</p>{!isStudent ? <Link href="/elearning/classrooms/new" className="btn-primary">Create classroom</Link> : null}</div>}
    </section>
  </main>;
}

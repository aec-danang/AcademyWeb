import Link from "next/link";
import { BookOpen, CheckCircle2, Plus, School, UserPlus, Users } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { cancelEnrollmentRequestAction, leaveClassroomAction, requestEnrollmentAction } from "@/lib/lmsActions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../ElearningBreadcrumbs";
import { ConfirmSubmitButton } from "./[classroomId]/ConfirmSubmitButton";
import styles from "../elearning.module.css";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
type ClassroomWithRelations = Prisma.ClassSectionGetPayload<{
  include: { teacher: true; enrollments: { include: { student: true } } };
}>;

export default async function ClassroomsPage({ searchParams }: Props) {
  const user = await requireUser();
  const query = await searchParams;
  const isStudent = user.role === "STUDENT";
  let classes: ClassroomWithRelations[] = [];

  try {
    classes = await prisma.classSection.findMany({
      where: isStudent
        ? { status: "ACTIVE", enrollments: { some: { userId: user.id, status: { in: ["REQUESTED", "ACTIVE"] } } } }
        : user.role === "TEACHER" ? { teacherId: user.id } : {},
      include: { teacher: true, enrollments: { include: { student: true } } },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    });
  } catch (error) {
    console.error("Failed to load classrooms:", error);
  }

  const activeClasses = isStudent
    ? classes.filter((item) => item.enrollments.some((enrollment) => enrollment.userId === user.id && enrollment.status === "ACTIVE")).length
    : classes.filter((item) => item.status === "ACTIVE").length;
  const activeStudents = classes.reduce((sum, item) => {
    const studentCanSeeRoster = !isStudent || item.enrollments.some((enrollment) => enrollment.userId === user.id && enrollment.status === "ACTIVE");
    return studentCanSeeRoster ? sum + item.enrollments.filter((enrollment) => enrollment.status === "ACTIVE").length : sum;
  }, 0);
  const pendingEnrollments = isStudent
    ? classes.reduce((sum, item) => sum + item.enrollments.filter((enrollment) => enrollment.userId === user.id && enrollment.status === "REQUESTED").length, 0)
    : classes.reduce((sum, item) => sum + item.enrollments.filter((enrollment) => enrollment.status === "REQUESTED").length, 0);

  return <main className={styles.classroomHub}>
    <ElearningBreadcrumbs items={[{ label: isStudent ? "My Classrooms" : "Classrooms" }]} />
    <header className={styles.workflowHero}>
      <div><span><School size={16} /> {isStudent ? "Your learning groups" : "Teaching workspace"}</span><h1>{isStudent ? "My Classrooms" : "Classrooms"}</h1><p>{isStudent ? "Open a classroom to see assignments, quizzes and the weekly schedule." : "Manage rosters and open one classroom when you need to assign or review work."}</p></div>
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
        <input name="classCode" placeholder="Class code, e.g. AEC-7K4M2Q" minLength={3} maxLength={24} autoComplete="off" required />
        <button className="btn-primary" type="submit">Send join request</button>
      </form>
    </section> : null}

    {isStudent && query.join === "requested" ? <div className={styles.workflowNextStep}><CheckCircle2 size={20} /><div><strong>Request sent</strong><p>Your teacher must approve it before assignments and quizzes become available.</p></div></div> : null}
    {isStudent && query.join === "already-requested" ? <div className={styles.workflowNextStep}><UserPlus size={20} /><div><strong>Already waiting for approval</strong><p>This classroom request is still pending.</p></div></div> : null}
    {isStudent && query.join === "already-active" ? <div className={styles.workflowNextStep}><CheckCircle2 size={20} /><div><strong>You already belong to this classroom</strong><p>Open it from the list below.</p></div></div> : null}
    {isStudent && query.join === "cancelled" ? <div className={styles.workflowNextStep}><CheckCircle2 size={20} /><div><strong>Join request cancelled</strong><p>You can send a new request later with the same class code.</p></div></div> : null}
    {isStudent && query.join === "left" ? <div className={styles.workflowNextStep}><CheckCircle2 size={20} /><div><strong>You left the classroom</strong><p>Your account, submissions and score history were kept. Ask the teacher to add you again if needed.</p></div></div> : null}
    {isStudent && (query.join === "not-found" || query.join === "missing-code") ? <div className={styles.formError} role="alert"><strong>Classroom not found.</strong> Check the code with your teacher and try again.</div> : null}

    <section className={styles.recordPanel}>
      <header><div><span className={styles.cockpitEyebrow}><BookOpen size={16} /> Overview</span><h2>{classes.length} classroom{classes.length === 1 ? "" : "s"}</h2></div></header>
      {classes.length ? <div className={styles.recordList}>{classes.map((classSection) => {
        const students = classSection.enrollments.filter((enrollment) => enrollment.status === "ACTIVE").length;
        const requested = classSection.enrollments.filter((enrollment) => enrollment.status === "REQUESTED").length;
        const ownEnrollment = isStudent ? classSection.enrollments.find((enrollment) => enrollment.userId === user.id) : null;
        const canOpen = !isStudent || ownEnrollment?.status === "ACTIVE";
        return <article className={styles.recordRow} key={classSection.id} id={`classroom-${classSection.id}`}>
          <span className={styles.recordIcon}><School size={19} /></span>
          <div className={styles.recordMain}><small>{classSection.code}</small><strong>{canOpen ? <Link href={`/elearning/classrooms/${classSection.id}`}>{classSection.name}</Link> : classSection.name}</strong><p>{classSection.teacher?.name || classSection.teacher?.email || "Teacher not assigned"}</p></div>
          <div className={styles.recordMetric}><strong>{canOpen ? students : "–"}</strong><span>{isStudent ? "Classmates" : "Students"}</span></div>
          <div className={styles.recordMetric}><strong>{isStudent ? (ownEnrollment?.status === "REQUESTED" ? "1" : "0") : requested}</strong><span>Pending</span></div>
          <span className={`${styles.statusBadge} ${canOpen ? styles.statusCompleted : styles.statusPending}`}>{isStudent ? ownEnrollment?.status : classSection.status}</span>
          <div className={styles.recordActions}>
            {canOpen ? <Link href={`/elearning/classrooms/${classSection.id}`} className="btn-secondary">Open</Link> : <span className={styles.statusBadge}>Awaiting approval</span>}
            {isStudent && ownEnrollment?.status === "REQUESTED" ? (
              <form action={cancelEnrollmentRequestAction}>
                <input type="hidden" name="enrollmentId" value={ownEnrollment.id} />
                <button type="submit" className={styles.rosterRemoveButton}>Cancel request</button>
              </form>
            ) : null}
            {isStudent && ownEnrollment?.status === "ACTIVE" ? (
              <form action={leaveClassroomAction}>
                <input type="hidden" name="enrollmentId" value={ownEnrollment.id} />
                <ConfirmSubmitButton className={styles.rosterRemoveButton} message={`Leave ${classSection.name}? You will lose access, but your submitted work and score history will be kept.`}>Leave class</ConfirmSubmitButton>
              </form>
            ) : null}
            {!isStudent ? <Link href={`/elearning/classrooms/${classSection.id}?tab=students`}>Roster</Link> : null}
          </div>
        </article>;
      })}</div> : <div className={styles.libraryEmpty}><CheckCircle2 size={36} /><h3>No classrooms yet</h3><p>{isStudent ? "Your classrooms appear here after enrollment." : "Create your first classroom to begin."}</p>{!isStudent ? <Link href="/elearning/classrooms/new" className="btn-primary">Create classroom</Link> : null}</div>}
    </section>
  </main>;
}

import styles from "../elearning.module.css";
import { requestEnrollmentAction } from "@/lib/lmsActions";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ClassroomsPage() {
  const user = await requireUser();
  const classes = await prisma.classSection.findMany({
    where: user.role === "STUDENT"
      ? { enrollments: { some: { userId: user.id } } }
      : user.role === "TEACHER"
        ? { teacherId: user.id }
        : {},
    include: { course: true, teacher: true, enrollments: { include: { student: true } } },
    orderBy: { createdAt: "desc" },
  });
  const availableClasses = user.role === "STUDENT"
    ? await prisma.classSection.findMany({ include: { course: true }, orderBy: { name: "asc" } })
    : [];

  return (
    <div>
      <div className={styles.header}><h1 style={{ marginBottom: "0.5rem" }}>Classrooms</h1></div>

      {user.role === "STUDENT" && (
        <div className={styles.panel}>
          <h3>Request Enrollment</h3>
          <form action={requestEnrollmentAction} style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <input name="classCode" placeholder="Enter class code, e.g. INT-704" style={{ minWidth: 240 }} />
            <select name="classSectionId">
              <option value="">Or choose a class</option>
              {availableClasses.map((classSection) => <option key={classSection.id} value={classSection.id}>{classSection.code} - {classSection.course.title}</option>)}
            </select>
            <button className="btn-primary" type="submit">Request</button>
          </form>
        </div>
      )}

      {classes.map((classSection) => (
        <div className={styles.panel} key={classSection.id}>
          <div className={styles.panelHeader}>
            <h3 style={{ margin: 0 }}>{classSection.name}</h3>
            <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>{classSection.status}</span>
          </div>
          <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", color: "var(--text-muted)" }}>
            <div>Course: {classSection.course.title}</div>
            <div>Teacher: {classSection.teacher?.name || classSection.teacher?.email || "Not assigned"}</div>
            <div>Code: {classSection.code}</div>
          </div>
          <table className={styles.table}>
            <thead><tr><th>Student</th><th>Email</th><th>Status</th></tr></thead>
            <tbody>
              {classSection.enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td>{enrollment.student.name || "Unknown"}</td>
                  <td>{enrollment.student.email}</td>
                  <td>{enrollment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {classes.length === 0 && <div className={styles.panel}>No classrooms found for your account.</div>}
    </div>
  );
}

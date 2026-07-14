import styles from "../elearning.module.css";
import { Award, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ScoresPage() {
  const user = await requireUser();
  const grades = await prisma.grade.findMany({
    where: user.role === "STUDENT"
      ? { studentId: user.id }
      : user.role === "TEACHER"
        ? { OR: [{ assignment: { classSection: { teacherId: user.id } } }, { quiz: { classSection: { teacherId: user.id } } }] }
        : {},
    orderBy: { createdAt: "desc" },
    include: { student: true, assignment: true, quiz: true, gradedBy: true },
  });
  const average = grades.length ? grades.reduce((sum, grade) => sum + grade.score, 0) / grades.length : 0;

  return (
    <div>
      <div className={styles.header}><h1 style={{ marginBottom: "0.5rem" }}>{user.role === "STUDENT" ? "My Scores & Feedback" : "Scores & Feedback"}</h1></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className={styles.panel} style={{ textAlign: "center", marginBottom: 0 }}>
          <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", backgroundColor: "var(--color-orange-light)", color: "var(--color-orange)", marginBottom: "1rem" }}><Award size={32} /></div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", color: "var(--color-navy)" }}>{average ? average.toFixed(1) : "-"}</h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem" }}>Average Score</p>
        </div>
        <div className={styles.panel} style={{ textAlign: "center", marginBottom: 0 }}>
          <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", backgroundColor: "var(--color-navy-light)", color: "var(--color-navy)", marginBottom: "1rem" }}><TrendingUp size={32} /></div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", color: "var(--color-navy)" }}>{grades.length}</h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem" }}>Graded items</p>
        </div>
      </div>
      <div className={styles.panel}>
        <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Recent Results</h3>
        <table className={styles.table}>
          <thead><tr><th>Student</th><th>Assignment / Quiz</th><th>Date</th><th>Score</th><th>Feedback</th></tr></thead>
          <tbody>
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td>{grade.student.name || grade.student.email}</td>
                <td style={{ fontWeight: 500 }}>{grade.assignment?.title || grade.quiz?.title || "Manual grade"}</td>
                <td>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(grade.createdAt)}</td>
                <td><span style={{ fontWeight: 700, color: "var(--color-orange)", fontSize: "1.125rem" }}>{grade.score}</span></td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{grade.feedback || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

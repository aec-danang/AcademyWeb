import styles from "../elearning.module.css";
import { Award, TrendingUp } from "lucide-react";

export default function ScoresPage() {
  const mockScores = [
    { id: 1, assignment: "Writing Task 1 Analysis", score: "7.5", date: "June 01, 2026", feedback: "Good structure, but vocabulary could be improved." },
    { id: 2, assignment: "Speaking Mock Test 1", score: "7.0", date: "May 25, 2026", feedback: "Great fluency. Work on pronunciation of 'th' sounds." },
    { id: 3, assignment: "Reading Practice Test 3", score: "8.5", date: "May 10, 2026", feedback: "Excellent comprehension!" },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 style={{ marginBottom: "0.5rem" }}>My Scores & Feedback</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className={styles.panel} style={{ textAlign: "center", marginBottom: 0 }}>
          <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", backgroundColor: "var(--color-orange-light)", color: "var(--color-orange)", marginBottom: "1rem" }}>
            <Award size={32} />
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", color: "var(--color-navy)" }}>7.5</h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem" }}>Overall Average Band</p>
        </div>
        
        <div className={styles.panel} style={{ textAlign: "center", marginBottom: 0 }}>
          <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", backgroundColor: "var(--color-navy-light)", color: "var(--color-navy)", marginBottom: "1rem" }}>
            <TrendingUp size={32} />
          </div>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", color: "var(--color-navy)" }}>+0.5</h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.875rem" }}>Improvement from last month</p>
        </div>
      </div>

      <div className={styles.panel}>
        <h3 style={{ marginTop: 0, marginBottom: "1.5rem" }}>Recent Exam Results</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Assignment / Exam</th>
              <th>Date Completed</th>
              <th>Score/Band</th>
              <th>Teacher Feedback</th>
            </tr>
          </thead>
          <tbody>
            {mockScores.map(score => (
              <tr key={score.id}>
                <td style={{ fontWeight: 500 }}>{score.assignment}</td>
                <td>{score.date}</td>
                <td>
                  <span style={{ fontWeight: 700, color: "var(--color-orange)", fontSize: "1.125rem" }}>
                    {score.score}
                  </span>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{score.feedback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

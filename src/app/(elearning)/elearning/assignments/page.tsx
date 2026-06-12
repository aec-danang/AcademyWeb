import styles from "../elearning.module.css";
import { Plus, FileText } from "lucide-react";

export default function AssignmentsPage() {
  const mockAssignments = [
    { id: 1, title: "IELTS Reading Practice Test 4", course: "IELTS Intensive 7.0+", due: "Tomorrow, 11:59 PM", status: "Pending" },
    { id: 2, title: "Speaking Part 2 Recording", course: "Advanced Communication", due: "Friday, 11:59 PM", status: "Pending" },
    { id: 3, title: "Writing Task 1 Analysis", course: "IELTS Intensive 7.0+", due: "Last Week", status: "Completed" },
  ];

  return (
    <div>
      <div className={styles.flexBetween} style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>Assignments</h1>
        <button className="btn-primary" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Plus size={18} />
          Create Assignment
        </button>
      </div>

      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mockAssignments.map(assignment => (
              <tr key={assignment.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
                    <FileText size={16} color="var(--color-navy)" />
                    {assignment.title}
                  </div>
                </td>
                <td>{assignment.course}</td>
                <td>{assignment.due}</td>
                <td>
                  <span className={`${styles.statusBadge} ${assignment.status === 'Completed' ? styles.statusCompleted : styles.statusPending}`}>
                    {assignment.status}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}>
                    {assignment.status === 'Completed' ? 'View' : 'Submit'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

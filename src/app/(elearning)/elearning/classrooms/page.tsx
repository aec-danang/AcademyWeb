import styles from "../elearning.module.css";
import { Users, Mail } from "lucide-react";

export default function ClassroomsPage() {
  const mockStudents = [
    { id: 1, name: "Nguyen Van A", email: "nguyenvana@example.com", progress: 75, status: "Active" },
    { id: 2, name: "Tran Thi B", email: "tranthib@example.com", progress: 60, status: "Active" },
    { id: 3, name: "Le Van C", email: "levanc@example.com", progress: 90, status: "Active" },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1 style={{ marginBottom: "0.5rem" }}>My Classrooms</h1>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 style={{ margin: 0 }}>IELTS Intensive 7.0+ (Class ID: INT-704)</h3>
          <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Active Course</span>
        </div>
        
        <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", color: "var(--text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={18} />
            24 Students Enrolled
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Teacher: Mr. David Smith
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockStudents.map(student => (
              <tr key={student.id}>
                <td style={{ fontWeight: 500 }}>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div className={styles.progressBar} style={{ width: "100px" }}>
                      <div className={styles.progressFill} style={{ width: `${student.progress}%` }}></div>
                    </div>
                    <span>{student.progress}%</span>
                  </div>
                </td>
                <td>
                  <button style={{ padding: "0.5rem", background: "var(--color-navy-light)", border: "none", borderRadius: "4px", color: "var(--color-navy)", cursor: "pointer" }}>
                    <Mail size={16} />
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

import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";
import styles from "../elearning.module.css";

export default function CoursesPage() {
  const mockCourses = [
    {
      id: "INT-704",
      title: "IELTS Intensive 7.0+",
      description: "Advanced preparation for IELTS focusing on writing and speaking.",
      progress: 45,
      totalLessons: 24,
      completedLessons: 11
    },
    {
      id: "ENG-COM",
      title: "Advanced Communication",
      description: "Improve your daily and professional communication skills.",
      progress: 80,
      totalLessons: 10,
      completedLessons: 8
    },
    {
      id: "KIDS-01",
      title: "Kids Explorers (Level 1)",
      description: "Fun and interactive English for young learners.",
      progress: 10,
      totalLessons: 30,
      completedLessons: 3
    }
  ];

  return (
    <div>
      <div className={styles.flexBetween} style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>My Courses</h1>
      </div>

      <div className={styles.courseGrid}>
        {mockCourses.map(course => (
          <Link href={`/elearning/courses/${course.id}`} key={course.id} style={{ textDecoration: "none", color: "inherit" }}>
            <div className={styles.courseCard}>
              <div className={styles.courseImage}>
                <BookOpen size={48} opacity={0.5} />
              </div>
              <div className={styles.courseContent}>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
                  <span>{course.completedLessons} / {course.totalLessons} Lessons</span>
                  <span>{course.progress}%</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${course.progress}%` }}></div>
                </div>
                
                <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-orange)", fontWeight: 500 }}>
                  <PlayCircle size={18} /> Continue Learning
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

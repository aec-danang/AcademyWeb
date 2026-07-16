"use client";

import Link from "next/link";
import { BookOpen, Users, ClipboardList } from "lucide-react";
import styles from "../elearning.module.css";

type ClassWithCourse = {
  id: string;
  name?: string | null;
  code?: string | null;
  course: {
    id: string;
    title: string;
    description: string | null;
  };
  _count: {
    enrollments: number;
    assignments: number;
  };
};

export function AnimatedCourseGrid({ classes }: { classes: ClassWithCourse[] }) {
  if (classes.length === 0) {
    return (
      <div className={styles.panel}>
        No classes found. You have not been assigned to any class yet.
      </div>
    );
  }

  return (
    <div className={styles.courseGrid}>
      {classes.map((classSection) => (
        <Link
          href={`/elearning/courses/${classSection.course.id}`}
          key={classSection.id}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className={styles.courseCard}>
            <div className={styles.courseImage}>
              <BookOpen size={48} opacity={0.5} />
            </div>
            <div className={styles.courseContent}>
              <h3>{classSection.course.title}</h3>
              {classSection.name && (
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                  Class: {classSection.name} {classSection.code ? `(${classSection.code})` : ""}
                </p>
              )}
              <p>{classSection.course.description}</p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginTop: "0.5rem",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Users size={13} /> {classSection._count.enrollments} students
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <ClipboardList size={13} /> {classSection._count.assignments} assignments
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

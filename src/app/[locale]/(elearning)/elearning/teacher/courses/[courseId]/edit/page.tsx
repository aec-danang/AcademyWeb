"use client";

import { use } from "react";
import CourseForm from "../../components/CourseForm";
import { mockCourses } from "../../mock-data";
import { notFound } from "next/navigation";

export default function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const course = mockCourses.find(c => c.id === resolvedParams.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="p-6">
      <CourseForm initialData={course} isEditing />
    </div>
  );
}

"use client";

import { use } from "react";
import { ArrowLeft, Users, BookOpen, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockCourses } from "../../mock-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import styles from "../../../elearning.module.css";

export default function CourseStatsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const course = mockCourses.find(c => c.id === resolvedParams.courseId);

  if (!course) {
    notFound();
  }

  // Mock data for incomplete lessons
  const incompleteLessons = course.sections.flatMap(section => 
    section.lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      sectionTitle: section.title,
      incompleteRate: Math.floor(Math.random() * 40) + 10 // Random 10-50%
    }))
  ).sort((a, b) => b.incompleteRate - a.incompleteRate).slice(0, 5);

  return (
    <div className={styles.dashboardShell}>
      <section className={styles.dashboardHero}>
        <div className={styles.dashboardHeroCopy}>
          <span className={styles.cockpitEyebrow}>
            <Link href={`/elearning/teacher/courses`} style={{ color: 'inherit', textDecoration: 'none' }}>
              <ArrowLeft size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Back to Courses
            </Link>
          </span>
          <div className="flex items-center gap-3">
             <h1 style={{ marginBottom: 0 }}>Course Statistics</h1>
             <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">{course.status}</Badge>
          </div>
          <p>Overview of student performance in {course.title}</p>
        </div>
      </section>

      <section className={styles.dashboardMain}>
        <div className="space-y-6 w-full max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <h3 className="text-2xl font-bold text-slate-900">{course.studentCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Lessons</p>
              <h3 className="text-2xl font-bold text-slate-900">{course.lessonCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Completion</p>
              <h3 className="text-2xl font-bold text-slate-900">{course.completionRate || 0}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Duration</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {Math.floor(course.sections.reduce((acc, sec) => acc + sec.lessons.reduce((lAcc, l) => lAcc + l.duration, 0), 0) / 60)}h
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
             <CardTitle>Lessons Needing Attention</CardTitle>
             <CardDescription>Lessons with the highest percentage of students not completing them.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incompleteLessons.map((lesson, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50">
                  <div>
                    <h4 className="font-medium text-slate-900">{lesson.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{lesson.sectionTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {lesson.incompleteRate}% incomplete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle>Student Engagement</CardTitle>
             <CardDescription>Recent activity summary.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-blue-500 mb-4 animate-pulse"></div>
              <p className="text-sm text-slate-500">More detailed analytics will be available once more students complete the course.</p>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

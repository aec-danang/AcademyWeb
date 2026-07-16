"use client";

import Link from "next/link";
import { BookOpen, Users, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  user: { name: string | null };
  classCount: number;
  studentCount: number;
  assignmentCount: number;
};

export function AnimatedDashboard({ user, classCount, studentCount, assignmentCount }: Props) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user.name || "Teacher"}
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s a quick overview of your teaching activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Classes</p>
              <p className="text-2xl font-bold">{classCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Students</p>
              <p className="text-2xl font-bold">{studentCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assignments</p>
              <p className="text-2xl font-bold">{assignmentCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/elearning/classrooms"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Manage Classrooms
        </Link>
        <Link
          href="/elearning/scores"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Grade Submissions
        </Link>
      </div>
    </div>
  );
}

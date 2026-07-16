import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, FileText, CheckSquare } from "lucide-react";



import { AnimatedDashboard } from "./AnimatedDashboard";

export async function TeacherDashboardView() {
  const user = await requireUser(["TEACHER", "ADMIN"]);

  // Fetch quick stats for the teacher
  const [classCount, studentCount, assignmentCount] = await Promise.all([
    prisma.classSection.count({
      where: { teacherId: user.id, status: "ACTIVE" },
    }),
    prisma.enrollment.count({
      where: { classSection: { teacherId: user.id }, status: "ACTIVE" },
    }),
    prisma.assignment.count({
      where: { classSection: { teacherId: user.id } },
    }),
  ]);

  return (
    <AnimatedDashboard 
      user={{ name: user.name }} 
      classCount={classCount} 
      studentCount={studentCount} 
      assignmentCount={assignmentCount} 
    />
  );
}

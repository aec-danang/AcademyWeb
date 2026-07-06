import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Trash2, AlertTriangle } from "lucide-react";
import { updateClassSectionAction, deleteClassSectionAction } from "@/lib/teacherActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export async function TeacherCourseEditView({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await requireUser(["TEACHER", "ADMIN"]);

  const classSection = await prisma.classSection.findUnique({
    where: { id: courseId },
    include: {
      course: true,
      _count: {
        select: { enrollments: true },
      },
    },
  });

  if (!classSection) {
    notFound();
  }

  // Ensure authorization
  if (user.role === "TEACHER" && classSection.teacherId !== user.id) {
    return (
      <div className="p-12 text-center text-red-500">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You do not have permission to manage this course.</p>
        <Link href="/elearning/courses">
          <Button className="mt-4">Back to My Courses</Button>
        </Link>
      </div>
    );
  }

  const updateWithId = updateClassSectionAction.bind(null, courseId);
  const deleteWithId = deleteClassSectionAction.bind(null, courseId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/elearning/courses">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy dark:text-white">
            Edit Course: {classSection.course.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {classSection.name} ({classSection.code})
          </p>
        </div>
      </div>

      <form action={updateWithId} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              Changes here will affect the global course information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="courseTitle" className="text-sm font-medium">Course Title</label>
              <Input id="courseTitle" name="courseTitle" defaultValue={classSection.course.title} required />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="courseDescription" className="text-sm font-medium">Description</label>
              <Textarea 
                id="courseDescription" 
                name="courseDescription" 
                defaultValue={classSection.course.description || ""} 
                rows={4}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="coursePublished" 
                name="coursePublished" 
                defaultChecked={classSection.course.published} 
                className="rounded border-gray-300 text-orange focus:ring-orange"
              />
              <label htmlFor="coursePublished" className="text-sm font-medium">Published (Visible to students)</label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Section Details</CardTitle>
            <CardDescription>
              Information specific to your class schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Class Name</label>
                <Input id="name" name="name" defaultValue={classSection.name} required />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select 
                  id="status" 
                  name="status" 
                  defaultValue={classSection.status}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startAt" className="text-sm font-medium">Start Date</label>
                <Input 
                  id="startAt" 
                  name="startAt" 
                  type="date" 
                  defaultValue={classSection.startAt ? classSection.startAt.toISOString().split('T')[0] : ""} 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="endAt" className="text-sm font-medium">End Date</label>
                <Input 
                  id="endAt" 
                  name="endAt" 
                  type="date" 
                  defaultValue={classSection.endAt ? classSection.endAt.toISOString().split('T')[0] : ""} 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="submit" className="bg-navy hover:bg-navy-light text-white">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this class. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Current Enrollments: <strong>{classSection._count.enrollments}</strong>
          </p>
          {classSection._count.enrollments > 0 ? (
            <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              You cannot delete this class because it has enrolled students.
            </div>
          ) : (
            <form action={deleteWithId}>
              <Button variant="destructive" type="submit" onClick={(e) => {
                if(!confirm("Are you sure you want to delete this class?")) e.preventDefault();
              }}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Class
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { requireUser } from "@/lib/session";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { createClassSectionAction } from "@/lib/teacherActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Create Course | Teacher Portal",
};

export default async function TeacherNewCoursePage() {
  await requireUser(["TEACHER", "ADMIN"]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/teacher/courses">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy dark:text-white">
            Create New Class
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Create a new course and schedule a class section for it.
          </p>
        </div>
      </div>

      <form action={createClassSectionAction} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>
              Basic information about the course curriculum.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="courseTitle" className="text-sm font-medium">Course Title</label>
              <Input id="courseTitle" name="courseTitle" placeholder="e.g., IELTS Foundation 5.0" required />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="courseDescription" className="text-sm font-medium">Description</label>
              <Textarea 
                id="courseDescription" 
                name="courseDescription" 
                placeholder="What will students learn?"
                rows={4}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="coursePublished" 
                name="coursePublished" 
                defaultChecked
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
              Information specific to this class's schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Class Name</label>
                <Input id="name" name="name" placeholder="e.g., Evening Batch A" required />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">Unique Class Code</label>
                <Input id="code" name="code" placeholder="e.g., IE5.0-A-2026" required />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <select 
                  id="status" 
                  name="status" 
                  defaultValue="ACTIVE"
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
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="endAt" className="text-sm font-medium">End Date</label>
                <Input 
                  id="endAt" 
                  name="endAt" 
                  type="date" 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="submit" className="bg-navy hover:bg-navy-light text-white">
              <Plus className="mr-2 h-4 w-4" /> Create Class
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

"use client";

import React, { useState, use } from "react";
import { ArrowLeft, Save, UploadCloud, Video, FileText, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockCourses, Course, Lesson, LessonContentType } from "../../../mock-data";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import styles from "../../../../elearning.module.css";

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const course = mockCourses.find(c => c.id === resolvedParams.courseId);
  if (!course) notFound();

  let foundLesson: Lesson | undefined;
  for (const section of course.sections) {
    const lesson = section.lessons.find(l => l.id === resolvedParams.lessonId);
    if (lesson) {
      foundLesson = lesson;
      break;
    }
  }

  if (!foundLesson) notFound();

  const [lessonData, setLessonData] = useState<Lesson>(foundLesson);
  const [activeTab, setActiveTab] = useState<"content" | "settings">("content");

  const handleSave = () => {
    // Save logic
    console.log("Saving lesson:", lessonData);
    router.push(`/elearning/teacher/courses/${course.id}/builder`);
  };

  const renderContentEditor = () => {
    switch (lessonData.type) {
      case "Video":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-10 flex flex-col items-center justify-center text-center bg-slate-50">
              <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Upload Video File</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Drag and drop your MP4 or WebM file here</p>
              <Button variant="outline">Browse Files</Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-sm text-slate-400 font-medium">OR Embed from URL</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>
            <div className="space-y-2">
              <Label>YouTube or Vimeo URL</Label>
              <Input 
                value={lessonData.contentUrl || ""} 
                onChange={(e) => setLessonData({...lessonData, contentUrl: e.target.value})}
                placeholder="https://www.youtube.com/watch?v=..." 
              />
            </div>
          </div>
        );
      case "PDF":
      case "Slide":
        return (
          <div className="space-y-4">
             <div className="border-2 border-dashed border-slate-200 rounded-lg p-10 flex flex-col items-center justify-center text-center bg-slate-50">
              <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Upload Document</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">Drag and drop your PDF or PPTX file here</p>
              <Button variant="outline">Browse Files</Button>
            </div>
          </div>
        );
      case "Text":
        return (
          <div className="space-y-2">
            <Label>Rich Text Content</Label>
            {/* Mock Rich Text Editor using Textarea for now */}
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1">
                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0 font-bold">B</Button>
                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0 italic">I</Button>
                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0 underline">U</Button>
                 <div className="w-px h-6 bg-slate-200 my-auto mx-1"></div>
                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><LinkIcon className="h-4 w-4" /></Button>
              </div>
              <Textarea 
                value={lessonData.textContent || ""} 
                onChange={(e) => setLessonData({...lessonData, textContent: e.target.value})}
                className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 resize-none p-4"
                placeholder="Write your lesson content here..."
              />
            </div>
          </div>
        );
      case "External Link":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>External URL</Label>
              <Input 
                value={lessonData.contentUrl || ""} 
                onChange={(e) => setLessonData({...lessonData, contentUrl: e.target.value})}
                placeholder="https://..." 
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex gap-3 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>Students will be redirected to this link when they open the lesson. We recommend making sure the link opens in a new tab if it's outside of your organization.</p>
            </div>
          </div>
        );
      default:
        return <div>Select a content type</div>;
    }
  };

  return (
    <div className={styles.dashboardShell}>
      <section className={styles.dashboardHero}>
        <div className={styles.dashboardHeroCopy}>
          <span className={styles.cockpitEyebrow}>
            <Link href={`/elearning/teacher/courses/${course.id}/builder`} style={{ color: 'inherit', textDecoration: 'none' }}>
              <ArrowLeft size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Back to {course.title}
            </Link>
          </span>
          <h1>{lessonData.title}</h1>
          <p>Configure your lesson content and settings.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Lesson
          </Button>
        </div>
      </section>

      <section className={styles.dashboardMain}>
        <div className="flex border-b border-slate-200 mb-6 px-6">
          <button
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "content" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("content")}
          >
            Lesson Content
          </button>
          <button
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "settings" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>

        <div className="px-6 pb-6 w-full max-w-4xl">
        {activeTab === "content" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Type</CardTitle>
              <CardDescription>Select the primary media format for this lesson.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={lessonData.type} 
                onValueChange={(val: LessonContentType) => setLessonData({...lessonData, type: val})}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Slide">Presentation / Slide</SelectItem>
                  <SelectItem value="Text">Rich Text Article</SelectItem>
                  <SelectItem value="Exercise">Exercise / Quiz</SelectItem>
                  <SelectItem value="External Link">External Link</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Editor</CardTitle>
            </CardHeader>
            <CardContent>
              {renderContentEditor()}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "settings" && (
        <Card>
          <CardHeader>
            <CardTitle>Lesson Settings</CardTitle>
            <CardDescription>Configure how this lesson behaves in the course.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <Label>Lesson Title</Label>
                <Input 
                  value={lessonData.title} 
                  onChange={(e) => setLessonData({...lessonData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={lessonData.description} 
                  onChange={(e) => setLessonData({...lessonData, description: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Duration (minutes)</Label>
                <Input 
                  type="number" 
                  value={lessonData.duration} 
                  onChange={(e) => setLessonData({...lessonData, duration: parseInt(e.target.value) || 0})}
                  className="w-32"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-6">
              <div className="flex items-center justify-between max-w-2xl">
                <div className="space-y-0.5">
                  <Label>Free Preview</Label>
                  <p className="text-sm text-slate-500">Allow users to view this lesson without purchasing the course.</p>
                </div>
                <Switch 
                  checked={lessonData.isPreview}
                  onCheckedChange={(checked: boolean) => setLessonData({...lessonData, isPreview: checked})}
                />
              </div>
              <div className="flex items-center justify-between max-w-2xl">
                <div className="space-y-0.5">
                  <Label>Required Completion</Label>
                  <p className="text-sm text-slate-500">Students must complete this lesson before moving to the next one.</p>
                </div>
                <Switch 
                  checked={lessonData.isRequired}
                  onCheckedChange={(checked: boolean) => setLessonData({...lessonData, isRequired: checked})}
                />
              </div>
              <div className="flex items-center justify-between max-w-2xl">
                <div className="space-y-0.5">
                  <Label>Mark as Introduction</Label>
                  <p className="text-sm text-slate-500">Highlight this lesson as the starting point of the section.</p>
                </div>
                <Switch 
                  checked={lessonData.isIntroduction}
                  onCheckedChange={(checked: boolean) => setLessonData({...lessonData, isIntroduction: checked})}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        )}
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ImagePlus, Save, ArrowLeft, BookOpen, Layers, Target, Languages } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/image-upload";
import { Course } from "../mock-data";
import styles from "../../../elearning.module.css";

interface CourseFormProps {
  initialData?: Course;
  isEditing?: boolean;
}

export default function CourseForm({ initialData, isEditing = false }: CourseFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    level: initialData?.level || "",
    language: initialData?.language || "",
    thumbnail: initialData?.thumbnail || "",
    coverImage: initialData?.coverImage || "",
    tags: initialData?.tags?.join(", ") || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save logic would go here
    console.log("Saving course:", formData);
    // After save, redirect back or to builder
    if (isEditing && initialData) {
      router.push(`/elearning/teacher/courses/${initialData.id}/builder`);
    } else {
      router.push(`/elearning/teacher/courses`);
    }
  };

  return (
    <div className={styles.dashboardShell}>
      <section className={styles.dashboardHero}>
        <div className={styles.dashboardHeroCopy}>
          <span className={styles.cockpitEyebrow}><BookOpen size={16} /> Course Management</span>
          <h1>{isEditing ? "Edit Course" : "Create New Course"}</h1>
          <p>{isEditing ? "Update your course information." : "Fill in the details to start building your new course."}</p>
        </div>
      </section>

      <section className={styles.dashboardMain}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>The core details of your course.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Course Title</label>
                <Input 
                  name="title"
                  placeholder="e.g. Advanced JavaScript Concepts" 
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <Textarea 
                  name="description"
                  placeholder="What will students learn in this course?" 
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorization</CardTitle>
              <CardDescription>Help students find your course.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-400" />
                  Category
                </label>
                <Input 
                  name="category"
                  placeholder="e.g. Web Development" 
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-400" />
                  Level
                </label>
                <Select value={formData.level} onValueChange={(val) => handleSelectChange("level", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="All Levels">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Languages className="h-4 w-4 text-slate-400" />
                  Language
                </label>
                <Select value={formData.language} onValueChange={(val) => handleSelectChange("language", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  Tags
                </label>
                <Input 
                  name="tags"
                  placeholder="e.g. react, frontend, ui (comma separated)" 
                  value={formData.tags}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Visuals to represent your course.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Course Thumbnail</label>
                <ImageUpload 
                  value={formData.thumbnail}
                  onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                />
                <p className="text-xs text-slate-500 mt-1">Recommended: 1280x720</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Cover Image</label>
                <ImageUpload 
                  value={formData.coverImage}
                  onChange={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={handleSave}>
            <Save className="mr-2 h-5 w-5" />
            {isEditing ? "Save Changes" : "Create & Continue"}
          </Button>
          
          {isEditing && (
             <Link href={`/elearning/teacher/courses/${initialData?.id}/builder`} className="block mt-4">
               <Button variant="outline" className="w-full">
                  Go to Course Builder
               </Button>
             </Link>
          )}
        </div>
        </div>
      </section>
    </div>
  );
}

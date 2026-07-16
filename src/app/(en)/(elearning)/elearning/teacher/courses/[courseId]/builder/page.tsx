"use client";

import React, { useState, use } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Plus, Edit2, Trash2, BookOpen, Video, FileText, Link as LinkIcon, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { mockCourses, Course, Section, Lesson } from "../../mock-data";
import { notFound } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import styles from "../../../../elearning.module.css";
import { Badge } from "@/components/ui/badge";

export default function CourseBuilderPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseData = mockCourses.find(c => c.id === resolvedParams.courseId);

  if (!courseData) {
    notFound();
  }

  const [course, setCourse] = useState<Course>(courseData);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Reordering sections
    if (type === "section") {
      const newSections = Array.from(course.sections);
      const [reorderedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, reorderedSection);
      setCourse({ ...course, sections: newSections });
      return;
    }

    // Reordering lessons within the same section
    if (source.droppableId === destination.droppableId) {
      const sectionIndex = course.sections.findIndex(s => s.id === source.droppableId);
      const newSections = [...course.sections];
      const section = newSections[sectionIndex];
      const newLessons = Array.from(section.lessons);
      const [reorderedLesson] = newLessons.splice(source.index, 1);
      newLessons.splice(destination.index, 0, reorderedLesson);
      
      newSections[sectionIndex] = { ...section, lessons: newLessons };
      setCourse({ ...course, sections: newSections });
      return;
    }

    // Reordering lessons across different sections
    const sourceSectionIndex = course.sections.findIndex(s => s.id === source.droppableId);
    const destSectionIndex = course.sections.findIndex(s => s.id === destination.droppableId);
    
    const newSections = [...course.sections];
    const sourceSection = newSections[sourceSectionIndex];
    const destSection = newSections[destSectionIndex];
    
    const sourceLessons = Array.from(sourceSection.lessons);
    const destLessons = Array.from(destSection.lessons);
    
    const [movedLesson] = sourceLessons.splice(source.index, 1);
    destLessons.splice(destination.index, 0, movedLesson);
    
    newSections[sourceSectionIndex] = { ...sourceSection, lessons: sourceLessons };
    newSections[destSectionIndex] = { ...destSection, lessons: destLessons };
    
    setCourse({ ...course, sections: newSections });
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Video className="h-4 w-4 text-blue-500" />;
      case 'PDF': return <FileText className="h-4 w-4 text-red-500" />;
      case 'Text': return <FileText className="h-4 w-4 text-slate-500" />;
      case 'External Link': return <LinkIcon className="h-4 w-4 text-green-500" />;
      default: return <BookOpen className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className={styles.dashboardShell}>
      <section className={styles.dashboardHero}>
        <div className={styles.dashboardHeroCopy}>
          <span className={styles.cockpitEyebrow}><BookOpen size={16} /> Course Builder</span>
          <h1>{course.title}</h1>
          <p>Organize your sections and lessons.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Select defaultValue={course.status}>
            <SelectTrigger className="w-[140px] bg-white border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Review">Review</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-white">Preview</Button>
          <Button>Save</Button>
        </div>
      </section>

      <section className={styles.dashboardMain}>
        <div className={`${styles.dashboardPanel} w-full`}>
          <div className={styles.dashboardPanelHeader}>
            <div>
              <span className={styles.cockpitEyebrow}><BookOpen size={16} /> Curriculum</span>
              <h2>Course Structure</h2>
            </div>
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="section">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="space-y-4"
              >
                {course.sections.map((section, sectionIndex) => (
                  <Draggable key={section.id} draggableId={section.id} index={sectionIndex}>
                    {(provided, snapshot) => (
                      <Card 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={provided.draggableProps.style as React.CSSProperties}
                        className={`border border-slate-200 shadow-sm ${snapshot.isDragging ? 'shadow-md border-blue-200 bg-blue-50/10' : ''}`}
                      >
                        <CardHeader className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                          <div className="flex items-center gap-3">
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded text-slate-400"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-medium">
                              Section {sectionIndex + 1}: {section.title}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-4 bg-white">
                          <Droppable droppableId={section.id} type="lesson">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`space-y-2 min-h-[50px] p-2 rounded-lg transition-colors ${
                                  snapshot.isDraggingOver ? 'bg-slate-50 border-2 border-dashed border-slate-200' : ''
                                }`}
                              >
                                {section.lessons.map((lesson, lessonIndex) => (
                                  <Draggable key={lesson.id} draggableId={lesson.id} index={lessonIndex}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        style={provided.draggableProps.style as React.CSSProperties}
                                        className={`flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-blue-200 transition-colors ${
                                          snapshot.isDragging ? 'shadow-md ring-1 ring-blue-400' : ''
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div 
                                            {...provided.dragHandleProps}
                                            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
                                          >
                                            <GripVertical className="h-4 w-4" />
                                          </div>
                                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100">
                                            {getLessonIcon(lesson.type)}
                                          </div>
                                          <div>
                                            <div className="font-medium text-sm text-slate-800">{lesson.title}</div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                              <span>{lesson.type}</span>
                                              <span>•</span>
                                              <span>{lesson.duration} min</span>
                                              {lesson.isPreview && (
                                                <>
                                                  <span>•</span>
                                                  <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-50 text-green-700 border-green-200">Free Preview</Badge>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Link href={`/elearning/teacher/courses/${course.id}/lessons/${lesson.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                                              <Settings className="h-4 w-4" />
                                            </Button>
                                          </Link>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                          
                          <div className="mt-2 pl-2">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Plus className="h-4 w-4 mr-1" />
                              Add Lesson
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        </div>
      </section>
    </div>
  );
}

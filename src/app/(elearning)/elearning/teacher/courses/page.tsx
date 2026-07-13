"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Filter, MoreVertical, Copy, Archive, Settings2, 
  LayoutGrid, BookOpen, Users, ArrowRight, Clock, LayoutDashboard 
} from "lucide-react";
import Link from "next/link";
import { mockCourses, Course } from "./mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "../../elearning.module.css";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Recently Updated");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate network loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredAndSortedCourses = courses
    .filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "Name":
          return a.title.localeCompare(b.title);
        case "Students":
          return b.studentCount - a.studentCount;
        case "Lessons":
          return b.lessonCount - a.lessonCount;
        case "Recently Updated":
        default:
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published": 
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none shadow-sm font-semibold rounded-md">🟢 Published</Badge>;
      case "Review": 
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none shadow-sm font-semibold rounded-md">🟡 Review</Badge>;
      case "Draft": 
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-200 border-none shadow-sm font-semibold rounded-md">⚪ Draft</Badge>;
      case "Archived": 
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none shadow-sm font-semibold rounded-md">⚫ Archived</Badge>;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  // Stats for Hero
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.status === "Published").length;
  const draftCourses = courses.filter(c => c.status === "Draft").length;
  const totalStudents = courses.reduce((acc, curr) => acc + curr.studentCount, 0);

  return (
    <div className={styles.dashboardShell}>
      {/* 1. Compact Hero Section */}
      <section className="bg-white border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6" style={{ borderRadius: 'var(--radius-lg)' }}>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
            <LayoutDashboard size={16} /> Course Management
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-navy)' }}>Manage your courses</h1>
          <p className="text-slate-500 text-sm">Create, edit, and organize your curriculums efficiently.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 lg:border-l lg:pl-6 border-slate-100">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total</span>
            <span className="text-2xl font-black leading-none" style={{ color: 'var(--color-navy)' }}>{totalCourses}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Published</span>
            <span className="text-2xl font-black leading-none" style={{ color: 'var(--color-navy)' }}>{publishedCourses}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Drafts</span>
            <span className="text-2xl font-black leading-none" style={{ color: 'var(--color-navy)' }}>{draftCourses}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-primary text-[10px] font-bold uppercase tracking-wider">Students</span>
            <span className="text-2xl font-black leading-none" style={{ color: 'var(--color-navy)' }}>{totalStudents}</span>
          </div>
          
          <Link href="/elearning/teacher/courses/create">
            <Button className="ml-2 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. Consolidated Toolbars */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 border border-slate-200 shadow-sm" style={{ borderRadius: 'var(--radius-md)' }}>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search courses by title..."
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Recently Updated">Recently Updated</SelectItem>
              <SelectItem value="Name">Name (A-Z)</SelectItem>
              <SelectItem value="Students">Most Students</SelectItem>
              <SelectItem value="Lessons">Most Lessons</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* 3. Responsive Data Grids */}
      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white border border-slate-200 overflow-hidden shadow-sm" style={{ borderRadius: 'var(--radius-md)' }}>
                <Skeleton className="h-40 w-full rounded-none" />
                <div className="p-5 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-4 pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedCourses.length === 0 ? (
          /* 5. Inline Empty States */
          <div className="bg-white border border-slate-200 border-dashed flex flex-col items-center justify-center p-16 text-center shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <BookOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-navy)' }}>No courses found</h3>
            <p className="text-slate-500 mb-6 max-w-sm text-sm">You haven't created any courses that match your filters. Start building your curriculum today.</p>
            <Link href="/elearning/teacher/courses/create">
              <Button className="shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Create your first course
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAndSortedCourses.map((course) => (
              /* 4. Action-Oriented Cards */
              <div key={course.id} className="group relative bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col h-full" style={{ borderRadius: 'var(--radius-md)' }}>
                
                {/* Actions Menu */}
                <div className="absolute top-3 right-3 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-md bg-white/95 backdrop-blur shadow-sm hover:bg-white text-slate-700 border border-slate-200">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48" style={{ borderRadius: 'var(--radius-sm)' }}>
                      <Link href={`/elearning/teacher/courses/${course.id}/builder`}>
                        <DropdownMenuItem className="cursor-pointer">
                          <LayoutGrid className="mr-2 h-4 w-4" /> Open Course Builder
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/elearning/teacher/courses/${course.id}/edit`}>
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings2 className="mr-2 h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                        <Archive className="mr-2 h-4 w-4" /> Archive Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link href={`/elearning/teacher/courses/${course.id}/builder`} className="block relative h-40 w-full overflow-hidden bg-slate-100 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {getStatusBadge(course.status)}
                  </div>
                </Link>

                <div className="p-5 flex flex-col flex-1">
                  <Link href={`/elearning/teacher/courses/${course.id}/builder`} className="hover:text-primary transition-colors">
                    <h3 className="font-bold text-[1.05rem] line-clamp-1 mb-1 leading-tight" style={{ color: 'var(--color-navy)' }}>{course.title}</h3>
                  </Link>
                  <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-1 leading-relaxed">{course.description}</p>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] text-slate-600 mb-4 bg-slate-50 p-3 border border-slate-100" style={{ borderRadius: 'var(--radius-sm)' }}>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Users className="h-3.5 w-3.5 text-primary" /> {course.studentCount} Students
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <BookOpen className="h-3.5 w-3.5 text-primary" /> {course.lessonCount} Lessons
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5 text-slate-400 mt-1">
                      <Clock className="h-3 w-3" /> Updated {formatDate(course.lastUpdated)}
                    </div>
                  </div>

                  {course.completionRate !== undefined && (
                    <div className="mb-5">
                      <div className="flex justify-between items-center text-[11px] mb-1.5">
                        <span className="text-slate-500 font-medium">Avg. Completion</span>
                        <span className="font-bold text-slate-700">{course.completionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 overflow-hidden" style={{ borderRadius: 'var(--radius-pill)' }}>
                        <div 
                          className="bg-primary h-1.5 transition-all duration-1000 ease-out" 
                          style={{ width: `${course.completionRate}%`, borderRadius: 'var(--radius-pill)' }} 
                        />
                      </div>
                    </div>
                  )}

                  <Link href={`/elearning/teacher/courses/${course.id}/builder`} className="mt-auto block">
                    <Button variant="outline" className="w-full bg-white group-hover:bg-primary/5 group-hover:border-primary/30 group-hover:text-primary transition-colors text-xs font-semibold h-9" style={{ borderRadius: 'var(--radius-sm)' }}>
                      Manage Course <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

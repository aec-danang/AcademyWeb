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
import styles from "../../elearning.module.css";

// --- Sub-Components ---

function CourseHero({ courses }: { courses: Course[] }) {
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.status === "Published").length;
  const draftCourses = courses.filter(c => c.status === "Draft").length;
  const totalStudents = courses.reduce((acc, curr) => acc + curr.studentCount, 0);

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
          <LayoutDashboard size={16} aria-hidden="true" /> Course Management
        </div>
        <h1 className="text-2xl font-bold mb-1 text-slate-900">Manage your courses</h1>
        <p className="text-slate-500 text-sm">Create, edit, and organize your curriculums efficiently.</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-6 lg:border-l lg:pl-6 border-slate-100" role="group" aria-label="Course statistics">
        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total</span>
          <span className="text-2xl font-black leading-none text-slate-800">{totalCourses}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Published</span>
          <span className="text-2xl font-black leading-none text-slate-800">{publishedCourses}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Drafts</span>
          <span className="text-2xl font-black leading-none text-slate-800">{draftCourses}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-primary text-[10px] font-bold uppercase tracking-wider">Students</span>
          <span className="text-2xl font-black leading-none text-slate-800">{totalStudents}</span>
        </div>
        
        <Link href="/elearning/teacher/courses/create" passHref legacyBehavior>
          <Button className="ml-2 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Create Course
          </Button>
        </Link>
      </div>
    </section>
  );
}

function CourseToolbar({ 
  searchQuery, setSearchQuery, 
  statusFilter, setStatusFilter, 
  sortOption, setSortOption 
}: {
  searchQuery: string; setSearchQuery: (val: string) => void;
  statusFilter: string; setStatusFilter: (val: string) => void;
  sortOption: string; setSortOption: (val: string) => void;
}) {
  return (
    <section className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 border border-slate-200 shadow-sm rounded-2xl" aria-label="Course filters">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
        <Input
          type="search"
          aria-label="Search courses by title"
          placeholder="Search courses by title..."
          className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex w-full md:w-auto items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200" aria-label={`Filter by status. Current: ${statusFilter}`}>
            <Filter className="w-4 h-4 mr-2 text-slate-400" aria-hidden="true" />
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
          <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200" aria-label={`Sort courses. Current: ${sortOption}`}>
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
  );
}

function CourseSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-busy="true" aria-label="Loading courses">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 overflow-hidden shadow-sm rounded-2xl animate-pulse">
          <div className="h-40 w-full bg-slate-200" />
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-5 bg-slate-200 rounded w-16" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-5/6" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="h-8 bg-slate-100 rounded" />
              <div className="h-8 bg-slate-100 rounded" />
            </div>
            <div className="mt-4 h-9 bg-slate-100 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CourseEmptyState() {
  return (
    <div role="status" className="bg-white border border-slate-200 border-dashed flex flex-col items-center justify-center p-16 text-center shadow-sm rounded-3xl">
      <div className="bg-slate-50 p-4 rounded-full mb-4" aria-hidden="true">
        <BookOpen className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold mb-1 text-slate-900">No courses found</h3>
      <p className="text-slate-500 mb-6 max-w-sm text-sm">We couldn't find any courses matching your criteria. Try adjusting your filters or create a new one.</p>
      <Link href="/elearning/teacher/courses/create" passHref legacyBehavior>
        <Button className="shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Create your first course
        </Button>
      </Link>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published": 
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none shadow-sm font-semibold rounded-lg">🟢 Published</Badge>;
      case "Review": 
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none shadow-sm font-semibold rounded-lg">🟡 Review</Badge>;
      case "Draft": 
        return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-200 border-none shadow-sm font-semibold rounded-lg">⚪ Draft</Badge>;
      case "Archived": 
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-none shadow-sm font-semibold rounded-lg">⚫ Archived</Badge>;
      default: return null;
    }
  };

  return (
    <div className="group relative bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col h-full rounded-2xl focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      
      {/* Actions Menu */}
      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" aria-label={`Course actions for ${course.title}`} className="h-8 w-8 rounded-lg bg-white/95 backdrop-blur shadow-sm hover:bg-white text-slate-700 border border-slate-200">
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <Link href={`/elearning/teacher/courses/${course.id}/builder`} passHref legacyBehavior>
              <DropdownMenuItem className="cursor-pointer focus:bg-slate-100 focus:text-slate-900 rounded-lg">
                <LayoutGrid className="mr-2 h-4 w-4" aria-hidden="true" /> Open Course Builder
              </DropdownMenuItem>
            </Link>
            <Link href={`/elearning/teacher/courses/${course.id}/edit`} passHref legacyBehavior>
              <DropdownMenuItem className="cursor-pointer focus:bg-slate-100 focus:text-slate-900 rounded-lg">
                <Settings2 className="mr-2 h-4 w-4" aria-hidden="true" /> Edit Details
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer focus:bg-slate-100 focus:text-slate-900 rounded-lg">
              <Copy className="mr-2 h-4 w-4" aria-hidden="true" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg cursor-pointer">
              <Archive className="mr-2 h-4 w-4" aria-hidden="true" /> Archive Course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/elearning/teacher/courses/${course.id}/builder`} className="block relative h-40 w-full overflow-hidden bg-slate-100 flex-shrink-0 outline-none" aria-hidden="true" tabIndex={-1}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={course.thumbnail} 
          alt="" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute bottom-3 left-3 flex gap-2">
          {getStatusBadge(course.status)}
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link href={`/elearning/teacher/courses/${course.id}/builder`} className="hover:text-primary transition-colors outline-none" aria-label={`Manage course: ${course.title}`}>
          <h3 className="font-bold text-[1.05rem] text-slate-900 line-clamp-1 mb-1 leading-tight">{course.title}</h3>
        </Link>
        <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-1 leading-relaxed">{course.description}</p>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] text-slate-600 mb-4 bg-slate-50 p-3 border border-slate-100 rounded-lg" aria-label="Course statistics">
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> 
            <span><span className="sr-only">Students enrolled: </span>{course.studentCount} Students</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <BookOpen className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> 
            <span><span className="sr-only">Total lessons: </span>{course.lessonCount} Lessons</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 text-slate-400 mt-1">
            <Clock className="h-3 w-3" aria-hidden="true" /> 
            <span><span className="sr-only">Last updated on </span>Updated {formatDate(course.lastUpdated)}</span>
          </div>
        </div>

        {course.completionRate !== undefined && (
          <div className="mb-5" aria-label={`Average completion rate: ${course.completionRate} percent`}>
            <div className="flex justify-between items-center text-[11px] mb-1.5" aria-hidden="true">
              <span className="text-slate-500 font-medium">Avg. Completion</span>
              <span className="font-bold text-slate-700">{course.completionRate}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 overflow-hidden rounded-full">
              <div 
                className="bg-primary h-1.5 transition-all duration-1000 ease-out rounded-full" 
                style={{ width: `${course.completionRate}%` }} 
              />
            </div>
          </div>
        )}

        <Link href={`/elearning/teacher/courses/${course.id}/builder`} passHref legacyBehavior>
          <Button variant="outline" className="w-full bg-white group-hover:bg-primary/5 group-hover:border-primary/30 group-hover:text-primary transition-colors text-xs font-semibold h-9 rounded-lg mt-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            Manage Course <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Recently Updated");
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className={styles.dashboardShell}>
      <CourseHero courses={courses} />
      
      <CourseToolbar 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        sortOption={sortOption} setSortOption={setSortOption}
      />

      <section>
        {isLoading ? (
          <CourseSkeleton />
        ) : filteredAndSortedCourses.length === 0 ? (
          <CourseEmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAndSortedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

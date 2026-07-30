"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Filter,
  Search
} from "lucide-react";

type AssignmentWithStatus = {
  id: string;
  title: string;
  classCode: string;
  className: string;
  dueAt: Date | null;
  status: 'PENDING' | 'LATE' | 'SUBMITTED' | 'GRADED';
  submissionId?: string;
  gradeScore?: number;
  maxScore?: number;
  submittedAt?: Date;
};

export default function StudentAssignmentsList({ assignments }: { assignments: AssignmentWithStatus[] }) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'LATE' | 'SUBMITTED' | 'GRADED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssignments = assignments.filter(a => {
    if (a.status !== activeTab) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const tabCounts = {
    PENDING: assignments.filter(a => a.status === 'PENDING').length,
    LATE: assignments.filter(a => a.status === 'LATE').length,
    SUBMITTED: assignments.filter(a => a.status === 'SUBMITTED').length,
    GRADED: assignments.filter(a => a.status === 'GRADED').length,
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Assignments</h1>
          <p className="text-slate-500 mt-1">Manage your homework and track your progress.</p>
        </div>
      </div>

      {/* Controls: Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 gap-4">
        <div className="flex w-full md:w-auto overflow-x-auto hide-scrollbar gap-1 p-1">
          <TabButton 
            label="Pending" 
            count={tabCounts.PENDING} 
            active={activeTab === 'PENDING'} 
            onClick={() => setActiveTab('PENDING')} 
            icon={<Clock size={16} className={activeTab === 'PENDING' ? 'text-blue-500' : 'text-slate-400'} />}
          />
          <TabButton 
            label="Late" 
            count={tabCounts.LATE} 
            active={activeTab === 'LATE'} 
            onClick={() => setActiveTab('LATE')} 
            icon={<AlertTriangle size={16} className={activeTab === 'LATE' ? 'text-red-500' : 'text-slate-400'} />}
          />
          <TabButton 
            label="Submitted" 
            count={tabCounts.SUBMITTED} 
            active={activeTab === 'SUBMITTED'} 
            onClick={() => setActiveTab('SUBMITTED')} 
            icon={<FileText size={16} className={activeTab === 'SUBMITTED' ? 'text-amber-500' : 'text-slate-400'} />}
          />
          <TabButton 
            label="Graded" 
            count={tabCounts.GRADED} 
            active={activeTab === 'GRADED'} 
            onClick={() => setActiveTab('GRADED')} 
            icon={<CheckCircle2 size={16} className={activeTab === 'GRADED' ? 'text-emerald-500' : 'text-slate-400'} />}
          />
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search assignments..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map(assignment => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No assignments found</h3>
            <p className="text-slate-500 max-w-sm">
              You don't have any {activeTab.toLowerCase()} assignments matching your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, count, active, onClick, icon }: { label: string, count: number, active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active 
          ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        active ? 'bg-slate-100 text-slate-900' : 'bg-slate-100 text-slate-500'
      }`}>
        {count}
      </span>
    </button>
  );
}

function AssignmentCard({ assignment }: { assignment: AssignmentWithStatus }) {
  const isPending = assignment.status === 'PENDING';
  const isLate = assignment.status === 'LATE';
  const isSubmitted = assignment.status === 'SUBMITTED';
  const isGraded = assignment.status === 'GRADED';

  let statusColor = "bg-blue-50 text-blue-700 border-blue-100";
  if (isLate) statusColor = "bg-red-50 text-red-700 border-red-100";
  if (isSubmitted) statusColor = "bg-amber-50 text-amber-700 border-amber-100";
  if (isGraded) statusColor = "bg-emerald-50 text-emerald-700 border-emerald-100";

  const href = assignment.submissionId 
    ? `/elearning/scores/${assignment.submissionId}`
    : `/elearning/assignments/${assignment.id}`;

  return (
    <Link href={href} className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group">
      <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border ${statusColor} shrink-0 mt-1 md:mt-0`}>
            {isPending && <Clock size={24} />}
            {isLate && <AlertTriangle size={24} />}
            {isSubmitted && <FileText size={24} />}
            {isGraded && <CheckCircle2 size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {assignment.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {assignment.classCode}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {assignment.dueAt ? `Due ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(assignment.dueAt))}` : "No deadline"}
              </span>
              {assignment.submittedAt && (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Submitted {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(assignment.submittedAt))}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 mt-2 md:mt-0">
          {isGraded && assignment.gradeScore !== undefined && (
            <div className="mr-6 text-right">
              <span className="text-xs text-slate-500 block mb-0.5">Score</span>
              <span className="text-xl font-bold text-slate-900">
                {assignment.gradeScore}/{assignment.maxScore || 10}
              </span>
            </div>
          )}
          
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            isPending || isLate 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}>
            {(isPending || isLate) ? "Start Assignment" : "View Details"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}

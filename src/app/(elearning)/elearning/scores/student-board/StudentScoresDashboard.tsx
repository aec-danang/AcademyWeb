"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { 
  Award,
  BookOpen,
  FileText,
  TrendingUp,
  Search,
  MessageSquare,
  Bot,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ListChecks,
  AlertCircle
} from "lucide-react";

type AiRubricRow = {
  criterion: string;
  score: number;
  maxScore?: number;
  comment: string;
};

type GradeItem = {
  id: string;
  createdAt: Date;
  score: number | null;
  status: string;
  feedback: string | null;
  teacherName: string;
  type: 'ASSIGNMENT' | 'QUIZ';
  assignment?: {
    id: string;
    title: string;
    skill: string;
    maxScore: number;
    cefrLevel: string | null;
    className: string;
  };
  quiz?: {
    id: string;
    title: string;
    className: string;
  };
  aiFeedback?: string | null;
  aiRubric?: AiRubricRow[];
};

export default function StudentScoresDashboard({ grades }: { grades: GradeItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'ALL' | 'ASSIGNMENT' | 'QUIZ'>('ALL');

  const publishedGrades = grades.filter(g => g.status === "PUBLISHED" && g.score !== null);
  
  const filteredGrades = publishedGrades.filter(g => {
    if (activeTab !== 'ALL' && g.type !== activeTab) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = g.type === 'ASSIGNMENT' ? g.assignment?.title : g.quiz?.title;
      const className = g.type === 'ASSIGNMENT' ? g.assignment?.className : g.quiz?.className;
      if (!title?.toLowerCase().includes(q) && !className?.toLowerCase().includes(q)) {
        return false;
      }
    }
    
    return true;
  });

  const averagePercentage = useMemo(() => {
    if (publishedGrades.length === 0) return 0;
    const sum = publishedGrades.reduce((acc, g) => {
      if (g.type === 'ASSIGNMENT' && g.assignment?.maxScore) {
        return acc + ((g.score || 0) / g.assignment.maxScore) * 100;
      }
      return acc + (g.score || 0); // Assuming quiz score is already out of 100 or something, wait we should just use raw if no maxScore
    }, 0);
    return sum / publishedGrades.length;
  }, [publishedGrades]);

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="text-blue-600" />
            My Scores & Feedback
          </h1>
          <p className="text-slate-500 mt-1">Review your official grades and teacher feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Average Score</div>
            <div className="text-2xl font-bold text-slate-900">{averagePercentage ? `${averagePercentage.toFixed(1)}%` : "-"}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Graded Items</div>
            <div className="text-2xl font-bold text-slate-900">{publishedGrades.length}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 gap-4">
        <div className="flex w-full md:w-auto overflow-x-auto hide-scrollbar gap-1 p-1">
          <TabButton label="All" active={activeTab === 'ALL'} onClick={() => setActiveTab('ALL')} />
          <TabButton label="Assignments" active={activeTab === 'ASSIGNMENT'} onClick={() => setActiveTab('ASSIGNMENT')} />
          <TabButton label="Quizzes" active={activeTab === 'QUIZ'} onClick={() => setActiveTab('QUIZ')} />
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search scores..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredGrades.length > 0 ? (
          filteredGrades.map(grade => (
            <ScoreCard key={grade.id} grade={grade} />
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Award className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No scores yet</h3>
            <p className="text-slate-500 max-w-sm">
              Your teachers have not published any grades matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active 
          ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-200' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );
}

function ScoreCard({ grade }: { grade: GradeItem }) {
  const [expanded, setExpanded] = useState(false);
  
  const isAssignment = grade.type === 'ASSIGNMENT' && grade.assignment;
  const title = isAssignment ? grade.assignment!.title : grade.quiz?.title || "Unknown";
  const className = isAssignment ? grade.assignment!.className : grade.quiz?.className;
  const maxScore = isAssignment ? grade.assignment!.maxScore : 100;
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
      <div 
        className="p-5 flex flex-col md:flex-row gap-4 justify-between md:items-center cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border shrink-0 ${isAssignment ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
            {isAssignment ? <FileText size={24} /> : <BookOpen size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
              <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                {className}
              </span>
              <span>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(grade.createdAt))}</span>
              {isAssignment && grade.assignment?.skill && (
                <span className="capitalize">{grade.assignment.skill.toLowerCase().replace('_', ' ')}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 justify-between md:justify-end border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-900">{grade.score}</span>
            <span className="text-slate-400 font-medium text-sm">/{maxScore}</span>
          </div>
          <button className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-md">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            
            {/* Teacher Feedback */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-3 text-sm">
                  <MessageSquare size={16} className="text-blue-500" />
                  Teacher Feedback
                </h4>
                {grade.feedback ? (
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                    {grade.feedback}
                  </p>
                ) : (
                  <p className="text-slate-400 text-sm italic">No written feedback provided.</p>
                )}
                <div className="mt-3 text-xs text-slate-500 flex items-center justify-end">
                  Graded by {grade.teacherName}
                </div>
              </div>
            </div>
            
            {/* Detailed AI Rubric */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="flex items-center gap-2 font-semibold text-slate-900 mb-3 text-sm">
                  <ListChecks size={16} className="text-indigo-500" />
                  Detailed Assessment Criteria
                </h4>
                
                {grade.aiRubric && grade.aiRubric.length > 0 ? (
                  <div className="space-y-3">
                    {grade.aiRubric.map((rubric, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-slate-800 text-sm">{rubric.criterion}</span>
                          <span className="font-bold text-indigo-700 text-sm bg-indigo-100 px-2 py-0.5 rounded">
                            {rubric.score}{rubric.maxScore ? `/${rubric.maxScore}` : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{rubric.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-slate-400 text-center">
                    <AlertCircle size={24} className="mb-2 opacity-50" />
                    <p className="text-sm">No detailed criteria breakdown available for this submission.</p>
                  </div>
                )}
                
                {/* Fallback to simple AI Feedback if no rubric */}
                {(!grade.aiRubric || grade.aiRubric.length === 0) && grade.aiFeedback && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h5 className="flex items-center gap-1.5 font-medium text-slate-700 mb-2 text-xs uppercase tracking-wider">
                      <Bot size={14} className="text-slate-400" /> AI Insights
                    </h5>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {grade.aiFeedback.replace(/```(?:\w+)?/g, "").replace(/^#{1,6}\s*/gm, "").replace(/\*\*(.*?)\*\*/g, "$1")}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
          
          {isAssignment && (
            <div className="mt-4 flex justify-end">
              <Link 
                href={`/elearning/assignments/${grade.assignment?.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                View full assignment details
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

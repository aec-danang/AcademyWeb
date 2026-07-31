"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bot, 
  Send, 
  UploadCloud, 
  Sparkles, 
  X,
  FileText,
  Clock,
  History,
  AlertTriangle,
  ListChecks,
  MessageSquareText,
  LoaderCircle,
  ShieldCheck,
  Lightbulb,
  CornerDownLeft,
  PenLine,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  CheckCircle2
} from "lucide-react";
import { submitAssignmentWithStateAction, type SubmitAssignmentState } from "@/lib/lmsActions";

type AssignmentItem = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  skill: string;
  cefrLevel: string | null;
  maxScore: number;
  rubric: string | null;
  allowLateSubmission: boolean;
  allowResubmission: boolean;
  category: string | null;
  tags: string[];
  instructions: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  dueAt: string | null;
  classroomId: string;
  classCode: string;
  courseTitle: string;
  submission: {
    id: string;
    content: string | null;
    fileUrl: string | null;
    status: string;
    submittedAt: string;
    grade: {
      status: string;
      score: number | null;
      feedback: string | null;
      aiStatus: string;
      aiScore: number | null;
      aiFeedback: string | null;
      aiConfidence: number | null;
    } | null;
  } | null;
};

function readableAiText(text: string) {
  return text.replace(/```(?:\w+)?/g, "").replace(/^#{1,6}\s*/gm, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/__(.*?)__/g, "$1").replace(/\*([^*\n]+)\*/g, "$1").replace(/^\s*[*-]\s+/gm, "• ").replace(/^>\s*/gm, "").replace(/`([^`]+)`/g, "$1").replace(/\*+/g, "").trim();
}

export default function StudentSubmissionClient({ assignment }: { assignment: AssignmentItem }) {
  const router = useRouter();
  
  const [content, setContent] = useState(assignment.submission?.content || "");
  const [fileName, setFileName] = useState(assignment.submission?.fileUrl || "");
  
  const [taskPanelOpen, setTaskPanelOpen] = useState(true);
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachMessages, setCoachMessages] = useState<Array<{ role: "student" | "coach"; content: string }>>([]);
  const [coachModel, setCoachModel] = useState("");
  const [coachError, setCoachError] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  const initialSubmitState: SubmitAssignmentState = { ok: false, message: "", assignmentId: "" };
  const [submitState, submitFormAction, submitPending] = useActionState(submitAssignmentWithStateAction, initialSubmitState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isWriting = assignment.type === "WRITING" || assignment.skill === "WRITING";
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  
  const now = Date.now();
  const deadlinePassed = Boolean(assignment.dueAt && new Date(assignment.dueAt).getTime() < now);
  const canSubmit = (!deadlinePassed || assignment.allowLateSubmission) && (!assignment.submission || assignment.submission.status === "REVISION_REQUESTED");

  const handleFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name);
  };

  const requestCoach = async (mode: "plan" | "language" | "review" | "custom", question = "") => {
    const promptLabel = mode === "plan" ? "Help me plan my answer" : mode === "language" ? "Suggest useful language" : mode === "review" ? "Review my current draft" : question.trim();
    if (!promptLabel) return;
    
    setCoachOpen(true);
    setCoachMessages((current) => [...current, { role: "student", content: promptLabel }]);
    setCoachLoading(true);
    setCoachError("");
    
    try {
      const response = await fetch("/api/elearning/writing-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: assignment.id, draft: content, mode, question }),
      });
      const result = await response.json() as { advice?: string; model?: string; error?: string };
      if (!response.ok || !result.advice) throw new Error(result.error || "The writing coach is unavailable.");
      
      setCoachMessages((current) => [...current, { role: "coach", content: readableAiText(result.advice || "") }]);
      setCoachModel(result.model || "Local AI");
      setCoachQuestion("");
    } catch (error) {
      setCoachError(error instanceof Error ? error.message : "The writing coach is unavailable.");
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <form action={submitFormAction} className="h-full w-full flex bg-slate-50 relative overflow-hidden">
      <input type="hidden" name="assignmentId" value={assignment.id} />
      <input type="hidden" name="fileUrl" value={fileName} />

      {/* Task Description Panel (Left Sidebar) */}
      {taskPanelOpen && (
        <aside className="w-80 shrink-0 border-r border-slate-200 bg-white h-full flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                <ListChecks size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Task Brief</h3>
              </div>
            </div>
            <button type="button" onClick={() => setTaskPanelOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-md transition-colors">
              <PanelLeftClose size={18} />
            </button>
          </div>
          
          <div className="p-5 space-y-6">
            <section>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Prompt</h4>
              <div className="text-sm text-slate-700 leading-relaxed space-y-2">
                {assignment.description || "No prompt provided."}
              </div>
            </section>

            {assignment.instructions && (
              <section>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Instructions</h4>
                <div className="text-sm text-slate-700 leading-relaxed bg-amber-50 border border-amber-100 p-3 rounded-lg text-amber-900">
                  {assignment.instructions}
                </div>
              </section>
            )}

            <section>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assessment Criteria</h4>
              <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-lg whitespace-pre-wrap">
                {assignment.rubric || `Complete the task clearly, organize your ideas, and use language appropriate for CEFR ${assignment.cefrLevel || "level"}.`}
              </div>
            </section>

            <div className="flex items-center gap-4 py-4 border-t border-slate-100 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs">Max Score</span>
                <span className="font-semibold text-slate-900">{assignment.maxScore} points</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs">Deadline</span>
                <span className={`font-semibold ${deadlinePassed ? 'text-red-600' : 'text-slate-900'}`}>
                  {assignment.dueAt ? new Date(assignment.dueAt).toLocaleDateString() : "No deadline"}
                </span>
              </div>
            </div>

            {assignment.attachmentUrl && (
              <a 
                href={assignment.attachmentUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors shadow-sm"
              >
                <Paperclip size={16} className="text-blue-500" /> 
                Open attached resource
              </a>
            )}
          </div>
        </aside>
      )}

      {/* Main Editor Area */}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            {!taskPanelOpen && (
              <button type="button" onClick={() => setTaskPanelOpen(true)} className="text-slate-500 hover:text-slate-900 flex items-center gap-2 text-sm font-medium border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                <PanelLeftOpen size={16} /> View Task
              </button>
            )}
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <PenLine size={18} className="text-blue-600" />
              Your Response
            </div>
          </div>

          {isWriting && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                {wordCount} words
              </span>
              <button 
                type="button" 
                onClick={() => setCoachOpen(!coachOpen)}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                  coachOpen 
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-2' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <Sparkles size={16} className={coachOpen ? "" : "animate-pulse"} />
                AI Coach
                {coachMessages.length > 0 && !coachOpen && (
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs ml-1">
                    {coachMessages.filter(m => m.role === 'coach').length}
                  </span>
                )}
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 p-6 lg:px-12 xl:px-24 max-w-5xl mx-auto w-full flex flex-col">
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your response here..."
            className="flex-1 w-full resize-none outline-none text-lg text-slate-800 placeholder:text-slate-300 bg-transparent py-4 leading-relaxed font-serif"
            spellCheck={false}
          />

          <div className="py-6 border-t border-slate-100 flex items-center justify-between mt-auto">
            <div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Paperclip size={18} />
                {fileName ? fileName : "Attach file"}
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              {submitState.message && !submitState.ok && (
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle size={14} /> {submitState.message}
                </span>
              )}
              {deadlinePassed && !assignment.allowLateSubmission && (
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle size={14} /> Deadline passed
                </span>
              )}
              
              <button 
                type="submit"
                disabled={!canSubmit || submitPending || (!content.trim() && !fileName)}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Send size={16} />
                {submitPending ? "Submitting..." : assignment.submission ? "Resubmit" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* AI Coach Drawer (Right Sidebar) */}
      {coachOpen && (
        <aside className="w-80 shrink-0 border-l border-slate-200 bg-slate-50 h-full flex flex-col shadow-2xl z-20 absolute right-0 top-0">
          <header className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">AI Coach</h3>
                <p className="text-xs text-slate-500">{coachModel || "Ready to help"}</p>
              </div>
            </div>
            <button type="button" onClick={() => setCoachOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-md transition-colors">
              <X size={18} />
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {coachMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-slate-100">
                  <Lightbulb size={32} className="text-amber-400" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Need a hint?</h4>
                <p className="text-sm leading-relaxed mb-6">
                  I can review your {wordCount} words draft, suggest better vocabulary, or help you plan your next paragraph.
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <button type="button" onClick={() => requestCoach("plan")} className="text-sm font-medium bg-white border border-slate-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-sm text-left flex items-center gap-3 transition-all">
                    <ListChecks size={16} className="text-indigo-500" /> Help me plan
                  </button>
                  <button type="button" onClick={() => requestCoach("language")} className="text-sm font-medium bg-white border border-slate-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-sm text-left flex items-center gap-3 transition-all">
                    <MessageSquareText size={16} className="text-indigo-500" /> Suggest vocabulary
                  </button>
                  <button type="button" disabled={wordCount < 20} onClick={() => requestCoach("review")} className="text-sm font-medium bg-white border border-slate-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-sm text-left flex items-center gap-3 transition-all disabled:opacity-50">
                    <Sparkles size={16} className="text-indigo-500" /> Review draft
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-xs text-center text-slate-400 flex items-center justify-center gap-1.5 py-2">
                  <ShieldCheck size={14} /> Coach reads your {wordCount}-word draft
                </div>
                {coachMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'student' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {coachLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-slate-400 text-sm shadow-sm">
                      <LoaderCircle size={14} className="animate-spin" /> Thinking...
                    </div>
                  </div>
                )}
                {coachError && (
                  <div className="bg-red-50 text-red-600 border border-red-100 rounded-lg p-3 text-sm text-center">
                    {coachError}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="relative flex items-center">
              <textarea
                value={coachQuestion}
                onChange={(e) => setCoachQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (coachQuestion.trim() && !coachLoading) requestCoach("custom", coachQuestion);
                  }
                }}
                placeholder="Ask something..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                rows={1}
              />
              <button 
                type="button" 
                disabled={!coachQuestion.trim() || coachLoading}
                onClick={() => requestCoach("custom", coachQuestion)}
                className="absolute right-2 text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <CornerDownLeft size={16} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {submitState.ok && submitState.message && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <div className="font-medium">{submitState.message}</div>
          <button type="button" onClick={() => router.push('/elearning/assignments')} className="ml-4 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
            Go to List
          </button>
        </div>
      )}
    </form>
  );
}

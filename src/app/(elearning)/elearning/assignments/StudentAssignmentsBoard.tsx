"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  CornerDownLeft,
  FileText,
  Flame,
  History,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  MessageSquareText,
  Paperclip,
  PenLine,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { submitAssignmentWithStateAction, type SubmitAssignmentState } from "@/lib/lmsActions";
import styles from "./studentAssignments.module.css";

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

type StudentAssignmentsBoardProps = {
  assignments: AssignmentItem[];
};

type WorkState = Record<string, { started: boolean; content: string; fileName: string }>;
type AssignmentStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "NEEDS_REVISION" | "OVERDUE";

const difficultyMeta = {
  EASY: { label: "Easy", color: "#10B981" },
  MEDIUM: { label: "Medium", color: "#F59E0B" },
  HARD: { label: "Hard", color: "#EF4444" },
};

const statusMeta = {
  NOT_STARTED: { label: "Not Started", color: "#06B6D4" },
  IN_PROGRESS: { label: "In Progress", color: "#F59E0B" },
  SUBMITTED: { label: "Submitted", color: "#10B981" },
  NEEDS_REVISION: { label: "Needs Revision", color: "#8B5CF6" },
  OVERDUE: { label: "Overdue", color: "#EF4444" },
};

const subjectColors = ["#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"];

function subjectColor(value: string) {
  const total = value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return subjectColors[total % subjectColors.length];
}

function statusFor(assignment: AssignmentItem, state: WorkState[string], now: number): AssignmentStatus {
  if (assignment.submission?.status === "REVISION_REQUESTED") return "NEEDS_REVISION";
  if (assignment.submission) return "SUBMITTED";
  if (assignment.dueAt && new Date(assignment.dueAt).getTime() < now) return "OVERDUE";
  if (state?.started || state?.content || state?.fileName) return "IN_PROGRESS";
  return "NOT_STARTED";
}

function timeParts(dueAt: string | null, now: number) {
  if (!dueAt) return { overdue: false, days: 0, hours: 0, minutes: 0, totalHours: Number.POSITIVE_INFINITY };
  const diff = new Date(dueAt).getTime() - now;
  const absMinutes = Math.max(0, Math.floor(Math.abs(diff) / 60000));
  return {
    overdue: diff < 0,
    days: Math.floor(absMinutes / 1440),
    hours: Math.floor((absMinutes % 1440) / 60),
    minutes: absMinutes % 60,
    totalHours: diff / 3600000,
  };
}

function countdownColor(totalHours: number, overdue: boolean) {
  if (overdue || totalHours < 24) return "#EF4444";
  if (totalHours < 72) return "#F97316";
  if (totalHours <= 168) return "#F59E0B";
  return "#10B981";
}

function formatDate(value: string | null) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusPriority(status: AssignmentStatus, assignment: AssignmentItem, now: number) {
  if (status === "OVERDUE") return 0;
  const parts = timeParts(assignment.dueAt, now);
  if (status !== "SUBMITTED" && parts.totalHours <= 72) return 1;
  if (status !== "SUBMITTED") return 2;
  return 3;
}

function previewText(text: string | null) {
  return text || "No brief has been published yet. Open the assignment for instructions and submission options.";
}

function readableAiText(text: string) {
  return text.replace(/```(?:\w+)?/g, "").replace(/^#{1,6}\s*/gm, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/__(.*?)__/g, "$1").replace(/\*([^*\n]+)\*/g, "$1").replace(/^\s*[*-]\s+/gm, "• ").replace(/^>\s*/gm, "").replace(/`([^`]+)`/g, "$1").replace(/\*+/g, "").trim();
}

function StudentEmptyState() {
  return (
    <div className={styles.emptyState}>
      <div>
        <div className={styles.emptyIllustration}>
          <FileText size={44} />
        </div>
        <h3>No assignments yet</h3>
        <p>Your teacher has not published assignments for your active classes.</p>
      </div>
    </div>
  );
}

export default function StudentAssignmentsBoard({ assignments }: StudentAssignmentsBoardProps) {
  const router = useRouter();
  const [now, setNow] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [workState, setWorkState] = useState<WorkState>({});
  const [historyOpen, setHistoryOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [taskPanelOpen, setTaskPanelOpen] = useState(true);
  const [coachQuestion, setCoachQuestion] = useState("");
  const [coachMessages, setCoachMessages] = useState<Array<{ role: "student" | "coach"; content: string }>>([]);
  const [coachModel, setCoachModel] = useState("");
  const [coachError, setCoachError] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const initialSubmitState: SubmitAssignmentState = { ok: false, message: "", assignmentId: "" };
  const [submitState, submitFormAction, submitPending] = useActionState(submitAssignmentWithStateAction, initialSubmitState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initialTick = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(timer);
    };
  }, []);

  const hasPendingAiGrade = assignments.some((assignment) => assignment.submission?.grade?.aiStatus === "PENDING");
  useEffect(() => {
    if (!hasPendingAiGrade) return;
    const refreshTimer = window.setInterval(() => router.refresh(), 3000);
    return () => window.clearInterval(refreshTimer);
  }, [hasPendingAiGrade, router]);

  const stats = useMemo(() => {
    const completed = assignments.filter((assignment) => assignment.submission).length;
    const onTime = assignments.filter((assignment) => (
      assignment.submission
      && (!assignment.dueAt || new Date(assignment.submission.submittedAt).getTime() <= new Date(assignment.dueAt).getTime())
    )).length;
    return {
      completed,
      total: assignments.length,
      onTime,
    };
  }, [assignments]);

  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => {
      const stateA = workState[a.id] || { started: false, content: "", fileName: "" };
      const stateB = workState[b.id] || { started: false, content: "", fileName: "" };
      const statusA = statusFor(a, stateA, now);
      const statusB = statusFor(b, stateB, now);
      const priorityA = statusPriority(statusA, a, now);
      const priorityB = statusPriority(statusB, b, now);
      if (priorityA !== priorityB) return priorityA - priorityB;
      const dueA = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      const dueB = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      return dueA - dueB;
    });
  }, [assignments, now, workState]);

  const nextAssignment = sortedAssignments.find((assignment) => !assignment.submission);
  const nextCountdown = timeParts(nextAssignment?.dueAt || null, now);
  const nextColor = countdownColor(nextCountdown.totalHours, nextCountdown.overdue);
  const activeAssignment = assignments.find((assignment) => assignment.id === activeId) || null;
  const activeState = activeAssignment ? workState[activeAssignment.id] || { started: false, content: activeAssignment.submission?.content || "", fileName: activeAssignment.submission?.fileUrl || "" } : null;
  const activeStatus = activeAssignment && activeState ? statusFor(activeAssignment, activeState, now) : "NOT_STARTED";
  const activeDeadlinePassed = Boolean(activeAssignment?.dueAt && new Date(activeAssignment.dueAt).getTime() < now);
  const activeSubmissionLocked = Boolean(
    activeAssignment?.submission
    && !activeAssignment.allowResubmission
    && activeAssignment.submission.status !== "REVISION_REQUESTED",
  );
  const activeCanSubmit = Boolean(activeAssignment && (!activeDeadlinePassed || activeAssignment.allowLateSubmission) && !activeSubmissionLocked);
  const activeIsWriting = Boolean(activeAssignment && (activeAssignment.type === "WRITING" || activeAssignment.skill === "WRITING"));
  const activeWordCount = activeState?.content.trim() ? activeState.content.trim().split(/\s+/).length : 0;

  const updateWork = (id: string, patch: Partial<WorkState[string]>) => {
    setWorkState((current) => ({
      ...current,
      [id]: {
        started: current[id]?.started || false,
        content: current[id]?.content || "",
        fileName: current[id]?.fileName || "",
        ...patch,
      },
    }));
  };

  const openAssignment = (assignment: AssignmentItem) => {
    setActiveId(assignment.id);
    setHistoryOpen(false);
    setCoachOpen(false);
    setCoachQuestion("");
    setCoachMessages([]);
    setCoachModel("");
    setCoachError("");
    if (!workState[assignment.id]) {
      updateWork(assignment.id, {
        content: assignment.submission?.content || "",
        fileName: assignment.submission?.fileUrl || "",
      });
    }
  };

  const handleFile = (assignmentId: string, file?: File) => {
    if (!file) return;
    updateWork(assignmentId, { started: true, fileName: file.name });
  };

  const requestCoach = async (mode: "plan" | "language" | "review" | "custom", question = "") => {
    if (!activeAssignment || !activeState) return;
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
        body: JSON.stringify({ assignmentId: activeAssignment.id, draft: activeState.content, mode, question }),
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

  const openCoach = () => {
    setTaskPanelOpen(false);
    setCoachOpen(true);
  };

  return (
    <div className={styles.board}>
      <div className={styles.hero}>
        <section className={styles.heroCard} style={{ "--countdown-color": nextColor } as CSSProperties}>
          <p className={styles.eyebrow}>Your assignments</p>
          <h1 className={styles.pageTitle}>What to work on next</h1>
          {nextAssignment ? <div className={styles.nextTaskRow}><div className={styles.nextTaskIcon}><FileText size={21} /></div><div><span>{nextCountdown.overdue ? "Needs attention" : "Next task"}</span><strong>{nextAssignment.title}</strong><small>{nextAssignment.dueAt ? `${nextCountdown.overdue ? "Overdue" : "Due"} ${formatDate(nextAssignment.dueAt)}` : "No deadline"} · {nextAssignment.classCode}</small></div><button type="button" onClick={() => openAssignment(nextAssignment)}>Open <ArrowRight size={16} /></button></div> : <div className={styles.allDoneState}><CheckCircle2 size={24} /><div><strong>You’re all caught up</strong><span>No assignment is waiting for submission.</span></div></div>}
        </section>

        <aside className={styles.celebrationCard}>
          <div className={styles.celebrationMeter}>
            <div className={styles.miniRing} style={{ "--ring": `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` } as CSSProperties}>
              <div className={styles.miniRingInner}>{stats.completed}/{stats.total}</div>
            </div>
            <div>
              <p className={styles.eyebrow}>Your progress</p>
              <h3 style={{ margin: 0 }}>{stats.completed} of {stats.total} completed</h3>
            </div>
          </div>
          <div className={styles.streakPill}>
            <Flame size={15} /> {Math.max(stats.onTime, 0)} submitted on time
          </div>
        </aside>
      </div>

      {assignments.length === 0 ? (
        <StudentEmptyState />
      ) : (
        <div className={styles.grid}>
          {sortedAssignments.map((assignment) => {
            const state = workState[assignment.id] || { started: false, content: assignment.submission?.content || "", fileName: assignment.submission?.fileUrl || "" };
            const status = statusFor(assignment, state, now);
            const due = timeParts(assignment.dueAt, now);
            const accent = statusMeta[status].color;
            const countdown = countdownColor(due.totalHours, due.overdue);
            const overdueDays = due.overdue ? Math.max(1, due.days || Math.ceil(Math.abs(due.totalHours) / 24)) : 0;

            return (
              <article
                key={assignment.id}
                className={`${styles.assignmentCard} ${status === "SUBMITTED" ? `${styles.cardMuted} ${styles.cardCompleted}` : styles.cardPending} ${status === "OVERDUE" ? styles.cardOverdue : ""} ${status === "IN_PROGRESS" ? styles.cardInProgress : ""}`}
                style={{ "--accent": accent, "--countdown-color": countdown } as CSSProperties}
                tabIndex={0}
                role="button"
                onClick={() => openAssignment(assignment)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") openAssignment(assignment);
                }}
              >
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{assignment.title}</h2>
                  <div className={styles.badgeStack}>
                    <span className={styles.difficultyBadge} style={{ "--difficulty-color": difficultyMeta[assignment.difficulty].color } as CSSProperties}>
                      {difficultyMeta[assignment.difficulty].label}
                    </span>
                    <span className={styles.tag}>{assignment.skill.replace("_", " ")}</span>
                    {assignment.cefrLevel ? <span className={styles.tag}>{assignment.cefrLevel}</span> : null}
                  </div>
                </div>

                <div className={styles.metadataStrip}>
                  <span className={styles.dueLine}><Clock3 size={15} /> {formatDate(assignment.dueAt)}</span>
                  <span>{assignment.classCode} · {assignment.maxScore} points</span>
                </div>
                <p className={styles.description}>{previewText(assignment.description)}</p>

                <div className={styles.cardFooter}>
                  <div className={styles.statusArea}>
                    <span
                      className={`${styles.statusBadge} ${status === "NOT_STARTED" ? styles.statusPulse : ""}`}
                      style={{ "--status-color": statusMeta[status].color } as CSSProperties}
                    >
                      {status === "SUBMITTED" && <CheckCircle2 size={14} />}
                      {status === "OVERDUE" && <AlertTriangle size={14} />}
                      {statusMeta[status].label}
                    </span>
                    {status === "SUBMITTED" && assignment.submission && (
                      <small>
                        Submitted {formatDate(assignment.submission.submittedAt)}
                        {assignment.submission.grade?.aiStatus === "PENDING" ? " · AI review running" : ""}
                        {assignment.submission.grade?.aiStatus === "COMPLETED" ? " · AI feedback ready" : ""}
                      </small>
                    )}
                    {status === "OVERDUE" && <small>Past due: {overdueDays} day{overdueDays > 1 ? "s" : ""}</small>}
                  </div>
                  <button className={styles.viewLink} type="button" onClick={(event) => { event.stopPropagation(); openAssignment(assignment); }}>
                    {status === "SUBMITTED" ? "View submission" : status === "IN_PROGRESS" ? "Continue work" : "Start assignment"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeAssignment && activeState && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label={activeAssignment.title}>
          <div className={`${styles.modalCard} ${activeIsWriting ? styles.writingWorkspace : ""}`} style={{ "--accent": subjectColor(activeAssignment.category || activeAssignment.courseTitle) } as CSSProperties}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.previewBadgeRow}>
                  <span className={styles.statusBadge} style={{ "--status-color": statusMeta[activeStatus].color } as CSSProperties}>{statusMeta[activeStatus].label}</span>
                  <span className={styles.tag}>{activeAssignment.skill.replace("_", " ")}</span>
                  {activeAssignment.cefrLevel ? <span className={styles.tag}>CEFR {activeAssignment.cefrLevel}</span> : null}
                </div>
                <h2>{activeAssignment.title}</h2>
                <p style={{ margin: "0.35rem 0 0", opacity: 0.86 }}>{activeAssignment.classCode} · {activeAssignment.courseTitle}</p>
              </div>
              <button className={styles.closeButton} type="button" onClick={() => setActiveId(null)} aria-label="Close assignment modal">
                <X size={18} />
              </button>
            </div>

            {activeIsWriting ? (
              <form action={submitFormAction} className={`${styles.writingWorkspaceBody} ${!taskPanelOpen ? styles.writingWorkspaceFocus : ""} ${coachOpen ? styles.writingWorkspaceWithCoach : ""}`}>
                <input type="hidden" name="assignmentId" value={activeAssignment.id} />
                <input type="hidden" name="fileUrl" value={activeState.fileName} />

                {taskPanelOpen ? <aside className={styles.writingTaskPanel}>
                  <div className={styles.writingPanelTitle}><ListChecks size={18} /><div><small>Writing task</small><strong>Read before you write</strong></div><button type="button" onClick={() => setTaskPanelOpen(false)} aria-label="Hide writing task"><PanelLeftClose size={17} /></button></div>
                  <section><h3>Prompt</h3><p>{previewText(activeAssignment.description)}</p></section>
                  {activeAssignment.instructions ? <section><h3>Instructions</h3><p>{activeAssignment.instructions}</p></section> : null}
                  <section><h3>Assessment criteria</h3><p>{activeAssignment.rubric || `Complete the task clearly, organize your ideas, and use language appropriate for CEFR ${activeAssignment.cefrLevel || "level"}.`}</p></section>
                  <div className={styles.writingTaskMeta}><span>{activeAssignment.maxScore} points</span><span>{formatDate(activeAssignment.dueAt)}</span></div>
                  {activeAssignment.attachmentUrl ? <a className={styles.writingResourceLink} href={activeAssignment.attachmentUrl} target="_blank" rel="noreferrer"><Paperclip size={15} /> Open task resource</a> : null}
                </aside> : null}

                <main className={styles.writingEditorPanel}>
                  <div className={styles.writingEditorToolbar}><div>{!taskPanelOpen ? <button type="button" onClick={() => setTaskPanelOpen(true)}><PanelLeftOpen size={16} /> Task</button> : <><PenLine size={18} /><strong>Your response</strong></>} </div><div><span>{activeWordCount} words</span><button type="button" className={styles.coachToggle} onClick={openCoach}><Sparkles size={16} /><span><small>Need a hint?</small><strong>Ask AI Coach</strong></span>{coachMessages.length ? <b>{coachMessages.filter((item) => item.role === "coach").length}</b> : null}</button></div></div>
                  <textarea
                    className={styles.writingEditor}
                    name="content"
                    value={activeState.content}
                    onFocus={() => updateWork(activeAssignment.id, { started: true })}
                    onChange={(event) => updateWork(activeAssignment.id, { started: true, content: event.target.value })}
                    placeholder="Start writing here. Develop your own ideas; the coach can help you plan and revise without writing the answer for you."
                    aria-label="Writing response"
                  />
                  <div className={styles.writingEditorFooter}>
                    <details><summary><Paperclip size={14} /> Attach supporting file</summary><div className={styles.compactUpload} onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0}><UploadCloud size={20} /><span>{activeState.fileName || "Choose a file"}</span><input ref={fileInputRef} className={styles.hiddenInput} type="file" onChange={(event) => handleFile(activeAssignment.id, event.target.files?.[0])} /></div></details>
                    <span>Draft stays in this browser until you submit.</span>
                  </div>
                  {activeAssignment.submission?.grade ? <section className={styles.writingGradePanel}><header><Bot size={18} /><div><strong>Writing results</strong><span>AI estimate and teacher grade are recorded separately.</span></div></header><div className={styles.writingGradeComparison}><article><small>AI estimate</small><strong>{activeAssignment.submission.grade.aiStatus === "COMPLETED" && typeof activeAssignment.submission.grade.aiScore === "number" ? `${activeAssignment.submission.grade.aiScore}/${activeAssignment.maxScore}` : activeAssignment.submission.grade.aiStatus === "PENDING" ? "Reviewing…" : "Not available"}</strong><span>Immediate guidance, not the official grade</span></article><article><small>Teacher grade</small><strong>{activeAssignment.submission.grade.status === "PUBLISHED" && typeof activeAssignment.submission.grade.score === "number" ? `${activeAssignment.submission.grade.score}/${activeAssignment.maxScore}` : "Waiting"}</strong><span>{activeAssignment.submission.grade.status === "PUBLISHED" ? "Official result" : "Published after teacher review"}</span></article></div>{activeAssignment.submission.grade.aiFeedback ? <p>{readableAiText(activeAssignment.submission.grade.aiFeedback)}</p> : null}{activeAssignment.submission.grade.status === "PUBLISHED" && activeAssignment.submission.grade.feedback ? <p className={styles.teacherFeedback}><strong>Teacher feedback</strong>{activeAssignment.submission.grade.feedback}</p> : null}</section> : null}
                  {activeDeadlinePassed && activeAssignment.allowLateSubmission ? <p className={styles.submissionNotice}><AlertTriangle size={17} /> The deadline has passed, but late submission is allowed.</p> : null}
                  {activeDeadlinePassed && !activeAssignment.allowLateSubmission ? <p className={styles.submissionError}><AlertTriangle size={17} /> The deadline has passed. Contact your teacher for an extension.</p> : null}
                  {submitState.assignmentId === activeAssignment.id && submitState.message && !submitState.ok ? <p className={styles.submissionError}><AlertTriangle size={17} /> {submitState.message}</p> : null}
                  <div className={styles.writingSubmitBar}><button className={styles.historyButton} type="button" onClick={() => setHistoryOpen((value) => !value)}><History size={15} /> Submission history</button>{historyOpen && activeAssignment.submission ? <span>Last submitted {formatDate(activeAssignment.submission.submittedAt)}</span> : null}<button className={styles.ctaButton} type="submit" disabled={!activeCanSubmit || submitPending || activeWordCount === 0}><Send size={16} /> {submitPending ? "Submitting..." : activeAssignment.submission ? "Submit revision" : "Submit writing"}</button></div>
                </main>

                {coachOpen ? <aside className={styles.coachChatDrawer} aria-label="AI writing coach">
                  <header><div><span><Bot size={17} /></span><div><strong>AI Writing Coach</strong><small>{coachModel || "qwen3.5:9b"} · connected to your draft</small></div></div><button type="button" onClick={() => setCoachOpen(false)} aria-label="Close AI coach"><X size={18} /></button></header>
                  <div className={styles.coachContext}><ShieldCheck size={15} /><span>The coach can read this task and your current {activeWordCount}-word draft. It will guide, not write the submission.</span></div>
                  <div className={styles.coachChips} aria-label="Quick coach prompts"><button type="button" disabled={coachLoading} onClick={() => requestCoach("plan")}><ListChecks size={14} /> Plan</button><button type="button" disabled={coachLoading} onClick={() => requestCoach("language")}><MessageSquareText size={14} /> Language</button><button type="button" disabled={coachLoading || activeWordCount < 20} onClick={() => requestCoach("review")}><Sparkles size={14} /> Review</button></div>
                  <div className={styles.coachConversation} aria-live="polite">{coachMessages.length ? coachMessages.map((message, index) => <div className={message.role === "student" ? styles.coachStudentMessage : styles.coachAiMessage} key={`${message.role}-${index}`}>{message.role === "coach" ? <Bot size={15} /> : null}<p>{message.content}</p></div>) : <div className={styles.coachWelcome}><Lightbulb size={22} /><strong>What do you need help with?</strong><p>Choose a quick prompt above or ask a specific question below.</p></div>}{coachLoading ? <div className={styles.coachTyping}><LoaderCircle className={styles.aiSpinner} size={16} /> Thinking about your draft…</div> : null}{coachError ? <p className={styles.coachError}>{coachError}</p> : null}</div>
                  <div className={styles.coachComposer}><textarea value={coachQuestion} onChange={(event) => setCoachQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); if (!coachLoading) void requestCoach("custom", coachQuestion); } }} placeholder="Ask about an idea, sentence, grammar…" rows={2} /><button type="button" disabled={coachLoading || !coachQuestion.trim()} onClick={() => requestCoach("custom", coachQuestion)} aria-label="Send question"><CornerDownLeft size={17} /></button></div>
                </aside> : null}
                {!coachOpen ? <button type="button" className={styles.coachFloatingLauncher} onClick={openCoach} aria-label="Open AI writing coach"><span><Sparkles size={22} /></span><strong>AI Coach</strong><small>Get writing help</small></button> : null}
              </form>
            ) : (
            <div className={styles.modalBody}>
              <div className={styles.briefGrid}>
                <section className={styles.modalSection}>
                  <h3>Full assignment brief</h3>
                  <p className={styles.briefText}>{previewText(activeAssignment.description)}</p>
                  {activeAssignment.instructions && (
                    <>
                      <h3 style={{ marginTop: "1rem" }}>Student instructions</h3>
                      <p className={styles.briefText}>{activeAssignment.instructions}</p>
                    </>
                  )}
                </section>

                <aside className={styles.modalSection}>
                  <h3>Rubric / Criteria</h3>
                  {activeAssignment.rubric ? <p className={styles.briefText} style={{ whiteSpace: "pre-wrap" }}>{activeAssignment.rubric}</p> : <ul className={styles.rubricList}><li>Complete the task according to the brief.</li><li>Match the expected format for {activeAssignment.type.replace("_", " ").toLowerCase()}.</li><li>Difficulty: {difficultyMeta[activeAssignment.difficulty].label}.</li><li>Maximum score: {activeAssignment.maxScore}.</li></ul>}
                </aside>
              </div>

              <section className={styles.modalSection}>
                <h3>Attachment files</h3>
                {activeAssignment.attachmentName || activeAssignment.attachmentUrl ? (
                  <a className={styles.attachmentBox} href={activeAssignment.attachmentUrl || "#"} target="_blank" rel="noreferrer">
                    <Paperclip size={22} color="#6366F1" />
                    <span>{activeAssignment.attachmentName || activeAssignment.attachmentUrl}</span>
                  </a>
                ) : (
                  <p className={styles.briefText}>No attachment files for this assignment.</p>
                )}
              </section>

              <form
                action={submitFormAction}
                className={styles.modalSection}
              >
                {status === "SUBMITTED" ? <div className={styles.completedMark}><CheckCircle2 size={16} /> Completed</div> : null}
                <input type="hidden" name="assignmentId" value={activeAssignment.id} />
                <input type="hidden" name="fileUrl" value={activeState.fileName} />
                <div className={styles.submitArea}>
                  <h3>Submit your work</h3>
                  <div
                    className={styles.dropZone}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleFile(activeAssignment.id, event.dataTransfer.files[0]);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <UploadCloud size={34} color="#6366F1" />
                    <strong>Drop your file here or click to choose</strong>
                    <span>{activeState.fileName ? `Selected: ${activeState.fileName}` : "PDF, image, document, or presentation"}</span>
                    <input
                      ref={fileInputRef}
                      className={styles.hiddenInput}
                      type="file"
                      onChange={(event) => handleFile(activeAssignment.id, event.target.files?.[0])}
                    />
                  </div>
                  <textarea
                    className={styles.submissionText}
                    name="content"
                    value={activeState.content}
                    onFocus={() => updateWork(activeAssignment.id, { started: true })}
                    onChange={(event) => updateWork(activeAssignment.id, { started: true, content: event.target.value })}
                    placeholder="Write your response, paste a link, or add notes for your teacher..."
                  />
                  {historyOpen && activeAssignment.submission && (
                    <div className={styles.attachmentBox}>
                      <History size={20} color="#6366F1" />
                      <span>Last submitted {formatDate(activeAssignment.submission.submittedAt)} · {activeAssignment.submission.fileUrl || "No file reference"}</span>
                    </div>
                  )}
                  {activeAssignment.submission?.grade ? (
                    <section className={styles.aiStudentResult}>
                      <div>
                        {activeAssignment.submission.grade.aiStatus === "PENDING"
                          ? <LoaderCircle className={styles.aiSpinner} size={20} />
                          : <Bot size={20} />}
                        <div>
                          <strong>
                            {activeAssignment.submission.grade.status === "PUBLISHED" && typeof activeAssignment.submission.grade.score === "number"
                              ? `Teacher score: ${activeAssignment.submission.grade.score}/${activeAssignment.maxScore}`
                              : activeAssignment.submission.grade.aiStatus === "COMPLETED"
                                ? "AI first pass is ready"
                                : activeAssignment.submission.grade.aiStatus === "PENDING"
                                  ? "AI is reviewing your writing"
                                  : "Teacher review pending"}
                          </strong>
                          <span>
                            {activeAssignment.submission.grade.status === "PUBLISHED"
                              ? "This is your official result."
                              : "AI feedback is provisional. Your teacher publishes the official score."}
                          </span>
                        </div>
                        {activeAssignment.submission.grade.aiStatus === "COMPLETED" && typeof activeAssignment.submission.grade.aiScore === "number" ? (
                          <b>{activeAssignment.submission.grade.aiScore}/{activeAssignment.maxScore}</b>
                        ) : null}
                      </div>
                      {activeAssignment.submission.grade.aiStatus === "COMPLETED" && activeAssignment.submission.grade.aiFeedback ? (
                        <p>{activeAssignment.submission.grade.aiFeedback}</p>
                      ) : null}
                      {activeAssignment.submission.grade.status === "PUBLISHED" && activeAssignment.submission.grade.feedback ? (
                        <p className={styles.teacherFeedback}><strong>Teacher feedback</strong>{activeAssignment.submission.grade.feedback}</p>
                      ) : null}
                    </section>
                  ) : null}
                  {activeDeadlinePassed && activeAssignment.allowLateSubmission ? (
                    <p className={styles.submissionNotice}><AlertTriangle size={17} /> The deadline has passed, but your teacher allows late submission.</p>
                  ) : null}
                  {activeDeadlinePassed && !activeAssignment.allowLateSubmission ? (
                    <p className={styles.submissionError}><AlertTriangle size={17} /> The deadline has passed. Contact your teacher if you need an extension.</p>
                  ) : null}
                  {submitState.assignmentId === activeAssignment.id && submitState.message && !submitState.ok ? (
                    <p className={styles.submissionError}><AlertTriangle size={17} /> {submitState.message}</p>
                  ) : null}
                  <div className={styles.modalActions}>
                    {activeAssignment.submission ? (
                      <Link className={styles.secondaryButton} href={`/elearning/classrooms/${activeAssignment.classroomId}?tab=assignments`}>
                        Back to classroom
                      </Link>
                    ) : null}
                    <button className={styles.historyButton} type="button" onClick={() => setHistoryOpen((value) => !value)}>
                      View Submission History
                    </button>
                    {!activeState.started && !activeAssignment.submission ? (
                      <button className={styles.secondaryButton} type="button" onClick={() => updateWork(activeAssignment.id, { started: true })}>
                        <Sparkles size={16} /> Start Assignment
                      </button>
                    ) : activeSubmissionLocked ? (
                      <span className={styles.secondaryButton}>Resubmission disabled</span>
                    ) : (
                      <button className={styles.ctaButton} type="submit" disabled={!activeCanSubmit || submitPending}>
                        <Send size={16} /> {submitPending ? "Submitting..." : activeAssignment.submission?.status === "REVISION_REQUESTED" ? "Submit revision" : activeAssignment.submission ? "Resubmit" : "Submit Assignment"}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
            )}
          </div>
        </div>
      )}

      {submitState.ok && submitState.message && (
        <div className={styles.successBurst} role="status">
          <CheckCircle2 size={18} /> {submitState.message}
        </div>
      )}
    </div>
  );
}

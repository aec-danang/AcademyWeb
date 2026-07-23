"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  History,
  Paperclip,
  Send,
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
  const [now, setNow] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [workState, setWorkState] = useState<WorkState>({});
  const [historyOpen, setHistoryOpen] = useState(false);
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

  const nextAssignment = sortedAssignments.find((assignment) => !assignment.submission && assignment.dueAt);
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

  return (
    <div className={styles.board}>
      <div className={styles.hero}>
        <section className={styles.heroCard} style={{ "--countdown-color": nextColor } as CSSProperties}>
          <p className={styles.eyebrow}>Assignment Board</p>
          <h1 className={styles.pageTitle}>Stay ahead of every deadline</h1>
          <p className={styles.subtitle}>
            Cards are sorted by urgency: overdue first, due soon next, pending work after that, and completed assignments at the bottom.
          </p>
          <div className={`${styles.countdownBlock} ${nextCountdown.totalHours < 24 ? styles.countdownPulse : ""}`}>
            <p className={styles.countdownLabel}>{nextAssignment ? `Next due: ${nextAssignment.title}` : "No upcoming deadline"}</p>
            <div className={styles.countdownNumber}>
              <span>{nextCountdown.days}</span><span className={styles.countdownUnit}>Days</span>
              <span>:</span>
              <span>{nextCountdown.hours.toString().padStart(2, "0")}</span><span className={styles.countdownUnit}>Hours</span>
              <span>:</span>
              <span>{nextCountdown.minutes.toString().padStart(2, "0")}</span><span className={styles.countdownUnit}>Minutes left</span>
            </div>
          </div>
        </section>

        <aside className={styles.celebrationCard}>
          <div className={styles.celebrationMeter}>
            <div className={styles.miniRing} style={{ "--ring": `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` } as CSSProperties}>
              <div className={styles.miniRingInner}>{stats.completed}/{stats.total}</div>
            </div>
            <div>
              <p className={styles.eyebrow}>Progress celebration</p>
              <h3 style={{ margin: 0 }}>You&apos;ve completed {stats.completed} of {stats.total} assignments!</h3>
            </div>
          </div>
          <div className={styles.streakPill}>
            <Flame size={15} /> {Math.max(stats.onTime, 0)} on-time submissions streak
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
            const accent = status === "OVERDUE" ? "#EF4444" : subjectColor(assignment.category || assignment.courseTitle || assignment.type);
            const countdown = countdownColor(due.totalHours, due.overdue);
            const overdueDays = due.overdue ? Math.max(1, due.days || Math.ceil(Math.abs(due.totalHours) / 24)) : 0;

            return (
              <article
                key={assignment.id}
                className={`${styles.assignmentCard} ${status === "SUBMITTED" ? styles.cardMuted : ""}`}
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
                      <small>Submitted {formatDate(assignment.submission.submittedAt)}</small>
                    )}
                    {status === "OVERDUE" && <small>Past due: {overdueDays} day{overdueDays > 1 ? "s" : ""}</small>}
                  </div>
                  <button className={styles.viewLink} type="button" onClick={(event) => { event.stopPropagation(); openAssignment(assignment); }}>Open assignment</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeAssignment && activeState && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-label={activeAssignment.title}>
          <div className={styles.modalCard} style={{ "--accent": subjectColor(activeAssignment.category || activeAssignment.courseTitle) } as CSSProperties}>
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

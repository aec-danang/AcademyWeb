"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Circle, Rocket, X } from "lucide-react";
import type { TeacherSetupProgress as Progress } from "@/lib/teacherSetup";
import styles from "./elearning.module.css";

export function TeacherSetupProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [expanded, setExpanded] = useState(true);
  const previousCompleted = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/elearning/setup-progress", { cache: "no-store" });
      if (!response.ok) return;
      const next = await response.json() as Progress;
      if (previousCompleted.current !== null && next.completed > previousCompleted.current) setExpanded(true);
      previousCompleted.current = next.completed;
      setProgress(next);
    } catch {
      // The checklist is helpful but must never block the teaching workspace.
    }
  }, []);

  useEffect(() => { queueMicrotask(() => void refresh()); }, [pathname, refresh]);
  useEffect(() => {
    const handleFocus = () => { if (!document.hidden) void refresh(); };
    const timer = window.setInterval(() => void refresh(), 5000);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", handleFocus); document.removeEventListener("visibilitychange", handleFocus); };
  }, [refresh]);

  if (!progress || progress.completed === progress.total) return null;
  const percent = Math.round((progress.completed / progress.total) * 100);

  return <section className={expanded ? styles.globalSetupGuide : styles.globalSetupGuideCollapsed} aria-label="Getting started checklist">
    <div className={styles.globalSetupHeader}>
      <span className={styles.globalSetupIcon}><Rocket size={19} /></span>
      <div className={styles.globalSetupHeading}><strong>{progress.classroomName ? `Continue setting up ${progress.classroomName}` : "Get your classroom ready"}</strong><span>{progress.completed ? `${progress.completed} completed · ${progress.total - progress.completed} remaining${progress.classroomCode ? ` · ${progress.classroomCode}` : ""}${progress.incompleteClassrooms > 1 ? ` · ${progress.incompleteClassrooms} classes need setup` : ""}` : "Four quick steps to start teaching"}</span></div>
      <div className={styles.globalSetupProgress}><span><i style={{ width: `${percent}%` }} /></span><b>{progress.completed}/{progress.total}</b></div>
      {!expanded && progress.nextStep ? <Link href={progress.nextStep.href}>{progress.nextStep.label}<ChevronRight size={15} /></Link> : null}
      <button type="button" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? "Collapse setup guide" : "Expand setup guide"}>{expanded ? <X size={17} /> : <ChevronDown size={17} />}</button>
    </div>
    {expanded ? <div className={styles.globalSetupSteps}>{progress.steps.map((step, index) => <Link href={step.href} key={step.key} className={step.done ? styles.globalSetupStepDone : styles.globalSetupStep} aria-current={!step.done && progress.nextStep?.key === step.key ? "step" : undefined}><span>{step.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}</span><div><small>Step {index + 1}</small><strong>{step.label}</strong><p>{step.done ? "Completed" : step.detail}</p></div>{!step.done ? <ChevronRight size={16} /> : null}</Link>)}</div> : null}
  </section>;
}

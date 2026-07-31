"use client";

import { FormEvent, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Bot, CheckCircle2, Circle, GripHorizontal, LoaderCircle, LockKeyhole, Send, Sparkles, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { TestDraft } from "@/lib/testBuilder";
import type { TeacherAgentAction as AgentAction, TeacherWorkflow, TeacherWorkflowProgress } from "@/lib/teacherAgentWorkflows";
import { isWorkflowAction } from "@/lib/teacherAgentWorkflows";
import { TeacherAgentWorkflowForm } from "./TeacherAgentWorkflowForm";
import styles from "./elearning.module.css";

type ChatMessage = { role: "user" | "assistant"; content: string };
type DraftSession = { draft: TestDraft; classSectionId: string; classroomName: string; classroomCode: string; warnings?: string[] };
type PersistedAgentState = {
  messages: ChatMessage[];
  pendingAction: AgentAction | null;
  workflow: TeacherWorkflow | null;
  workflowEditing: boolean;
  workflowProgress?: TeacherWorkflowProgress | null;
};

const suggestions = [
  "Giải quyết bước setup tiếp theo",
  "Tạo một Test và giao cho lớp",
  "Thêm học sinh đã có tài khoản vào lớp",
];

export function TeacherAiAgent() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Chào thầy/cô. Tôi đọc được tiến độ setup và có thể chuẩn bị lớp, bài tập, đề kiểm tra hoặc học sinh. Mọi thay đổi quan trọng đều được trình bày để xác nhận trước." },
  ]);
  const [pendingAction, setPendingAction] = useState<AgentAction | null>(null);
  const [workflow, setWorkflow] = useState<TeacherWorkflow | null>(null);
  const [workflowEditing, setWorkflowEditing] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState<TeacherWorkflowProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const messageEnd = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    let active = true;

    void fetch("/api/elearning/teacher-agent")
      .then(async (response) => response.ok ? response.json() as Promise<PersistedAgentState> : null)
      .then((saved) => {
        if (!active) return;
        queueMicrotask(() => {
          if (!active) return;
          if (saved?.messages?.length) setMessages(saved.messages);
          setPendingAction(saved?.pendingAction || null);
          setWorkflow(saved?.workflow || null);
          setWorkflowEditing(Boolean(saved?.workflowEditing));
          setWorkflowProgress(saved?.workflowProgress || null);
          restoredRef.current = true;
        });
      })
      .catch(() => {
        restoredRef.current = true;
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!restoredRef.current) return;
    const timer = window.setTimeout(() => {
      void fetch("/api/elearning/teacher-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saveState: { messages, pendingAction, workflow, workflowEditing, currentPath: pathname },
        }),
      });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [messages, pathname, pendingAction, workflow, workflowEditing]);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, pendingAction, loading]);

  useEffect(() => {
    const keepInsideViewport = () => {
      if (!position || !drawerRef.current) return;
      const rect = drawerRef.current.getBoundingClientRect();
      setPosition({ x: Math.max(8, Math.min(position.x, window.innerWidth - rect.width - 8)), y: Math.max(8, Math.min(position.y, window.innerHeight - rect.height - 8)) });
    };
    window.addEventListener("resize", keepInsideViewport);
    return () => window.removeEventListener("resize", keepInsideViewport);
  }, [position]);

  function startDrag(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    const rect = drawerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    const rect = drawerRef.current?.getBoundingClientRect();
    if (!drag || drag.pointerId !== event.pointerId || !rect) return;
    setPosition({
      x: Math.max(8, Math.min(event.clientX - drag.offsetX, window.innerWidth - rect.width - 8)),
      y: Math.max(8, Math.min(event.clientY - drag.offsetY, window.innerHeight - rect.height - 8)),
    });
  }

  function endDrag(event: ReactPointerEvent<HTMLElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  async function sendMessage(value = input) {
    const message = value.trim();
    if (!message || loading) return;
    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput("");
    setPendingAction(null);
    setWorkflow(null);
    setWorkflowEditing(false);
    setWorkflowProgress(null);
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/elearning/teacher-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: messages.slice(-10), currentPath: pathname }),
      });
      const result = await response.json() as { reply?: string; action?: AgentAction | null; workflow?: TeacherWorkflow | null; workflowProgress?: TeacherWorkflowProgress | null; error?: string };
      if (!response.ok) throw new Error(result.error || "AI Teacher đang tạm thời không phản hồi.");
      setMessages((current) => [...current, { role: "assistant", content: result.reply || "Tôi cần thêm thông tin để tiếp tục." }]);
      setPendingAction(result.action || null);
      setWorkflow(result.workflow || null);
      setWorkflowEditing(Boolean(result.workflow && isWorkflowAction(result.action)));
      setWorkflowProgress(result.workflowProgress || null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể kết nối AI Teacher.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmAction() {
    if (!pendingAction || loading) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/elearning/teacher-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ execute: pendingAction, currentPath: pathname }),
      });
      const result = await response.json() as {
        message?: string;
        href?: string;
        draftSession?: DraftSession;
        workflowProgress?: TeacherWorkflowProgress | null;
        action?: AgentAction | null;
        workflow?: TeacherWorkflow | null;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "Không thể hoàn thành tác vụ.");
      if (result.draftSession) sessionStorage.setItem("aec-teacher-test-draft", JSON.stringify(result.draftSession));
      setMessages((current) => [...current, { role: "assistant", content: result.message || "Tác vụ đã hoàn thành." }]);
      setPendingAction(result.action || null);
      setWorkflow(result.workflow || null);
      setWorkflowEditing(Boolean(result.action && result.workflow));
      setWorkflowProgress(result.workflowProgress || null);
      if (result.href) router.push(result.href);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể hoàn thành tác vụ.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  const confirmLabel = pendingAction?.type === "CREATE_TEST_DRAFT"
    ? pendingAction.payload.publishNow === true ? "Tạo, xuất bản và giao đề" : "Tạo và mở bản nháp"
    : pendingAction?.type === "CREATE_ASSIGNMENT"
      ? pendingAction.payload.publishNow === true ? "Tạo và giao bài tập" : "Lưu bản nháp"
      : pendingAction?.type === "CREATE_CLASSROOM" ? "Tạo lớp học"
      : pendingAction?.type === "ASSIGN_TEST" ? "Giao đề cho lớp"
      : "Xác nhận thực hiện";
  const operationLabels: Partial<Record<AgentAction["type"], string>> = {
    DECIDE_ENROLLMENT: "Xác nhận quyết định",
    REMOVE_STUDENT: "Thu hồi quyền vào lớp",
    ADD_CLASS_MEETING: "Thêm lịch học",
    REMOVE_CLASS_MEETING: "Gỡ lịch học",
    UPDATE_ASSIGNMENT: "Lưu thay đổi",
    ARCHIVE_ASSIGNMENT: "Archive bài tập",
    GRADE_SUBMISSION: pendingAction?.payload.mode === "publish"
      ? "Công bố và trả bài"
      : pendingAction?.payload.mode === "request_revision"
        ? "Yêu cầu sửa bài"
        : "Lưu điểm nháp",
  };
  const effectiveConfirmLabel = pendingAction ? operationLabels[pendingAction.type] || confirmLabel : confirmLabel;
  const workflowReview = workflow && pendingAction ? workflow.fields.flatMap((field) => {
    const value = pendingAction.payload[field.name];
    if (value === "" || value === null || value === undefined || value === false) return [];
    const shown = field.type === "checkbox"
      ? "Có"
      : field.options?.find((option) => option.value === String(value))?.label || String(value);
    return [{ label: field.label, value: shown }];
  }) : [];

  return <>
    <button type="button" className={`${styles.teacherAgentLauncher} ${open ? styles.teacherAgentLauncherOpen : ""}`} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="teacher-ai-agent">
      {open ? <X size={20} /> : <Sparkles size={21} />}
      <span><strong>AI Teacher</strong><small>Giao việc cho qwen</small></span>
    </button>

    {open ? <aside
      ref={drawerRef}
      id="teacher-ai-agent"
      className={`${styles.teacherAgentDrawer} ${workflow ? styles.teacherAgentDrawerExpanded : ""}`}
      aria-label="Trợ lý tác vụ cho giáo viên"
      style={position ? { left: position.x, top: position.y, right: "auto", bottom: "auto" } : undefined}
    >
      <header
        className={styles.teacherAgentHeader}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => setPosition(null)}
        title="Giữ chuột và kéo để di chuyển · nhấp đúp để đặt lại"
      >
        <span><Bot size={21} /></span>
        <div><strong>AI Teacher</strong><small>Trợ lý vận hành · local qwen</small></div>
        <GripHorizontal className={styles.teacherAgentDragHint} size={18} />
        <button type="button" onClick={() => setOpen(false)} aria-label="Đóng AI Teacher"><X size={18} /></button>
      </header>

      <div className={styles.teacherAgentScope}><CheckCircle2 size={16} /><span>Hiểu tiến độ setup, tạo Test Draft đầy đủ và nối đề vào đúng lớp sau khi giáo viên xác nhận.</span></div>

      <div className={styles.teacherAgentMessages} aria-live="polite">
        {messages.map((message, index) => <div key={`${message.role}-${index}`} className={message.role === "user" ? styles.teacherAgentUserMessage : styles.teacherAgentAssistantMessage}>{message.content}</div>)}
        {workflowProgress ? <section className={styles.teacherWorkflowProgress}>
          <header>
            <div><small>WORKFLOW ĐANG THEO DÕI</small><strong>{workflowProgress.title}</strong>{workflowProgress.targetLabel ? <span>{workflowProgress.targetLabel}</span> : null}</div>
            <b>{workflowProgress.steps.filter((step) => step.status === "COMPLETED").length}/{workflowProgress.steps.length}</b>
          </header>
          <ol>
            {workflowProgress.steps.map((step) => <li key={step.id} data-status={step.status.toLowerCase()}>
              <span>{step.status === "COMPLETED" ? <CheckCircle2 size={16} /> : step.status === "BLOCKED" ? <LockKeyhole size={16} /> : <Circle size={16} />}</span>
              <div><strong>{step.label}</strong>{step.evidence ? <small>{step.evidence}</small> : step.status === "CURRENT" ? <small>Agent đang chờ thông tin hoặc xác nhận ở bước này.</small> : null}</div>
            </li>)}
          </ol>
        </section> : null}
        {pendingAction && workflow && workflowEditing ? <TeacherAgentWorkflowForm
          action={pendingAction}
          workflow={workflow}
          onCancel={() => { setPendingAction(null); setWorkflow(null); setWorkflowEditing(false); }}
          onDraftChange={setPendingAction}
          onContinue={(nextAction) => { setPendingAction(nextAction); setWorkflowEditing(false); }}
        /> : pendingAction ? <section className={styles.teacherAgentPlan}>
          <span>Kế hoạch chờ xác nhận</span>
          <strong>{pendingAction.summary}</strong>
          {workflowReview.length ? <dl className={styles.teacherWorkflowReview}>{workflowReview.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl> : null}
          <p>{pendingAction.type === "CREATE_TEST_DRAFT" && pendingAction.payload.publishNow !== true ? "Qwen sẽ tạo nội dung và mở Test Builder. Đề chưa được giao ở bước này." : "Đây là lần xác nhận cuối. Hệ thống chưa thay đổi dữ liệu."}</p>
          <div>{workflow ? <button type="button" onClick={() => setWorkflowEditing(true)} disabled={loading}>Sửa thông tin</button> : <button type="button" onClick={() => setPendingAction(null)} disabled={loading}>Hủy</button>}<button type="button" onClick={() => void confirmAction()} disabled={loading}>{loading ? <LoaderCircle size={15} className={styles.spinner} /> : <CheckCircle2 size={15} />}{effectiveConfirmLabel}</button></div>
        </section> : null}
        {loading && !pendingAction ? <div className={styles.teacherAgentThinking}><LoaderCircle size={16} className={styles.spinner} /> Đang lập kế hoạch…</div> : null}
        {error ? <div className={styles.teacherAgentError}>{error}</div> : null}
        <div ref={messageEnd} />
      </div>

      {messages.length <= 1 ? <div className={styles.teacherAgentSuggestions}>{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => void sendMessage(suggestion)}><span>{suggestion}</span><ArrowRight size={15} /></button>)}</div> : null}

      <form className={styles.teacherAgentComposer} onSubmit={submit}>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="Ví dụ: Giải quyết Step 4 cho lớp này…" rows={2} />
        <button type="submit" disabled={!input.trim() || loading} aria-label="Gửi yêu cầu"><Send size={17} /></button>
      </form>
      <small className={styles.teacherAgentFootnote}>Giữ phần đầu hộp để di chuyển · mọi lần publish/giao lớp đều cần xác nhận.</small>
    </aside> : null}
  </>;
}

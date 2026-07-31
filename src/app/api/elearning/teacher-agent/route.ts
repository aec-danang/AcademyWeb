import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getTeacherSetupProgress } from "@/lib/teacherSetup";
import { normalizeTestDraft, testDraftJsonSchema, validateTestDraft, type TestDraft } from "@/lib/testBuilder";
import { importPracticeTestJsonAction } from "@/lib/lmsActions";
import type { TeacherAgentAction as AgentAction, TeacherAgentValue as AgentValue, TeacherWorkflow, TeacherWorkflowProgress } from "@/lib/teacherAgentWorkflows";
import {
  completeWorkflowStep,
  failWorkflowStep,
  loadActiveTeacherWorkflow,
  persistTeacherWorkflowPlan,
  planTeacherWorkflow,
  resolveTeacherOperationalState,
  updateWorkflowForConfirmation,
  type TeacherWorkflowPlan,
} from "@/lib/teacherWorkflowEngine";

export const dynamic = "force-dynamic";

const actionTypes = new Set<AgentAction["type"]>([
  "CREATE_ASSIGNMENT",
  "UPDATE_ASSIGNMENT",
  "ARCHIVE_ASSIGNMENT",
  "CREATE_CLASSROOM",
  "ADD_STUDENT",
  "DECIDE_ENROLLMENT",
  "REMOVE_STUDENT",
  "ADD_CLASS_MEETING",
  "REMOVE_CLASS_MEETING",
  "GRADE_SUBMISSION",
  "OPEN_PAGE",
  "CREATE_TEST_DRAFT",
  "ASSIGN_TEST",
]);
const openPages = new Set(["/elearning/assignments", "/elearning/assignments/new", "/elearning/classrooms", "/elearning/classrooms/new", "/elearning/practice", "/elearning/practice/new", "/elearning/scores"]);
const agentPlanSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "action"],
  properties: {
    reply: { type: "string" },
    action: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["type", "summary", "payload"],
      properties: {
        type: { type: "string", enum: [...actionTypes] },
        summary: { type: "string" },
        payload: { type: "object", additionalProperties: { type: ["string", "number", "boolean", "null"] } },
      },
    },
  },
} as const;

function isAgentAction(value: unknown): value is AgentAction {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AgentAction>;
  return typeof candidate.type === "string" && actionTypes.has(candidate.type as AgentAction["type"])
    && typeof candidate.summary === "string" && !!candidate.payload && typeof candidate.payload === "object";
}

type AgentPlan = { reply?: string; action?: AgentAction | null };
type StoredMessage = { role: "user" | "assistant"; content: string };

function jsonInput(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function storedMessages(value: unknown): StoredMessage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as { role?: unknown; content?: unknown };
    if (!["user", "assistant"].includes(String(candidate.role)) || typeof candidate.content !== "string") return [];
    return [{ role: candidate.role as StoredMessage["role"], content: candidate.content.slice(0, 4000) }];
  }).slice(-100);
}

async function saveAgentState(teacherId: string, state: {
  messages: StoredMessage[];
  pendingAction?: AgentAction | null;
  workflow?: TeacherWorkflow | null;
  workflowEditing?: boolean;
  currentPath?: string | null;
}) {
  const data = {
    messages: jsonInput(state.messages.slice(-100)),
    pendingAction: state.pendingAction ? jsonInput(state.pendingAction) : Prisma.DbNull,
    workflow: state.workflow ? jsonInput(state.workflow) : Prisma.DbNull,
    workflowEditing: Boolean(state.workflowEditing),
    currentPath: state.currentPath || null,
  };
  return prisma.teacherAgentSession.upsert({
    where: { teacherId },
    update: data,
    create: { teacherId, ...data },
  });
}

async function planResponse(teacherId: string, message: string, data: {
  reply: string;
  action?: AgentAction | null;
  workflow?: TeacherWorkflow | null;
  workflowProgress?: TeacherWorkflowProgress | null;
  model: string;
  setup?: unknown;
}, currentPath?: string) {
  const session = await prisma.teacherAgentSession.findUnique({ where: { teacherId }, select: { messages: true } });
  const action = data.action ? { ...data.action, idempotencyKey: data.action.idempotencyKey || randomUUID() } : null;
  const messages = [
    ...storedMessages(session?.messages),
    { role: "user" as const, content: message },
    { role: "assistant" as const, content: data.reply },
  ].slice(-100);
  await saveAgentState(teacherId, {
    messages,
    pendingAction: action,
    workflow: data.workflow || null,
    workflowEditing: Boolean(action && data.workflow),
    currentPath,
  });
  return NextResponse.json({ ...data, action, workflow: data.workflow || null });
}

async function workflowPlanResponse(
  teacherId: string,
  message: string,
  plan: TeacherWorkflowPlan,
  context: TeacherContext,
  currentPath?: string,
) {
  const session = await prisma.teacherAgentSession.upsert({
    where: { teacherId },
    update: { currentPath: currentPath || undefined },
    create: { teacherId, messages: [], currentPath: currentPath || null },
  });
  const persisted = await persistTeacherWorkflowPlan(teacherId, session.id, plan);
  return planResponse(teacherId, message, {
    reply: persisted.reply,
    action: persisted.action,
    workflow: persisted.action ? workflowForAction(persisted.action, context) : null,
    workflowProgress: persisted.progress,
    model: "workflow-engine",
    setup: context.setup,
  }, currentPath);
}

function parseAgentPlan(value: unknown): AgentPlan | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as { reply?: unknown; action?: unknown };

  // Some local models put the requested JSON inside `reply` even when a
  // structured-output schema is supplied. Unwrap that shape defensively.
  if (typeof candidate.reply === "string" && candidate.action === undefined) {
    const nested = candidate.reply.trim();
    if (nested.startsWith("{")) {
      try {
        const parsed = parseAgentPlan(JSON.parse(nested));
        if (parsed) return parsed;
      } catch {
        // Keep the ordinary reply below. Never expose parser details to users.
      }
    }
  }

  return {
    reply: typeof candidate.reply === "string" ? candidate.reply : undefined,
    action: candidate.action === null || isAgentAction(candidate.action) ? candidate.action : null,
  };
}

function jsonObject(text: string): AgentPlan {
  const cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Phản hồi của AI local bị ngắt giữa chừng. Hãy gửi lại yêu cầu.");
  try {
    const plan = parseAgentPlan(JSON.parse(cleaned.slice(start, end + 1)));
    if (!plan) throw new Error();
    return plan;
  } catch {
    throw new Error("AI local chưa tạo được kế hoạch hoàn chỉnh. Hãy gửi lại yêu cầu.");
  }
}

async function teacherContext(userId: string) {
  const [classrooms, tests, setup, operationalState] = await Promise.all([
    prisma.classSection.findMany({ where: { teacherId: userId, status: "ACTIVE" }, select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    prisma.quiz.findMany({ where: { isPracticeTest: true, published: true, createdById: userId }, select: { id: true, title: true, skill: true, examType: true, timeLimit: true, attemptLimit: true, _count: { select: { questions: true } } }, orderBy: { updatedAt: "desc" }, take: 30 }),
    getTeacherSetupProgress(userId, false),
    resolveTeacherOperationalState(userId),
  ]);
  return { classrooms, tests, setup, operationalState, now: new Date().toISOString() };
}

type TeacherContext = Awaited<ReturnType<typeof teacherContext>>;

function normalizeVietnamese(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

function workflowForAction(action: AgentAction, context: TeacherContext): TeacherWorkflow | null {
  const classroomOptions = context.classrooms.map((item) => ({ value: item.id, label: `${item.name} (${item.code})` }));
  const selectedClassroomId = String(action.payload.classSectionId || "");
  const selectedClassroom = context.operationalState.classrooms.find((item) => item.id === selectedClassroomId);
  if (action.type === "CREATE_CLASSROOM") {
    return {
      id: "CREATE_CLASSROOM",
      title: "Tạo lớp học",
      description: "Chỉ nhập phần giáo viên quyết định. Mã lớp và trạng thái sẽ được hệ thống xử lý.",
      submitLabel: "Kiểm tra kế hoạch",
      fields: [
        { name: "name", label: "Tên lớp", type: "text", required: true, placeholder: "IELTS Foundation – Evening A" },
        { name: "startAt", label: "Ngày bắt đầu", type: "datetime-local" },
        { name: "endAt", label: "Ngày kết thúc", type: "datetime-local" },
        { name: "dayOfWeek", label: "Lịch học đầu tiên", type: "select", options: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"].map((label, value) => ({ value: String(value), label })) },
        { name: "startTime", label: "Giờ bắt đầu", type: "time" },
        { name: "endTime", label: "Giờ kết thúc", type: "time" },
        { name: "location", label: "Phòng học hoặc Meet URL", type: "text", placeholder: "Phòng 3 hoặc https://meet.google.com/..." },
      ],
    };
  }
  if (action.type === "CREATE_ASSIGNMENT") {
    return {
      id: "CREATE_ASSIGNMENT",
      title: "Tạo và giao Assignment",
      description: "Agent tự thiết lập các mặc định phù hợp; bài chỉ được giao cho lớp đã chọn.",
      submitLabel: "Kiểm tra bài tập",
      fields: [
        { name: "classSectionId", label: "Lớp nhận bài", type: "select", required: true, options: classroomOptions },
        { name: "title", label: "Tên bài tập", type: "text", required: true, placeholder: "Writing: My future goals" },
        { name: "instructions", label: "Yêu cầu cho học sinh", type: "textarea", required: true, placeholder: "Viết 150–200 từ và nêu ít nhất hai lý do..." },
        { name: "skill", label: "Kỹ năng", type: "select", required: true, options: ["WRITING", "READING", "LISTENING", "SPEAKING", "GRAMMAR", "VOCABULARY", "MIXED"].map((value) => ({ value, label: value })) },
        { name: "cefrLevel", label: "Trình độ CEFR", type: "select", required: true, options: ["A1", "A2", "B1", "B2", "C1", "C2"].map((value) => ({ value, label: value })) },
        { name: "dueAt", label: "Hạn nộp", type: "datetime-local" },
        { name: "maxScore", label: "Điểm tối đa", type: "number", required: true, min: 1, max: 1000 },
        { name: "publishNow", label: "Xuất bản và giao ngay", type: "checkbox", help: "Tắt nếu chỉ muốn lưu bản nháp riêng tư." },
      ],
    };
  }
  if (action.type === "UPDATE_ASSIGNMENT") {
    const assignments = selectedClassroom?.assignments || context.operationalState.classrooms.flatMap((item) => item.assignments);
    return {
      id: "UPDATE_ASSIGNMENT",
      title: "Chỉnh sửa Assignment",
      description: "Cập nhật đúng một bài. Bài nộp và điểm hiện có không bị thay đổi.",
      submitLabel: "Kiểm tra thay đổi",
      fields: [
        { name: "assignmentId", label: "Assignment", type: "select", required: true, options: assignments.map((item) => ({ value: item.id, label: `${item.title} · ${item.status}` })) },
        { name: "title", label: "Tên bài tập", type: "text", required: true },
        { name: "instructions", label: "Yêu cầu cho học sinh", type: "textarea" },
        { name: "dueAt", label: "Hạn nộp", type: "datetime-local" },
        { name: "maxScore", label: "Điểm tối đa", type: "number", required: true, min: 1, max: 1000 },
        { name: "publishNow", label: "Hiển thị cho học sinh", type: "checkbox" },
      ],
    };
  }
  if (action.type === "ARCHIVE_ASSIGNMENT") {
    const assignments = selectedClassroom?.assignments.filter((item) => item.status !== "ARCHIVED")
      || context.operationalState.classrooms.flatMap((item) => item.assignments.filter((assignment) => assignment.status !== "ARCHIVED"));
    return {
      id: "ARCHIVE_ASSIGNMENT",
      title: "Archive Assignment",
      description: "Bài sẽ biến mất khỏi danh sách đang học nhưng submission, điểm và lịch sử vẫn được giữ.",
      submitLabel: "Kiểm tra trước khi archive",
      fields: [
        { name: "classSectionId", label: "Lớp", type: "select", required: true, options: classroomOptions },
        { name: "assignmentId", label: "Assignment", type: "select", required: true, options: assignments.map((item) => ({ value: item.id, label: `${item.title} · ${item.submissionCount} bài nộp` })) },
      ],
    };
  }
  if (action.type === "CREATE_TEST_DRAFT") {
    return {
      id: "CREATE_TEST",
      title: "Tạo và giao Test",
      description: "Qwen tạo câu hỏi, đáp án và rubric. Có thể giao thẳng hoặc mở Test Builder để duyệt.",
      submitLabel: "Kiểm tra cấu hình đề",
      fields: [
        { name: "classSectionId", label: "Lớp nhận đề", type: "select", required: true, options: classroomOptions },
        { name: "title", label: "Tên đề", type: "text", required: true, placeholder: "B1 Progress Test" },
        { name: "topic", label: "Chủ đề", type: "text", required: true, placeholder: "Daily life and future plans" },
        { name: "skill", label: "Kỹ năng", type: "select", required: true, options: ["MIXED", "READING", "LISTENING", "WRITING", "GRAMMAR", "VOCABULARY"].map((value) => ({ value, label: value })) },
        { name: "level", label: "Trình độ", type: "select", required: true, options: ["A1", "A2", "B1", "B2", "C1", "C2"].map((value) => ({ value, label: value })) },
        { name: "questionCount", label: "Số câu", type: "number", required: true, min: 1, max: 50 },
        { name: "timeLimitMinutes", label: "Thời lượng (phút)", type: "number", required: true, min: 5, max: 240 },
        { name: "dueAt", label: "Hạn làm bài", type: "datetime-local", required: true },
        { name: "attemptLimit", label: "Số lượt làm", type: "number", required: true, min: 1, max: 10 },
        { name: "publishNow", label: "Tạo, xuất bản và giao ngay", type: "checkbox", help: "Tắt để mở bản nháp trong Test Builder trước khi giao." },
      ],
    };
  }
  if (action.type === "ADD_STUDENT") {
    return {
      id: "ADD_STUDENT",
      title: "Thêm học sinh vào lớp",
      description: "Agent tìm đúng tài khoản học sinh theo email và chỉ thêm vào lớp được chọn. Enrollment đã tồn tại sẽ được kích hoạt lại thay vì tạo trùng.",
      submitLabel: "Kiểm tra enrollment",
      fields: [
        { name: "classSectionId", label: "Lớp nhận học sinh", type: "select", required: true, options: classroomOptions },
        { name: "email", label: "Email tài khoản học sinh", type: "text", required: true, placeholder: "student@example.com" },
      ],
    };
  }
  if (action.type === "DECIDE_ENROLLMENT") {
    const requests = selectedClassroom
      ? selectedClassroom.roster.filter((item) => item.status === "REQUESTED").map((item) => ({ ...item, classroomName: selectedClassroom.name }))
      : context.operationalState.classrooms.flatMap((item) => item.roster.filter((entry) => entry.status === "REQUESTED").map((entry) => ({ ...entry, classroomName: item.name })));
    return {
      id: "DECIDE_ENROLLMENT",
      title: "Xử lý yêu cầu vào lớp",
      description: "Chọn đúng yêu cầu và quyết định. Hệ thống giữ lịch sử thay vì xóa enrollment.",
      submitLabel: "Kiểm tra quyết định",
      fields: [
        { name: "classSectionId", label: "Lớp", type: "select", required: true, options: classroomOptions },
        { name: "enrollmentId", label: "Học sinh đang chờ", type: "select", required: true, options: requests.map((item) => ({ value: item.enrollmentId, label: `${item.name || item.email} · ${item.email} · ${item.classroomName}` })) },
        { name: "decision", label: "Quyết định", type: "select", required: true, options: [{ value: "approve", label: "Duyệt vào lớp" }, { value: "reject", label: "Từ chối" }] },
      ],
    };
  }
  if (action.type === "REMOVE_STUDENT") {
    const students = selectedClassroom
      ? selectedClassroom.roster.filter((item) => item.status === "ACTIVE").map((item) => ({ ...item, classroomName: selectedClassroom.name }))
      : context.operationalState.classrooms.flatMap((item) => item.roster.filter((entry) => entry.status === "ACTIVE").map((entry) => ({ ...entry, classroomName: item.name })));
    return {
      id: "REMOVE_STUDENT",
      title: "Loại học sinh khỏi lớp",
      description: "Chỉ thu hồi quyền truy cập. Tài khoản, bài nộp và điểm vẫn được giữ.",
      submitLabel: "Kiểm tra trước khi loại",
      fields: [
        { name: "classSectionId", label: "Lớp", type: "select", required: true, options: classroomOptions },
        { name: "enrollmentId", label: "Học sinh", type: "select", required: true, options: students.map((item) => ({ value: item.enrollmentId, label: `${item.name || item.email} · ${item.email} · ${item.classroomName}` })) },
      ],
    };
  }
  if (action.type === "ADD_CLASS_MEETING") {
    return {
      id: "MANAGE_SCHEDULE",
      title: "Thêm lịch học",
      description: "Lịch định kỳ này xuất hiện trong trang lớp của cả giáo viên và học sinh.",
      submitLabel: "Kiểm tra lịch học",
      fields: [
        { name: "classSectionId", label: "Lớp", type: "select", required: true, options: classroomOptions },
        { name: "dayOfWeek", label: "Ngày học", type: "select", required: true, options: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"].map((label, value) => ({ value: String(value), label })) },
        { name: "startTime", label: "Bắt đầu", type: "time", required: true },
        { name: "endTime", label: "Kết thúc", type: "time", required: true },
        { name: "location", label: "Phòng hoặc link học", type: "text", placeholder: "Phòng 3 hoặc Meet URL" },
        { name: "note", label: "Ghi chú", type: "text" },
      ],
    };
  }
  if (action.type === "REMOVE_CLASS_MEETING") {
    const meetings = selectedClassroom?.schedule || context.operationalState.classrooms.flatMap((item) => item.schedule);
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return {
      id: "MANAGE_SCHEDULE",
      title: "Gỡ lịch học",
      description: "Gỡ đúng một buổi định kỳ đã chọn.",
      submitLabel: "Kiểm tra trước khi gỡ",
      fields: [
        { name: "classSectionId", label: "Lớp", type: "select", required: true, options: classroomOptions },
        { name: "meetingId", label: "Buổi học", type: "select", required: true, options: meetings.map((item) => ({ value: item.id, label: `${dayNames[item.dayOfWeek]} · ${item.startTime}–${item.endTime}${item.location ? ` · ${item.location}` : ""}` })) },
      ],
    };
  }
  if (action.type === "GRADE_SUBMISSION") {
    return {
      id: "GRADE_SUBMISSION",
      title: "Chấm và trả bài",
      description: "Điểm AI là gợi ý. Điểm dưới đây là quyết định riêng của giáo viên và chỉ hiện với học sinh khi chọn Công bố.",
      submitLabel: "Kiểm tra điểm",
      fields: [
        { name: "submissionId", label: "Bài đang chờ", type: "select", required: true, options: context.operationalState.reviewQueue.map((item) => ({ value: item.submissionId, label: `${item.studentName || item.studentEmail} · ${item.assignmentTitle} · ${item.classroomName}` })) },
        { name: "score", label: "Điểm giáo viên", type: "number", required: true, min: 0, max: 1000 },
        { name: "feedback", label: "Nhận xét", type: "textarea", required: true, placeholder: "Điểm mạnh và một việc học sinh nên cải thiện..." },
        { name: "mode", label: "Sau khi chấm", type: "select", required: true, options: [{ value: "save_draft", label: "Lưu nháp, học sinh chưa thấy" }, { value: "publish", label: "Công bố và trả bài" }, { value: "request_revision", label: "Yêu cầu sửa và nộp lại" }] },
      ],
    };
  }
  if (action.type === "ASSIGN_TEST") {
    return {
      id: "ASSIGN_TEST",
      title: "Giao Test cho lớp",
      description: "Chọn một Test đã publish. Agent tạo đúng một delivery cho lớp và cập nhật delivery cũ nếu đề đã từng được giao.",
      submitLabel: "Kiểm tra lịch giao đề",
      fields: [
        { name: "classSectionId", label: "Lớp nhận đề", type: "select", required: true, options: classroomOptions },
        { name: "quizId", label: "Test đã publish", type: "select", required: true, options: context.tests.map((test) => ({ value: test.id, label: `${test.title} · ${test.skill} · ${test._count.questions} câu` })) },
        { name: "dueAt", label: "Hạn làm bài", type: "datetime-local", required: true },
        { name: "attemptLimit", label: "Số lượt làm", type: "number", required: true, min: 1, max: 10 },
      ],
    };
  }
  return null;
}

function matchedClassroomId(message: string, context: TeacherContext) {
  const normalized = normalizeVietnamese(message);
  return context.classrooms.find((item) => normalized.includes(item.code.toLowerCase())
    || normalized.includes(normalizeVietnamese(item.name)))?.id
    || (context.classrooms.length === 1 ? context.classrooms[0].id : "");
}

function defaultDueAt() {
  const dueAt = new Date(Date.now() + 7 * 86400000);
  dueAt.setHours(23, 59, 0, 0);
  return dueAt.toISOString().slice(0, 16);
}

function directWorkflowIntent(message: string, context: TeacherContext): { reply: string; action: AgentAction } | null {
  const plain = normalizeVietnamese(message);
  if (/\b(tao|them|mo)\s+(mot\s+)?lop\b/.test(plain)) {
    return {
      reply: "Tôi sẽ tạo lớp từ đây. Thầy/cô chỉ cần nhập các thông tin học vụ cần thiết; mã lớp và phần kỹ thuật tôi tự xử lý.",
      action: { type: "CREATE_CLASSROOM", summary: "Tạo lớp học mới và lịch học đầu tiên", payload: {} },
    };
  }
  if (/\b(tao|giao)\s+(mot\s+)?(assignment|bai tap)\b/.test(plain)) {
    return {
      reply: "Tôi sẽ chuẩn bị Assignment và giao đúng một lớp. Những thiết lập ít dùng sẽ lấy mặc định an toàn.",
      action: {
        type: "CREATE_ASSIGNMENT",
        summary: "Tạo Assignment và giao cho lớp đã chọn",
        payload: { classSectionId: matchedClassroomId(message, context), skill: "WRITING", cefrLevel: "B1", maxScore: 100, publishNow: true },
      },
    };
  }
  if (/\b(tao|ra|giao)\s+(mot\s+)?(test|de|bai kiem tra)\b/.test(plain)) {
    return {
      reply: "Tôi sẽ tạo nội dung đề, đáp án và rubric. Thầy/cô có thể chọn giao ngay hoặc duyệt bản nháp.",
      action: {
        type: "CREATE_TEST_DRAFT",
        summary: "Tạo Test hoàn chỉnh và giao cho lớp đã chọn",
        payload: { classSectionId: matchedClassroomId(message, context), skill: "MIXED", level: "B1", questionCount: 10, timeLimitMinutes: 30, attemptLimit: 1, dueAt: defaultDueAt(), publishNow: true, shuffleQuestions: false },
      },
    };
  }
  return null;
}

function localAiSettings() {
  return {
    endpoint: (process.env.LOCAL_AI_BASE_URL || "http://127.0.0.1:11434").replace(/\/v1\/?$/, "").replace(/\/$/, ""),
    model: process.env.LOCAL_AI_MODEL || "qwen3.5:9b",
  };
}

async function requestTestDraft(specification: Record<string, AgentValue>, correction?: { draft: TestDraft; errors: string[] }) {
  const { endpoint, model } = localAiSettings();
  const questionCount = Math.min(50, Math.max(1, Number(specification.questionCount) || 10));
  const prompt = correction
    ? `Correct this test draft so it passes every validation error. Preserve good content and return the complete corrected JSON. Errors: ${JSON.stringify(correction.errors)}. Draft: ${JSON.stringify(correction.draft)}`
    : `Create a complete English assessment draft from this teacher specification: ${JSON.stringify({ ...specification, questionCount })}. Produce exactly ${questionCount} useful questions where practical. Every multiple-choice question needs 4 non-empty options and exactly one correct option. Short answers need an answerKey. Essays need a detailed scoring rubric in answerKey. Include concise explanations. Do not leave placeholder text.`;
  const response = await fetch(`${endpoint}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(180_000),
    body: JSON.stringify({
      model,
      stream: false,
      think: false,
      format: testDraftJsonSchema,
      options: { temperature: 0, num_predict: 6000 },
      messages: [
        { role: "system", content: "You design classroom-ready English tests. Return only JSON matching the supplied schema. Accuracy of answer keys and rubrics matters more than creativity." },
        { role: "user", content: prompt },
      ],
    }),
  });
  const result = await response.json() as { message?: { content?: string }; error?: string };
  if (!response.ok || !result.message?.content) throw new Error(result.error || "Qwen không tạo được nội dung đề.");
  return normalizeTestDraft(JSON.parse(result.message.content));
}

function fitGeneratedDraft(input: TestDraft, requestedCount: number) {
  let remaining = requestedCount;
  const completeQuestion = (question: NonNullable<TestDraft["questions"]>[number]) => question.type === "ESSAY" && !question.answerKey?.trim()
    ? { ...question, answerKey: `Rubric (${question.points || 1} points): assess task completion, organization, vocabulary range, grammar accuracy and clarity. Award points proportionally and include one actionable improvement.` }
    : question;
  const sections = (input.sections || []).map((section) => {
    const questions = section.questions.slice(0, remaining).map(completeQuestion);
    remaining -= questions.length;
    return { ...section, questions };
  }).filter((section) => section.questions.length > 0);
  const questions = (input.questions || []).slice(0, remaining).map(completeQuestion);
  return normalizeTestDraft({ ...input, sections, questions });
}

async function generateTestDraft(action: AgentAction, classroomName: string) {
  const now = new Date();
  const defaultDueAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  defaultDueAt.setHours(23, 59, 0, 0);
  const requestedCount = Math.min(50, Math.max(1, Number(action.payload.questionCount) || 10));
  let draft = fitGeneratedDraft(await requestTestDraft(action.payload), requestedCount);
  draft = normalizeTestDraft({
    ...draft,
    title: draft.title || `${classroomName} First Progress Test`,
    timeLimitMinutes: Number(action.payload.timeLimitMinutes) || draft.timeLimitMinutes || 30,
    attemptLimit: Number(action.payload.attemptLimit) || draft.attemptLimit || 1,
    openAt: String(action.payload.openAt || now.toISOString().slice(0, 16)),
    closeAt: String(action.payload.dueAt || defaultDueAt.toISOString().slice(0, 16)),
    published: true,
    shuffleQuestions: action.payload.shuffleQuestions === true,
  });
  let validation = validateTestDraft(draft);
  if (validation.errors.length) {
    draft = normalizeTestDraft({ ...fitGeneratedDraft(await requestTestDraft(action.payload, { draft, errors: validation.errors }), requestedCount), openAt: draft.openAt, closeAt: draft.closeAt, published: true, shuffleQuestions: draft.shuffleQuestions, attemptLimit: draft.attemptLimit });
    validation = validateTestDraft(draft);
  }
  if (validation.errors.length) throw new Error(`Bản nháp còn lỗi: ${validation.errors[0]}`);
  return { draft, warnings: validation.warnings, questionCount: validation.questions };
}

async function executeAction(user: { id: string; role: string }, action: AgentAction) {
  if (action.type === "UPDATE_ASSIGNMENT") {
    const assignmentId = String(action.payload.assignmentId || "");
    const existing = await prisma.assignment.findFirst({
      where: { id: assignmentId, classSection: { teacherId: user.id } },
      select: { id: true, title: true, classSectionId: true, status: true, maxScore: true },
    });
    if (!existing) throw new Error("Không tìm thấy Assignment hoặc thầy/cô không có quyền chỉnh sửa.");
    const title = String(action.payload.title || existing.title).trim();
    if (!title) throw new Error("Tên Assignment không được để trống.");
    const dueAt = action.payload.dueAt ? new Date(String(action.payload.dueAt)) : null;
    const assignment = await prisma.assignment.update({
      where: { id: existing.id },
      data: {
        title,
        instructions: action.payload.instructions === undefined ? undefined : String(action.payload.instructions || "").trim() || null,
        dueAt: dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt : null,
        maxScore: Math.max(1, Number(action.payload.maxScore) || existing.maxScore),
        status: action.payload.publishNow === true ? "PUBLISHED" : existing.status,
      },
    });
    return { ok: true, message: `Đã cập nhật Assignment “${assignment.title}”.`, href: "/elearning/assignments", entityId: assignment.id, classSectionId: assignment.classSectionId };
  }

  if (action.type === "ARCHIVE_ASSIGNMENT") {
    const assignmentId = String(action.payload.assignmentId || "");
    const requestedClassSectionId = String(action.payload.classSectionId || "");
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, classSection: { teacherId: user.id } },
      select: { id: true, title: true, classSectionId: true, status: true },
    });
    if (!assignment) throw new Error("Không tìm thấy Assignment hoặc thầy/cô không có quyền archive.");
    if (requestedClassSectionId && assignment.classSectionId !== requestedClassSectionId) throw new Error("Assignment đã chọn không thuộc lớp được chọn.");
    if (assignment.status !== "ARCHIVED") {
      await prisma.assignment.update({ where: { id: assignment.id }, data: { status: "ARCHIVED" } });
    }
    return { ok: true, message: `Đã archive “${assignment.title}”. Bài nộp và điểm vẫn được giữ.`, href: "/elearning/assignments", entityId: assignment.id, classSectionId: assignment.classSectionId };
  }

  if (action.type === "OPEN_PAGE") {
    const href = String(action.payload.href || "");
    if (!openPages.has(href)) throw new Error("Trang được yêu cầu không nằm trong phạm vi AI Teacher.");
    return { ok: true, message: "Đang mở đúng khu vực thầy/cô yêu cầu.", href };
  }

  if (action.type === "CREATE_TEST_DRAFT") {
    const classSectionId = String(action.payload.classSectionId || "");
    const classroom = await prisma.classSection.findFirst({ where: { id: classSectionId, teacherId: user.id, status: "ACTIVE" }, select: { id: true, name: true, code: true } });
    if (!classroom) throw new Error("Không tìm thấy lớp hoặc thầy/cô không có quyền quản lý lớp này.");
    const generated = await generateTestDraft(action, classroom.name);
    if (action.payload.publishNow === true) {
      const importData = new FormData();
      importData.set("json", JSON.stringify({ ...generated.draft, published: true }));
      importData.set("classSectionId", classroom.id);
      const saved = await importPracticeTestJsonAction(importData);
      if (!saved?.ok || !saved.testId) throw new Error(saved?.message || "Không thể lưu đề vừa tạo.");
      const dueAt = action.payload.dueAt ? new Date(String(action.payload.dueAt)) : new Date(Date.now() + 7 * 86400000);
      await prisma.quizDelivery.upsert({
        where: { quizId_classSectionId: { quizId: saved.testId, classSectionId: classroom.id } },
        update: { status: "PUBLISHED", openAt: new Date(), dueAt, attemptLimit: Math.max(1, Number(action.payload.attemptLimit) || 1), assignedById: user.id },
        create: { quizId: saved.testId, classSectionId: classroom.id, status: "PUBLISHED", openAt: new Date(), dueAt, attemptLimit: Math.max(1, Number(action.payload.attemptLimit) || 1), assignedById: user.id },
      });
      return {
        ok: true,
        message: `Đã tạo, xuất bản và giao đề “${generated.draft.title}” gồm ${generated.questionCount} câu cho lớp ${classroom.name}.`,
        href: `/elearning/classrooms/${classroom.id}?tab=quizzes&created=1`,
        entityId: saved.testId,
        classSectionId: classroom.id,
      };
    }
    return {
      ok: true,
      message: `Đã chuẩn bị đề “${generated.draft.title}” gồm ${generated.questionCount} câu. Hãy kiểm tra bản xem trước trước khi publish và giao lớp.`,
      href: "/elearning/practice/new?agentDraft=1",
      classSectionId: classroom.id,
      draftSession: { draft: generated.draft, classSectionId: classroom.id, classroomName: classroom.name, classroomCode: classroom.code, warnings: generated.warnings },
    };
  }

  if (action.type === "ASSIGN_TEST") {
    const classSectionId = String(action.payload.classSectionId || "");
    const quizId = String(action.payload.quizId || "");
    const [classroom, quiz] = await Promise.all([
      prisma.classSection.findFirst({ where: { id: classSectionId, teacherId: user.id, status: "ACTIVE" }, select: { id: true, name: true } }),
      prisma.quiz.findFirst({ where: { id: quizId, isPracticeTest: true, published: true, createdById: user.id }, select: { id: true, title: true, attemptLimit: true } }),
    ]);
    if (!classroom || !quiz) throw new Error("Lớp hoặc đề đã chọn không còn khả dụng.");
    const dueAt = action.payload.dueAt ? new Date(String(action.payload.dueAt)) : new Date(Date.now() + 7 * 86400000);
    const openAt = action.payload.openAt ? new Date(String(action.payload.openAt)) : new Date();
    const delivery = await prisma.quizDelivery.upsert({
      where: { quizId_classSectionId: { quizId, classSectionId } },
      update: { status: "PUBLISHED", openAt, dueAt, attemptLimit: Math.max(1, Number(action.payload.attemptLimit) || quiz.attemptLimit), assignedById: user.id },
      create: { quizId, classSectionId, status: "PUBLISHED", openAt, dueAt, attemptLimit: Math.max(1, Number(action.payload.attemptLimit) || quiz.attemptLimit), assignedById: user.id },
    });
    return { ok: true, message: `Đã giao đề “${quiz.title}” cho lớp ${classroom.name}. Setup của lớp sẽ được cập nhật ngay.`, href: `/elearning/classrooms/${classroom.id}?tab=quizzes`, entityId: delivery.id, classSectionId: classroom.id };
  }

  if (action.type === "CREATE_ASSIGNMENT") {
    const classSectionId = String(action.payload.classSectionId || "");
    const classroom = await prisma.classSection.findFirst({ where: { id: classSectionId, status: "ACTIVE", teacherId: user.id }, select: { id: true } });
    if (!classroom) throw new Error("Lớp đã chọn không khả dụng.");
    const title = String(action.payload.title || "").trim();
    if (!title) throw new Error("Cần có tiêu đề bài tập.");
    const dueAt = action.payload.dueAt ? new Date(String(action.payload.dueAt)) : null;
    const skill = String(action.payload.skill || "WRITING").toUpperCase();
    const assignment = await prisma.assignment.create({ data: {
      classSectionId,
      title,
      description: String(action.payload.description || "").trim() || null,
      instructions: String(action.payload.instructions || "").trim() || null,
      type: skill === "SPEAKING" ? "SPEAKING" : skill === "WRITING" ? "WRITING" : "HOMEWORK",
      skill: ["LISTENING", "READING", "WRITING", "SPEAKING", "GRAMMAR", "VOCABULARY", "PRONUNCIATION", "MIXED"].includes(skill) ? skill as "LISTENING" | "READING" | "WRITING" | "SPEAKING" | "GRAMMAR" | "VOCABULARY" | "PRONUNCIATION" | "MIXED" : "MIXED",
      cefrLevel: String(action.payload.cefrLevel || "B1"),
      difficulty: "MEDIUM",
      maxScore: Math.max(1, Number(action.payload.maxScore) || 100),
      rubric: skill === "WRITING" ? "Task achievement: 40%\nOrganization and coherence: 25%\nVocabulary: 20%\nGrammar accuracy: 15%" : null,
      allowLateSubmission: false,
      allowResubmission: true,
      status: action.payload.publishNow === true ? "PUBLISHED" : "DRAFT",
      dueAt: dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt : null,
      createdById: user.id,
    } });
    return { ok: true, message: `Đã tạo${assignment.status === "PUBLISHED" ? " và giao" : ""} bài tập “${assignment.title}”.`, href: "/elearning/assignments", entityId: assignment.id, classSectionId };
  }

  if (action.type === "CREATE_CLASSROOM") {
    const name = String(action.payload.name || "").trim();
    if (!name) throw new Error("Cần có tên lớp.");
    let code = String(action.payload.code || "").trim().toUpperCase() || `AEC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    if (await prisma.classSection.findUnique({ where: { code }, select: { id: true } })) code = `AEC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const startAt = action.payload.startAt ? new Date(String(action.payload.startAt)) : null;
    const endAt = action.payload.endAt ? new Date(String(action.payload.endAt)) : null;
    if (startAt && endAt && endAt <= startAt) throw new Error("Ngày kết thúc phải sau ngày bắt đầu.");
    const startTime = String(action.payload.startTime || "");
    const endTime = String(action.payload.endTime || "");
    const hasMeeting = startTime && endTime;
    if (hasMeeting && endTime <= startTime) throw new Error("Giờ kết thúc phải sau giờ bắt đầu.");
    const classroom = await prisma.$transaction(async (tx) => {
      const created = await tx.classSection.create({ data: { name, code, teacherId: user.id, status: "ACTIVE", startAt, endAt } });
      if (hasMeeting) {
        await tx.classMeeting.create({ data: {
          classSectionId: created.id,
          dayOfWeek: Math.min(6, Math.max(0, Number(action.payload.dayOfWeek) || 0)),
          startTime,
          endTime,
          location: String(action.payload.location || "").trim() || null,
        } });
      }
      return created;
    });
    return { ok: true, message: `Đã tạo lớp “${classroom.name}” (${classroom.code}).`, href: `/elearning/classrooms/${classroom.id}?tab=students`, entityId: classroom.id };
  }

  if (action.type === "DECIDE_ENROLLMENT") {
    const enrollmentId = String(action.payload.enrollmentId || "");
    const requestedClassSectionId = String(action.payload.classSectionId || "");
    const decision = String(action.payload.decision || "approve");
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, status: "REQUESTED", classSection: { teacherId: user.id } },
      select: { id: true, classSectionId: true, student: { select: { name: true, email: true } } },
    });
    if (!enrollment) throw new Error("Yêu cầu vào lớp không còn ở trạng thái chờ hoặc không thuộc lớp của thầy/cô.");
    if (requestedClassSectionId && enrollment.classSectionId !== requestedClassSectionId) throw new Error("Học sinh đã chọn không thuộc lớp được chọn.");
    const status = decision === "reject" ? "REJECTED" : "ACTIVE";
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status, decidedAt: new Date(), decidedById: user.id },
    });
    return {
      ok: true,
      message: `${status === "ACTIVE" ? "Đã duyệt" : "Đã từ chối"} yêu cầu của ${enrollment.student.name || enrollment.student.email}.`,
      href: `/elearning/classrooms/${enrollment.classSectionId}?tab=students`,
      entityId: enrollment.id,
      classSectionId: enrollment.classSectionId,
    };
  }

  if (action.type === "REMOVE_STUDENT") {
    const enrollmentId = String(action.payload.enrollmentId || "");
    const requestedClassSectionId = String(action.payload.classSectionId || "");
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, status: "ACTIVE", classSection: { teacherId: user.id } },
      select: {
        id: true,
        classSectionId: true,
        student: { select: { name: true, email: true } },
        classSection: { select: { name: true } },
      },
    });
    if (!enrollment) throw new Error("Không tìm thấy học sinh đang ACTIVE trong lớp của thầy/cô.");
    if (requestedClassSectionId && enrollment.classSectionId !== requestedClassSectionId) throw new Error("Học sinh đã chọn không thuộc lớp được chọn.");
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "REMOVED", decidedAt: new Date(), decidedById: user.id },
    });
    return {
      ok: true,
      message: `Đã loại ${enrollment.student.name || enrollment.student.email} khỏi ${enrollment.classSection.name}; tài khoản, bài nộp và điểm vẫn được giữ.`,
      href: `/elearning/classrooms/${enrollment.classSectionId}?tab=students`,
      entityId: enrollment.id,
      classSectionId: enrollment.classSectionId,
    };
  }

  if (action.type === "ADD_CLASS_MEETING") {
    const classSectionId = String(action.payload.classSectionId || "");
    const classroom = await prisma.classSection.findFirst({
      where: { id: classSectionId, teacherId: user.id, status: "ACTIVE" },
      select: { id: true, name: true },
    });
    if (!classroom) throw new Error("Lớp không còn khả dụng.");
    const dayOfWeek = Number(action.payload.dayOfWeek);
    const startTime = String(action.payload.startTime || "");
    const endTime = String(action.payload.endTime || "");
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6 || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime) || endTime <= startTime) {
      throw new Error("Ngày và giờ học không hợp lệ.");
    }
    const conflict = await prisma.classMeeting.findFirst({
      where: { classSectionId, dayOfWeek, startTime: { lt: endTime }, endTime: { gt: startTime } },
      select: { startTime: true, endTime: true },
    });
    if (conflict) throw new Error(`Lịch mới bị trùng với buổi ${conflict.startTime}–${conflict.endTime}.`);
    const meeting = await prisma.classMeeting.create({
      data: {
        classSectionId,
        dayOfWeek,
        startTime,
        endTime,
        location: String(action.payload.location || "").trim() || null,
        note: String(action.payload.note || "").trim() || null,
      },
    });
    return { ok: true, message: `Đã thêm lịch học cho ${classroom.name}.`, href: `/elearning/classrooms/${classroom.id}?tab=overview`, entityId: meeting.id, classSectionId };
  }

  if (action.type === "REMOVE_CLASS_MEETING") {
    const classSectionId = String(action.payload.classSectionId || "");
    const meetingId = String(action.payload.meetingId || "");
    const meeting = await prisma.classMeeting.findFirst({
      where: { id: meetingId, classSectionId, classSection: { teacherId: user.id } },
      select: { id: true, classSectionId: true, startTime: true, endTime: true },
    });
    if (!meeting) throw new Error("Không tìm thấy buổi học thuộc lớp của thầy/cô.");
    await prisma.classMeeting.delete({ where: { id: meeting.id } });
    return { ok: true, message: `Đã gỡ lịch ${meeting.startTime}–${meeting.endTime}.`, href: `/elearning/classrooms/${meeting.classSectionId}?tab=overview`, entityId: meeting.id, classSectionId: meeting.classSectionId };
  }

  if (action.type === "GRADE_SUBMISSION") {
    const submissionId = String(action.payload.submissionId || "");
    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, assignment: { classSection: { teacherId: user.id } } },
      select: {
        id: true,
        studentId: true,
        assignmentId: true,
        status: true,
        assignment: { select: { title: true, maxScore: true, classSectionId: true } },
        student: { select: { name: true, email: true } },
      },
    });
    if (!submission || !["SUBMITTED", "PENDING", "REVISION_REQUESTED"].includes(String(submission.status))) {
      throw new Error("Bài nộp không còn ở trạng thái có thể chấm.");
    }
    const score = Number(action.payload.score);
    if (!Number.isFinite(score) || score < 0 || score > submission.assignment.maxScore) {
      throw new Error(`Điểm phải nằm trong khoảng 0–${submission.assignment.maxScore}.`);
    }
    const mode = String(action.payload.mode || "publish");
    const gradeStatus = mode === "save_draft" ? "DRAFT" : mode === "request_revision" ? "REVISION_REQUESTED" : "PUBLISHED";
    const submissionStatus = mode === "save_draft" ? "SUBMITTED" : mode === "request_revision" ? "REVISION_REQUESTED" : "GRADED";
    const grade = await prisma.$transaction(async (tx) => {
      const saved = await tx.grade.upsert({
        where: { submissionId: submission.id },
        update: {
          score,
          feedback: String(action.payload.feedback || "").trim() || null,
          gradedById: user.id,
          status: gradeStatus,
          publishedAt: gradeStatus === "PUBLISHED" ? new Date() : null,
        },
        create: {
          submissionId: submission.id,
          studentId: submission.studentId,
          assignmentId: submission.assignmentId,
          score,
          feedback: String(action.payload.feedback || "").trim() || null,
          gradedById: user.id,
          status: gradeStatus,
          publishedAt: gradeStatus === "PUBLISHED" ? new Date() : null,
        },
      });
      await tx.submission.update({ where: { id: submission.id }, data: { status: submissionStatus } });
      return saved;
    });
    return {
      ok: true,
      message: gradeStatus === "PUBLISHED"
        ? `Đã công bố điểm bài “${submission.assignment.title}” cho ${submission.student.name || submission.student.email}.`
        : gradeStatus === "DRAFT"
          ? "Đã lưu điểm nháp; học sinh chưa nhìn thấy."
          : "Đã yêu cầu học sinh sửa và nộp lại.",
      href: "/elearning/scores",
      entityId: grade.id,
      classSectionId: submission.assignment.classSectionId,
    };
  }

  const classSectionId = String(action.payload.classSectionId || "");
  const email = String(action.payload.email || "").trim().toLowerCase();
  const classroom = await prisma.classSection.findFirst({ where: { id: classSectionId, teacherId: user.id }, select: { id: true, name: true } });
  if (!classroom) throw new Error("Lớp đã chọn không khả dụng.");
  const student = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" }, role: "STUDENT" }, select: { id: true, name: true, email: true } });
  if (!student) throw new Error("Không tìm thấy tài khoản học sinh với email này.");
  const enrollment = await prisma.enrollment.upsert({ where: { userId_classSectionId: { userId: student.id, classSectionId } }, update: { status: "ACTIVE", decidedAt: new Date(), decidedById: user.id }, create: { userId: student.id, classSectionId, status: "ACTIVE", decidedAt: new Date(), decidedById: user.id } });
  return { ok: true, message: `Đã thêm ${student.name || student.email} vào ${classroom.name}.`, href: `/elearning/classrooms/${classroom.id}?tab=students`, entityId: enrollment.id, classSectionId };
}

async function verifyActionEffect(userId: string, action: AgentAction, result: { entityId?: string; classSectionId?: string }) {
  if (action.type === "UPDATE_ASSIGNMENT") {
    const assignment = await prisma.assignment.findFirst({
      where: { id: result.entityId, classSection: { teacherId: userId } },
      select: { title: true, classSection: { select: { name: true } } },
    });
    return assignment ? `Đã kiểm chứng “${assignment.title}” được cập nhật trong lớp ${assignment.classSection.name}.` : null;
  }
  if (action.type === "ARCHIVE_ASSIGNMENT") {
    const assignment = await prisma.assignment.findFirst({
      where: { id: result.entityId, status: "ARCHIVED", classSection: { teacherId: userId } },
      select: { title: true, _count: { select: { submissions: true, grades: true } } },
    });
    return assignment ? `Đã kiểm chứng “${assignment.title}” ở trạng thái ARCHIVED; giữ ${assignment._count.submissions} bài nộp và ${assignment._count.grades} bản ghi điểm.` : null;
  }
  if (action.type === "OPEN_PAGE") return "Điều hướng không thay đổi dữ liệu.";
  if (action.type === "CREATE_CLASSROOM") {
    const classroom = await prisma.classSection.findFirst({
      where: { id: result.entityId, teacherId: userId },
      select: { name: true, code: true },
    });
    return classroom ? `Đã kiểm chứng lớp ${classroom.name} (${classroom.code}) trong database.` : null;
  }
  if (action.type === "CREATE_ASSIGNMENT") {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: result.entityId,
        classSection: { teacherId: userId },
      },
      select: { title: true, status: true, classSection: { select: { name: true } } },
    });
    return assignment ? `Đã kiểm chứng Assignment “${assignment.title}” ở lớp ${assignment.classSection.name}, trạng thái ${assignment.status}.` : null;
  }
  if (action.type === "ADD_STUDENT") {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: result.entityId,
        status: "ACTIVE",
        classSection: { teacherId: userId },
      },
      select: { student: { select: { email: true } }, classSection: { select: { name: true } } },
    });
    return enrollment ? `Đã kiểm chứng ${enrollment.student.email} đang ACTIVE trong lớp ${enrollment.classSection.name}.` : null;
  }
  if (action.type === "DECIDE_ENROLLMENT") {
    const expectedStatus = String(action.payload.decision) === "reject" ? "REJECTED" : "ACTIVE";
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: result.entityId, status: expectedStatus, classSection: { teacherId: userId } },
      select: { student: { select: { email: true } }, classSection: { select: { name: true } } },
    });
    return enrollment ? `Đã kiểm chứng ${enrollment.student.email} có trạng thái ${expectedStatus} trong ${enrollment.classSection.name}.` : null;
  }
  if (action.type === "REMOVE_STUDENT") {
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: result.entityId, status: "REMOVED", classSection: { teacherId: userId } },
      select: { student: { select: { email: true } }, classSection: { select: { name: true } } },
    });
    return enrollment ? `Đã kiểm chứng quyền truy cập của ${enrollment.student.email} tại ${enrollment.classSection.name} đã bị thu hồi, enrollment vẫn còn để giữ lịch sử.` : null;
  }
  if (action.type === "ADD_CLASS_MEETING") {
    const meeting = await prisma.classMeeting.findFirst({
      where: { id: result.entityId, classSection: { teacherId: userId } },
      select: { startTime: true, endTime: true, classSection: { select: { name: true } } },
    });
    return meeting ? `Đã kiểm chứng lịch ${meeting.startTime}–${meeting.endTime} được thêm vào ${meeting.classSection.name}.` : null;
  }
  if (action.type === "REMOVE_CLASS_MEETING") {
    const [meeting, classroom] = await Promise.all([
      prisma.classMeeting.findUnique({ where: { id: String(result.entityId || "") }, select: { id: true } }),
      prisma.classSection.findFirst({ where: { id: result.classSectionId, teacherId: userId }, select: { name: true } }),
    ]);
    return !meeting && classroom ? `Đã kiểm chứng buổi học được gỡ khỏi ${classroom.name}.` : null;
  }
  if (action.type === "GRADE_SUBMISSION") {
    const expectedStatus = String(action.payload.mode) === "save_draft"
      ? "DRAFT"
      : String(action.payload.mode) === "request_revision"
        ? "REVISION_REQUESTED"
        : "PUBLISHED";
    const grade = await prisma.grade.findFirst({
      where: { id: result.entityId, status: expectedStatus, assignment: { classSection: { teacherId: userId } } },
      select: { score: true, student: { select: { email: true } }, assignment: { select: { title: true } } },
    });
    return grade ? `Đã kiểm chứng điểm giáo viên ${grade.score} cho ${grade.student.email} ở trạng thái ${expectedStatus}.` : null;
  }
  if (action.type === "ASSIGN_TEST" || (action.type === "CREATE_TEST_DRAFT" && action.payload.publishNow === true)) {
    const classSectionId = String(result.classSectionId || action.payload.classSectionId || "");
    const quizId = action.type === "ASSIGN_TEST" ? String(action.payload.quizId || "") : String(result.entityId || "");
    const delivery = await prisma.quizDelivery.findFirst({
      where: {
        classSectionId,
        quizId,
        status: "PUBLISHED",
        classSection: { teacherId: userId },
      },
      select: { quiz: { select: { title: true } }, classSection: { select: { name: true } } },
    });
    return delivery ? `Đã kiểm chứng Test “${delivery.quiz.title}” được giao cho ${delivery.classSection.name}.` : null;
  }
  if (action.type === "CREATE_TEST_DRAFT") {
    return result.entityId ? "Đã kiểm chứng bản nháp Test." : "Bản nháp Test đã được chuẩn bị để giáo viên duyệt.";
  }
  return null;
}

export async function GET() {
  const user = await requireUser(["TEACHER"]);
  const [session, workflowProgress] = await Promise.all([
    prisma.teacherAgentSession.findUnique({ where: { teacherId: user.id } }),
    loadActiveTeacherWorkflow(user.id),
  ]);
  return NextResponse.json({
    messages: storedMessages(session?.messages),
    pendingAction: session?.pendingAction || null,
    workflow: session?.workflow || null,
    workflowEditing: session?.workflowEditing || false,
    currentPath: session?.currentPath || null,
    workflowProgress,
  });
}

export async function POST(request: Request) {
  const user = await requireUser(["TEACHER"]);
  const body = await request.json() as {
    message?: string;
    history?: Array<{ role: string; content: string }>;
    execute?: AgentAction;
    currentPath?: string;
    saveState?: {
      messages?: StoredMessage[];
      pendingAction?: AgentAction | null;
      workflow?: TeacherWorkflow | null;
      workflowEditing?: boolean;
      currentPath?: string | null;
    };
  };
  if (body.saveState) {
    const existing = await prisma.teacherAgentSession.findUnique({ where: { teacherId: user.id }, select: { messages: true } });
    await saveAgentState(user.id, {
      messages: body.saveState.messages ? storedMessages(body.saveState.messages) : storedMessages(existing?.messages),
      pendingAction: body.saveState.pendingAction || null,
      workflow: body.saveState.workflow || null,
      workflowEditing: body.saveState.workflowEditing,
      currentPath: body.saveState.currentPath || body.currentPath || null,
    });
    return NextResponse.json({ ok: true });
  }
  if (body.execute) {
    if (!isAgentAction(body.execute)) return NextResponse.json({ error: "Kế hoạch tác vụ không hợp lệ." }, { status: 400 });
    const idempotencyKey = body.execute.idempotencyKey || randomUUID();
    const session = await prisma.teacherAgentSession.upsert({
      where: { teacherId: user.id },
      update: { currentPath: body.currentPath || undefined },
      create: { teacherId: user.id, messages: [], currentPath: body.currentPath || null },
    });
    const previous = await prisma.teacherAgentExecution.findUnique({
      where: { teacherId_idempotencyKey: { teacherId: user.id, idempotencyKey } },
    });
    if (previous?.status === "COMPLETED" && previous.result) return NextResponse.json(previous.result);
    if (previous) {
      const message = previous.status === "RUNNING"
        ? "Tác vụ này đang hoặc đã được thực hiện trước khi phiên bị gián đoạn. Hệ thống sẽ không chạy lại để tránh tạo dữ liệu trùng."
        : previous.error || "Tác vụ trước đó chưa hoàn tất. Hãy sửa thông tin để tạo một lần xác nhận mới.";
      return NextResponse.json({ error: message }, { status: 409 });
    }
    await updateWorkflowForConfirmation(body.execute);
    const execution = await prisma.teacherAgentExecution.create({
      data: {
        teacherId: user.id,
        sessionId: session.id,
        idempotencyKey,
        actionType: body.execute.type,
        payload: jsonInput(body.execute),
      },
    });
    try {
      const result = await executeAction(user, body.execute);
      const evidence = await verifyActionEffect(user.id, body.execute, result);
      if (!evidence) throw new Error("Tác vụ đã chạy nhưng verifier không tìm thấy kết quả mong đợi trong database. Workflow đã được chuyển sang trạng thái cần kiểm tra.");
      await completeWorkflowStep(body.execute, result, evidence);
      let nextAction: AgentAction | null = null;
      let nextWorkflow: TeacherWorkflow | null = null;
      let workflowProgress = await loadActiveTeacherWorkflow(user.id);
      let continuationReply = "";
      if (body.execute.workflowRunId) {
        const completedRun = await prisma.teacherWorkflowRun.findUnique({
          where: { id: body.execute.workflowRunId },
          select: { workflowId: true, targetId: true },
        });
        if (completedRun?.workflowId === "CLASSROOM_SETUP") {
          const targetId = completedRun.targetId || result.classSectionId || (body.execute.type === "CREATE_CLASSROOM" ? result.entityId : undefined);
          if (targetId) {
            const nextContext = await teacherContext(user.id);
            const nextPlan = planTeacherWorkflow("hoàn tất setup lớp này", `/elearning/classrooms/${targetId}`, nextContext.operationalState);
            if (nextPlan) {
              const persistedNext = await persistTeacherWorkflowPlan(user.id, session.id, nextPlan);
              nextAction = persistedNext.action ? {
                ...persistedNext.action,
                idempotencyKey: persistedNext.action.idempotencyKey || randomUUID(),
              } : null;
              nextWorkflow = nextAction ? workflowForAction(nextAction, nextContext) : null;
              workflowProgress = persistedNext.progress;
              continuationReply = nextAction ? ` Bước hợp lệ tiếp theo: ${nextPlan.reply}` : ` ${nextPlan.reply}`;
            }
          }
        }
      }
      const responseMessage = `${result.message || "Tác vụ đã hoàn thành."}${continuationReply}`;
      const verifiedResult = { ...result, message: responseMessage, evidence, workflowProgress, action: nextAction, workflow: nextWorkflow };
      await prisma.$transaction([
        prisma.teacherAgentExecution.update({ where: { id: execution.id }, data: { status: "COMPLETED", result: jsonInput(verifiedResult) } }),
        prisma.teacherAgentSession.update({
          where: { id: session.id },
          data: {
            messages: jsonInput([...storedMessages(session.messages), { role: "assistant", content: responseMessage }].slice(-100)),
            pendingAction: nextAction ? jsonInput(nextAction) : Prisma.DbNull,
            workflow: nextWorkflow ? jsonInput(nextWorkflow) : Prisma.DbNull,
            workflowEditing: Boolean(nextAction && nextWorkflow),
            currentPath: result.href || body.currentPath || null,
          },
        }),
      ]);
      return NextResponse.json(verifiedResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể hoàn thành tác vụ.";
      await failWorkflowStep(body.execute, message);
      await prisma.teacherAgentExecution.update({ where: { id: execution.id }, data: { status: "FAILED", error: message } });
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const message = String(body.message || "").trim().slice(0, 2000);
  if (!message) return NextResponse.json({ error: "Hãy nhập yêu cầu." }, { status: 400 });
  const context = await teacherContext(user.id);
  const plainMessage = normalizeVietnamese(message);
  const deterministicPlan = planTeacherWorkflow(message, body.currentPath, context.operationalState);
  if (deterministicPlan) {
    return workflowPlanResponse(user.id, message, deterministicPlan, context, body.currentPath);
  }
  const publishIntent = /\b(publish|xuat ban|dang bai|giao de)\b/.test(plainMessage);
  if (publishIntent && body.currentPath?.startsWith("/elearning/practice/new")) {
    return planResponse(user.id, message, {
      reply: "Bản nháp đang nằm trong Test Builder và chưa được ghi vào hệ thống. Thầy/cô hãy kiểm tra nhanh nội dung, lớp nhận đề và thời hạn, sau đó bấm “Publish & assign”. Tôi không tự bấm bỏ qua bước duyệt này để tránh giao nhầm đề hoặc nhầm lớp.",
      action: null,
      model: "workflow-engine",
      setup: context.setup,
    }, body.currentPath);
  }
  const requestsSetupTest = context.setup.nextStep?.key === "test" && (plainMessage.includes("step 4") || plainMessage.includes("buoc 4") || plainMessage.includes("setup tiep theo") || plainMessage.includes("giai quyet setup"));
  if (requestsSetupTest && context.setup.classroomId) {
    const dueAt = new Date(Date.now() + 7 * 86400000);
    dueAt.setHours(23, 59, 0, 0);
    const classroomName = context.setup.classroomName || "Classroom";
    const action = {
      type: "CREATE_TEST_DRAFT",
      summary: `Tạo Test hoàn chỉnh cho ${classroomName} và giao đúng lớp`,
      payload: { classSectionId: context.setup.classroomId, title: `${classroomName} First Progress Test`, topic: "General English progress review", skill: "MIXED", level: "B1", questionCount: 10, timeLimitMinutes: 30, attemptLimit: 1, dueAt: dueAt.toISOString().slice(0, 16), publishNow: true, shuffleQuestions: false },
    } satisfies AgentAction;
    return planResponse(user.id, message, {
      reply: `Step 4 của ${classroomName} là tạo và giao Test. Tôi đã điền mặc định General English B1, MIXED, 10 câu, 30 phút, một lượt và hạn sau 7 ngày. Thầy/cô chỉ cần kiểm tra form bên dưới.`,
      action,
      workflow: workflowForAction(action, context),
      model: "workflow-engine",
      setup: context.setup,
    }, body.currentPath);
  }
  const directIntent = directWorkflowIntent(message, context);
  if (directIntent) {
    return planResponse(user.id, message, {
      ...directIntent,
      workflow: workflowForAction(directIntent.action, context),
      model: "workflow-engine",
      setup: context.setup,
    }, body.currentPath);
  }
  const { endpoint, model } = localAiSettings();
  try {
    const response = await fetch(`${endpoint}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(120_000), body: JSON.stringify({ model, stream: false, think: false, format: agentPlanSchema, options: { temperature: 0, num_predict: 2400 }, messages: [
      { role: "system", content: `You are the operations agent for an English LMS. Reply in Vietnamese when the user writes Vietnamese. Use the live context; never ask the teacher to explain a setup step that context already defines. You may prepare one action: CREATE_ASSIGNMENT, UPDATE_ASSIGNMENT, ARCHIVE_ASSIGNMENT, CREATE_CLASSROOM, ADD_STUDENT, DECIDE_ENROLLMENT, REMOVE_STUDENT, ADD_CLASS_MEETING, REMOVE_CLASS_MEETING, GRADE_SUBMISSION, OPEN_PAGE, CREATE_TEST_DRAFT, ASSIGN_TEST.

Setup rules:
- If setup.nextStep.key is "test", Step 4 means assign the first published test to setup.classroomId.
- If the user asks to solve/complete Step 4 and a suitable published test exists, propose ASSIGN_TEST using its real id.
- If there is no suitable test, or the teacher asks to create a test, propose CREATE_TEST_DRAFT for setup.classroomId. Fill sensible defaults without interrogating the teacher: topic "General English progress review", skill "MIXED", level "B1", questionCount 10, timeLimitMinutes 30, attemptLimit 1, dueAt seven days from context.now. Mention these defaults in the reply so they can be changed.
- CREATE_TEST_DRAFT required payload: classSectionId, title, topic, skill, level, questionCount, timeLimitMinutes, attemptLimit, dueAt, shuffleQuestions.
- ASSIGN_TEST required payload: classSectionId, quizId, dueAt, attemptLimit.
- Enrollment actions must use a real enrollmentId from operationalState. REMOVE_STUDENT never deletes an account, submissions or grades.
- Prefer ARCHIVE_ASSIGNMENT over deletion. Do not propose irreversible deletion.
- GRADE_SUBMISSION uses a real submissionId. AI scores are advisory; only a teacher score with mode publish is visible to students.
- ADD_CLASS_MEETING requires classSectionId, dayOfWeek (0-6), startTime and endTime. Never invent an existing meetingId.
- Never invent IDs; only use IDs in context.
- Ask one concise follow-up only when a required entity cannot be resolved safely.
- Every write or generated draft is a plan requiring explicit confirmation. Never claim it already happened.
- Return JSON only: {"reply":"...","action":null OR {"type":"...","summary":"...","payload":{...}}}.

Current page: ${body.currentPath || "/elearning"}. Live context: ${JSON.stringify(context)}` },
      ...(body.history || []).slice(-10).map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: String(item.content).slice(0, 1500) })),
      { role: "user", content: message },
    ] }) });
    const payload = await response.json() as { message?: { content?: string }; error?: string };
    if (!response.ok || !payload.message?.content) throw new Error(payload.error || "Qwen không trả về kế hoạch.");
    const plan = jsonObject(payload.message.content);
    const action = isAgentAction(plan.action) ? plan.action : null;
    return planResponse(user.id, message, {
      reply: plan.reply || "Tôi cần thêm một chút thông tin.",
      action,
      workflow: action ? workflowForAction(action, context) : null,
      model,
      setup: context.setup,
    }, body.currentPath);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI Teacher đang tạm thời không khả dụng." }, { status: 503 });
  }
}

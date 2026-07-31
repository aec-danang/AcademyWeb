import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  TeacherAgentAction,
  TeacherWorkflowProgress,
  TeacherWorkflowStepProgress,
} from "@/lib/teacherAgentWorkflows";

type SetupStepId = "classroom" | "student" | "learning" | "test";

export type ClassroomOperationalState = {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  activeStudents: number;
  pendingStudents: number;
  publishedAssignments: number;
  publishedTests: number;
  meetings: number;
  roster: Array<{
    enrollmentId: string;
    status: string;
    studentId: string;
    name: string;
    email: string;
  }>;
  schedule: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    location: string;
    note: string;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    status: string;
    maxScore: number;
    dueAt: Date | null;
    submissionCount: number;
  }>;
};

export type TeacherOperationalState = {
  classrooms: ClassroomOperationalState[];
  publishedTests: Array<{
    id: string;
    title: string;
    skill: string;
    attemptLimit: number;
  }>;
  reviewQueue: Array<{
    submissionId: string;
    assignmentId: string;
    assignmentTitle: string;
    classSectionId: string;
    classroomName: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    maxScore: number;
    aiScore: number | null;
    aiStatus: string;
  }>;
};

export type TeacherWorkflowPlan = {
  reply: string;
  action: TeacherAgentAction | null;
  progress: TeacherWorkflowProgress;
  targetId?: string;
  targetLabel?: string;
};

type SetupDefinition = {
  id: SetupStepId;
  label: string;
  dependencies: SetupStepId[];
  isComplete: (classroom: ClassroomOperationalState | null) => boolean;
  evidence: (classroom: ClassroomOperationalState | null) => string | undefined;
};

export const classroomSetupRegistry: SetupDefinition[] = [
  {
    id: "classroom",
    label: "Tạo lớp học",
    dependencies: [],
    isComplete: (classroom) => Boolean(classroom),
    evidence: (classroom) => classroom ? `${classroom.name} (${classroom.code}) đã tồn tại` : undefined,
  },
  {
    id: "student",
    label: "Có học sinh trong lớp",
    dependencies: ["classroom"],
    isComplete: (classroom) => Boolean(classroom?.activeStudents),
    evidence: (classroom) => classroom?.activeStudents ? `${classroom.activeStudents} học sinh đang hoạt động` : undefined,
  },
  {
    id: "learning",
    label: "Giao Assignment đầu tiên",
    dependencies: ["classroom", "student"],
    isComplete: (classroom) => Boolean(classroom?.publishedAssignments),
    evidence: (classroom) => classroom?.publishedAssignments
      ? `${classroom.publishedAssignments} Assignment đã giao`
      : undefined,
  },
  {
    id: "test",
    label: "Giao bài Test đầu tiên",
    dependencies: ["classroom", "student", "learning"],
    isComplete: (classroom) => Boolean(classroom?.publishedTests),
    evidence: (classroom) => classroom?.publishedTests ? `${classroom.publishedTests} Test đã được giao` : undefined,
  },
];

function jsonInput(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalizeVietnamese(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

function defaultDueAt() {
  const dueAt = new Date(Date.now() + 7 * 86400000);
  dueAt.setHours(23, 59, 0, 0);
  return dueAt.toISOString().slice(0, 16);
}

export async function resolveTeacherClassroomStates(teacherId: string, isAdmin = false): Promise<ClassroomOperationalState[]> {
  const classrooms = await prisma.classSection.findMany({
    where: { status: "ACTIVE", ...(isAdmin ? {} : { teacherId }) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      code: true,
      createdAt: true,
      enrollments: {
        select: {
          id: true,
          status: true,
          userId: true,
          student: { select: { name: true, email: true } },
        },
      },
      assignments: {
        select: {
          id: true,
          title: true,
          status: true,
          maxScore: true,
          dueAt: true,
          _count: { select: { submissions: true } },
        },
      },
      quizDeliveries: {
        where: { status: "PUBLISHED" },
        select: { id: true },
      },
      meetings: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          location: true,
          note: true,
        },
      },
    },
  });
  return classrooms.map((classroom) => ({
    id: classroom.id,
    name: classroom.name,
    code: classroom.code,
    createdAt: classroom.createdAt,
    activeStudents: classroom.enrollments.filter((item) => item.status === "ACTIVE").length,
    pendingStudents: classroom.enrollments.filter((item) => item.status === "REQUESTED").length,
    publishedAssignments: classroom.assignments.filter((item) => item.status === "PUBLISHED").length,
    publishedTests: classroom.quizDeliveries.length,
    meetings: classroom.meetings.length,
    roster: classroom.enrollments.map((item) => ({
      enrollmentId: item.id,
      status: String(item.status),
      studentId: item.userId,
      name: item.student.name || "",
      email: item.student.email || "",
    })),
    schedule: classroom.meetings.map((item) => ({
      id: item.id,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location || "",
      note: item.note || "",
    })),
    assignments: classroom.assignments.map((item) => ({
      id: item.id,
      title: item.title,
      status: String(item.status),
      maxScore: item.maxScore,
      dueAt: item.dueAt,
      submissionCount: item._count.submissions,
    })),
  }));
}

export async function resolveTeacherOperationalState(teacherId: string, isAdmin = false): Promise<TeacherOperationalState> {
  const [classrooms, tests, submissions] = await Promise.all([
    resolveTeacherClassroomStates(teacherId, isAdmin),
    prisma.quiz.findMany({
      where: {
        isPracticeTest: true,
        published: true,
        createdById: teacherId,
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: { id: true, title: true, skill: true, attemptLimit: true },
    }),
    prisma.submission.findMany({
      where: {
        status: { in: ["SUBMITTED", "PENDING"] },
        ...(isAdmin ? {} : { assignment: { classSection: { teacherId } } }),
      },
      orderBy: { submittedAt: "asc" },
      take: 50,
      select: {
        id: true,
        studentId: true,
        student: { select: { name: true, email: true } },
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
            classSectionId: true,
            classSection: { select: { name: true } },
          },
        },
        grade: { select: { aiScore: true, aiStatus: true } },
      },
    }),
  ]);

  return {
    classrooms,
    publishedTests: tests.map((test) => ({
      ...test,
      skill: String(test.skill),
    })),
    reviewQueue: submissions.map((submission) => ({
      submissionId: submission.id,
      assignmentId: submission.assignment.id,
      assignmentTitle: submission.assignment.title,
      classSectionId: submission.assignment.classSectionId,
      classroomName: submission.assignment.classSection.name,
      studentId: submission.studentId,
      studentName: submission.student.name || "",
      studentEmail: submission.student.email || "",
      maxScore: submission.assignment.maxScore,
      aiScore: submission.grade?.aiScore ?? null,
      aiStatus: String(submission.grade?.aiStatus || "NOT_REQUESTED"),
    })),
  };
}

function requestedSetupStep(message: string): SetupStepId | null {
  const normalized = normalizeVietnamese(message);
  const numeric = normalized.match(/\b(?:step|buoc)\s*([1-4])\b/)?.[1];
  if (numeric) return classroomSetupRegistry[Number(numeric) - 1]?.id || null;
  if (/\b(hoc sinh|student|roster)\b/.test(normalized)) return "student";
  if (/\b(assignment|bai tap|bai hoc|lesson)\b/.test(normalized)) return "learning";
  if (/\b(test|quiz|de thi|bai kiem tra)\b/.test(normalized)) return "test";
  return null;
}

function targetClassroom(message: string, currentPath: string | undefined, state: TeacherOperationalState) {
  const pathId = currentPath?.match(/\/elearning\/classrooms\/([^/?]+)/)?.[1];
  if (pathId) {
    const fromPath = state.classrooms.find((item) => item.id === pathId);
    if (fromPath) return fromPath;
  }
  const normalized = normalizeVietnamese(message);
  const named = state.classrooms.find((item) => normalized.includes(normalizeVietnamese(item.code))
    || normalized.includes(normalizeVietnamese(item.name)));
  if (named) return named;
  if (state.classrooms.length === 1) return state.classrooms[0];
  return null;
}

function setupProgress(classroom: ClassroomOperationalState | null, currentStepId?: SetupStepId, blockedStepId?: SetupStepId): TeacherWorkflowProgress {
  const steps: TeacherWorkflowStepProgress[] = classroomSetupRegistry.map((step) => ({
    id: step.id,
    label: step.label,
    status: step.isComplete(classroom)
      ? "COMPLETED"
      : step.id === blockedStepId
        ? "BLOCKED"
        : step.id === currentStepId
          ? "CURRENT"
          : "PENDING",
    evidence: step.evidence(classroom),
  }));
  return {
    workflowId: "CLASSROOM_SETUP",
    title: "Hoàn tất thiết lập lớp học",
    status: blockedStepId
      ? "BLOCKED"
      : currentStepId
        ? "WAITING_INPUT"
        : steps.every((step) => step.status === "COMPLETED")
          ? "COMPLETED"
          : "PLANNING",
    targetLabel: classroom ? `${classroom.name} (${classroom.code})` : undefined,
    currentStepId,
    steps,
  };
}

function singleStepProgress(workflowId: string, title: string, stepId: string, label: string, targetLabel?: string): TeacherWorkflowProgress {
  return {
    workflowId,
    title,
    status: "WAITING_INPUT",
    targetLabel,
    currentStepId: stepId,
    steps: [{ id: stepId, label, status: "CURRENT" }],
  };
}

function actionForSetupStep(stepId: SetupStepId, classroom: ClassroomOperationalState | null, state: TeacherOperationalState): TeacherAgentAction {
  if (stepId === "classroom") {
    return { type: "CREATE_CLASSROOM", summary: "Tạo lớp học mới", payload: {} };
  }
  if (!classroom) {
    return { type: "CREATE_CLASSROOM", summary: "Tạo lớp học trước khi tiếp tục setup", payload: {} };
  }
  if (stepId === "student") {
    return {
      type: "ADD_STUDENT",
      summary: `Thêm học sinh đã có tài khoản vào ${classroom.name}`,
      payload: { classSectionId: classroom.id, email: "" },
    };
  }
  if (stepId === "learning") {
    return {
      type: "CREATE_ASSIGNMENT",
      summary: `Tạo và giao Assignment đầu tiên cho ${classroom.name}`,
      payload: {
        classSectionId: classroom.id,
        skill: "WRITING",
        cefrLevel: "B1",
        maxScore: 100,
        publishNow: true,
      },
    };
  }
  if (state.publishedTests.length) {
    return {
      type: "ASSIGN_TEST",
      summary: `Giao Test đầu tiên cho ${classroom.name}`,
      payload: {
        classSectionId: classroom.id,
        quizId: state.publishedTests.length === 1 ? state.publishedTests[0].id : "",
        dueAt: defaultDueAt(),
        attemptLimit: 1,
      },
    };
  }
  return {
    type: "CREATE_TEST_DRAFT",
    summary: `Tạo và giao Test đầu tiên cho ${classroom.name}`,
    payload: {
      classSectionId: classroom.id,
      title: `${classroom.name} First Progress Test`,
      topic: "General English progress review",
      skill: "MIXED",
      level: "B1",
      questionCount: 10,
      timeLimitMinutes: 30,
      attemptLimit: 1,
      dueAt: defaultDueAt(),
      publishNow: true,
      shuffleQuestions: false,
    },
  };
}

function isSetupIntent(normalized: string) {
  return /\b(setup|thiet lap|hoan tat|giai quyet|tiep theo)\b/.test(normalized)
    && /\b(lop|class|step|buoc|setup)\b/.test(normalized);
}

function matchingRosterEntry(
  message: string,
  classroom: ClassroomOperationalState | null,
  statuses?: string[],
) {
  if (!classroom) return null;
  const normalized = normalizeVietnamese(message);
  const candidates = classroom.roster.filter((item) => !statuses || statuses.includes(item.status));
  return candidates.find((item) => item.email && normalized.includes(normalizeVietnamese(item.email)))
    || candidates.find((item) => item.name && normalized.includes(normalizeVietnamese(item.name)))
    || (candidates.length === 1 ? candidates[0] : null);
}

function matchingAssignment(message: string, classroom: ClassroomOperationalState | null) {
  if (!classroom) return null;
  const normalized = normalizeVietnamese(message);
  return classroom.assignments.find((item) => normalized.includes(normalizeVietnamese(item.title)))
    || (classroom.assignments.length === 1 ? classroom.assignments[0] : null);
}

function matchingSubmission(message: string, classroom: ClassroomOperationalState | null, state: TeacherOperationalState) {
  const normalized = normalizeVietnamese(message);
  const candidates = state.reviewQueue.filter((item) => !classroom || item.classSectionId === classroom.id);
  return candidates.find((item) => item.studentEmail && normalized.includes(normalizeVietnamese(item.studentEmail)))
    || candidates.find((item) => item.studentName && normalized.includes(normalizeVietnamese(item.studentName)))
    || candidates.find((item) => normalized.includes(normalizeVietnamese(item.assignmentTitle)))
    || (candidates.length === 1 ? candidates[0] : null);
}

export function planTeacherWorkflow(message: string, currentPath: string | undefined, state: TeacherOperationalState): TeacherWorkflowPlan | null {
  const normalized = normalizeVietnamese(message);
  const classroom = targetClassroom(message, currentPath, state);

  if (isSetupIntent(normalized) || /\b(?:step|buoc)\s*[1-4]\b/.test(normalized)) {
    const requested = requestedSetupStep(message);
    if (!classroom) {
      const action = actionForSetupStep("classroom", null, state);
      return {
        reply: "Hiện chưa có lớp học để tiếp tục setup. Tôi sẽ bắt đầu từ việc tạo lớp; sau đó trạng thái mới sẽ quyết định bước tiếp theo.",
        action,
        progress: setupProgress(null, "classroom"),
      };
    }

    const requestedDefinition = requested ? classroomSetupRegistry.find((step) => step.id === requested) : null;
    if (requestedDefinition?.isComplete(classroom)) {
      return {
        reply: `${requestedDefinition.label} đã hoàn thành: ${requestedDefinition.evidence(classroom)}. Tôi sẽ không thực hiện lại bước này.`,
        action: null,
        progress: setupProgress(classroom),
        targetId: classroom.id,
        targetLabel: classroom.name,
      };
    }

    const missingDependency = requestedDefinition?.dependencies
      .map((id) => classroomSetupRegistry.find((step) => step.id === id))
      .find((step) => step && !step.isComplete(classroom));
    const nextStep = missingDependency || requestedDefinition || classroomSetupRegistry.find((step) => !step.isComplete(classroom));
    if (!nextStep) {
      return {
        reply: `${classroom.name} đã hoàn tất toàn bộ workflow setup. Không có bước nào cần chạy lại.`,
        action: null,
        progress: setupProgress(classroom),
        targetId: classroom.id,
        targetLabel: classroom.name,
      };
    }
    const action = actionForSetupStep(nextStep.id, classroom, state);
    const blocked = requestedDefinition && missingDependency ? requestedDefinition.id : undefined;
    const reply = blocked
      ? `${requestedDefinition?.label} chưa thể thực hiện vì còn thiếu “${missingDependency?.label}”. Tôi đã chuyển về đúng bước phụ thuộc còn thiếu; các bước đã hoàn thành sẽ không bị làm lại.`
      : `Tôi đã kiểm tra trạng thái thật của ${classroom.name}. Bước hợp lệ tiếp theo là “${nextStep.label}”.`;
    return {
      reply,
      action,
      progress: setupProgress(classroom, nextStep.id, blocked),
      targetId: classroom.id,
      targetLabel: classroom.name,
    };
  }

  if (/\b(duyet|chap nhan|approve|tu choi|reject)\b/.test(normalized)
    && /\b(hoc sinh|student|yeu cau|request|vao lop)\b/.test(normalized)) {
    const enrollment = matchingRosterEntry(message, classroom, ["REQUESTED"]);
    const approve = !/\b(tu choi|reject)\b/.test(normalized);
    return {
      reply: classroom
        ? `Tôi sẽ ${approve ? "duyệt" : "từ chối"} đúng một yêu cầu vào lớp ${classroom.name}. Lịch sử yêu cầu vẫn được giữ để đối soát.`
        : "Hãy chọn lớp có yêu cầu cần xử lý; agent sẽ không tự duyệt nhầm lớp.",
      action: {
        type: "DECIDE_ENROLLMENT",
        summary: `${approve ? "Duyệt" : "Từ chối"} yêu cầu vào lớp`,
        payload: {
          classSectionId: classroom?.id || "",
          enrollmentId: enrollment?.enrollmentId || "",
          decision: approve ? "approve" : "reject",
        },
      },
      progress: singleStepProgress("DECIDE_ENROLLMENT", "Xử lý yêu cầu vào lớp", "decide_enrollment", `${approve ? "Duyệt" : "Từ chối"} enrollment và giữ lịch sử`, classroom?.name),
      targetId: classroom?.id,
      targetLabel: classroom?.name,
    };
  }

  if (/\b(xoa|loai|remove|cho roi)\b.*\b(hoc sinh|student|khoi lop)\b/.test(normalized)) {
    const enrollment = matchingRosterEntry(message, classroom, ["ACTIVE"]);
    return {
      reply: classroom
        ? `Tôi sẽ ngừng quyền truy cập lớp ${classroom.name} của đúng học sinh được chọn. Tài khoản, bài nộp và điểm sẽ không bị xóa.`
        : "Hãy chọn lớp và học sinh cần loại khỏi lớp.",
      action: {
        type: "REMOVE_STUDENT",
        summary: "Loại học sinh khỏi lớp nhưng giữ lịch sử học tập",
        payload: {
          classSectionId: classroom?.id || "",
          enrollmentId: enrollment?.enrollmentId || "",
        },
      },
      progress: singleStepProgress("REMOVE_STUDENT", "Loại học sinh khỏi lớp", "remove_student", "Thu hồi quyền truy cập và giữ dữ liệu lịch sử", classroom?.name),
      targetId: classroom?.id,
      targetLabel: classroom?.name,
    };
  }

  if (/\b(them|tao|dat|cap nhat|add|update)\b.*\b(lich hoc|buoi hoc|class meeting|schedule)\b/.test(normalized)) {
    return {
      reply: classroom
        ? `Tôi sẽ thêm một lịch học định kỳ cho ${classroom.name}; lịch này sẽ hiện ở trang lớp của cả giáo viên và học sinh.`
        : "Hãy chọn lớp cần thêm lịch học.",
      action: {
        type: "ADD_CLASS_MEETING",
        summary: "Thêm lịch học định kỳ",
        payload: { classSectionId: classroom?.id || "" },
      },
      progress: singleStepProgress("MANAGE_SCHEDULE", "Quản lý lịch học", "add_meeting", "Kiểm tra thời gian và thêm lịch không trùng", classroom?.name),
      targetId: classroom?.id,
      targetLabel: classroom?.name,
    };
  }

  if (/\b(xoa|bo|remove)\b.*\b(lich hoc|buoi hoc|class meeting|schedule)\b/.test(normalized)) {
    const meeting = classroom?.schedule.length === 1 ? classroom.schedule[0] : null;
    return {
      reply: classroom
        ? `Tôi sẽ gỡ đúng buổi học được chọn khỏi lịch của ${classroom.name}.`
        : "Hãy chọn lớp và buổi học cần gỡ.",
      action: {
        type: "REMOVE_CLASS_MEETING",
        summary: "Gỡ một buổi học định kỳ",
        payload: { classSectionId: classroom?.id || "", meetingId: meeting?.id || "" },
      },
      progress: singleStepProgress("MANAGE_SCHEDULE", "Quản lý lịch học", "remove_meeting", "Gỡ đúng lịch đã chọn", classroom?.name),
      targetId: classroom?.id,
      targetLabel: classroom?.name,
    };
  }

  if (/\b(an|go|archive|unpublish|ngung giao)\b.*\b(assignment|bai tap)\b/.test(normalized)) {
    const assignment = matchingAssignment(message, classroom);
    return {
      reply: assignment
        ? `Tôi sẽ archive “${assignment.title}”. Bài nộp và điểm hiện có được giữ nguyên.`
        : "Hãy chọn đúng Assignment cần archive; agent sẽ không hard-delete dữ liệu học tập.",
      action: {
        type: "ARCHIVE_ASSIGNMENT",
        summary: "Archive Assignment và giữ bài nộp, điểm",
        payload: { classSectionId: classroom?.id || "", assignmentId: assignment?.id || "" },
      },
      progress: singleStepProgress("ARCHIVE_ASSIGNMENT", "Archive Assignment", "archive_assignment", "Ẩn bài khỏi học sinh và giữ lịch sử", assignment?.title),
      targetId: assignment?.id,
      targetLabel: assignment?.title,
    };
  }

  if (/\b(sua|chinh|cap nhat|edit)\b.*\b(assignment|bai tap|han nop)\b/.test(normalized)) {
    const assignment = matchingAssignment(message, classroom);
    return {
      reply: assignment
        ? `Tôi sẽ mở form gọn với dữ liệu hiện tại của “${assignment.title}”. Chỉ các trường được xác nhận mới được cập nhật.`
        : "Hãy chọn đúng Assignment cần chỉnh sửa.",
      action: {
        type: "UPDATE_ASSIGNMENT",
        summary: "Cập nhật Assignment",
        payload: {
          classSectionId: classroom?.id || "",
          assignmentId: assignment?.id || "",
          title: assignment?.title || "",
          dueAt: assignment?.dueAt ? assignment.dueAt.toISOString().slice(0, 16) : "",
          maxScore: assignment?.maxScore || 100,
        },
      },
      progress: singleStepProgress("UPDATE_ASSIGNMENT", "Chỉnh sửa Assignment", "update_assignment", "Cập nhật đúng một Assignment", assignment?.title),
      targetId: assignment?.id,
      targetLabel: assignment?.title,
    };
  }

  if (/\b(cham|cho diem|grade|publish diem|tra bai)\b/.test(normalized)
    && /\b(bai|assignment|submission|hoc sinh|diem)\b/.test(normalized)) {
    const submission = matchingSubmission(message, classroom, state);
    return {
      reply: submission
        ? `Tôi đã tìm thấy bài “${submission.assignmentTitle}” của ${submission.studentName || submission.studentEmail}. Điểm AI chỉ là gợi ý; điểm giáo viên nhập mới là điểm chính thức sau khi publish.`
        : "Hãy chọn bài nộp cần chấm. Nếu có nhiều bài đang chờ, agent sẽ không tự đoán học sinh.",
      action: {
        type: "GRADE_SUBMISSION",
        summary: "Chấm và trả bài cho học sinh",
        payload: {
          submissionId: submission?.submissionId || "",
          score: submission?.aiScore ?? "",
          feedback: "",
          mode: "publish",
        },
      },
      progress: singleStepProgress("GRADE_SUBMISSION", "Chấm và trả bài", "grade_submission", "Lưu điểm giáo viên và công bố cho học sinh", submission ? `${submission.studentName || submission.studentEmail} · ${submission.assignmentTitle}` : undefined),
      targetId: submission?.submissionId,
      targetLabel: submission ? `${submission.studentName || submission.studentEmail} · ${submission.assignmentTitle}` : undefined,
    };
  }

  const email = message.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0]?.toLowerCase() || "";
  if (/\b(them|moi|add)\b.*\b(hoc sinh|student)\b/.test(normalized)) {
    return {
      reply: classroom
        ? `Tôi sẽ kiểm tra tài khoản học sinh và chỉ thêm vào ${classroom.name} sau khi thầy/cô xác nhận.`
        : "Tôi cần thầy/cô chọn đúng lớp nhận học sinh; agent sẽ không tự đoán khi có nhiều lớp.",
      action: {
        type: "ADD_STUDENT",
        summary: classroom ? `Thêm học sinh vào ${classroom.name}` : "Thêm học sinh vào lớp đã chọn",
        payload: { classSectionId: classroom?.id || "", email },
      },
      progress: singleStepProgress("ADD_STUDENT", "Thêm học sinh vào lớp", "enroll_student", "Tìm tài khoản và tạo enrollment", classroom?.name),
      targetId: classroom?.id,
      targetLabel: classroom?.name,
    };
  }

  if (/\b(tao|giao)\b.*\b(assignment|bai tap)\b/.test(normalized)) {
    return {
      reply: classroom
        ? `Tôi sẽ tạo Assignment chỉ cho ${classroom.name}. Các lớp khác không nhận bài này.`
        : "Hãy chọn lớp nhận Assignment; agent sẽ không tự giao cho tất cả lớp.",
      action: {
        type: "CREATE_ASSIGNMENT",
        summary: classroom ? `Tạo và giao Assignment cho ${classroom.name}` : "Tạo và giao Assignment cho lớp đã chọn",
        payload: { classSectionId: classroom?.id || "", skill: "WRITING", cefrLevel: "B1", maxScore: 100, publishNow: true },
      },
      progress: singleStepProgress("CREATE_ASSIGNMENT", "Tạo và giao Assignment", "create_assignment", "Tạo nội dung và giao đúng lớp", classroom?.name),
      targetId: classroom?.id,
      targetLabel: classroom?.name,
    };
  }

  if (/\b(tao|ra|giao)\b.*\b(test|quiz|de thi|bai kiem tra)\b/.test(normalized)) {
    const action = classroom
      ? actionForSetupStep("test", classroom, state)
      : {
        type: "CREATE_TEST_DRAFT" as const,
        summary: "Tạo Test và giao cho lớp đã chọn",
        payload: {
          classSectionId: "",
          skill: "MIXED",
          level: "B1",
          questionCount: 10,
          timeLimitMinutes: 30,
          attemptLimit: 1,
          dueAt: defaultDueAt(),
          publishNow: true,
          shuffleQuestions: false,
        },
      };
    return {
      reply: classroom
        ? `Tôi sẽ chuẩn bị hoặc chọn một Test đã publish và chỉ giao cho ${classroom.name}.`
        : "Hãy chọn lớp nhận Test; agent sẽ không tự giao đề cho tất cả lớp.",
      action,
      progress: singleStepProgress("CREATE_OR_ASSIGN_TEST", "Tạo và giao Test", "assign_test", "Chuẩn bị đề và tạo delivery đúng lớp", classroom?.name),
      targetId: classroom?.id,
      targetLabel: classroom?.name,
    };
  }

  if (/\b(tao|them|mo)\b.*\b(lop|classroom)\b/.test(normalized)) {
    return {
      reply: "Tôi sẽ tạo một lớp mới. Mã lớp và phần kỹ thuật được hệ thống xử lý; thầy/cô chỉ nhập thông tin học vụ.",
      action: { type: "CREATE_CLASSROOM", summary: "Tạo lớp học mới", payload: {} },
      progress: singleStepProgress("CREATE_CLASSROOM", "Tạo lớp học", "create_classroom", "Tạo lớp và kiểm chứng trong database"),
    };
  }

  return null;
}

function progressFromRun(run: {
  id: string;
  workflowId: string;
  status: string;
  targetLabel: string | null;
  currentStepId: string | null;
  steps: Array<{ stepId: string; label: string; status: string; evidence: unknown }>;
}): TeacherWorkflowProgress {
  return {
    runId: run.id,
    workflowId: run.workflowId,
    title: run.workflowId === "CLASSROOM_SETUP" ? "Hoàn tất thiết lập lớp học" : run.workflowId.replaceAll("_", " "),
    status: run.status as TeacherWorkflowProgress["status"],
    targetLabel: run.targetLabel || undefined,
    currentStepId: run.currentStepId || undefined,
    steps: run.steps.map((step) => ({
      id: step.stepId,
      label: step.label,
      status: step.status as TeacherWorkflowStepProgress["status"],
      evidence: typeof step.evidence === "string"
        ? step.evidence
        : step.evidence && typeof step.evidence === "object" && "text" in step.evidence
          ? String((step.evidence as { text: unknown }).text)
          : undefined,
    })),
  };
}

export async function persistTeacherWorkflowPlan(
  teacherId: string,
  sessionId: string,
  plan: TeacherWorkflowPlan,
) {
  const activeStatuses = ["PLANNING", "WAITING_INPUT", "WAITING_CONFIRMATION", "RUNNING", "BLOCKED", "NEEDS_REPAIR"];
  const existing = await prisma.teacherWorkflowRun.findFirst({
    where: {
      teacherId,
      workflowId: plan.progress.workflowId,
      targetId: plan.targetId || null,
      status: { in: activeStatuses },
    },
    orderBy: { updatedAt: "desc" },
  });

  await prisma.teacherWorkflowRun.updateMany({
    where: {
      teacherId,
      status: { in: activeStatuses },
      ...(existing ? { id: { not: existing.id } } : {}),
    },
    data: { status: "PAUSED" },
  });

  const status = plan.action ? "WAITING_INPUT" : plan.progress.status;
  const run = existing
    ? await prisma.teacherWorkflowRun.update({
      where: { id: existing.id },
      data: {
        sessionId,
        status,
        targetLabel: plan.targetLabel || plan.progress.targetLabel || null,
        currentStepId: plan.progress.currentStepId || null,
        goal: jsonInput({ message: plan.reply }),
        state: jsonInput(plan.progress),
      },
    })
    : await prisma.teacherWorkflowRun.create({
      data: {
        teacherId,
        sessionId,
        workflowId: plan.progress.workflowId,
        status,
        targetType: plan.targetId ? "CLASSROOM" : null,
        targetId: plan.targetId || null,
        targetLabel: plan.targetLabel || plan.progress.targetLabel || null,
        currentStepId: plan.progress.currentStepId || null,
        goal: jsonInput({ message: plan.reply }),
        state: jsonInput(plan.progress),
      },
    });

  await prisma.$transaction(plan.progress.steps.map((step, position) => prisma.teacherWorkflowStep.upsert({
    where: { runId_stepId: { runId: run.id, stepId: step.id } },
    update: {
      position,
      label: step.label,
      status: step.status,
      evidence: step.evidence ? jsonInput({ text: step.evidence }) : Prisma.DbNull,
      completedAt: step.status === "COMPLETED" ? new Date() : null,
    },
    create: {
      runId: run.id,
      stepId: step.id,
      position,
      label: step.label,
      status: step.status,
      evidence: step.evidence ? jsonInput({ text: step.evidence }) : Prisma.DbNull,
      completedAt: step.status === "COMPLETED" ? new Date() : null,
    },
  })));

  const progress = { ...plan.progress, runId: run.id, status } as TeacherWorkflowProgress;
  const action = plan.action ? {
    ...plan.action,
    workflowRunId: run.id,
    workflowStepId: plan.progress.currentStepId,
  } : null;
  return { ...plan, action, progress };
}

export async function loadActiveTeacherWorkflow(teacherId: string) {
  const run = await prisma.teacherWorkflowRun.findFirst({
    where: {
      teacherId,
      status: { in: ["PLANNING", "WAITING_INPUT", "WAITING_CONFIRMATION", "RUNNING", "BLOCKED", "NEEDS_REPAIR"] },
    },
    orderBy: { updatedAt: "desc" },
    include: { steps: { orderBy: { position: "asc" } } },
  });
  return run ? progressFromRun(run) : null;
}

export async function updateWorkflowForConfirmation(action: TeacherAgentAction) {
  if (!action.workflowRunId || !action.workflowStepId) return;
  await prisma.$transaction([
    prisma.teacherWorkflowRun.update({
      where: { id: action.workflowRunId },
      data: { status: "WAITING_CONFIRMATION", currentStepId: action.workflowStepId },
    }),
    prisma.teacherWorkflowStep.update({
      where: { runId_stepId: { runId: action.workflowRunId, stepId: action.workflowStepId } },
      data: { status: "CURRENT", input: jsonInput(action.payload) },
    }),
  ]);
}

export async function completeWorkflowStep(action: TeacherAgentAction, result: unknown, evidence: string) {
  if (!action.workflowRunId || !action.workflowStepId) return;
  await prisma.$transaction(async (tx) => {
    await tx.teacherWorkflowStep.update({
      where: { runId_stepId: { runId: action.workflowRunId!, stepId: action.workflowStepId! } },
      data: {
        status: "COMPLETED",
        result: jsonInput(result),
        evidence: jsonInput({ text: evidence }),
        completedAt: new Date(),
        error: null,
      },
    });
    const remaining = await tx.teacherWorkflowStep.count({
      where: { runId: action.workflowRunId!, status: { not: "COMPLETED" } },
    });
    await tx.teacherWorkflowRun.update({
      where: { id: action.workflowRunId! },
      data: {
        status: remaining ? "PLANNING" : "COMPLETED",
        currentStepId: null,
        completedAt: remaining ? null : new Date(),
      },
    });
  });
}

export async function failWorkflowStep(action: TeacherAgentAction, error: string) {
  if (!action.workflowRunId || !action.workflowStepId) return;
  await prisma.$transaction([
    prisma.teacherWorkflowRun.update({
      where: { id: action.workflowRunId },
      data: { status: "NEEDS_REPAIR" },
    }),
    prisma.teacherWorkflowStep.update({
      where: { runId_stepId: { runId: action.workflowRunId, stepId: action.workflowStepId } },
      data: { status: "BLOCKED", error },
    }),
  ]);
}

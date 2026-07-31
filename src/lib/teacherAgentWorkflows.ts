export type TeacherAgentValue = string | boolean | number | null;

export type TeacherAgentAction = {
  type:
    | "CREATE_ASSIGNMENT"
    | "UPDATE_ASSIGNMENT"
    | "ARCHIVE_ASSIGNMENT"
    | "CREATE_CLASSROOM"
    | "ADD_STUDENT"
    | "DECIDE_ENROLLMENT"
    | "REMOVE_STUDENT"
    | "ADD_CLASS_MEETING"
    | "REMOVE_CLASS_MEETING"
    | "GRADE_SUBMISSION"
    | "OPEN_PAGE"
    | "CREATE_TEST_DRAFT"
    | "ASSIGN_TEST";
  summary: string;
  payload: Record<string, TeacherAgentValue>;
  idempotencyKey?: string;
  workflowRunId?: string;
  workflowStepId?: string;
};

export type WorkflowOption = {
  value: string;
  label: string;
};

export type WorkflowField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "datetime-local" | "time" | "checkbox";
  required?: boolean;
  placeholder?: string;
  help?: string;
  min?: number;
  max?: number;
  options?: WorkflowOption[];
};

export type TeacherWorkflow = {
  id:
    | "CREATE_CLASSROOM"
    | "CREATE_ASSIGNMENT"
    | "UPDATE_ASSIGNMENT"
    | "ARCHIVE_ASSIGNMENT"
    | "CREATE_TEST"
    | "ADD_STUDENT"
    | "DECIDE_ENROLLMENT"
    | "REMOVE_STUDENT"
    | "MANAGE_SCHEDULE"
    | "GRADE_SUBMISSION"
    | "ASSIGN_TEST";
  title: string;
  description: string;
  submitLabel: string;
  fields: WorkflowField[];
};

export type TeacherWorkflowStepProgress = {
  id: string;
  label: string;
  status: "COMPLETED" | "CURRENT" | "BLOCKED" | "PENDING";
  evidence?: string;
};

export type TeacherWorkflowProgress = {
  runId?: string;
  workflowId: string;
  title: string;
  status: "PLANNING" | "WAITING_INPUT" | "WAITING_CONFIRMATION" | "RUNNING" | "COMPLETED" | "BLOCKED" | "NEEDS_REPAIR";
  targetLabel?: string;
  currentStepId?: string;
  steps: TeacherWorkflowStepProgress[];
};

export function isWorkflowAction(action: TeacherAgentAction | null | undefined) {
  return action?.type === "CREATE_CLASSROOM"
    || action?.type === "CREATE_ASSIGNMENT"
    || action?.type === "UPDATE_ASSIGNMENT"
    || action?.type === "ARCHIVE_ASSIGNMENT"
    || action?.type === "CREATE_TEST_DRAFT"
    || action?.type === "ADD_STUDENT"
    || action?.type === "DECIDE_ENROLLMENT"
    || action?.type === "REMOVE_STUDENT"
    || action?.type === "ADD_CLASS_MEETING"
    || action?.type === "REMOVE_CLASS_MEETING"
    || action?.type === "GRADE_SUBMISSION"
    || action?.type === "ASSIGN_TEST";
}

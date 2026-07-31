export type TestOptionDraft = { text: string; isCorrect?: boolean };
export type TestQuestionDraft = {
  type: "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "FILL_BLANK" | "ESSAY" | "LISTENING" | "READING";
  text: string;
  points?: number;
  options?: TestOptionDraft[];
  correctIndex?: number;
  answerKey?: string;
  explanation?: string;
  passage?: string;
};
export type TestSectionDraft = {
  title: string;
  skill?: string;
  instructions?: string;
  passage?: string;
  questions: TestQuestionDraft[];
};
export type TestDraft = {
  title: string;
  description?: string;
  examType?: string;
  skill?: string;
  timeLimitMinutes?: number;
  attemptLimit?: number;
  openAt?: string;
  closeAt?: string;
  published?: boolean;
  shuffleQuestions?: boolean;
  instructions?: string;
  passage?: string;
  sections?: TestSectionDraft[];
  questions?: TestQuestionDraft[];
};

const questionStart = /^\s*(?:question\s*)?(\d{1,3})[.)\-:]\s*(.+)$/i;
const optionStart = /^\s*([A-H])[.)\-:]\s*(.+)$/i;
const answerLine = /^\s*(?:answer|correct answer|đáp án)\s*[:\-]\s*([A-H]|.+)$/i;
const sectionLine = /^\s*(?:(?:section|part|test)\s+\d+|(?:reading|listening|writing|speaking|grammar|vocabulary)(?:\s+(?:section|part|test)\s*\d*)?)\s*$/i;

function skillFromTitle(title: string) {
  const value = title.toUpperCase();
  return ["LISTENING", "READING", "WRITING", "SPEAKING", "GRAMMAR", "VOCABULARY"].find((item) => value.includes(item)) || "MIXED";
}

function finishQuestion(question: TestQuestionDraft | null, target: TestQuestionDraft[]) {
  if (!question?.text.trim()) return;
  question.text = question.text.trim();
  question.options = question.options?.filter((item) => item.text.trim());
  if (question.options?.length) question.type = "MULTIPLE_CHOICE";
  else if (question.type === "MULTIPLE_CHOICE") question.type = "FILL_BLANK";
  target.push(question);
}

export function parseFormattedTestText(raw: string, fallbackTitle = "Untitled test"): TestDraft {
  const lines = raw.replace(/\r/g, "").split("\n");
  const sections: TestSectionDraft[] = [];
  const looseQuestions: TestQuestionDraft[] = [];
  let activeQuestions = looseQuestions;
  let current: TestQuestionDraft | null = null;
  const intro: string[] = [];
  let seenQuestion = false;

  for (const originalLine of lines) {
    const line = originalLine.trim();
    if (!line) continue;
    const q = line.match(questionStart);
    const option = line.match(optionStart);
    const answer = line.match(answerLine);

    if (!q && !option && !answer && sectionLine.test(line)) {
      finishQuestion(current, activeQuestions);
      current = null;
      const section: TestSectionDraft = { title: line, skill: skillFromTitle(line), questions: [] };
      sections.push(section);
      activeQuestions = section.questions;
      continue;
    }

    if (q) {
      finishQuestion(current, activeQuestions);
      seenQuestion = true;
      current = { type: "MULTIPLE_CHOICE", text: q[2], points: 1, options: [] };
      continue;
    }

    if (option && current) {
      current.options ||= [];
      current.options.push({ text: option[2] });
      continue;
    }

    if (answer && current) {
      const value = answer[1].trim();
      if (/^[A-H]$/i.test(value) && current.options?.length) {
        const index = value.toUpperCase().charCodeAt(0) - 64;
        current.correctIndex = index;
        current.options = current.options.map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === index - 1 }));
      } else {
        current.answerKey = value;
      }
      continue;
    }

    if (current) current.text += `\n${line}`;
    else if (!seenQuestion) intro.push(line);
  }
  finishQuestion(current, activeQuestions);

  const titleCandidate = intro[0] && intro[0].length <= 120 ? intro.shift()! : fallbackTitle;
  const allQuestions = [...looseQuestions, ...sections.flatMap((section) => section.questions)];
  return {
    title: titleCandidate || fallbackTitle,
    description: intro.join("\n") || undefined,
    examType: /ielts/i.test(raw) ? "IELTS" : /toeic/i.test(raw) ? "TOEIC" : "GENERAL",
    skill: sections.length ? "MIXED" : skillFromTitle(raw.slice(0, 300)),
    attemptLimit: 1,
    sections: sections.length ? sections : undefined,
    questions: looseQuestions.length ? looseQuestions : undefined,
    ...(allQuestions.length ? {} : { questions: [] }),
  };
}

export function normalizeTestDraft(input: unknown): TestDraft {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const normalizeQuestion = (value: unknown): TestQuestionDraft | null => {
    const item = value && typeof value === "object" ? value as Record<string, unknown> : {};
    const text = String(item.text || "").trim();
    if (!text) return null;
    const rawOptions = Array.isArray(item.options) ? item.options : [];
    const options = rawOptions.map((option) => typeof option === "string"
      ? { text: option.trim() }
      : { text: String((option as Record<string, unknown>)?.text || "").trim(), isCorrect: Boolean((option as Record<string, unknown>)?.isCorrect) })
      .filter((option) => option.text);
    const allowed = new Set(["MULTIPLE_CHOICE", "SHORT_ANSWER", "FILL_BLANK", "ESSAY", "LISTENING", "READING"]);
    const requestedType = String(item.type || "MULTIPLE_CHOICE").toUpperCase();
    return {
      type: allowed.has(requestedType) ? requestedType as TestQuestionDraft["type"] : "MULTIPLE_CHOICE",
      text,
      points: Number(item.points) > 0 ? Number(item.points) : 1,
      options: options.length ? options : undefined,
      correctIndex: Number(item.correctIndex) > 0 ? Number(item.correctIndex) : undefined,
      answerKey: String(item.answerKey || "").trim() || undefined,
      explanation: String(item.explanation || "").trim() || undefined,
      passage: String(item.passage || "").trim() || undefined,
    };
  };
  const normalizeQuestions = (value: unknown) => (Array.isArray(value) ? value.map(normalizeQuestion).filter(Boolean) as TestQuestionDraft[] : []);
  const sections = (Array.isArray(source.sections) ? source.sections : []).map((value, index) => {
    const item = value && typeof value === "object" ? value as Record<string, unknown> : {};
    return {
      title: String(item.title || `Section ${index + 1}`).trim(),
      skill: String(item.skill || "READING").toUpperCase(),
      instructions: String(item.instructions || "").trim() || undefined,
      passage: String(item.passage || "").trim() || undefined,
      questions: normalizeQuestions(item.questions),
    };
  });
  return {
    title: String(source.title || "Untitled test").trim(),
    description: String(source.description || "").trim() || undefined,
    examType: String(source.examType || "GENERAL").toUpperCase(),
    skill: String(source.skill || "MIXED").toUpperCase(),
    timeLimitMinutes: Number(source.timeLimitMinutes) > 0 ? Number(source.timeLimitMinutes) : undefined,
    attemptLimit: Number(source.attemptLimit) > 0 ? Number(source.attemptLimit) : 1,
    openAt: String(source.openAt || "").trim() || undefined,
    closeAt: String(source.closeAt || "").trim() || undefined,
    published: source.published === undefined ? false : Boolean(source.published),
    shuffleQuestions: Boolean(source.shuffleQuestions),
    instructions: String(source.instructions || "").trim() || undefined,
    passage: String(source.passage || "").trim() || undefined,
    sections: sections.length ? sections : undefined,
    questions: normalizeQuestions(source.questions),
  };
}

export function validateTestDraft(draft: TestDraft) {
  const questions = [...(draft.questions || []), ...(draft.sections || []).flatMap((section) => section.questions)];
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!draft.title.trim()) errors.push("Add a quiz title.");
  if (!questions.length) errors.push("Add at least one question.");
  questions.forEach((question, index) => {
    const number = index + 1;
    if (!question.text.trim()) errors.push(`Question ${number}: add the prompt.`);
    if (!Number.isFinite(question.points) || Number(question.points) <= 0) errors.push(`Question ${number}: points must be greater than zero.`);
    if (question.type === "MULTIPLE_CHOICE") {
      const options = (question.options || []).filter((option) => option.text.trim());
      if (options.length < 2) errors.push(`Question ${number}: add at least two answer choices.`);
      if (!options.some((option) => option.isCorrect) && !question.correctIndex) errors.push(`Question ${number}: choose the correct answer.`);
      if (options.filter((option) => option.isCorrect).length > 1) errors.push(`Question ${number}: choose only one correct answer.`);
    }
    if (["SHORT_ANSWER", "FILL_BLANK"].includes(question.type) && !question.answerKey?.trim()) errors.push(`Question ${number}: add an accepted answer.`);
    if (question.type === "ESSAY" && !question.answerKey?.trim()) warnings.push(`Question ${number}: add a rubric so AI and teachers grade consistently.`);
  });
  if (draft.openAt && draft.closeAt && new Date(draft.closeAt) <= new Date(draft.openAt)) errors.push("The closing time must be after the opening time.");
  if (!draft.timeLimitMinutes) warnings.push("No time limit is set.");
  return { questions: questions.length, errors, warnings };
}

export const testDraftJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "examType", "skill", "sections", "questions"],
  properties: {
    title: { type: "string" }, description: { type: ["string", "null"] }, examType: { type: "string", enum: ["IELTS", "TOEIC", "GENERAL"] },
    skill: { type: "string", enum: ["LISTENING", "READING", "WRITING", "SPEAKING", "GRAMMAR", "VOCABULARY", "MIXED"] },
    timeLimitMinutes: { type: ["number", "null"] }, attemptLimit: { type: "number" }, instructions: { type: ["string", "null"] }, passage: { type: ["string", "null"] },
    sections: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "skill", "instructions", "passage", "questions"], properties: {
      title: { type: "string" }, skill: { type: "string" }, instructions: { type: ["string", "null"] }, passage: { type: ["string", "null"] }, questions: { type: "array", items: { $ref: "#/$defs/question" } },
    } } },
    questions: { type: "array", items: { $ref: "#/$defs/question" } },
  },
  $defs: { question: { type: "object", additionalProperties: false, required: ["type", "text", "points", "options", "correctIndex", "answerKey", "explanation", "passage"], properties: {
    type: { type: "string", enum: ["MULTIPLE_CHOICE", "SHORT_ANSWER", "FILL_BLANK", "ESSAY", "LISTENING", "READING"] }, text: { type: "string" }, points: { type: "number" },
    options: { type: "array", items: { type: "object", additionalProperties: false, required: ["text", "isCorrect"], properties: { text: { type: "string" }, isCorrect: { type: "boolean" } } } },
    correctIndex: { type: ["number", "null"] }, answerKey: { type: ["string", "null"] }, explanation: { type: ["string", "null"] }, passage: { type: ["string", "null"] },
  } } },
} as const;

export const testTemplates: Record<string, TestDraft> = {
  IELTS_READING: { title: "IELTS Reading Practice", examType: "IELTS", skill: "READING", timeLimitMinutes: 60, attemptLimit: 1, instructions: "Read each passage and answer all questions.", sections: [1, 2, 3].map((number) => ({ title: `Reading Passage ${number}`, skill: "READING", passage: "", questions: [] })) },
  IELTS_WRITING: { title: "IELTS Writing Practice", examType: "IELTS", skill: "WRITING", timeLimitMinutes: 60, attemptLimit: 1, sections: [{ title: "Writing Task 1", skill: "WRITING", questions: [{ type: "ESSAY", text: "Writing Task 1 prompt", points: 40 }] }, { title: "Writing Task 2", skill: "WRITING", questions: [{ type: "ESSAY", text: "Writing Task 2 prompt", points: 60 }] }] },
  TOEIC_LISTENING_READING: { title: "TOEIC Listening & Reading", examType: "TOEIC", skill: "MIXED", timeLimitMinutes: 120, attemptLimit: 1, sections: [{ title: "Listening", skill: "LISTENING", questions: [] }, { title: "Reading", skill: "READING", questions: [] }] },
  CAMBRIDGE: { title: "Cambridge English Practice", examType: "GENERAL", skill: "MIXED", attemptLimit: 1, sections: [{ title: "Reading and Use of English", skill: "READING", questions: [] }, { title: "Writing", skill: "WRITING", questions: [] }, { title: "Listening", skill: "LISTENING", questions: [] }, { title: "Speaking", skill: "SPEAKING", questions: [] }] },
};

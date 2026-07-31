"use server";

import { Buffer } from "node:buffer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { XMLParser } from "fast-xml-parser";
import { prisma } from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/session";
import { importPracticeTestJsonAction } from "@/lib/lmsActions";
import { normalizeTestDraft, parseFormattedTestText, testDraftJsonSchema, testTemplates, validateTestDraft, type TestDraft, type TestQuestionDraft } from "@/lib/testBuilder";

export type TestBuilderState = {
  status: "idle" | "ready" | "error";
  message: string;
  draft?: TestDraft;
  warnings?: string[];
  questionCount?: number;
  source?: string;
};

async function extractFileText(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: bytes });
    return result.value;
  }
  if (name.endsWith(".pdf")) {
    const parser = new PDFParse({ data: bytes });
    try { return (await parser.getText()).text; } finally { await parser.destroy(); }
  }
  return bytes.toString("utf8");
}

function asArray<T>(value: T | T[] | undefined): T[] {
  return value === undefined ? [] : Array.isArray(value) ? value : [value];
}

function qtiText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!value || typeof value !== "object") return "";
  const item = value as Record<string, unknown>;
  return qtiText(item["#text"] ?? item.p ?? item.div ?? item.span ?? "");
}

function parseQti(raw: string): TestDraft {
  const parsed = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", trimValues: true }).parse(raw) as Record<string, unknown>;
  const root = (parsed.assessmentTest || parsed.questestinterop || parsed) as Record<string, unknown>;
  const title = String(root["@_title"] || root["@_identifier"] || "Imported QTI test");
  const items: Record<string, unknown>[] = [];
  const walk = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) return value.forEach(walk);
    const object = value as Record<string, unknown>;
    for (const [key, child] of Object.entries(object)) {
      if (["assessmentItem", "item"].includes(key)) asArray(child as Record<string, unknown> | Record<string, unknown>[]).forEach((entry) => items.push(entry));
      else walk(child);
    }
  };
  walk(root);
  const questions: TestQuestionDraft[] = items.map((item) => {
    const body = (item.itemBody || item.presentation || {}) as Record<string, unknown>;
    const interaction = (body.choiceInteraction || body.response_lid || {}) as Record<string, unknown>;
    const choices = asArray((interaction.simpleChoice || interaction.render_choice || []) as Record<string, unknown> | Record<string, unknown>[]);
    const response = (item.responseDeclaration || item.resprocessing || {}) as Record<string, unknown>;
    const correct = qtiText(((response.correctResponse || {}) as Record<string, unknown>).value || response.respcondition || "").trim();
    const options = choices.map((choice) => ({ text: qtiText(choice).trim(), isCorrect: String(choice["@_identifier"] || choice["@_ident"] || "") === correct })).filter((choice) => choice.text);
    return { type: options.length ? "MULTIPLE_CHOICE" : "FILL_BLANK", text: qtiText(body.prompt || interaction.material || item["@_title"] || "Question"), points: 1, options: options.length ? options : undefined, answerKey: options.length ? undefined : correct || undefined };
  });
  return normalizeTestDraft({ title, examType: "GENERAL", skill: "MIXED", questions });
}

function extractResponseText(response: Record<string, unknown>) {
  if (typeof response.output_text === "string") return response.output_text;
  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output) {
    const content = Array.isArray((item as Record<string, unknown>).content) ? (item as Record<string, unknown>).content as Record<string, unknown>[] : [];
    for (const block of content) if (typeof block.text === "string") return block.text;
  }
  return "";
}

async function parseWithHostedAi(raw: string, suggestAnswers = false) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured. Use Smart paste or configure the API key.");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_TEST_BUILDER_MODEL || process.env.OPENAI_GRADING_MODEL || "gpt-5.4-mini",
      instructions: suggestAnswers
        ? "Review this English test JSON. Preserve every question. Suggest the most likely correct option or answer key where missing, add concise explanations, and create practical assessment rubrics for essay questions. Do not change supplied answers. Return the complete test in the schema. Teacher verification is mandatory."
        : "Convert the supplied English test into the schema. Preserve the source wording. Never invent missing answers. Use null or empty arrays when information is absent. Return only structured data.",
      input: raw.slice(0, 120000),
      text: { format: { type: "json_schema", name: "test_draft", strict: true, schema: testDraftJsonSchema } },
    }),
  });
  const result = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error(String(((result.error || {}) as Record<string, unknown>).message || "AI parsing failed."));
  const text = extractResponseText(result);
  if (!text) throw new Error("AI returned no structured test data.");
  return normalizeTestDraft(JSON.parse(text));
}

async function parseWithLocalAi(raw: string, suggestAnswers = false) {
  const endpoint = (process.env.LOCAL_AI_BASE_URL || "http://127.0.0.1:11434/v1").replace(/\/$/, "");
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(process.env.LOCAL_AI_API_KEY ? { Authorization: `Bearer ${process.env.LOCAL_AI_API_KEY}` } : {}) },
    body: JSON.stringify({ model: process.env.LOCAL_AI_MODEL || "gpt-oss:20b", temperature: 0, response_format: { type: "json_object" }, messages: [
      { role: "system", content: suggestAnswers
        ? "Review this English quiz JSON. Preserve every question and every supplied answer. Fill only missing answer keys when evidence is clear, add concise explanations, and create assessment rubrics for essay questions. Return the complete JSON. A teacher must verify it."
        : "Convert English quiz material to JSON with title, examType, skill, sections and questions. Preserve wording and never invent an answer." },
      { role: "user", content: raw.slice(0, 120000) },
    ] }),
  });
  const result = await response.json() as Record<string, unknown>;
  if (!response.ok) throw new Error(String(((result.error || {}) as Record<string, unknown>).message || "Local model is unavailable."));
  const choices = result.choices as Array<Record<string, unknown>> | undefined;
  const content = ((choices?.[0]?.message || {}) as Record<string, unknown>).content;
  if (typeof content !== "string") throw new Error("Local model returned no JSON.");
  return normalizeTestDraft(JSON.parse(content));
}

export async function prepareTestDraftAction(_previous: TestBuilderState, formData: FormData): Promise<TestBuilderState> {
  await requireTeacherOrAdmin();
  try {
    const mode = String(formData.get("mode") || "formatted");
    const file = formData.get("sourceFile");
    let raw = String(formData.get("sourceText") || "").trim();
    if (file instanceof File && file.size) {
      if (file.size > 10 * 1024 * 1024) throw new Error("The source file is larger than 10 MB.");
      raw = await extractFileText(file);
    }
    if (mode !== "template" && !raw) throw new Error("Paste test content or choose a source file first.");

    let draft: TestDraft;
    if (mode === "template") draft = normalizeTestDraft(testTemplates[String(formData.get("template") || "IELTS_READING")] || testTemplates.IELTS_READING);
    else if (mode === "json" || mode === "manual" || (file instanceof File && /\.json$/i.test(file.name))) draft = normalizeTestDraft(JSON.parse(raw));
    else if (mode === "qti" || (file instanceof File && /\.xml$|\.qti$/i.test(file.name))) draft = parseQti(raw);
    else if (mode === "ai") draft = String(formData.get("provider") || "hosted") === "local" ? await parseWithLocalAi(raw) : await parseWithHostedAi(raw);
    else if (mode === "suggest") draft = process.env.TEST_BUILDER_AI_PROVIDER === "hosted"
      ? await parseWithHostedAi(raw, true)
      : await parseWithLocalAi(raw, true);
    else draft = parseFormattedTestText(raw, file instanceof File ? file.name.replace(/\.[^.]+$/, "") : "Untitled test");

    const validation = validateTestDraft(draft);
    return { status: "ready", message: `Prepared ${validation.questions} ${validation.questions === 1 ? "question" : "questions"}. Review everything before saving.`, draft, warnings: validation.warnings, questionCount: validation.questions, source: file instanceof File && file.size ? file.name : mode };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Could not prepare this quiz." };
  }
}

export async function savePreparedTestAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const draftJson = String(formData.get("json") || "");
  const draft = normalizeTestDraft(JSON.parse(draftJson));
  const validation = validateTestDraft(draft);
  if (validation.errors.length) throw new Error(validation.errors[0]);
  const importData = new FormData();
  importData.set("json", JSON.stringify(draft));
  const classroomId = String(formData.get("classSectionId") || "");
  if (classroomId) importData.set("classSectionId", classroomId);
  const result = await importPracticeTestJsonAction(importData);
  if (!result?.testId) throw new Error(result?.message || "The quiz could not be saved.");
  if (classroomId && draft.published) {
    const classroom = await prisma.classSection.findFirst({ where: { id: classroomId, status: "ACTIVE", ...(actor.role === "TEACHER" ? { teacherId: actor.id } : {}) }, select: { id: true } });
    if (!classroom) throw new Error("The selected classroom is unavailable.");
    const parseDate = (name: string) => {
      const raw = String(formData.get(name) || "");
      const value = raw ? new Date(raw) : null;
      return value && !Number.isNaN(value.getTime()) ? value : null;
    };
    await prisma.quizDelivery.upsert({
      where: { quizId_classSectionId: { quizId: result.testId, classSectionId: classroomId } },
      update: { status: "PUBLISHED", openAt: parseDate("openAt"), dueAt: parseDate("dueAt"), attemptLimit: Math.max(1, Number(formData.get("attemptLimit")) || draft.attemptLimit || 1), assignedById: actor.id },
      create: { quizId: result.testId, classSectionId: classroomId, status: "PUBLISHED", openAt: parseDate("openAt"), dueAt: parseDate("dueAt"), attemptLimit: Math.max(1, Number(formData.get("attemptLimit")) || draft.attemptLimit || 1), assignedById: actor.id },
    });
    revalidatePath(`/elearning/classrooms/${classroomId}`);
    revalidatePath("/elearning");
    redirect(`/elearning/classrooms/${classroomId}?tab=quizzes&created=1`);
  }
  redirect(`/elearning/practice?tab=quizzes&created=1`);
}

async function manageableTest(quizId: string, actor: { id: string; role: string }) {
  return prisma.quiz.findFirst({ where: { id: quizId, isPracticeTest: true, ...(actor.role === "TEACHER" ? { createdById: actor.id } : {}) }, include: { sections: { orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" }, include: { question: { include: { options: { orderBy: { order: "asc" } } } } } } } }, questions: { where: { sectionId: null }, orderBy: { order: "asc" }, include: { question: { include: { options: { orderBy: { order: "asc" } } } } } } } });
}

function snapshotFromTest(test: NonNullable<Awaited<ReturnType<typeof manageableTest>>>) {
  return normalizeTestDraft({
    title: test.title, description: test.description, examType: test.examType, skill: test.skill, timeLimitMinutes: test.timeLimit, attemptLimit: test.attemptLimit, instructions: test.instructions, passage: test.passage,
    sections: test.sections.map((section) => ({ title: section.title, skill: section.skill, instructions: section.instructions, passage: section.passage, questions: section.questions.map((link) => ({ ...link.question, options: link.question.options.map((option) => ({ text: option.text, isCorrect: option.isCorrect })) })) })),
    questions: test.questions.map((link) => ({ ...link.question, options: link.question.options.map((option) => ({ text: option.text, isCorrect: option.isCorrect })) })),
  });
}

export async function createTestVersionAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const quizId = String(formData.get("quizId") || "");
  const test = await manageableTest(quizId, actor);
  if (!test) return;
  const last = await prisma.testVersion.aggregate({ where: { quizId }, _max: { version: true } });
  await prisma.testVersion.create({ data: { quizId, createdById: actor.id, version: (last._max.version || 0) + 1, changeNote: String(formData.get("changeNote") || "Manual snapshot").trim() || "Manual snapshot", snapshot: JSON.parse(JSON.stringify(snapshotFromTest(test))) } });
  revalidatePath(`/elearning/practice/${quizId}/manage`);
}

export async function duplicatePracticeTestAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const sourceId = String(formData.get("quizId") || "");
  const source = await manageableTest(sourceId, actor);
  if (!source) return;
  const draft: TestDraft = { ...snapshotFromTest(source), title: `${source.title} (Copy)` };
  const data = new FormData(); data.set("json", JSON.stringify(draft));
  await importPracticeTestJsonAction(data);
  revalidatePath("/elearning/practice");
}

export async function duplicateTestSectionAction(formData: FormData) {
  const actor = await requireTeacherOrAdmin();
  const quizId = String(formData.get("quizId") || "");
  const sectionId = String(formData.get("sectionId") || "");
  const test = await manageableTest(quizId, actor);
  const source = test?.sections.find((section) => section.id === sectionId);
  if (!test || !source) return;
  const section = await prisma.testSection.create({ data: { quizId, title: `${source.title} (Copy)`, skill: source.skill, instructions: source.instructions, audioUrl: source.audioUrl, passage: source.passage, order: Math.max(0, ...test.sections.map((item) => item.order)) + 1 } });
  for (const [index, link] of source.questions.entries()) {
    const question = await prisma.question.create({ data: { type: link.question.type, text: link.question.text, points: link.question.points, answerKey: link.question.answerKey, explanation: link.question.explanation, audioUrl: link.question.audioUrl, passage: link.question.passage, createdById: actor.id, options: { create: link.question.options.map((option) => ({ label: option.label, text: option.text, isCorrect: option.isCorrect, order: option.order })) } } });
    await prisma.quizQuestion.create({ data: { quizId, sectionId: section.id, questionId: question.id, points: link.points, order: index + 1 } });
  }
  revalidatePath(`/elearning/exercises/${quizId}`);
}

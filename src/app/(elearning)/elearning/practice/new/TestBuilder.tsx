"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowDown, ArrowUp, BookCopy, Bot, CheckCircle2, ChevronDown, ClipboardPaste, Copy, Eye, FileJson, FileText, Library, Loader2, Plus, Save, Sparkles, Trash2, Upload, WandSparkles, X } from "lucide-react";
import { prepareTestDraftAction, savePreparedTestAction, type TestBuilderState } from "@/lib/testBuilderActions";
import { normalizeTestDraft, validateTestDraft, type TestDraft, type TestQuestionDraft, type TestSectionDraft } from "@/lib/testBuilder";
import styles from "../../elearning.module.css";

type Classroom = { id: string; name: string; code: string };
type BankQuestion = { id: string; text: string; type: string; points: number; answerKey: string | null; explanation: string | null; options: { text: string; isCorrect: boolean }[] };
type BuilderMode = "manual" | "import" | "template" | "ai";
type AgentDraftSession = { draft: TestDraft; classSectionId: string; classroomName: string; classroomCode: string; warnings?: string[] };
const initialTestBuilderState: TestBuilderState = { status: "idle", message: "" };

const blankQuestion = (): TestQuestionDraft => ({ type: "MULTIPLE_CHOICE", text: "", points: 1, options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }] });
const blankDraft = (): TestDraft => ({ title: "", examType: "GENERAL", skill: "MIXED", timeLimitMinutes: 45, attemptLimit: 1, published: false, shuffleQuestions: false, sections: [], questions: [blankQuestion()] });

function questionCount(draft: TestDraft) {
  return (draft.questions?.length || 0) + (draft.sections || []).reduce((sum, section) => sum + section.questions.length, 0);
}

export function TestBuilder({ classrooms, questionBank }: { classrooms: Classroom[]; questionBank: BankQuestion[] }) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<BuilderMode>("manual");
  const [state, prepareAction, preparing] = useActionState(prepareTestDraftAction, initialTestBuilderState);
  const [draft, setDraft] = useState<TestDraft>(blankDraft);
  const [showJson, setShowJson] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [bankQuery, setBankQuery] = useState("");
  const [agentDraft, setAgentDraft] = useState<AgentDraftSession | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");

  useEffect(() => {
    if (!state.draft) return;
    const preparedDraft = state.draft;
    queueMicrotask(() => setDraft(preparedDraft));
  }, [state.draft]);

  useEffect(() => {
    if (searchParams.get("agentDraft") !== "1") return;
    const raw = sessionStorage.getItem("aec-teacher-test-draft");
    if (!raw) return;
    try {
      const session = JSON.parse(raw) as AgentDraftSession;
      if (!session?.draft || !session.classSectionId) return;
      sessionStorage.removeItem("aec-teacher-test-draft");
      queueMicrotask(() => {
        setDraft(normalizeTestDraft(session.draft));
        setSelectedClassroomId(session.classSectionId);
        setAgentDraft(session);
        setMode("manual");
      });
    } catch {
      sessionStorage.removeItem("aec-teacher-test-draft");
    }
  }, [searchParams]);
  const filteredBank = useMemo(() => questionBank.filter((item) => item.text.toLowerCase().includes(bankQuery.toLowerCase())).slice(0, 12), [bankQuery, questionBank]);
  const validation = useMemo(() => validateTestDraft(draft), [draft]);

  const updateQuestion = (index: number, patch: Partial<TestQuestionDraft>, sectionIndex?: number) => {
    setDraft((current) => {
      const next = structuredClone(current);
      const list = sectionIndex === undefined ? (next.questions ||= []) : next.sections![sectionIndex].questions;
      list[index] = { ...list[index], ...patch };
      return next;
    });
  };
  const removeQuestion = (index: number, sectionIndex?: number) => setDraft((current) => {
    const next = structuredClone(current);
    if (sectionIndex === undefined) next.questions = (next.questions || []).filter((_, itemIndex) => itemIndex !== index);
    else next.sections![sectionIndex].questions = next.sections![sectionIndex].questions.filter((_, itemIndex) => itemIndex !== index);
    return next;
  });
  const addQuestion = (sectionIndex?: number, question = blankQuestion()) => setDraft((current) => {
    const next = structuredClone(current);
    if (sectionIndex === undefined) (next.questions ||= []).push(question);
    else next.sections![sectionIndex].questions.push(question);
    return next;
  });
  const duplicateQuestion = (index: number, sectionIndex?: number) => setDraft((current) => {
    const next = structuredClone(current);
    const list = sectionIndex === undefined ? (next.questions ||= []) : next.sections![sectionIndex].questions;
    list.splice(index + 1, 0, structuredClone(list[index]));
    return next;
  });
  const moveQuestion = (index: number, direction: -1 | 1, sectionIndex?: number) => setDraft((current) => {
    const next = structuredClone(current);
    const list = sectionIndex === undefined ? (next.questions ||= []) : next.sections![sectionIndex].questions;
    const target = index + direction;
    if (target < 0 || target >= list.length) return current;
    [list[index], list[target]] = [list[target], list[index]];
    return next;
  });
  const addSection = () => setDraft((current) => ({ ...current, sections: [...(current.sections || []), { title: `Section ${(current.sections?.length || 0) + 1}`, skill: current.skill || "READING", questions: [blankQuestion()] }] }));
  const addFromBank = (item: BankQuestion) => addQuestion(undefined, { type: item.type as TestQuestionDraft["type"], text: item.text, points: item.points, answerKey: item.answerKey || undefined, explanation: item.explanation || undefined, options: item.options });

  return <div className={styles.testBuilderLayout}>
    <section className={styles.testBuilderMain}>
      {agentDraft ? <div className={styles.agentDraftBanner}><Bot size={20} /><div><strong>AI đã điền bản nháp cho {agentDraft.classroomName}</strong><span>Kiểm tra câu hỏi và đáp án. Khi sẵn sàng, chọn “Publish & assign” để hoàn thành Step 4.</span></div><button type="button" onClick={() => setShowPreview(true)}><Eye size={16} /> Xem như học sinh</button></div> : null}
      <div className={styles.builderModeGrid}>
        {([
          ["manual", FileText, "Manual builder", "Write sections and questions yourself"],
          ["import", ClipboardPaste, "Paste or upload", "Formatted text, JSON, DOCX or QTI"],
          ["template", BookCopy, "Exam templates", "IELTS, TOEIC and Cambridge"],
          ["ai", Bot, "AI document import", "Analyse DOCX or PDF with review"],
        ] as const).map(([value, Icon, title, detail]) => <button type="button" key={value} onClick={() => setMode(value)} className={mode === value ? styles.builderModeActive : ""}><Icon size={20} /><span><strong>{title}</strong><small>{detail}</small></span><CheckCircle2 size={16} /></button>)}
      </div>

      {mode === "import" ? <form action={prepareAction} className={styles.builderSourcePanel}>
        <input type="hidden" name="mode" value="formatted" />
        <header><ClipboardPaste size={20} /><div><strong>Turn existing content into a quiz</strong><span>Use clear question numbers, A/B/C/D options and “Answer: B” when possible.</span></div></header>
        <label className={styles.builderUpload}><Upload size={22} /><span><strong>Upload source file</strong><small>DOCX, TXT, JSON, XML or QTI · maximum 10 MB</small></span><input name="sourceFile" type="file" accept=".docx,.txt,.json,.xml,.qti" /></label>
        <div className={styles.builderDivider}><span>or paste content</span></div>
        <textarea name="sourceText" rows={14} placeholder={"English Grammar Review\n\n1. She ___ to school every day.\nA. go\nB. goes\nC. going\nD. gone\nAnswer: B"} />
        <div className={styles.builderSourceFooter}><span><WandSparkles size={16} /> Parser preserves the original wording and flags missing answers.</span><button className="btn-primary" disabled={preparing}>{preparing ? <Loader2 size={16} className={styles.spinner} /> : <Sparkles size={16} />} Prepare preview</button></div>
      </form> : null}

      {mode === "template" ? <form action={prepareAction} className={styles.builderSourcePanel}>
        <input type="hidden" name="mode" value="template" />
        <header><BookCopy size={20} /><div><strong>Start with an English exam structure</strong><span>The template creates sections and timing; you remain in control of every question.</span></div></header>
        <div className={styles.templateChoiceGrid}>
          {[{ value: "IELTS_READING", title: "IELTS Reading", detail: "3 passages · 60 minutes" }, { value: "IELTS_WRITING", title: "IELTS Writing", detail: "Task 1 + Task 2" }, { value: "TOEIC_LISTENING_READING", title: "TOEIC L&R", detail: "Listening + Reading" }, { value: "CAMBRIDGE", title: "Cambridge English", detail: "4 skills structure" }].map((item, index) => <label key={item.value}><input type="radio" name="template" value={item.value} defaultChecked={index === 0} /><span><FileJson size={21} /><strong>{item.title}</strong><small>{item.detail}</small></span></label>)}
        </div>
        <div className={styles.builderSourceFooter}><span>Templates are editable after preview.</span><button className="btn-primary" disabled={preparing}>{preparing ? <Loader2 size={16} className={styles.spinner} /> : <Plus size={16} />} Use template</button></div>
      </form> : null}

      {mode === "ai" ? <form action={prepareAction} className={styles.builderSourcePanel}>
        <input type="hidden" name="mode" value="ai" />
        <header><Bot size={20} /><div><strong>AI-assisted document analysis</strong><span>AI extracts structure but never publishes automatically. Teacher review is mandatory.</span></div></header>
        <div className={styles.builderAiNotice}><Sparkles size={20} /><div><strong>Use AI for complex layouts</strong><p>For clean A/B/C/D text, Smart paste is faster and cheaper. Do not include student personal information.</p></div></div>
        <label className={styles.builderUpload}><Upload size={22} /><span><strong>Upload a DOCX or text-based PDF</strong><small>Scanned PDFs require readable OCR text · maximum 10 MB</small></span><input name="sourceFile" type="file" accept=".docx,.pdf,.txt" /></label>
        <textarea name="sourceText" rows={10} placeholder="Or paste unstructured English quiz material here..." />
        <label className={styles.builderProvider}><span>AI provider</span><select name="provider" defaultValue="local"><option value="local">Local OpenAI-compatible model</option><option value="hosted">Hosted API</option></select></label>
        <div className={styles.builderSourceFooter}><span><AlertTriangle size={16} /> Answers and rubrics must be verified by a teacher.</span><button className="btn-primary" disabled={preparing}>{preparing ? <Loader2 size={16} className={styles.spinner} /> : <Bot size={16} />} Analyse document</button></div>
      </form> : null}

      {state.status === "error" && mode !== "manual" ? <div className={styles.formError}><AlertTriangle size={18} /> {state.message}</div> : null}
      {state.status === "ready" && mode !== "manual" ? <div className={styles.builderPrepared}><CheckCircle2 size={18} /><div><strong>{state.message}</strong><span>Source: {state.source}</span></div></div> : null}
      {state.status === "ready" && state.warnings?.length ? <div className={styles.builderWarnings}><AlertTriangle size={18} /><div><strong>Teacher review needed</strong>{state.warnings.slice(0, 8).map((warning) => <span key={warning}>{warning}</span>)}{state.warnings.length > 8 ? <small>+{state.warnings.length - 8} more warnings</small> : null}</div></div> : null}

      {(mode === "manual" || state.status === "ready") ? <TestDraftEditor draft={draft} setDraft={setDraft} updateQuestion={updateQuestion} removeQuestion={removeQuestion} duplicateQuestion={duplicateQuestion} moveQuestion={moveQuestion} addQuestion={addQuestion} addSection={addSection} /> : null}

      {(mode === "manual" || state.status === "ready") ? <section className={styles.builderSavePanel}>
        <div className={validation.errors.length ? styles.builderReadinessError : styles.builderReadinessReady}><strong>{validation.errors.length ? `${validation.errors.length} item${validation.errors.length === 1 ? "" : "s"} to fix` : "Ready to save"}</strong><span>{questionCount(draft)} {questionCount(draft) === 1 ? "question" : "questions"} · {draft.published ? "Ready for students" : "Private draft"}</span></div>
        <form action={prepareAction} className={styles.builderAiSuggest}><input type="hidden" name="mode" value="suggest" /><input type="hidden" name="sourceText" value={JSON.stringify(draft)} /><button type="submit" className="btn-secondary" disabled={preparing}>{preparing ? <Loader2 size={16} className={styles.spinner} /> : <WandSparkles size={16} />} Suggest answers & rubrics</button></form>
        {validation.errors.length ? <div className={styles.builderInlineIssues}>{validation.errors.slice(0, 4).map((issue) => <span key={issue}><X size={13} /> {issue}</span>)}</div> : null}
        {validation.warnings.length ? <div className={styles.builderInlineWarnings}>{validation.warnings.slice(0, 3).map((warning) => <span key={warning}><AlertTriangle size={13} /> {warning}</span>)}</div> : null}
        <div className={styles.builderSaveActions}><button type="button" className="btn-secondary" onClick={() => setShowPreview(true)} disabled={validation.errors.length > 0}><Eye size={17} /> Student preview</button><form action={savePreparedTestAction}><input type="hidden" name="json" value={JSON.stringify(draft)} /><input type="hidden" name="openAt" value={draft.openAt || ""} /><input type="hidden" name="dueAt" value={draft.closeAt || ""} /><input type="hidden" name="attemptLimit" value={draft.attemptLimit || 1} /><label><span>Assign now (optional)</span><select name="classSectionId" value={selectedClassroomId} onChange={(event) => setSelectedClassroomId(event.target.value)}><option value="">Keep in Quiz Library</option>{classrooms.map((item) => <option value={item.id} key={item.id}>{item.name} ({item.code})</option>)}</select></label><button className="btn-primary" disabled={validation.errors.length > 0}><Save size={17} /> {draft.published && selectedClassroomId ? "Publish & assign" : draft.published ? "Save & publish" : "Save draft"}</button></form></div>
        <button type="button" className={styles.builderJsonToggle} onClick={() => setShowJson((value) => !value)}><ChevronDown size={15} /> {showJson ? "Hide" : "Review"} JSON</button>
        {showJson ? <textarea className={styles.builderJsonPreview} value={JSON.stringify(draft, null, 2)} onChange={(event) => { try { setDraft(JSON.parse(event.target.value)); } catch {} }} rows={14} spellCheck={false} /> : null}
      </section> : null}
      {showPreview ? <TestPreview draft={draft} onClose={() => setShowPreview(false)} /> : null}
    </section>

    <aside className={styles.testBuilderAside}>
      <header><Library size={18} /><div><strong>Question Bank</strong><span>Reuse a question in one click</span></div></header>
      <input value={bankQuery} onChange={(event) => setBankQuery(event.target.value)} placeholder="Search questions..." />
      <div>{filteredBank.length ? filteredBank.map((item) => <button type="button" key={item.id} onClick={() => addFromBank(item)}><span>{item.type.replaceAll("_", " ")}</span><strong>{item.text}</strong><small><Plus size={13} /> Add to quiz</small></button>) : <p>No reusable questions found yet. Questions saved in quizzes will appear here.</p>}</div>
    </aside>
  </div>;
}

type QuestionMutationProps = {
  updateQuestion: (index: number, patch: Partial<TestQuestionDraft>, sectionIndex?: number) => void;
  removeQuestion: (index: number, sectionIndex?: number) => void;
  duplicateQuestion: (index: number, sectionIndex?: number) => void;
  moveQuestion: (index: number, direction: -1 | 1, sectionIndex?: number) => void;
};

function TestDraftEditor({ draft, setDraft, updateQuestion, removeQuestion, duplicateQuestion, moveQuestion, addQuestion, addSection }: QuestionMutationProps & {
  draft: TestDraft;
  setDraft: React.Dispatch<React.SetStateAction<TestDraft>>;
  addQuestion: (sectionIndex?: number) => void;
  addSection: () => void;
}) {
  return <section className={styles.draftEditor}>
    <header><FileText size={19} /><div><strong>Quiz content</strong><span>Complete the essentials first. Advanced delivery settings stay out of the way until needed.</span></div></header>
    <div className={styles.draftMetaGrid}>
      <label className={styles.draftWide}><span>Quiz title *</span><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Unit 3 vocabulary check" /></label>
      <label><span>Exam type</span><select value={draft.examType || "GENERAL"} onChange={(event) => setDraft((current) => ({ ...current, examType: event.target.value }))}><option>GENERAL</option><option>IELTS</option><option>TOEIC</option></select></label>
      <label><span>Main skill</span><select value={draft.skill || "MIXED"} onChange={(event) => setDraft((current) => ({ ...current, skill: event.target.value }))}>{["MIXED", "READING", "LISTENING", "WRITING", "SPEAKING", "GRAMMAR", "VOCABULARY"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className={styles.draftWide}><span>Student instructions</span><textarea rows={3} value={draft.instructions || ""} onChange={(event) => setDraft((current) => ({ ...current, instructions: event.target.value }))} placeholder="Explain what students must do and what they may use." /></label>
      <label className={styles.draftWide}><span>Teacher note / description</span><textarea rows={3} value={draft.description || ""} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="A short note for your Quiz Library." /></label>
      <details className={styles.draftAdvanced}>
        <summary>Delivery & availability settings</summary>
        <div>
          <label><span>Time limit (minutes)</span><input type="number" min={1} value={draft.timeLimitMinutes || ""} onChange={(event) => setDraft((current) => ({ ...current, timeLimitMinutes: Number(event.target.value) || undefined }))} /></label>
          <label><span>Attempt limit</span><input type="number" min={1} value={draft.attemptLimit || 1} onChange={(event) => setDraft((current) => ({ ...current, attemptLimit: Number(event.target.value) || 1 }))} /></label>
          <label><span>Opens at</span><input type="datetime-local" value={draft.openAt || ""} onChange={(event) => setDraft((current) => ({ ...current, openAt: event.target.value || undefined }))} /></label>
          <label><span>Closes at</span><input type="datetime-local" value={draft.closeAt || ""} onChange={(event) => setDraft((current) => ({ ...current, closeAt: event.target.value || undefined }))} /></label>
          <label className={styles.draftToggle}><input type="checkbox" checked={Boolean(draft.shuffleQuestions)} onChange={(event) => setDraft((current) => ({ ...current, shuffleQuestions: event.target.checked }))} /><span><strong>Shuffle questions</strong><small>Use only when question order is not meaningful.</small></span></label>
          <label className={styles.draftToggle}><input type="checkbox" checked={Boolean(draft.published)} onChange={(event) => setDraft((current) => ({ ...current, published: event.target.checked }))} /><span><strong>Publish after saving</strong><small>Leave off while another teacher still needs to review it.</small></span></label>
        </div>
      </details>
    </div>
    {(draft.sections || []).map((section, sectionIndex) => <SectionEditor key={sectionIndex} section={section} sectionIndex={sectionIndex} setDraft={setDraft} updateQuestion={updateQuestion} removeQuestion={removeQuestion} duplicateQuestion={duplicateQuestion} moveQuestion={moveQuestion} addQuestion={addQuestion} />)}
    {(draft.questions || []).length ? <div className={styles.draftSection}><div className={styles.draftSectionHeader}><div><span>GENERAL QUESTIONS</span><strong>Questions without a section</strong></div><button type="button" onClick={() => addQuestion()}><Plus size={15} /> Add question</button></div>{draft.questions!.map((question, index) => <QuestionEditor key={index} question={question} index={index} count={draft.questions!.length} updateQuestion={updateQuestion} removeQuestion={removeQuestion} duplicateQuestion={duplicateQuestion} moveQuestion={moveQuestion} />)}</div> : null}
    <div className={styles.draftAddActions}><button type="button" onClick={() => addQuestion()}><Plus size={16} /> Add question</button><button type="button" onClick={addSection}><Plus size={16} /> Add reading/listening section</button></div>
  </section>;
}

function SectionEditor({ section, sectionIndex, setDraft, updateQuestion, removeQuestion, duplicateQuestion, moveQuestion, addQuestion }: QuestionMutationProps & { section: TestSectionDraft; sectionIndex: number; setDraft: React.Dispatch<React.SetStateAction<TestDraft>>; addQuestion: (sectionIndex?: number) => void }) {
  const patchSection = (patch: Partial<TestSectionDraft>) => setDraft((current) => { const next = structuredClone(current); next.sections![sectionIndex] = { ...next.sections![sectionIndex], ...patch }; return next; });
  return <div className={styles.draftSection}><div className={styles.draftSectionHeader}><div><span>SECTION {sectionIndex + 1}</span><input aria-label={`Section ${sectionIndex + 1} title`} value={section.title} onChange={(event) => patchSection({ title: event.target.value })} /></div><button type="button" onClick={() => addQuestion(sectionIndex)}><Plus size={15} /> Add question</button></div><div className={styles.draftSectionContext}><textarea rows={2} value={section.instructions || ""} onChange={(event) => patchSection({ instructions: event.target.value })} placeholder="Section instructions (optional)" /><textarea rows={5} value={section.passage || ""} onChange={(event) => patchSection({ passage: event.target.value })} placeholder="Reading passage, transcript or shared context (optional)" /></div>{section.questions.map((question, index) => <QuestionEditor key={index} question={question} index={index} count={section.questions.length} sectionIndex={sectionIndex} updateQuestion={updateQuestion} removeQuestion={removeQuestion} duplicateQuestion={duplicateQuestion} moveQuestion={moveQuestion} />)}</div>;
}

function QuestionEditor({ question, index, count, sectionIndex, updateQuestion, removeQuestion, duplicateQuestion, moveQuestion }: QuestionMutationProps & { question: TestQuestionDraft; index: number; count: number; sectionIndex?: number }) {
  const options = question.options || [];
  const setOption = (optionIndex: number, text: string) => updateQuestion(index, { options: options.map((item, itemIndex) => itemIndex === optionIndex ? { ...item, text } : item) }, sectionIndex);
  const changeType = (type: TestQuestionDraft["type"]) => updateQuestion(index, { type, ...(type === "MULTIPLE_CHOICE" && options.length < 2 ? { options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }] } : {}) }, sectionIndex);
  const correctIndex = options.findIndex((item) => item.isCorrect);
  return <article className={styles.draftQuestion}>
    <div className={styles.draftQuestionTop}><span>{index + 1}</span><select aria-label={`Question ${index + 1} type`} value={question.type} onChange={(event) => changeType(event.target.value as TestQuestionDraft["type"])}><option value="MULTIPLE_CHOICE">Multiple choice</option><option value="SHORT_ANSWER">Short answer</option><option value="FILL_BLANK">Fill in the blank</option><option value="ESSAY">Essay / Writing</option><option value="LISTENING">Listening response</option><option value="READING">Reading prompt</option></select><label>Points <input aria-label={`Question ${index + 1} points`} type="number" min={0.5} step={0.5} value={question.points || 1} onChange={(event) => updateQuestion(index, { points: Number(event.target.value) || 1 }, sectionIndex)} /></label><div className={styles.draftQuestionActions}><button type="button" disabled={index === 0} onClick={() => moveQuestion(index, -1, sectionIndex)} aria-label="Move question up"><ArrowUp size={15} /></button><button type="button" disabled={index === count - 1} onClick={() => moveQuestion(index, 1, sectionIndex)} aria-label="Move question down"><ArrowDown size={15} /></button><button type="button" onClick={() => duplicateQuestion(index, sectionIndex)} aria-label="Duplicate question"><Copy size={15} /></button><button type="button" className={styles.draftQuestionDelete} onClick={() => removeQuestion(index, sectionIndex)} aria-label="Remove question"><Trash2 size={15} /></button></div></div>
    <label className={styles.draftPrompt}><span>Question / prompt *</span><textarea rows={3} value={question.text} onChange={(event) => updateQuestion(index, { text: event.target.value }, sectionIndex)} placeholder="Write a clear, self-contained question." /></label>
    {question.type === "MULTIPLE_CHOICE" ? <><div className={styles.draftOptions}>{options.map((option, optionIndex) => <label key={optionIndex}><input type="radio" name={`correct-${sectionIndex ?? "loose"}-${index}`} aria-label={`Mark option ${String.fromCharCode(65 + optionIndex)} correct`} checked={correctIndex === optionIndex} onChange={() => updateQuestion(index, { correctIndex: optionIndex + 1, options: options.map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === optionIndex })) }, sectionIndex)} /><b>{String.fromCharCode(65 + optionIndex)}</b><input value={option.text} onChange={(event) => setOption(optionIndex, event.target.value)} placeholder={`Answer choice ${String.fromCharCode(65 + optionIndex)}`} /><button type="button" disabled={options.length <= 2} onClick={() => updateQuestion(index, { options: options.filter((_, itemIndex) => itemIndex !== optionIndex), correctIndex: undefined }, sectionIndex)} aria-label={`Remove option ${String.fromCharCode(65 + optionIndex)}`}><X size={14} /></button></label>)}</div><button type="button" className={styles.draftAddOption} onClick={() => updateQuestion(index, { options: [...options, { text: "" }] }, sectionIndex)}><Plus size={14} /> Add answer choice</button></> : <label className={styles.draftAnswer}><span>{question.type === "ESSAY" ? "Rubric / expected evidence" : "Accepted answer *"}</span><textarea rows={2} value={question.answerKey || ""} onChange={(event) => updateQuestion(index, { answerKey: event.target.value }, sectionIndex)} placeholder={question.type === "ESSAY" ? "Describe criteria and point allocation." : "Enter the answer students are expected to give."} /></label>}
    <label className={styles.draftAnswer}><span>Feedback shown after review (optional)</span><input value={question.explanation || ""} onChange={(event) => updateQuestion(index, { explanation: event.target.value }, sectionIndex)} placeholder="Explain why the answer is correct or what to improve." /></label>
  </article>;
}

function TestPreview({ draft, onClose }: { draft: TestDraft; onClose: () => void }) {
  const groups: { title: string; instructions?: string; passage?: string; questions: TestQuestionDraft[] }[] = [...(draft.sections || []).map((section) => ({ title: section.title, instructions: section.instructions, passage: section.passage, questions: section.questions })), ...((draft.questions || []).length ? [{ title: "Questions", questions: draft.questions || [] }] : [])];
  let number = 0;
  const total = questionCount(draft);
  return <div className={styles.testPreviewBackdrop} role="dialog" aria-modal="true" aria-label="Student test preview"><div className={styles.testPreviewModal}><header><div><span>STUDENT PREVIEW</span><h2>{draft.title}</h2><p>{draft.instructions || "No student instructions provided."}</p></div><button type="button" onClick={onClose} aria-label="Close preview"><X size={20} /></button></header><div className={styles.testPreviewMeta}><span>{draft.timeLimitMinutes ? `${draft.timeLimitMinutes} minutes` : "No time limit"}</span><span>{total} question{total === 1 ? "" : "s"}</span><span>{draft.attemptLimit || 1} attempt{(draft.attemptLimit || 1) === 1 ? "" : "s"}</span></div><main>{groups.map((group, groupIndex) => <section key={`${group.title}-${groupIndex}`}><h3>{group.title}</h3>{group.instructions ? <p>{group.instructions}</p> : null}{group.passage ? <blockquote>{group.passage}</blockquote> : null}{group.questions.map((question) => { number += 1; return <article key={number}><div><strong>Question {number}</strong><span>{question.points || 1} pt</span></div><p>{question.text}</p>{question.type === "MULTIPLE_CHOICE" ? <div>{(question.options || []).filter((option) => option.text.trim()).map((option, optionIndex) => <label key={optionIndex}><input type="radio" disabled /><b>{String.fromCharCode(65 + optionIndex)}</b>{option.text}</label>)}</div> : <textarea rows={question.type === "ESSAY" ? 6 : 2} disabled placeholder="Student answer" />}</article>; })}</section>)}</main><footer><button type="button" className="btn-primary" onClick={onClose}>Back to editing</button></footer></div></div>;
}

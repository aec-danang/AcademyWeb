"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookCopy, Bot, CheckCircle2, ChevronDown, ClipboardPaste, FileJson, FileText, Library, Loader2, Plus, Save, Sparkles, Trash2, Upload, WandSparkles } from "lucide-react";
import { prepareTestDraftAction, savePreparedTestAction, type TestBuilderState } from "@/lib/testBuilderActions";
import type { TestDraft, TestQuestionDraft, TestSectionDraft } from "@/lib/testBuilder";
import styles from "../../elearning.module.css";

type Classroom = { id: string; name: string; code: string };
type BankQuestion = { id: string; text: string; type: string; points: number; answerKey: string | null; explanation: string | null; options: { text: string; isCorrect: boolean }[] };
type BuilderMode = "manual" | "import" | "template" | "ai";
const initialTestBuilderState: TestBuilderState = { status: "idle", message: "" };

const blankQuestion = (): TestQuestionDraft => ({ type: "MULTIPLE_CHOICE", text: "", points: 1, options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }] });
const blankDraft = (): TestDraft => ({ title: "", examType: "GENERAL", skill: "MIXED", timeLimitMinutes: 45, attemptLimit: 1, sections: [], questions: [blankQuestion()] });

function questionCount(draft: TestDraft) {
  return (draft.questions?.length || 0) + (draft.sections || []).reduce((sum, section) => sum + section.questions.length, 0);
}

export function TestBuilder({ classrooms, questionBank }: { classrooms: Classroom[]; questionBank: BankQuestion[] }) {
  const [mode, setMode] = useState<BuilderMode>("manual");
  const [state, prepareAction, preparing] = useActionState(prepareTestDraftAction, initialTestBuilderState);
  const [draft, setDraft] = useState<TestDraft>(blankDraft);
  const [showJson, setShowJson] = useState(false);
  const [bankQuery, setBankQuery] = useState("");

  useEffect(() => {
    if (!state.draft) return;
    const preparedDraft = state.draft;
    queueMicrotask(() => setDraft(preparedDraft));
  }, [state.draft]);
  const filteredBank = useMemo(() => questionBank.filter((item) => item.text.toLowerCase().includes(bankQuery.toLowerCase())).slice(0, 12), [bankQuery, questionBank]);

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
  const addSection = () => setDraft((current) => ({ ...current, sections: [...(current.sections || []), { title: `Section ${(current.sections?.length || 0) + 1}`, skill: current.skill || "READING", questions: [blankQuestion()] }] }));
  const addFromBank = (item: BankQuestion) => addQuestion(undefined, { type: item.type as TestQuestionDraft["type"], text: item.text, points: item.points, answerKey: item.answerKey || undefined, explanation: item.explanation || undefined, options: item.options });

  return <div className={styles.testBuilderLayout}>
    <section className={styles.testBuilderMain}>
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
        <header><ClipboardPaste size={20} /><div><strong>Turn existing content into a test</strong><span>Use clear question numbers, A/B/C/D options and “Answer: B” when possible.</span></div></header>
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
        <textarea name="sourceText" rows={10} placeholder="Or paste an unstructured English test here..." />
        <label className={styles.builderProvider}><span>AI provider</span><select name="provider" defaultValue="hosted"><option value="hosted">Hosted API (recommended)</option><option value="local">Local OpenAI-compatible model</option></select></label>
        <div className={styles.builderSourceFooter}><span><AlertTriangle size={16} /> Answers and rubrics must be verified by a teacher.</span><button className="btn-primary" disabled={preparing}>{preparing ? <Loader2 size={16} className={styles.spinner} /> : <Bot size={16} />} Analyse document</button></div>
      </form> : null}

      {state.status === "error" && mode !== "manual" ? <div className={styles.formError}><AlertTriangle size={18} /> {state.message}</div> : null}
      {state.status === "ready" && mode !== "manual" ? <div className={styles.builderPrepared}><CheckCircle2 size={18} /><div><strong>{state.message}</strong><span>Source: {state.source}</span></div></div> : null}
      {state.status === "ready" && state.warnings?.length ? <div className={styles.builderWarnings}><AlertTriangle size={18} /><div><strong>Teacher review needed</strong>{state.warnings.slice(0, 8).map((warning) => <span key={warning}>{warning}</span>)}{state.warnings.length > 8 ? <small>+{state.warnings.length - 8} more warnings</small> : null}</div></div> : null}

      {(mode === "manual" || state.status === "ready") ? <TestDraftEditor draft={draft} setDraft={setDraft} updateQuestion={updateQuestion} removeQuestion={removeQuestion} addQuestion={addQuestion} addSection={addSection} /> : null}

      {(mode === "manual" || state.status === "ready") ? <section className={styles.builderSavePanel}>
        <div><strong>Ready to save?</strong><span>{questionCount(draft)} questions · The test stays reusable in Test Library.</span></div>
        <form action={prepareAction} className={styles.builderAiSuggest}><input type="hidden" name="mode" value="suggest" /><input type="hidden" name="sourceText" value={JSON.stringify(draft)} /><button type="submit" className="btn-secondary" disabled={preparing}>{preparing ? <Loader2 size={16} className={styles.spinner} /> : <WandSparkles size={16} />} Suggest answers & rubrics</button></form>
        <form action={savePreparedTestAction}><input type="hidden" name="json" value={JSON.stringify(draft)} /><label><span>Optional classroom</span><select name="classSectionId" defaultValue=""><option value="">Keep in library only</option>{classrooms.map((item) => <option value={item.id} key={item.id}>{item.name} ({item.code})</option>)}</select></label><button className="btn-primary" disabled={!draft.title.trim() || !questionCount(draft)}><Save size={17} /> Save test</button></form>
        <button type="button" className={styles.builderJsonToggle} onClick={() => setShowJson((value) => !value)}><ChevronDown size={15} /> {showJson ? "Hide" : "Review"} JSON</button>
        {showJson ? <textarea className={styles.builderJsonPreview} value={JSON.stringify(draft, null, 2)} onChange={(event) => { try { setDraft(JSON.parse(event.target.value)); } catch {} }} rows={14} spellCheck={false} /> : null}
      </section> : null}
    </section>

    <aside className={styles.testBuilderAside}>
      <header><Library size={18} /><div><strong>Question Bank</strong><span>Reuse a question in one click</span></div></header>
      <input value={bankQuery} onChange={(event) => setBankQuery(event.target.value)} placeholder="Search questions..." />
      <div>{filteredBank.length ? filteredBank.map((item) => <button type="button" key={item.id} onClick={() => addFromBank(item)}><span>{item.type.replaceAll("_", " ")}</span><strong>{item.text}</strong><small><Plus size={13} /> Add to test</small></button>) : <p>No reusable questions found yet. Questions saved in tests will appear here.</p>}</div>
    </aside>
  </div>;
}

function TestDraftEditor({ draft, setDraft, updateQuestion, removeQuestion, addQuestion, addSection }: {
  draft: TestDraft; setDraft: React.Dispatch<React.SetStateAction<TestDraft>>;
  updateQuestion: (index: number, patch: Partial<TestQuestionDraft>, sectionIndex?: number) => void;
  removeQuestion: (index: number, sectionIndex?: number) => void; addQuestion: (sectionIndex?: number) => void; addSection: () => void;
}) {
  return <section className={styles.draftEditor}>
    <header><FileText size={19} /><div><strong>Test details and preview</strong><span>Edit the extracted content before saving it to the library.</span></div></header>
    <div className={styles.draftMetaGrid}>
      <label className={styles.draftWide}><span>Test title *</span><input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="IELTS Reading Mock Test 01" /></label>
      <label><span>Exam type</span><select value={draft.examType || "GENERAL"} onChange={(event) => setDraft((current) => ({ ...current, examType: event.target.value }))}><option>GENERAL</option><option>IELTS</option><option>TOEIC</option></select></label>
      <label><span>Main skill</span><select value={draft.skill || "MIXED"} onChange={(event) => setDraft((current) => ({ ...current, skill: event.target.value }))}>{["MIXED", "READING", "LISTENING", "WRITING", "SPEAKING", "GRAMMAR", "VOCABULARY"].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>Time limit (minutes)</span><input type="number" min={1} value={draft.timeLimitMinutes || ""} onChange={(event) => setDraft((current) => ({ ...current, timeLimitMinutes: Number(event.target.value) || undefined }))} /></label>
      <label><span>Attempt limit</span><input type="number" min={1} value={draft.attemptLimit || 1} onChange={(event) => setDraft((current) => ({ ...current, attemptLimit: Number(event.target.value) || 1 }))} /></label>
      <label className={styles.draftWide}><span>Description</span><textarea rows={2} value={draft.description || ""} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>
    </div>
    {(draft.sections || []).map((section, sectionIndex) => <SectionEditor key={sectionIndex} section={section} sectionIndex={sectionIndex} setDraft={setDraft} updateQuestion={updateQuestion} removeQuestion={removeQuestion} addQuestion={addQuestion} />)}
    {(draft.questions || []).length ? <div className={styles.draftSection}><div className={styles.draftSectionHeader}><div><span>GENERAL QUESTIONS</span><strong>Questions without a section</strong></div><button type="button" onClick={() => addQuestion()}><Plus size={15} /> Add question</button></div>{draft.questions!.map((question, index) => <QuestionEditor key={index} question={question} index={index} updateQuestion={updateQuestion} removeQuestion={removeQuestion} />)}</div> : null}
    <div className={styles.draftAddActions}><button type="button" onClick={() => addQuestion()}><Plus size={16} /> Add question</button><button type="button" onClick={addSection}><Plus size={16} /> Add section</button></div>
  </section>;
}

function SectionEditor({ section, sectionIndex, setDraft, updateQuestion, removeQuestion, addQuestion }: { section: TestSectionDraft; sectionIndex: number; setDraft: React.Dispatch<React.SetStateAction<TestDraft>>; updateQuestion: (index: number, patch: Partial<TestQuestionDraft>, sectionIndex?: number) => void; removeQuestion: (index: number, sectionIndex?: number) => void; addQuestion: (sectionIndex?: number) => void }) {
  const patchSection = (patch: Partial<TestSectionDraft>) => setDraft((current) => { const next = structuredClone(current); next.sections![sectionIndex] = { ...next.sections![sectionIndex], ...patch }; return next; });
  return <div className={styles.draftSection}><div className={styles.draftSectionHeader}><div><span>SECTION {sectionIndex + 1}</span><input value={section.title} onChange={(event) => patchSection({ title: event.target.value })} /></div><button type="button" onClick={() => addQuestion(sectionIndex)}><Plus size={15} /> Add question</button></div><textarea className={styles.draftPassage} rows={4} value={section.passage || ""} onChange={(event) => patchSection({ passage: event.target.value })} placeholder="Optional passage or section context..." />{section.questions.map((question, index) => <QuestionEditor key={index} question={question} index={index} sectionIndex={sectionIndex} updateQuestion={updateQuestion} removeQuestion={removeQuestion} />)}</div>;
}

function QuestionEditor({ question, index, sectionIndex, updateQuestion, removeQuestion }: { question: TestQuestionDraft; index: number; sectionIndex?: number; updateQuestion: (index: number, patch: Partial<TestQuestionDraft>, sectionIndex?: number) => void; removeQuestion: (index: number, sectionIndex?: number) => void }) {
  const setOption = (optionIndex: number, text: string) => updateQuestion(index, { options: (question.options || []).map((item, itemIndex) => itemIndex === optionIndex ? { ...item, text } : item) }, sectionIndex);
  const correctIndex = question.options?.findIndex((item) => item.isCorrect) ?? -1;
  return <article className={styles.draftQuestion}><div className={styles.draftQuestionTop}><span>{index + 1}</span><select value={question.type} onChange={(event) => updateQuestion(index, { type: event.target.value as TestQuestionDraft["type"] }, sectionIndex)}><option value="MULTIPLE_CHOICE">Multiple choice</option><option value="FILL_BLANK">Fill blank</option><option value="ESSAY">Essay / Writing</option><option value="LISTENING">Listening</option><option value="READING">Reading</option></select><label>Points <input type="number" min={0.5} step={0.5} value={question.points || 1} onChange={(event) => updateQuestion(index, { points: Number(event.target.value) || 1 }, sectionIndex)} /></label><button type="button" onClick={() => removeQuestion(index, sectionIndex)} aria-label="Remove question"><Trash2 size={16} /></button></div><textarea rows={3} value={question.text} onChange={(event) => updateQuestion(index, { text: event.target.value }, sectionIndex)} placeholder="Write the question or prompt..." />{question.type === "MULTIPLE_CHOICE" ? <div className={styles.draftOptions}>{(question.options || []).map((option, optionIndex) => <label key={optionIndex}><input type="radio" name={`correct-${sectionIndex ?? "loose"}-${index}`} checked={correctIndex === optionIndex} onChange={() => updateQuestion(index, { correctIndex: optionIndex + 1, options: (question.options || []).map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === optionIndex })) }, sectionIndex)} /><b>{String.fromCharCode(65 + optionIndex)}</b><input value={option.text} onChange={(event) => setOption(optionIndex, event.target.value)} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`} /></label>)}</div> : <label className={styles.draftAnswer}><span>Answer key / rubric</span><textarea rows={2} value={question.answerKey || ""} onChange={(event) => updateQuestion(index, { answerKey: event.target.value }, sectionIndex)} placeholder={question.type === "ESSAY" ? "Assessment rubric or expected points..." : "Accepted answer..."} /></label>}<label className={styles.draftAnswer}><span>Explanation (optional)</span><input value={question.explanation || ""} onChange={(event) => updateQuestion(index, { explanation: event.target.value }, sectionIndex)} placeholder="Why is this answer correct?" /></label></article>;
}

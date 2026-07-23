import Link from "next/link";
import { ArrowLeft, Route } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ElearningBreadcrumbs } from "../../ElearningBreadcrumbs";
import { TestBuilder } from "./TestBuilder";
import styles from "../../elearning.module.css";

export const dynamic = "force-dynamic";

export default async function CreateTestPage() {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  const [classrooms, questions] = await Promise.all([
    prisma.classSection.findMany({ where: user.role === "TEACHER" ? { teacherId: user.id, status: "ACTIVE" } : { status: "ACTIVE" }, select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    prisma.question.findMany({ where: user.role === "TEACHER" ? { createdById: user.id } : {}, include: { options: { orderBy: { order: "asc" } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
  ]);
  return <main className={styles.workflowPage}>
    <ElearningBreadcrumbs items={[{ label: "Test Library", href: "/elearning/practice?tab=tests" }, { label: "Create test" }]} />
    <header className={styles.workflowHero}><div><span><Route size={16} /> Assessment workflow</span><h1>Create an English test</h1><p>Write from scratch, reuse your question bank, import a document or start from an exam template.</p></div><Link href="/elearning/practice?tab=tests" className="btn-secondary"><ArrowLeft size={16} /> Back to library</Link></header>
    <div className={styles.workflowSteps}><strong>1 <span>Build or import</span></strong><i /><span>2 <em>Review questions</em></span><i /><span>3 <em>Save and assign</em></span></div>
    <TestBuilder classrooms={classrooms} questionBank={questions.map((item) => ({ id: item.id, text: item.text, type: item.type, points: item.points, answerKey: item.answerKey, explanation: item.explanation, options: item.options.map((option) => ({ text: option.text, isCorrect: option.isCorrect })) }))} />
  </main>;
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookCopy, Clock3, Download, History, Save, Trash2, UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { addTestCollaboratorAction, createTestVersionAction, duplicateTestSectionAction, removeTestCollaboratorAction } from "@/lib/testBuilderActions";
import { ElearningBreadcrumbs } from "../../../ElearningBreadcrumbs";
import styles from "../../../elearning.module.css";

export const dynamic = "force-dynamic";

export default async function ManageTestPage({ params }: { params: Promise<{ quizId: string }> }) {
  const user = await requireUser(["TEACHER", "ADMIN"]);
  const { quizId } = await params;
  const test = await prisma.quiz.findFirst({
    where: { id: quizId, isPracticeTest: true, ...(user.role === "TEACHER" ? { OR: [{ createdById: user.id }, { collaborators: { some: { userId: user.id } } }] } : {}) },
    include: { createdBy: true, sections: { orderBy: { order: "asc" }, include: { _count: { select: { questions: true } } } }, collaborators: { include: { user: true }, orderBy: { createdAt: "asc" } }, versions: { include: { createdBy: true }, orderBy: { version: "desc" }, take: 20 }, _count: { select: { questions: true } } },
  });
  if (!test) notFound();
  const isOwner = user.role === "ADMIN" || test.createdById === user.id;

  return <main className={styles.workflowPage}>
    <ElearningBreadcrumbs items={[{ label: "Test Library", href: "/elearning/practice?tab=tests" }, { label: test.title }, { label: "Manage" }]} />
    <header className={styles.workflowHero}><div><span><History size={16} /> Test management</span><h1>{test.title}</h1><p>{test._count.questions} questions · {test.examType} · {test.skill}</p></div><div className={styles.manageTestHeroActions}><Link href={`/elearning/practice/${test.id}/qti`} className="btn-secondary"><Download size={16} /> Export QTI</Link><Link href="/elearning/practice?tab=tests" className="btn-secondary"><ArrowLeft size={16} /> Library</Link></div></header>
    <div className={styles.testManageGrid}>
      <section className={styles.testManagePanel}><header><BookCopy size={19} /><div><strong>Sections</strong><span>Duplicate a complete section to reuse its structure and questions.</span></div></header>{test.sections.length ? <div className={styles.manageSectionList}>{test.sections.map((section) => <div key={section.id}><span>{section.order || "–"}</span><div><strong>{section.title}</strong><small>{section.skill} · {section._count.questions} questions</small></div><form action={duplicateTestSectionAction}><input type="hidden" name="quizId" value={test.id} /><input type="hidden" name="sectionId" value={section.id} /><button type="submit"><BookCopy size={15} /> Duplicate</button></form></div>)}</div> : <p className={styles.classroomEmpty}>This test has no sections yet.</p>}</section>
      <section className={styles.testManagePanel}><header><History size={19} /><div><strong>Version history</strong><span>Create named snapshots before making important changes.</span></div></header><form action={createTestVersionAction} className={styles.versionCreateForm}><input type="hidden" name="quizId" value={test.id} /><input name="changeNote" placeholder="Before updating answer keys" maxLength={160} /><button className="btn-primary"><Save size={15} /> Save snapshot</button></form><div className={styles.versionList}>{test.versions.map((version) => <div key={version.id}><span>v{version.version}</span><div><strong>{version.changeNote || "Saved version"}</strong><small><Clock3 size={12} /> {version.createdAt.toLocaleString("en-US")} · {version.createdBy?.name || version.createdBy?.email || "System"}</small></div></div>)}</div></section>
      <section className={`${styles.testManagePanel} ${styles.testManageWide}`}><header><Users size={19} /><div><strong>Teacher collaboration</strong><span>Invite another teacher as an editor. Students never appear in this list.</span></div></header>{isOwner ? <form action={addTestCollaboratorAction} className={styles.collaboratorForm}><input type="hidden" name="quizId" value={test.id} /><input type="email" name="email" placeholder="teacher@academy.edu.vn" required /><button className="btn-primary"><UserPlus size={15} /> Add editor</button></form> : <p className={styles.collaboratorNotice}>Only the test owner can manage collaborators.</p>}<div className={styles.collaboratorList}><div><span>{test.createdBy?.name?.charAt(0) || "O"}</span><div><strong>{test.createdBy?.name || test.createdBy?.email || "Test owner"}</strong><small>Owner</small></div></div>{test.collaborators.map((collaborator) => <div key={collaborator.id}><span>{collaborator.user.name?.charAt(0) || "T"}</span><div><strong>{collaborator.user.name || collaborator.user.email}</strong><small>{collaborator.role}</small></div>{isOwner ? <form action={removeTestCollaboratorAction}><input type="hidden" name="quizId" value={test.id} /><input type="hidden" name="collaboratorId" value={collaborator.id} /><button aria-label="Remove collaborator"><Trash2 size={15} /></button></form> : null}</div>)}</div></section>
    </div>
  </main>;
}

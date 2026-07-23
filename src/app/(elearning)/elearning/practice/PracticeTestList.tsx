"use client";

import { useState } from "react";
import Link from "next/link";
import { BookCopy, BookOpen, CalendarClock, ChevronRight, Download, Settings2, Send, Target, X } from "lucide-react";
import { assignQuizToClassAction } from "@/lib/lmsActions";
import { duplicatePracticeTestAction } from "@/lib/testBuilderActions";
import styles from "../elearning.module.css";

type TestCard = {
  id: string;
  title: string;
  unit: string | null;
  program: { name: string } | null;
  _count: { questions: number };
  deliveryId: string | null;
  canManage: boolean;
};

type ClassroomOption = { id: string; name: string; code: string };

export default function PracticeTestList({ tests, classrooms, canAssign }: {
  tests: TestCard[];
  classrooms: ClassroomOption[];
  canAssign: boolean;
}) {
  const [selectedTest, setSelectedTest] = useState<TestCard | null>(null);

  if (!tests.length) {
    return <div className={styles.libraryEmpty}><Target size={40} /><h3>Chưa có đề thi phù hợp</h3><p>Hãy thay đổi bộ lọc để xem các đề thi khác.</p></div>;
  }

  return <>
    <div className={styles.testLibraryGrid}>
      {tests.map((test) => {
        const href = `/elearning/exercises/${test.id}${test.deliveryId ? `?delivery=${test.deliveryId}` : ""}`;
        return <article key={test.id} className={styles.testLibraryCard}>
          <div className={styles.testLibraryCardBody}>
            <span className={styles.libraryTag}>{test.program?.name || "Practice Test"}{test.unit ? ` · Unit ${test.unit}` : ""}</span>
            <h3><Link href={href}>{test.title}</Link></h3>
          </div>
          <div className={styles.testLibraryMeta}>
            <span><BookOpen size={15} /> {test._count.questions} câu hỏi</span>
            <Link href={href}>{canAssign ? "Xem trước" : "Vào thi"}<ChevronRight size={16} /></Link>
          </div>
          {test.canManage ? <div className={styles.testCardUtilities}><Link href={`/elearning/practice/${test.id}/manage`}><Settings2 size={14} /> Manage</Link><form action={duplicatePracticeTestAction}><input type="hidden" name="quizId" value={test.id} /><button type="submit"><BookCopy size={14} /> Duplicate</button></form><Link href={`/elearning/practice/${test.id}/qti`}><Download size={14} /> QTI</Link></div> : null}
          {canAssign ? <button type="button" className={styles.testAssignButton} onClick={() => setSelectedTest(test)}><Send size={16} /> Giao đề cho lớp</button> : null}
        </article>;
      })}
    </div>

    {selectedTest ? <div className={styles.assignmentModalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTest(null); }}>
      <section className={styles.assignmentModal} role="dialog" aria-modal="true" aria-labelledby="assign-test-title">
        <header>
          <div><span>Giao đề thi</span><h2 id="assign-test-title">{selectedTest.title}</h2></div>
          <button type="button" onClick={() => setSelectedTest(null)} aria-label="Đóng"><X size={20} /></button>
        </header>
        <form action={assignQuizToClassAction} className={styles.assignmentModalForm}>
          <input type="hidden" name="quizId" value={selectedTest.id} />
          <label><span>Lớp học</span><select name="classSectionId" required defaultValue=""><option value="" disabled>Chọn lớp nhận đề</option>{classrooms.map((classroom) => <option value={classroom.id} key={classroom.id}>{classroom.name} ({classroom.code})</option>)}</select></label>
          <label><span><CalendarClock size={14} /> Deadline</span><input name="dueAt" type="datetime-local" required /></label>
          <label><span>Số lần làm</span><input name="attemptLimit" type="number" min="1" defaultValue="1" required /></label>
          <footer><button type="button" className="btn-secondary" onClick={() => setSelectedTest(null)}>Hủy</button><button type="submit" className="btn-primary"><Send size={16} /> Giao đề</button></footer>
        </form>
      </section>
    </div> : null}
  </>;
}

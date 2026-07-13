import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { FileCheck2, Search, SlidersHorizontal } from "lucide-react";
import styles from "../elearning.module.css";
import PracticeTestList from "./PracticeTestList";
import QuizFilters from "./QuizFilters";

export const dynamic = "force-dynamic";

export async function PracticeTestsTab({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q.toLowerCase() : "";
  const program = typeof resolvedSearchParams?.program === "string" ? resolvedSearchParams.program : "";
  const unit = typeof resolvedSearchParams?.unit === "string" ? resolvedSearchParams.unit : "";

  // Lấy toàn bộ đề thi Practice Test đã được published
  const tests = await prisma.quiz.findMany({
    where: {
      isPracticeTest: true,
      published: true,
      ...(program ? { programId: program } : {}),
      ...(unit ? { unit: unit } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      program: true,
      _count: {
        select: { questions: true }
      }
    },
  });

  const filteredTests = tests.filter((test) => {
    if (!q) return true;
    const searchString = `${test.title} ${test.program?.name || ""} ${test.program?.code || ""} ${test.unit || ""}`.toLowerCase();
    return searchString.includes(q);
  });

  const programs = await prisma.program.findMany({ orderBy: { code: 'asc' } });
  const programOptions = programs.filter((p) => tests.some((t) => t.programId === p.id) || p.id === program);
  const allUnits = Array.from(new Set(tests.map((t) => t.unit).filter(Boolean))) as string[];
  const unitOptions = allUnits.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return (
    <div className={styles.quizPageShell}>
      <section className={styles.quizHero}>
        <div>
          <span className={styles.cockpitEyebrow}><FileCheck2 size={16} /> Ngân hàng đề thi</span>
          <h1>Luyện tập cùng hàng trăm đề thi.</h1>
          <p>
            Các đề thi luyện tập độc lập giúp bạn ôn luyện kiến thức nhanh chóng mà không cần tham gia lớp học. Hãy click vào bất kỳ đề nào để làm bài ngay!
          </p>
        </div>
        <div className={styles.quizHeroStats}>
          <div><strong>{filteredTests.length}</strong><span>Total tests</span></div>
        </div>
      </section>

      <QuizFilters 
        q={q}
        program={program}
        unit={unit}
        programOptions={programOptions}
        unitOptions={unitOptions}
      />

      {/* GSAP Client Component */}
      <PracticeTestList tests={filteredTests} />
    </div>
  );
}

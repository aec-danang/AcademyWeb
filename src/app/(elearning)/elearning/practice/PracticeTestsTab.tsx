import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import Link from "next/link";
import { FileCheck2, Plus } from "lucide-react";
import styles from "../elearning.module.css";
import PracticeTestList from "./PracticeTestList";
import QuizFilters from "./QuizFilters";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
type PracticeTestRecord = Prisma.QuizGetPayload<{ include: { program: true; _count: { select: { questions: true } }; deliveries: true; collaborators: { select: { userId: true } } } }>;

export async function PracticeTestsTab({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q.trim() : "";
  const program = typeof resolvedSearchParams?.program === "string" ? resolvedSearchParams.program : "";
  const unit = typeof resolvedSearchParams?.unit === "string" ? resolvedSearchParams.unit : "";

  let tests: PracticeTestRecord[] = [];
  let programs: Awaited<ReturnType<typeof prisma.program.findMany>> = [];
  let classrooms: Array<{ id: string; name: string; code: string }> = [];

  try {
    // Lấy toàn bộ đề thi Practice Test đã được published
    tests = await prisma.quiz.findMany({
      where: {
        isPracticeTest: true,
        published: true,
        ...(user.role === "STUDENT" ? {
          deliveries: { some: { status: "PUBLISHED", classSection: { status: "ACTIVE", enrollments: { some: { userId: user.id, status: "ACTIVE" } } } } },
        } : {}),
        ...(program ? { programId: program } : {}),
        ...(unit ? { unit: unit } : {}),
        ...(q ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { unit: { contains: q, mode: "insensitive" } },
            { program: { is: { OR: [
              { code: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ] } } },
          ],
        } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        program: true,
        _count: {
          select: { questions: true }
        },
        deliveries: user.role === "STUDENT" ? {
          where: { status: "PUBLISHED", classSection: { status: "ACTIVE", enrollments: { some: { userId: user.id, status: "ACTIVE" } } } },
          orderBy: { createdAt: "desc" },
        } : true,
        collaborators: { select: { userId: true } },
      },
    });

    programs = await prisma.program.findMany({ orderBy: { code: 'asc' } });
    if (user.role !== "STUDENT") {
      classrooms = await prisma.classSection.findMany({
        where: user.role === "TEACHER" ? { teacherId: user.id, status: "ACTIVE" } : { status: "ACTIVE" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, code: true },
      });
    }
  } catch (error) {
    console.error("Failed to load practice tests:", error);
  }

  const filteredTests = tests;

  const programOptions = programs.filter((p) => tests.some((t) => t.programId === p.id) || p.id === program);
  const allUnits = Array.from(new Set(tests.map((t) => t.unit).filter(Boolean))) as string[];
  const unitOptions = allUnits.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return (
    <div className={styles.quizPageShell}>
      {resolvedSearchParams?.created === "1" ? <div className={styles.builderPrepared}><FileCheck2 size={18} /><div><strong>Test saved to your library</strong><span>You can preview it or assign it to a classroom.</span></div></div> : null}
      <section className={styles.quizHero}>
        <div>
          <span className={styles.cockpitEyebrow}><FileCheck2 size={16} /> Ngân hàng đề thi</span>
          <h1>Luyện tập cùng hàng trăm đề thi.</h1>
          <p>
            Các đề thi luyện tập độc lập giúp bạn ôn luyện kiến thức nhanh chóng mà không cần tham gia lớp học. Hãy click vào bất kỳ đề nào để làm bài ngay!
          </p>
        </div>
        <div className={styles.quizHeroActions}>
          {user.role !== "STUDENT" ? <Link href="/elearning/practice/new" className="btn-primary"><Plus size={16} /> Create test</Link> : null}
          <div className={styles.quizHeroStats}><div><strong>{filteredTests.length}</strong><span>Total tests</span></div></div>
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
      <PracticeTestList
        tests={filteredTests.map((test) => ({
          id: test.id,
          title: test.title,
          unit: test.unit,
          program: test.program ? { name: test.program.name } : null,
          _count: test._count,
          deliveryId: test.deliveries[0]?.id || null,
          canManage: user.role === "ADMIN" || test.createdById === user.id || test.collaborators.some((item) => item.userId === user.id),
        }))}
        classrooms={classrooms}
        canAssign={user.role !== "STUDENT"}
      />
    </div>
  );
}

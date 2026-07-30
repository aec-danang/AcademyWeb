import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ClipboardList,
  RotateCcw,
  Search,
  Target,
  Trophy,
} from "lucide-react";
import styles from "../elearning.module.css";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { startQuizReviewAttemptAction } from "@/lib/lmsActions";
import type { Prisma } from "@prisma/client";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
type WrongAnswerRecord = Prisma.AttemptAnswerGetPayload<{ include: { option: true; question: { include: { options: true } }; attempt: { include: { student: true; quizDelivery: { include: { classSection: true } }; quiz: { include: { program: true; classSection: true } } } } } }>;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function searchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function formatSkill(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function answerText(answer: {
  answerText: string | null;
  option: { label: string | null; text: string } | null;
}) {
  if (answer.option) return `${answer.option.label ? `${answer.option.label}. ` : ""}${answer.option.text}`;
  if (answer.answerText?.trim()) return answer.answerText;
  return "Blank";
}

function correctAnswerText(question: {
  answerKey: string | null;
  options: { label: string | null; text: string; isCorrect: boolean }[];
}) {
  const correctOptions = question.options.filter((option) => option.isCorrect);
  if (correctOptions.length > 0) {
    return correctOptions.map((option) => `${option.label ? `${option.label}. ` : ""}${option.text}`).join(", ");
  }
  return question.answerKey || "Pending answer key";
}

export async function WrongQuestionsTab({ searchParams }: Props) {
  const user = await requireUser();
  const isStudent = user.role === "STUDENT";
  const resolvedSearchParams = await searchParams;
  const searchTerm = searchValue(resolvedSearchParams?.q);
  const normalizedSearch = searchTerm.trim().toLowerCase();

  let wrongAnswers: WrongAnswerRecord[] = [];

  try {
    wrongAnswers = await prisma.attemptAnswer.findMany({
      where: {
        isCorrect: false,
        attempt: {
          isReviewPractice: false,
          ...(isStudent
            ? { studentId: user.id }
            : user.role === "TEACHER"
              ? {
                  OR: [
                    { quizDelivery: { classSection: { teacherId: user.id } } },
                    { quiz: { classSection: { teacherId: user.id } } },
                  ],
                }
              : {}),
          status: { not: "IN_PROGRESS" },
        },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        option: true,
        question: { include: { options: { orderBy: { order: "asc" } } } },
        attempt: {
          include: {
            student: true,
            quizDelivery: { include: { classSection: true } },
            quiz: {
              include: {
                program: true,
                classSection: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to load wrong questions:", error);
  }

  type WrongAnswer = (typeof wrongAnswers)[number];
  const groups = new Map<string, { answers: WrongAnswer[] }>();
  for (const answer of wrongAnswers) {
    const key = `${answer.attempt.studentId}:${answer.attempt.quizId}:${answer.questionId}`;
    const group = groups.get(key);
    if (group) {
      group.answers.push(answer);
    } else {
      groups.set(key, { answers: [answer] });
    }
  }

  const cards = Array.from(groups.values()).map((group) => {
    const latest = group.answers[0];
    const quiz = latest.attempt.quiz;
    const classroom = latest.attempt.quizDelivery?.classSection || quiz.classSection;
    const question = latest.question;
    const latestWrongAt = latest.attempt.submittedAt || latest.updatedAt;

    return {
      key: `${quiz.id}:${question.id}`,
      questionId: question.id,
      quizId: quiz.id,
      quizDeliveryId: latest.attempt.quizDeliveryId,
      quizTitle: quiz.title,
      isPracticeTest: quiz.isPracticeTest,
      classroomId: classroom?.id || "open_quiz",
      classroomName: classroom?.name || "Open quiz",
      classCode: classroom?.code || "Practice",
      studentId: latest.attempt.studentId,
      studentName: latest.attempt.student.name || latest.attempt.student.email || "Student",
      studentEmail: latest.attempt.student.email,
      programCode: quiz.program?.code || "General",
      programName: quiz.program?.name || "General",
      skill: quiz.skill,
      examType: quiz.examType,
      unit: quiz.unit,
      questionType: question.sourceType || question.type,
      questionText: question.text,
      passage: question.passage,
      audioUrl: question.audioUrl,
      correctAnswer: correctAnswerText(question),
      explanation: question.explanation,
      latestWrongAt,
      wrongCount: group.answers.length,
      latestAnswer: answerText(latest),
      reviewHref: `/elearning/exercises/${quiz.id}?attempt=${latest.attemptId}`,
      searchText: [
        question.text,
        question.explanation,
        quiz.title,
        quiz.program?.code,
        quiz.program?.name,
        quiz.unit,
        quiz.skill,
        classroom?.name,
        latest.attempt.student.name,
        latest.attempt.student.email,
      ].filter(Boolean).join(" ").toLowerCase(),
    };
  });

  const studentOptions = uniqueBy(
    cards.map((card) => ({ id: card.studentId, title: card.studentName })),
    (student) => student.id,
  ).sort((a, b) => a.title.localeCompare(b.title, "en", { numeric: true }));
  const filteredCards = cards.filter((card) => {
    if (isStudent) return true;
    if (normalizedSearch && ![
      card.classroomName,
      card.classCode,
      card.studentName,
      card.studentEmail,
    ].filter(Boolean).join(" ").toLowerCase().includes(normalizedSearch)) return false;
    return true;
  });
  type WrongQuestionCard = (typeof filteredCards)[number];
  type QuizGroup = {
    quizId: string;
    quizTitle: string;
    classroomName: string;
    studentName: string;
    programCode: string;
    classCode: string;
    quizDeliveryId: string | null;
    cards: WrongQuestionCard[];
  };
  const groupedCards = Array.from(filteredCards.reduce<Map<string, QuizGroup>>((acc, card) => {
    const groupKey = isStudent ? card.quizId : `${card.classroomId}:${card.studentId}:${card.quizId}`;
    if (!acc.has(groupKey)) {
      acc.set(groupKey, { quizId: card.quizId, quizDeliveryId: card.quizDeliveryId, quizTitle: card.quizTitle, classroomName: card.classroomName, studentName: card.studentName, programCode: card.programCode, classCode: card.classCode, cards: [] });
    }
    acc.get(groupKey)?.cards.push(card);
    return acc;
  }, new Map()).values());
  type TeacherStudentGroup = {
    studentId: string;
    studentName: string;
    studentEmail: string | null;
    quizzes: QuizGroup[];
    cards: WrongQuestionCard[];
  };
  type TeacherClassGroup = {
    classroomId: string;
    classroomName: string;
    classCode: string;
    students: TeacherStudentGroup[];
    cards: WrongQuestionCard[];
  };
  const teacherClassGroups = Array.from(filteredCards.reduce<Map<string, TeacherClassGroup>>((classMap, card) => {
    const classroom = classMap.get(card.classroomId) || {
      classroomId: card.classroomId,
      classroomName: card.classroomName,
      classCode: card.classCode,
      students: [],
      cards: [],
    };
    classroom.cards.push(card);
    let student = classroom.students.find((item) => item.studentId === card.studentId);
    if (!student) {
      student = {
        studentId: card.studentId,
        studentName: card.studentName,
        studentEmail: card.studentEmail,
        quizzes: [],
        cards: [],
      };
      classroom.students.push(student);
    }
    student.cards.push(card);
    let studentQuiz = student.quizzes.find((item) => item.quizId === card.quizId);
    if (!studentQuiz) {
      studentQuiz = {
        quizId: card.quizId,
        quizTitle: card.quizTitle,
        classroomName: card.classroomName,
        studentName: card.studentName,
        programCode: card.programCode,
        classCode: card.classCode,
        quizDeliveryId: card.quizDeliveryId,
        cards: [],
      };
      student.quizzes.push(studentQuiz);
    }
    studentQuiz.cards.push(card);
    classMap.set(card.classroomId, classroom);
    return classMap;
  }, new Map()).values()).sort((a, b) => a.classroomName.localeCompare(b.classroomName, "en", { numeric: true }));

  return (
    <div className={styles.quizPageShell}>
      <section className={styles.wrongCompactHeader}>
        <div className={styles.wrongCompactTitle}>
          <span className={styles.wrongCompactIcon}><Target size={20} /></span>
          <div>
            <span>{isStudent ? "Review practice" : "Classroom mistakes"}</span>
            <h1>{isStudent ? "Quizzes to practise again" : "Wrong questions by classroom"}</h1>
            <p>
              {isStudent
                ? "Choose a completed quiz. Practice attempts never change your submitted score."
                : "Open a class, choose a student, then inspect a quiz only when needed."}
            </p>
          </div>
        </div>
        <div className={styles.wrongCompactStats}>
          {isStudent ? (
            <>
              <span><strong>{groupedCards.length}</strong> quizzes</span>
              <span><strong>{cards.length}</strong> wrong</span>
            </>
          ) : (
            <>
              <span><strong>{teacherClassGroups.length}</strong> classes</span>
              <span><strong>{studentOptions.length}</strong> students</span>
              <span><strong>{filteredCards.length}</strong> wrong</span>
            </>
          )}
        </div>
      </section>

      {!isStudent ? (
        <form className={styles.wrongCompactSearch} action="/elearning/practice">
          <input type="hidden" name="tab" value="wrong" />
          <Search size={18} />
          <input
            type="search"
            name="q"
            defaultValue={searchTerm}
            aria-label="Search classroom or student"
            placeholder="Search classroom or student..."
          />
          <button className="btn-primary" type="submit">Search</button>
          {searchTerm ? <Link href="/elearning/practice?tab=wrong">Clear</Link> : null}
        </form>
      ) : null}

      {cards.length === 0 ? (
        <section className={styles.quizEmptyState}>
          <Trophy size={42} />
          <h2>No wrong questions yet</h2>
          <p>Once you submit quizzes and miss questions, your focused review bank will appear here.</p>
          <Link href="/elearning/practice?tab=quizzes" className="btn-primary">Go to quizzes</Link>
        </section>
      ) : filteredCards.length === 0 ? (
        <section className={styles.quizEmptyState}>
          <Search size={42} />
          <h2>No questions match these filters</h2>
          <p>Try another classroom or student name.</p>
          <Link href="/elearning/practice?tab=wrong" className="btn-primary">Clear search</Link>
        </section>
      ) : (
        isStudent ? (
          <section className={styles.studentReviewGrid}>
            {groupedCards.map((group) => (
              <article key={group.quizId} className={styles.studentReviewCard}>
                <div className={styles.studentReviewIcon}><Target size={24} /></div>
                <div className={styles.studentReviewCopy}>
                  <span>{group.programCode} · {group.classCode}</span>
                  <h2>{group.quizTitle}</h2>
                  <p>{group.classroomName}</p>
                </div>
                <div className={styles.studentReviewCount}>
                  <strong>{group.cards.length}</strong>
                  <span>wrong</span>
                </div>
                <div className={styles.studentReviewActions}>
                  <form action={startQuizReviewAttemptAction}>
                    <input type="hidden" name="quizId" value={group.quizId} />
                    <input type="hidden" name="scope" value="wrong" />
                    {group.quizDeliveryId ? <input type="hidden" name="quizDeliveryId" value={group.quizDeliveryId} /> : null}
                    <button type="submit" className="btn-primary"><RotateCcw size={16} /> Retry wrong</button>
                  </form>
                  <form action={startQuizReviewAttemptAction}>
                    <input type="hidden" name="quizId" value={group.quizId} />
                    <input type="hidden" name="scope" value="full" />
                    {group.quizDeliveryId ? <input type="hidden" name="quizDeliveryId" value={group.quizDeliveryId} /> : null}
                    <button type="submit" className="btn-secondary"><BookOpen size={16} /> Full quiz</button>
                  </form>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className={styles.teacherWrongExplorer}>
            {teacherClassGroups.map((classroom) => (
              <details key={classroom.classroomId} className={styles.teacherClassGroup}>
                <summary>
                  <span className={styles.teacherClassIcon}><ClipboardList size={20} /></span>
                  <div><small>{classroom.classCode}</small><strong>{classroom.classroomName}</strong></div>
                  <div className={styles.teacherGroupMetrics}>
                    <span><b>{classroom.students.length}</b> {classroom.students.length === 1 ? "student" : "students"}</span>
                    <span><b>{classroom.cards.length}</b> mistakes</span>
                  </div>
                  <ChevronDown size={20} />
                </summary>
                <div className={styles.teacherStudentList}>
                  {classroom.students.map((student) => (
                    <details key={student.studentId} className={styles.teacherStudentGroup}>
                      <summary>
                        <span className={styles.teacherStudentAvatar}>{student.studentName.charAt(0).toUpperCase()}</span>
                        <div><strong>{student.studentName}</strong><small>{student.studentEmail || "Student"}</small></div>
                        <span className={styles.quizGroupCountBadge}>{student.cards.length} wrong</span>
                        <ChevronDown size={18} />
                      </summary>
                      <div className={styles.teacherQuizList}>
                        {student.quizzes.map((quiz) => (
                          <details key={quiz.quizId} className={styles.teacherQuizGroup}>
                            <summary>
                              <span className={styles.teacherQuizIcon}><Target size={17} /></span>
                              <div>
                                <strong>{quiz.quizTitle}</strong>
                                <small>{quiz.programCode} · {formatSkill(quiz.cards[0]?.skill || "MIXED")}</small>
                              </div>
                              <span className={styles.quizGroupCountBadge}>{quiz.cards.length} wrong</span>
                              <ChevronDown size={17} />
                            </summary>
                            <div className={styles.teacherWrongList}>
                              {quiz.cards.map((card, index) => (
                                <article key={card.key} className={styles.teacherWrongRow}>
                                  <span className={styles.teacherWrongNumber}>{index + 1}</span>
                                  <div className={styles.teacherWrongMain}>
                                    <header><div><strong>{card.questionText}</strong></div><span>{dateFormatter.format(card.latestWrongAt)}</span></header>
                                    <div className={styles.teacherAnswerCompare}>
                                      <div><span>Student answered</span><strong>{card.latestAnswer}</strong></div>
                                      <div><span>Correct answer</span><strong>{card.correctAnswer}</strong></div>
                                      <div><span>Missed</span><strong>{card.wrongCount}×</strong></div>
                                    </div>
                                    {card.explanation ? <p className={styles.teacherExplanation}><AlertCircle size={15} /> {card.explanation}</p> : null}
                                  </div>
                                  <Link href={card.reviewHref} className="btn-secondary"><BookOpen size={15} /> Open attempt</Link>
                                </article>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </section>
        )
      )}
    </div>
  );
}

import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  ClipboardList,
  Filter,
  RotateCcw,
  Search,
  Target,
  Trophy,
} from "lucide-react";
import styles from "../elearning.module.css";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

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

export default async function WrongQuestionsPage({ searchParams }: Props) {
  const user = await requireUser(["STUDENT"]);
  const resolvedSearchParams = await searchParams;
  const selectedCourse = searchValue(resolvedSearchParams?.course);
  const selectedProgram = searchValue(resolvedSearchParams?.program);
  const selectedSkill = searchValue(resolvedSearchParams?.skill);
  const selectedQuiz = searchValue(resolvedSearchParams?.quiz);
  const searchTerm = searchValue(resolvedSearchParams?.q);
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const wrongAnswers = await prisma.attemptAnswer.findMany({
    where: {
      isCorrect: false,
      attempt: {
        studentId: user.id,
        status: { not: "IN_PROGRESS" },
      },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      option: true,
      question: { include: { options: { orderBy: { order: "asc" } } } },
      attempt: {
        include: {
          quiz: {
            include: {
              program: true,
              classSection: { include: { course: true } },
            },
          },
        },
      },
    },
  });

  type WrongAnswer = (typeof wrongAnswers)[number];
  const groups = new Map<string, { answers: WrongAnswer[] }>();
  for (const answer of wrongAnswers) {
    const key = `${answer.attempt.quizId}:${answer.questionId}`;
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
    const question = latest.question;
    const latestWrongAt = latest.attempt.submittedAt || latest.updatedAt;

    return {
      key: `${quiz.id}:${question.id}`,
      questionId: question.id,
      quizId: quiz.id,
      quizTitle: quiz.title,
      isPracticeTest: quiz.isPracticeTest,
      courseId: quiz.classSection.course.id,
      courseTitle: quiz.classSection.course.title,
      classCode: quiz.classSection.code,
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
      reviewHref: quiz.isPracticeTest ? `/elearning/tests/${quiz.id}` : `/elearning/exercises/${quiz.id}?attempt=${latest.attemptId}`,
      practiceHref: quiz.isPracticeTest ? `/elearning/tests/${quiz.id}` : `/elearning/exercises/${quiz.id}`,
      searchText: [
        question.text,
        question.explanation,
        quiz.title,
        quiz.program?.code,
        quiz.program?.name,
        quiz.unit,
        quiz.skill,
        quiz.classSection.course.title,
      ].filter(Boolean).join(" ").toLowerCase(),
    };
  });

  const courseOptions = uniqueBy(
    cards.map((card) => ({ id: card.courseId, title: card.courseTitle })),
    (course) => course.id,
  ).sort((a, b) => a.title.localeCompare(b.title, "en", { numeric: true }));
  const programOptions = uniqueBy(
    cards.map((card) => ({ code: card.programCode, name: card.programName })).filter((program) => program.code !== "General"),
    (program) => program.code,
  ).sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));
  const skillOptions = Array.from(new Set(cards.map((card) => card.skill))).sort();
  const quizOptions = uniqueBy(
    cards.map((card) => ({ id: card.quizId, title: card.quizTitle })),
    (quiz) => quiz.id,
  ).sort((a, b) => a.title.localeCompare(b.title, "en", { numeric: true }));

  const filteredCards = cards.filter((card) => {
    if (selectedCourse && card.courseId !== selectedCourse) return false;
    if (selectedProgram && card.programCode !== selectedProgram) return false;
    if (selectedSkill && card.skill !== selectedSkill) return false;
    if (selectedQuiz && card.quizId !== selectedQuiz) return false;
    if (normalizedSearch && !card.searchText.includes(normalizedSearch)) return false;
    return true;
  });

  return (
    <div className={styles.quizPageShell}>
      <section className={styles.quizHero}>
        <div>
          <span className={styles.cockpitEyebrow}><Target size={16} /> Wrong Question Bank</span>
          <h1>Review the questions that need another look.</h1>
          <p>
            This page is generated from your real submitted attempts. No mock data, no extra table: just the questions marked incorrect in AttemptAnswer.
          </p>
        </div>
        <div className={styles.quizHeroStats}>
          <div><strong>{cards.length}</strong><span>Wrong questions</span></div>
          <div><strong>{wrongAnswers.length}</strong><span>Total misses</span></div>
          <div><strong>{quizOptions.length}</strong><span>Source quizzes</span></div>
        </div>
      </section>

      <form className={styles.quizFilterPanel} action="/elearning/wrong-questions">
        <div className={styles.quizFilterHeader}>
          <div>
            <span className={styles.cockpitEyebrow}><Filter size={16} /> Focus filters</span>
            <h2>Choose what to review</h2>
          </div>
        </div>
        <div className={styles.quizFilterGrid}>
          <label className={styles.quizSearchControl}>
            <span>Search</span>
            <div>
              <Search size={16} />
              <input name="q" defaultValue={searchTerm} placeholder="Search question, quiz, explanation..." />
            </div>
          </label>
          <label>
            <span>Course</span>
            <select name="course" defaultValue={selectedCourse}>
              <option value="">All courses</option>
              {courseOptions.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </label>
          <label>
            <span>Program</span>
            <select name="program" defaultValue={selectedProgram}>
              <option value="">All programs</option>
              {programOptions.map((program) => <option key={program.code} value={program.code}>{program.code} - {program.name}</option>)}
            </select>
          </label>
          <label>
            <span>Skill</span>
            <select name="skill" defaultValue={selectedSkill}>
              <option value="">All skills</option>
              {skillOptions.map((skill) => <option key={skill} value={skill}>{formatSkill(skill)}</option>)}
            </select>
          </label>
          <label>
            <span>Quiz</span>
            <select name="quiz" defaultValue={selectedQuiz}>
              <option value="">All quizzes</option>
              {quizOptions.map((quiz) => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}
            </select>
          </label>
        </div>
        <div className={styles.quizFilterActions}>
          <button className="btn-primary" type="submit">Apply filters</button>
          <Link href="/elearning/wrong-questions" className="btn-secondary">Clear filters</Link>
        </div>
      </form>

      {cards.length === 0 ? (
        <section className={styles.quizEmptyState}>
          <Trophy size={42} />
          <h2>No wrong questions yet</h2>
          <p>Once you submit quizzes and miss questions, your focused review bank will appear here.</p>
          <Link href="/elearning/exercises" className="btn-primary">Go to quizzes</Link>
        </section>
      ) : filteredCards.length === 0 ? (
        <section className={styles.quizEmptyState}>
          <Search size={42} />
          <h2>No questions match these filters</h2>
          <p>Clear the filters to review all incorrect questions.</p>
          <Link href="/elearning/wrong-questions" className="btn-primary">Clear filters</Link>
        </section>
      ) : (
        <section className={styles.wrongQuestionGrid}>
          {filteredCards.map((card) => (
            <article key={card.key} className={styles.wrongQuestionCard}>
              <div className={styles.wrongQuestionHeader}>
                <div className={styles.quizTypeIcon}><AlertCircle size={22} /></div>
                <div>
                  <span>{card.quizTitle}</span>
                  <h2>{card.questionType}</h2>
                </div>
              </div>
              <div className={styles.quizBadgeRow}>
                <span>{card.programCode}</span>
                <span>{formatSkill(card.skill)}</span>
                <span>{card.classCode}</span>
                {card.unit ? <span>Unit {card.unit}</span> : null}
              </div>
              {card.passage ? <div className={styles.reviewPassage}>{card.passage}</div> : null}
              {card.audioUrl ? (
                <audio controls src={card.audioUrl} className={styles.reviewAudio}>
                  Your browser does not support audio.
                </audio>
              ) : null}
              <p className={styles.wrongQuestionText}>{card.questionText}</p>
              <div className={styles.reviewAnswerGrid}>
                <div>
                  <span>Your last answer</span>
                  <strong>{card.latestAnswer}</strong>
                </div>
                <div>
                  <span>Correct answer</span>
                  <strong>{card.correctAnswer}</strong>
                </div>
                <div>
                  <span>Last missed</span>
                  <strong>{dateFormatter.format(card.latestWrongAt)}</strong>
                </div>
                <div>
                  <span>Miss count</span>
                  <strong>{card.wrongCount}</strong>
                </div>
              </div>
              {card.explanation ? (
                <div className={styles.reviewExplanation}>
                  <strong>Explanation</strong>
                  <p>{card.explanation}</p>
                </div>
              ) : null}
              <div className={styles.wrongQuestionActions}>
                <Link href={card.practiceHref} className="btn-primary">
                  <RotateCcw size={16} /> Practice again
                </Link>
                <Link href={card.reviewHref} className="btn-secondary">
                  <BookOpen size={16} /> Review source
                </Link>
              </div>
              <p className={styles.wrongQuestionSource}>
                <ClipboardList size={14} /> {card.courseTitle} | {card.examType}
              </p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

import { prisma } from './src/lib/prisma';

async function run() {
  const quizId = "cmqypj4g80i2wm4usje4omc0c";
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { question: { include: { options: true } } } } }
  });

  if (!quiz) {
    console.log("Quiz not found");
    return;
  }

  let requiresManualGrade = false;
  for (const link of quiz.questions) {
    const q = link.question;
    if (q.type === "MULTIPLE_CHOICE") {
      if (!q.options.some(o => o.isCorrect)) {
        console.log(`Question ${q.id} (MULTIPLE_CHOICE) has no correct option. Manual grade required.`);
        requiresManualGrade = true;
      }
    } else if (q.type === "FILL_BLANK" || q.type === "SHORT_ANSWER" || q.type === "GRID") {
      if (!q.answerKey) {
         console.log(`Question ${q.id} (${q.type}) has no answerKey. Manual grade required.`);
         requiresManualGrade = true;
      }
    } else if (["READING", "LISTENING", "SECTION", "INFO"].includes(q.type)) {
      // Ignored
    } else {
      console.log(`Question ${q.id} (${q.type}) is an unknown type that requires manual grading.`);
      requiresManualGrade = true;
    }
  }

  console.log(`Total questions checked: ${quiz.questions.length}`);
  console.log(`Requires manual grade? ${requiresManualGrade}`);
}

run().catch(console.error).finally(() => prisma.$disconnect());

import { prisma } from './src/lib/prisma';

async function run() {
  const latestAttempt = await prisma.attempt.findFirst({
    orderBy: { updatedAt: 'desc' },
    include: {
      quiz: {
        include: {
          questions: {
            include: { question: { include: { options: true } } }
          }
        }
      }
    }
  });

  if (!latestAttempt) {
    console.log("No attempts found");
    return;
  }

  console.log(`Latest attempt ID: ${latestAttempt.id}`);
  console.log(`Status: ${latestAttempt.status}`);
  console.log(`Score: ${latestAttempt.score}`);
  console.log(`Quiz Type: ${latestAttempt.quiz.isPracticeTest ? 'Practice Test' : 'Class Quiz'}`);
  
  let requiresManualGrade = false;
  
  if (latestAttempt.quiz.isPracticeTest) {
    for (const link of latestAttempt.quiz.questions) {
      const q = link.question;
      if (q.options.length > 0) {
        // ok
      } else if (q.type === "FILL_BLANK") {
        // ok
      } else {
        console.log(`Question ${q.id} (type: ${q.type}) requires manual grading because it has no options and is not FILL_BLANK.`);
        requiresManualGrade = true;
      }
    }
  } else {
    for (const link of latestAttempt.quiz.questions) {
      const q = link.question;
      if (q.type === "MULTIPLE_CHOICE") {
        if (!q.options.some(o => o.isCorrect)) {
          console.log(`Question ${q.id} (type: MULTIPLE_CHOICE) requires manual grading because it has no correct options.`);
          requiresManualGrade = true;
        }
      } else if (q.type === "FILL_BLANK" || q.type === "SHORT_ANSWER" || q.type === "GRID") {
        if (!q.answerKey) {
           console.log(`Question ${q.id} (type: ${q.type}) requires manual grading because it has no answerKey.`);
           requiresManualGrade = true;
        }
      } else {
        console.log(`Question ${q.id} (type: ${q.type}) requires manual grading because its type is not auto-gradable.`);
        requiresManualGrade = true;
      }
    }
  }

  console.log(`Requires manual grade? ${requiresManualGrade}`);
}

run().catch(console.error).finally(() => prisma.$disconnect());

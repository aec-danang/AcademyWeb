import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function cleanSurveyQuestions() {
  console.log("Bat dau don dep cau hoi khao sat...");

  const surveyKeywords = [
    "họ và tên", "họ tên", "mã sinh viên", "mã học viên", "email", "sđt", "số điện thoại", "lớp", "your name", "student id",
    "học viên academy", "birthday", "ngày sinh", "ngay sinh", "parent's name", "tên bố", "tên mẹ", "nghề nghiệp", "job", "target score", "điểm số mục tiêu"
  ];

  // Tim tat ca cac cau hoi
  const questions = await prisma.question.findMany();

  console.log(`Tim thay ${questions.length} cau hoi.`);

  const toDelete = questions.filter((q: any) => {
    const text = q.text?.toLowerCase() || "";
    return surveyKeywords.some(keyword => text.includes(keyword));
  });

  console.log(`Phat hien ${toDelete.length} cau hoi khao sat can xoa.`);

  if (toDelete.length > 0) {
    const idsToDelete = toDelete.map((q: any) => q.id);

    // Xoa lien ket trong QuizQuestion
    const deletedQuizQuestions = await prisma.quizQuestion.deleteMany({
      where: {
        questionId: {
          in: idsToDelete
        }
      }
    });

    console.log(`Da xoa ${deletedQuizQuestions.count} lien ket QuizQuestion.`);

    // Xoa QuestionOption
    const deletedOptions = await prisma.questionOption.deleteMany({
      where: {
        questionId: {
          in: idsToDelete
        }
      }
    });
    console.log(`Da xoa ${deletedOptions.count} options.`);

    // Xoa Questions
    const deletedQuestions = await prisma.question.deleteMany({
      where: {
        id: {
          in: idsToDelete
        }
      }
    });
    console.log(`Da xoa ${deletedQuestions.count} questions thanh cong.`);
  }

  console.log("Don dep hoan tat.");
}

cleanSurveyQuestions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

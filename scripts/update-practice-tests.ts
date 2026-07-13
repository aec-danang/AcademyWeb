import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
    const res = await prisma.quiz.updateMany({
        where: { importSource: { not: null } },
        data: { isPracticeTest: true, published: true }
    });
    console.log(`Updated ${res.count} quizzes to be practice tests.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

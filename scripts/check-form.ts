import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
    const quiz = await prisma.quiz.findUnique({
        where: { id: 'cmqyprimn0ku6m4usexfqd4v4' },
        include: { questions: true }
    });
    console.log(`Quiz Title: ${quiz?.title}`);
    console.log(`Import Source (Form ID): ${quiz?.importSource}`);
    console.log(`Question Count in DB: ${quiz?.questions.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

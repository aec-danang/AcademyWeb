import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
    const q = await prisma.quiz.findUnique({where: {id: 'cmqypaz8j0feam4usunfbky3z'}});
    console.log("Title:", q?.title);
    console.log("Form ID:", q?.importSource);
}

main().finally(() => prisma.$disconnect());

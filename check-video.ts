import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
    const q = await prisma.question.findFirst({where: {text: {contains: '[Video:'}}});
    console.log(q);
}

main().finally(() => prisma.$disconnect());

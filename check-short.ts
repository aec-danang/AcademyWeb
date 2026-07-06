import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
    const qs = await prisma.question.findMany({where: {type: 'SHORT_ANSWER'}});
    console.log(qs.map(q => q.text.substring(0, 50)));
}

main().finally(() => prisma.$disconnect());

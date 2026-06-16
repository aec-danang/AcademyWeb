import { prisma } from './src/lib/prisma';

async function main() {
  const posts = await prisma.post.findMany();
  console.log(`Found ${posts.length} posts.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

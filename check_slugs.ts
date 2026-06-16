import { prisma } from './src/lib/prisma';

async function main() {
  const posts = await prisma.post.findMany();
  let emptySlugs = 0;
  for (const post of posts) {
    if (!post.slug || post.slug.trim() === '') {
      emptySlugs++;
      console.log(`Post with title "${post.title}" has an empty slug.`);
    }
  }
  console.log(`Total posts: ${posts.length}. Empty slugs: ${emptySlugs}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

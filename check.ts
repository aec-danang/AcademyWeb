import { prisma } from './src/lib/prisma';

async function check() {
  const p = await prisma.post.findFirst({
    where: {
      OR: [
        { content: { contains: 'academy.edu.vn' } },
        { featuredImage: { contains: 'academy.edu.vn' } }
      ]
    }
  });
  if (p) {
    if (p.content.includes('academy.edu.vn')) {
      const idx = p.content.indexOf('academy.edu.vn');
      console.log("Context:", p.content.substring(Math.max(0, idx - 50), idx + 100));
    }
  }
}
check();

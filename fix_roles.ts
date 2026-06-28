import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const res = await prisma.$executeRawUnsafe(`UPDATE elearning."User" SET role = 'USER'::elearning."Role" WHERE role::text = 'STUDENT'`);
    console.log("Updated rows:", res);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "elearning"."Assignment" DROP COLUMN IF EXISTS "skill" CASCADE;');
    console.log("Dropped skill column");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();

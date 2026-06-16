import { prisma } from './src/lib/prisma';

async function main() {
  try {
    console.log("Dropping old primary key...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_pkey" CASCADE;`);
    
    console.log("Dropping old unique constraint on slug...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Post" DROP CONSTRAINT IF EXISTS "Post_slug_key" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "public"."Post_slug_key";`);

    console.log("Adding new primary key on slug...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Post" ADD PRIMARY KEY ("slug");`);
    
    console.log("Dropping id column...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Post" DROP COLUMN "id" CASCADE;`);

    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main().finally(() => prisma.$disconnect());

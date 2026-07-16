import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public."SiteFeature" (
      id TEXT NOT NULL PRIMARY KEY DEFAULT concat('c', replace(gen_random_uuid()::text, '-', '')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      "iconValue" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      published BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  console.log("SiteFeature table created or already exists.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

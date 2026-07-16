import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  // Add missing columns to Testimonial table (idempotent)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE public."Testimonial"
      ADD COLUMN IF NOT EXISTS score TEXT,
      ADD COLUMN IF NOT EXISTS "isHallOfFame" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false
  `);
  console.log("Testimonial table columns added.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

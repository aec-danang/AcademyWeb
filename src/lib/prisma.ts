import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to your .env file before using Prisma.");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  prisma = new PrismaClient({
    adapter,
    log: ['query'],
  });
}

export { prisma };

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { attachDatabasePool } from '@vercel/functions';

const globalForPrisma = global as unknown as { prisma: PrismaClient; pool: Pool };

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  const connectionString =
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_NzIHvO8huS2f@ep-mute-water-aow9im3i-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&uselibpqcompat=true&channel_binding=require";

  if (!connectionString) {
    throw new Error("NEON_DATABASE_URL (or DATABASE_URL) is not set. Add it to your environment variables before using Prisma.");
  }

  const pool = new Pool({
    connectionString,
    max: process.env.NODE_ENV === 'production' ? 10 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Attach database pool to Vercel serverless lifecycle to drain idle connections
  if (process.env.VERCEL) {
    try {
      attachDatabasePool(pool);
    } catch {
      // Ignore in non-fluid / unsupported environments
    }
  }

  const adapter = new PrismaPg(pool);

  prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    globalForPrisma.pool = pool;
  }
}

export { prisma };

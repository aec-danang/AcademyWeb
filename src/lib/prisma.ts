import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "postgresql://neondb_owner:npg_NzIHvO8huS2f@ep-mute-water-aow9im3i-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&uselibpqcompat=true&channel_binding=require";

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  prisma = new PrismaClient({
    adapter,
    log: ['query'],
  });
}

export { prisma };

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

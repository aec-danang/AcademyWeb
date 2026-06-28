import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const users = await prisma.$queryRawUnsafe('SELECT id, role, username FROM elearning."User"');
    console.log("Users:", users);

    const enumQuery = `
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE typname = 'Role';
    `;
    const enums = await prisma.$queryRawUnsafe(enumQuery);
    console.log("Enum values:", enums);

    // If STUDENT is in the users but not in Enum, we can update it:
    // await prisma.$executeRawUnsafe('UPDATE elearning."User" SET role = \\'USER\\' WHERE role::text = \\'STUDENT\\'');

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

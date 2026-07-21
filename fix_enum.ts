import { Client } from 'pg';

async function fixDb() {
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
  });
  await client.connect();
  
  try {
    const res = await client.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('Successfully created LeadStatus enum');
  } catch (err) {
    console.error('Error creating enum:', err);
  } finally {
    await client.end();
  }
}

fixDb();

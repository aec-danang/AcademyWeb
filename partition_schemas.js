const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:oTysMtNvwsHfCTelrCJwdfIjAQrAwGgE@thomas.proxy.rlwy.net:10006/academy"
  });

  await client.connect();
  
  try {
    console.log("Renaming public schema to elearning...");
    await client.query("ALTER SCHEMA public RENAME TO elearning;");
    
    console.log("Creating new public schema...");
    await client.query("CREATE SCHEMA public;");
    
    console.log("Moving Post and Lead tables to public schema...");
    await client.query('ALTER TABLE elearning."Post" SET SCHEMA public;');
    await client.query('ALTER TABLE elearning."Lead" SET SCHEMA public;');
    
    console.log("Success!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();

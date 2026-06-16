const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:oTysMtNvwsHfCTelrCJwdfIjAQrAwGgE@thomas.proxy.rlwy.net:10006/postgres"
  });

  await client.connect();
  
  try {
    console.log("Terminating other connections to railway...");
    await client.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'railway' AND pid <> pg_backend_pid();");
    console.log("Renaming railway to academy...");
    await client.query("ALTER DATABASE railway RENAME TO academy;");
    console.log("Success!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();

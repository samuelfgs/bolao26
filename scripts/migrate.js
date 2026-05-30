require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  console.error("Error: DIRECT_URL not found in .env.local");
  process.exit(1);
}

async function runMigration() {
  console.log("Connecting to database using DIRECT_URL...");
  const sql = postgres(connectionString, {
    ssl: 'require',
    connect_timeout: 10,
  });

  try {
    const migrationPath = path.join(__dirname, '../lib/db/migrations/0000_jittery_the_hood.sql');
    console.log(`Reading migration from: ${migrationPath}`);
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    const statements = migrationSql.split('--> statement-breakpoint');
    
    console.log(`Executing ${statements.length} statements...`);
    
    for (let statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        await sql.unsafe(trimmed);
      }
    }
    
    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await sql.end();
  }
}

runMigration();

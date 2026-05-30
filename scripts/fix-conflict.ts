import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { users, pools } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const content = fs.readFileSync('.env.local');
const envConfig = dotenv.parse(content);
const connectionString = envConfig.DATABASE_URL;

const client = postgres(connectionString!, { ssl: 'require', prepare: false });
const db = drizzle(client);

async function fixConflict() {
  console.log('Searching for conflicting admin user...');
  const [admin] = await db.select().from(users).where(eq(users.email, 'fgs.samuel@gmail.com'));
  
  if (admin) {
    console.log('Found user with random ID:', admin.id);
    await db.update(users).set({ email: 'temp_conflict_fix@bolao26.com' }).where(eq(users.id, admin.id));
    console.log('Temporarily renamed email to allow Supabase registration.');
  } else {
    console.log('No conflicting user found.');
  }
  process.exit(0);
}

fixConflict().catch(err => {
  console.error(err);
  process.exit(1);
});

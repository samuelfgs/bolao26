import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { users, pools } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const content = fs.readFileSync('.env.local');
const envConfig = dotenv.parse(content);
const connectionString = envConfig.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in .env.local");
}

const client = postgres(connectionString, {
  ssl: 'require',
  prepare: false,
});
const db = drizzle(client);

async function setup() {
  console.log('Searching for admin user...');
  let [admin] = await db.select().from(users).where(eq(users.email, 'fgs.samuel@gmail.com'));
  
  if (!admin) {
    console.error('CRITICAL ERROR: Admin user fgs.samuel@gmail.com does not exist in the database.');
    console.error('Please register this user first via the application.');
    process.exit(1);
  }

  console.log('Checking for pool BOLAO26...');
  const [existing] = await db.select().from(pools).where(eq(pools.code, 'BOLAO26'));
  
  if (!existing) {
    await db.insert(pools).values({
      name: 'Bolão Oficial 2026',
      code: 'BOLAO26',
      ownerId: admin.id,
    });
    console.log('Successfully created pool BOLAO26 owned by ' + admin.email);
  } else {
    console.log('Pool BOLAO26 already exists.');
  }
  process.exit(0);
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});

import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { matches } from '../lib/db/schema';

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

async function seed() {
  console.log('Seeding matches...');

  const initialMatches = [
    {
      homeTeam: "Brasil",
      awayTeam: "França",
      startTime: new Date("2026-06-15T15:00:00Z"),
      group: "Grupo A",
      stage: "group" as const,
    },
    {
      homeTeam: "Egito",
      awayTeam: "Canadá",
      startTime: new Date("2026-06-15T18:00:00Z"),
      group: "Grupo A",
      stage: "group" as const,
    },
    {
      homeTeam: "Argentina",
      awayTeam: "Espanha",
      startTime: new Date("2026-06-16T15:00:00Z"),
      group: "Grupo B",
      stage: "group" as const,
    },
    {
      homeTeam: "Japão",
      awayTeam: "Nigéria",
      startTime: new Date("2026-06-16T18:00:00Z"),
      group: "Grupo B",
      stage: "group" as const,
    },
  ];

  for (const match of initialMatches) {
    await db.insert(matches).values(match);
  }

  console.log('Successfully seeded 4 matches.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

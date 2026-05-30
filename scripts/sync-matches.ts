import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { matches } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

const content = fs.readFileSync('.env.local');
const envConfig = dotenv.parse(content);
const API_KEY = envConfig.FOOTBALL_DATA_API_KEY;
const connectionString = envConfig.DATABASE_URL;

if (!API_KEY || !connectionString) {
  throw new Error("Missing API_KEY or DATABASE_URL in .env.local");
}

const client = postgres(connectionString, { ssl: 'require', prepare: false });
const db = drizzle(client);

async function syncMatches() {
  console.log('Fetching matches from Football-Data.org...');
  
  const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
    headers: { 'X-Auth-Token': API_KEY }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const apiMatches = data.matches;

  console.log(`Found ${apiMatches.length} matches. Syncing to database...`);

  for (const apiMatch of apiMatches) {
    // Skip if teams are not yet determined (TBD)
    if (!apiMatch.homeTeam.name || !apiMatch.awayTeam.name) continue;

    const mappedMatch = {
      apiId: apiMatch.id,
      homeTeam: apiMatch.homeTeam.name,
      awayTeam: apiMatch.awayTeam.name,
      startTime: new Date(apiMatch.utcDate),
      homeScore: apiMatch.score.fullTime.home,
      awayScore: apiMatch.score.fullTime.away,
      matchday: apiMatch.matchday,
      status: mapStatus(apiMatch.status),
      stage: mapStage(apiMatch.stage),
      group: apiMatch.group,
    };

    await db.insert(matches)
      .values(mappedMatch)
      .onConflictDoUpdate({
        target: [matches.apiId],
        set: {
          homeTeam: mappedMatch.homeTeam,
          awayTeam: mappedMatch.awayTeam,
          startTime: mappedMatch.startTime,
          homeScore: mappedMatch.homeScore,
          awayScore: mappedMatch.awayScore,
          matchday: mappedMatch.matchday,
          status: mappedMatch.status,
          stage: mappedMatch.stage,
          group: mappedMatch.group,
        }
      });
  }

  console.log('Synchronization complete.');
  process.exit(0);
}

function mapStatus(apiStatus: string): "scheduled" | "live" | "finished" {
  switch (apiStatus) {
    case "FINISHED":
      return "finished";
    case "IN_PLAY":
    case "PAUSED":
      return "live";
    default:
      return "scheduled";
  }
}

function mapStage(apiStage: string): "group" | "round_of_32" | "round_of_16" | "quarter_finals" | "semi_finals" | "third_place" | "final" {
  switch (apiStage) {
    case "GROUP_STAGE":
      return "group";
    case "LAST_32":
      return "round_of_32";
    case "LAST_16":
      return "round_of_16";
    case "QUARTER_FINALS":
      return "quarter_finals";
    case "SEMI_FINALS":
      return "semi_finals";
    case "THIRD_PLACE":
      return "third_place";
    case "FINAL":
      return "final";
    default:
      return "group";
  }
}

syncMatches().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});

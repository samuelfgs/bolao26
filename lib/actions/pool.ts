"use server";

import { db } from "@/lib/db";
import { pools, usersToPools, guesses, matches, apiCache } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, inArray, type InferSelectModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { sendWhatsAppMessage, formatApprovalMessage } from "@/lib/services/whatsapp";
import { users } from "@/lib/db/schema";
import { calculatePoints } from "./calculate-points";

type Match = InferSelectModel<typeof matches>;

export async function createPool(name: string) {
  // ... (rest of the function is unchanged)
}

export async function joinPool(code: string) {
  // ... (rest of the function is unchanged)
}

export async function saveAllGuesses(
  poolId: string, 
  guessesData: { matchId: string, homeGuess: string | number, awayGuess: string | number }[],
  bonusGuesses?: { campeao: string, artilheiro: string, craque: string }
) {
  // ... (rest of the function is unchanged)
}

export async function updateLiveData() {
  console.log('Starting live data update from ESPN...');

  const cacheKey = 'espn-data-matches';
  let apiData: any;

  const [cachedData] = await db.select().from(apiCache).where(eq(apiCache.key, cacheKey));

  if (cachedData && cachedData.updatedAt) {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    if (cachedData.updatedAt > oneMinuteAgo) {
      console.log('Using fresh cache. No update needed.');
      return;
    }
  }

  console.log('Cache is stale or empty. Fetching from ESPN...');
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    apiData = data;

    await db.insert(apiCache)
      .values({ key: cacheKey, data: apiData, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: apiCache.key,
        set: { data: apiData, updatedAt: new Date() }
      });

    console.log('API data fetched and cache updated.');
  } catch (error) {
    console.error('Failed to fetch from ESPN:', error);
    return;
  }

  const events = apiData.events;
  console.log(`Found ${events.length} matches in ESPN API. Syncing to database...`);

  // Fetch all matches from our DB to match them
  const dbMatches = await db.select().from(matches);

  for (const event of events) {
    const competition = event.competitions[0];
    const homeCompetitor = competition.competitors.find((c: any) => c.homeAway === 'home');
    const awayCompetitor = competition.competitors.find((c: any) => c.homeAway === 'away');

    if (!homeCompetitor || !awayCompetitor) continue;

    const homeTeamName = homeCompetitor.team.name;
    const awayTeamName = awayCompetitor.team.name;
    const homeScore = parseInt(homeCompetitor.score);
    const awayScore = parseInt(awayCompetitor.score);
    const status = mapEspnStatus(event.status.type.state);
    const startTime = new Date(event.date);

    // Find the match in our DB by team names
    // We normalize names and check if they match
    const dbMatch = dbMatches.find((m: Match) => 
      normalizeName(m.homeTeam) === normalizeName(homeTeamName) && 
      normalizeName(m.awayTeam) === normalizeName(awayTeamName)
    );

    if (dbMatch) {
      await db.update(matches)
        .set({
          homeScore: isNaN(homeScore) ? null : homeScore,
          awayScore: isNaN(awayScore) ? null : awayScore,
          status: status,
          startTime: startTime, // Sync start time just in case
        })
        .where(eq(matches.id, dbMatch.id));
    } else {
      console.log(`Match not found in DB: ${homeTeamName} vs ${awayTeamName}`);
    }
  }

  console.log('Matches synchronization complete.');

  await calculatePoints();

  revalidatePath("/ranking");
  revalidatePath("/classificacao");
  revalidatePath("/palpites");

  console.log('Live data update finished.');
}

function normalizeName(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function mapEspnStatus(espnState: string): "scheduled" | "live" | "finished" {
  switch (espnState) {
    case "post":
      return "finished";
    case "in":
      return "live";
    default:
      return "scheduled";
  }
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

export async function triggerUpdate() {
  await updateLiveData();
}


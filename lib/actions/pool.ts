"use server";

import { db } from "@/lib/db";
import { pools, usersToPools, guesses, matches, apiCache } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, inArray, desc, type InferSelectModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { sendWhatsAppMessage, formatApprovalMessage } from "@/lib/services/whatsapp";
import { sendMatchReminders } from "@/lib/services/reminders";
import { users } from "@/lib/db/schema";
import { calculatePoints } from "./calculate-points";

type Match = InferSelectModel<typeof matches>;

export async function createPool(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  const code = uuidv4().slice(0, 8).toUpperCase();

  const [newPool] = await db.insert(pools).values({
    name,
    code,
    ownerId: user.id,
  }).returning();

  await db.insert(usersToPools).values({
    userId: user.id,
    poolId: newPool.id,
  });

  revalidatePath("/palpites");
  return { code };
}

export async function joinPool(code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  const [pool] = await db.select().from(pools).where(eq(pools.code, code.toUpperCase()));
  if (!pool) throw new Error("Bolão não encontrado");

  await db.insert(usersToPools).values({
    userId: user.id,
    poolId: pool.id,
    status: "pending",
  }).onConflictDoNothing();

  revalidatePath("/palpites");
  return { poolId: pool.id };
}

export async function saveAllGuesses(
  poolId: string, 
  guessesData: { matchId: string, homeGuess: string | number, awayGuess: string | number }[],
  bonusGuesses?: { campeao: string, artilheiro: string, craque: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  const now = new Date();

  await db.transaction(async (tx: any) => {
    // 1. Validation & Filtering: Only allow saving guesses for matches that haven't started yet.
    const matchIds = guessesData.map((g: any) => g.matchId);
    let guessesToSave: any[] = [];

    if (matchIds.length > 0) {
      const dbMatches = await tx.select().from(matches).where(inArray(matches.id, matchIds));
      const existingGuesses = await tx.select().from(guesses).where(
        and(
          eq(guesses.userId, user.id),
          eq(guesses.poolId, poolId),
          inArray(guesses.matchId, matchIds)
        )
      );

      for (const g of guessesData) {
        // A "guess" is only considered if at least one side is filled
        const isNewGuessEmpty = (g.homeGuess === "" || g.homeGuess === null) && (g.awayGuess === "" || g.awayGuess === null);
        
        const match = dbMatches.find((m: any) => m.id === g.matchId);
        if (!match) continue;

        const isLocked = now >= new Date(match.startTime) || match.status === "live" || match.status === "finished";
        const existing = existingGuesses.find((eg: any) => eg.matchId === g.matchId);

        if (isLocked) {
          // If the match has started, we check if the user is trying to CHANGE it.
          // If they are trying to save the SAME thing, we just skip it silently.
          // If they are trying to change it, we throw an error.
          
          const newHome = isNewGuessEmpty ? null : Number(g.homeGuess);
          const newAway = isNewGuessEmpty ? null : Number(g.awayGuess);
          const currentHome = existing ? existing.homeGuess : null;
          const currentAway = existing ? existing.awayGuess : null;

          if (newHome !== currentHome || newAway !== currentAway) {
            throw new Error(`O jogo ${match.homeTeam} x ${match.awayTeam} já começou. Não é possível alterar palpites.`);
          }
          
          // Match started and same guess -> just skip
          continue;
        }

        // Match hasn't started -> add to save list if not empty
        if (!isNewGuessEmpty) {
          guessesToSave.push(g);
        }
      }
    }

    // 2. Save bonus guesses ... (unchanged)
    const bonusDeadline = new Date("2026-06-13T03:00:00Z");
    if (bonusGuesses && now < bonusDeadline) {
      await tx.update(usersToPools)
        .set({
          campeao: bonusGuesses.campeao,
          artilheiro: bonusGuesses.artilheiro,
          craque: bonusGuesses.craque,
        })
        .where(
          and(
            eq(usersToPools.userId, user.id),
            eq(usersToPools.poolId, poolId)
          )
        );
    }

    // 3. Save match guesses
    if (guessesToSave.length > 0) {
      console.log(`Saving ${guessesToSave.length} match guesses for user ${user.id} in pool ${poolId}`);

      for (const guess of guessesToSave) {
        const h = Number(guess.homeGuess);
        const a = Number(guess.awayGuess);

        await tx.insert(guesses).values({
          userId: user.id,
          poolId,
          matchId: guess.matchId,
          homeGuess: h,
          awayGuess: a,
        }).onConflictDoUpdate({
          target: [guesses.userId, guesses.poolId, guesses.matchId],
          set: { 
            homeGuess: h, 
            awayGuess: a,
            createdAt: new Date(),
          },
        });
      }
    }
  });

  revalidatePath("/palpites");
}

function mapSeasonTypeToStage(seasonType: number): "group" | "round_of_32" | "round_of_16" | "quarter_finals" | "semi_finals" | "third_place" | "final" {
  switch (seasonType) {
    case 13802:
      return "group";
    case 13801:
      return "round_of_32";
    case 13800:
      return "round_of_16";
    case 13799:
      return "quarter_finals";
    case 13798:
      return "semi_finals";
    case 13797:
      return "third_place";
    case 13803:
      return "final";
    default:
      return "group";
  }
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

  // Sync the entire tournament range to automatically discover playoff matches and team updates
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260720&limit=200`;

  console.log(`Cache is stale or empty. Fetching from ESPN: ${url}`);
  try {
    const response = await fetch(url);

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

  const events = apiData.events || [];
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
    const apiId = parseInt(event.id);
    const stage = mapSeasonTypeToStage(event.season?.type);

    const isGroupStage = stage === "group";
    const dbMatch = isGroupStage
      ? dbMatches.find((m: Match) => 
          m.stage === "group" &&
          normalizeName(m.homeTeam) === normalizeName(homeTeamName) && 
          normalizeName(m.awayTeam) === normalizeName(awayTeamName)
        )
      : dbMatches.find((m: Match) => m.apiId === apiId);

    if (dbMatch) {
      await db.update(matches)
        .set({
          homeTeam: homeTeamName,
          awayTeam: awayTeamName,
          homeScore: isNaN(homeScore) ? null : homeScore,
          awayScore: isNaN(awayScore) ? null : awayScore,
          status: status,
          startTime: startTime,
          stage: stage,
        })
        .where(eq(matches.id, dbMatch.id));
    } else {
      console.log(`New match from API: ${homeTeamName} vs ${awayTeamName} (${stage}). Inserting...`);
      await db.insert(matches).values({
        apiId: apiId,
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        homeScore: isNaN(homeScore) ? null : homeScore,
        awayScore: isNaN(awayScore) ? null : awayScore,
        status: status,
        startTime: startTime,
        stage: stage,
      });
    }
  }

  console.log('Matches synchronization complete.');

  await calculatePoints();

  try {
    revalidatePath("/ranking");
    revalidatePath("/classificacao");
    revalidatePath("/palpites");
  } catch (e) {
    console.log('Path revalidation skipped (likely running outside of Next.js context)');
  }

  console.log('Live data update finished.');
}

function normalizeName(name: string): string {
  let normalized = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  
  // Map common variations to a canonical form for matching
  const aliases: Record<string, string> = {
    "cape verde islands": "cape verde",
    "cabo verde": "cape verde",
    "czech republic": "czechia",
    "republic of ireland": "ireland",
    "usa": "united states",
    "dr congo": "congo dr",
    "ivory coast": "cote d'ivoire",
    "cote d'ivoire": "cote d'ivoire",
    "turkiye": "turkey",
  };

  if (aliases[normalized]) {
    return aliases[normalized];
  }

  return normalized;
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
  await sendMatchReminders();
}

export async function getMatchGuesses(poolId: string, matchId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
  });

  if (!match) throw new Error("Partida não encontrada");

  const now = new Date();
  const isLocked = now >= new Date(match.startTime) || match.status === "live" || match.status === "finished";

  if (!isLocked) {
    throw new Error("Palpites ainda estão ocultos até o início da partida.");
  }

  const allGuesses = await db.select({
    userName: users.name,
    userNickname: users.nickname,
    homeGuess: guesses.homeGuess,
    awayGuess: guesses.awayGuess,
  })
  .from(guesses)
  .innerJoin(users, eq(guesses.userId, users.id))
  .where(
    and(
      eq(guesses.poolId, poolId),
      eq(guesses.matchId, matchId)
    )
  );

  const mappedGuesses = allGuesses.map((g: { userName: string | null; userNickname: string | null; homeGuess: number | null; awayGuess: number | null }) => {
    let pts = 0;
    if (g.homeGuess !== null && g.awayGuess !== null && match.homeScore !== null && match.awayScore !== null) {
      const exactScore = g.homeGuess === match.homeScore && g.awayGuess === match.awayScore;
      const guessWinner = g.homeGuess > g.awayGuess ? "home" : g.homeGuess < g.awayGuess ? "away" : "draw";
      const matchWinner = match.homeScore > match.awayScore ? "home" : match.homeScore < match.awayScore ? "away" : "draw";
      if (exactScore) pts = 3;
      else if (guessWinner === matchWinner) pts = 1;
    }
    return { ...g, points: pts };
  });

  interface MappedGuess {
    userName: string | null;
    userNickname: string | null;
    homeGuess: number | null;
    awayGuess: number | null;
    points: number;
  }

  // Order by points desc, then user name/nickname
  mappedGuesses.sort((a: MappedGuess, b: MappedGuess) => {
    if (b.points !== a.points) return b.points - a.points;
    const aName = a.userNickname || a.userName || "";
    const bName = b.userNickname || b.userName || "";
    return aName.localeCompare(bName);
  });

  return mappedGuesses;
}

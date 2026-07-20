"use server";

import { db } from "@/lib/db";
import { matches, guesses, usersToPools, users, apiCache } from "@/lib/db/schema";
import { eq, and, inArray, type InferSelectModel } from "drizzle-orm";

type Match = InferSelectModel<typeof matches>;
type Guess = InferSelectModel<typeof guesses>;

type UserScore = {
  userId: string;
  poolId: string;
  totalPoints: number;
  totalCravadas: number;
  totalAcertos: number;
  cravadasFase1: number;
  cravadasFase2: number;
  acertosFase1: number;
  acertosFase2: number;
};

function normalizeChampion(val: string | null) {
  if (!val) return "";
  const normalized = val.trim().toLowerCase();
  if (normalized.includes("brasil")) return "Brasil";
  if (normalized.includes("espanha")) return "Espanha";
  if (normalized.includes("fran")) return "França";
  if (normalized.includes("portugal")) return "Portugal";
  if (normalized.includes("alemanha")) return "Alemanha";
  if (normalized.includes("inglaterra")) return "Inglaterra";
  return val;
}

function normalizePlayer(val: string | null) {
  if (!val) return "";
  const normalized = val.trim().toLowerCase();
  if (normalized.includes("mbap") || normalized.includes("mpab")) return "Kylian Mbappé";
  if (normalized.includes("kane")) return "Harry Kane";
  if (normalized.includes("ney")) return "Neymar";
  if (normalized.includes("messi")) return "Lionel Messi";
  if (normalized.includes("yamal")) return "Lamine Yamal";
  if (normalized.includes("oyarzabal")) return "Mikel Oyarzabal";
  if (normalized.includes("dembe")) return "Ousmane Dembélé";
  if (normalized.includes("alvarez")) return "Julián Álvarez";
  if (normalized.includes("ronaldo") || normalized.includes("cr7")) return "Cristiano Ronaldo";
  if (normalized.includes("olise")) return "Michael Olise";
  if (normalized.includes("vitinha")) return "Vitinha";
  if (normalized.includes("endrick")) return "Endrick";
  if (normalized.includes("rodri")) return "Rodri";
  return val;
}

export async function calculatePoints() {
  console.log("Starting point calculation...");

  // Load ESPN cache to determine shootout winners for playoff draw matches
  const [espnEntry] = await db.select().from(apiCache).where(eq(apiCache.key, "espn-data-matches"));
  const espnEvents = espnEntry?.data ? (espnEntry.data as any).events || [] : [];

  const allUsersInPools = await db.select({
    userId: usersToPools.userId,
    poolId: usersToPools.poolId,
    campeao: usersToPools.campeao,
    artilheiro: usersToPools.artilheiro,
    craque: usersToPools.craque,
  }).from(usersToPools);

  const finishedMatches = await db.select().from(matches).where(inArray(matches.status, ["finished", "live"]));

  if (finishedMatches.length === 0) {
    console.log("No finished matches to calculate points for.");
    return;
  }

  const finishedMatchIds = finishedMatches.map((m: Match) => m.id);
  const allGuesses = await db.select().from(guesses).where(inArray(guesses.matchId, finishedMatchIds));

  const scores: Record<string, UserScore> = {};

  for (const userInPool of allUsersInPools) {
    const key = `${userInPool.userId}-${userInPool.poolId}`;
    
    let bonusPoints = 0;
    if (userInPool.campeao && normalizeChampion(userInPool.campeao) === "Espanha") {
      bonusPoints += 10;
    }
    if (userInPool.artilheiro && normalizePlayer(userInPool.artilheiro) === "Kylian Mbappé") {
      bonusPoints += 7;
    }
    if (userInPool.craque && normalizePlayer(userInPool.craque) === "Rodri") {
      bonusPoints += 7;
    }

    if (!scores[key]) {
      scores[key] = {
        userId: userInPool.userId,
        poolId: userInPool.poolId,
        totalPoints: bonusPoints,
        totalCravadas: 0,
        totalAcertos: 0,
        cravadasFase1: 0,
        cravadasFase2: 0,
        acertosFase1: 0,
        acertosFase2: 0,
      };
    }
  }
  
  for (const match of finishedMatches) {
    const guessesForMatch = allGuesses.filter((g: Guess) => g.matchId === match.id);

    for (const guess of guessesForMatch) {
      if (guess.homeGuess === null || guess.awayGuess === null || match.homeScore === null || match.awayScore === null) {
        continue;
      }
      
      const key = `${guess.userId}-${guess.poolId}`;
      if (!scores[key]) continue;

      const exactScore = guess.homeGuess === match.homeScore && guess.awayGuess === match.awayScore;
      const isGroupStage = match.stage === "group";

      let correctWinner = false;
      if (isGroupStage) {
        const guessWinner = guess.homeGuess > guess.awayGuess ? "home" : guess.homeGuess < guess.awayGuess ? "away" : "draw";
        const matchWinner = match.homeScore > match.awayScore ? "home" : match.homeScore < match.awayScore ? "away" : "draw";
        correctWinner = guessWinner === matchWinner;
      } else {
        const event = espnEvents.find((e: any) => parseInt(e.id) === match.apiId);
        if (event) {
          const comp = event.competitions[0];
          const homeComp = comp.competitors.find((c: any) => c.homeAway === 'home');
          const awayComp = comp.competitors.find((c: any) => c.homeAway === 'away');
          
          const homeAdvanced = homeComp?.winner === true || homeComp?.advance === true;
          const awayAdvanced = awayComp?.winner === true || awayComp?.advance === true;
          
          const advancedTeam = homeAdvanced ? "home" : (awayAdvanced ? "away" : "draw");
          const guessWinner = guess.homeGuess > guess.awayGuess ? "home" : guess.homeGuess < guess.awayGuess ? "away" : "draw";
          
          if (guessWinner === "draw") {
            correctWinner = match.homeScore === match.awayScore;
          } else {
            correctWinner = advancedTeam === guessWinner;
          }
        } else {
          const guessWinner = guess.homeGuess > guess.awayGuess ? "home" : guess.homeGuess < guess.awayGuess ? "away" : "draw";
          const matchWinner = match.homeScore > match.awayScore ? "home" : match.homeScore < match.awayScore ? "away" : "draw";
          correctWinner = guessWinner === matchWinner;
        }
      }

      let points = 0;
      if (exactScore) {
        scores[key].totalCravadas += 1;
        if (isGroupStage) {
          scores[key].cravadasFase1 += 1;
          points = 3;
        } else {
          scores[key].cravadasFase2 += 1;
          points = 5;
        }
      } else if (correctWinner) {
        scores[key].totalAcertos += 1;
        if (isGroupStage) {
          scores[key].acertosFase1 += 1;
          points = 1;
        } else {
          scores[key].acertosFase2 += 1;
          points = 3;
        }
      }
      
      scores[key].totalPoints += points;
      if (guess.points !== points) {
        await db.update(guesses).set({ points }).where(eq(guesses.id, guess.id));
      }
    }
  }

  console.log("Updating users_to_pools table with new scores...");
  for (const key in scores) {
    const score = scores[key];
    await db.update(usersToPools)
      .set({
        totalPoints: score.totalPoints,
        totalCravadas: score.totalCravadas,
        totalAcertos: score.totalAcertos,
        cravadasFase1: score.cravadasFase1,
        cravadasFase2: score.cravadasFase2,
        acertosFase1: score.acertosFase1,
        acertosFase2: score.acertosFase2,
      })
      .where(and(
        eq(usersToPools.userId, score.userId),
        eq(usersToPools.poolId, score.poolId)
      ));
  }

  console.log("Point calculation finished.");
}

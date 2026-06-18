"use server";

import { db } from "@/lib/db";
import { matches, guesses, usersToPools, users } from "@/lib/db/schema";
import { eq, and, inArray, type InferSelectModel } from "drizzle-orm";

type Match = InferSelectModel<typeof matches>;
type Guess = InferSelectModel<typeof guesses>;

type UserScore = {
  userId: string;
  poolId: string;
  totalPoints: number;
  totalCravadas: number;
  totalAcertos: number;
};

export async function calculatePoints() {
  console.log("Starting point calculation...");

  const allUsersInPools = await db.select({
    userId: usersToPools.userId,
    poolId: usersToPools.poolId,
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
    if (!scores[key]) {
      scores[key] = {
        userId: userInPool.userId,
        poolId: userInPool.poolId,
        totalPoints: 0,
        totalCravadas: 0,
        totalAcertos: 0,
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
      const guessWinner = guess.homeGuess > guess.awayGuess ? "home" : guess.homeGuess < guess.awayGuess ? "away" : "draw";
      const matchWinner = match.homeScore > match.awayScore ? "home" : match.homeScore < match.awayScore ? "away" : "draw";
      const correctWinner = guessWinner === matchWinner;

      let points = 0;
      if (exactScore) {
        scores[key].totalCravadas += 1;
        points = 3;
      } else if (correctWinner) {
        scores[key].totalAcertos += 1;
        points = 1;
      }
      
      scores[key].totalPoints += points;
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
      })
      .where(and(
        eq(usersToPools.userId, score.userId),
        eq(usersToPools.poolId, score.poolId)
      ));
  }

  console.log("Point calculation finished.");
}

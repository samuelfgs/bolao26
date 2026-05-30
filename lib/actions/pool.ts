"use server";

import { db } from "@/lib/db";
import { pools, usersToPools, guesses, matches } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

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
  }).onConflictDoNothing();

  revalidatePath("/palpites");
  return { poolId: pool.id };
}

export async function saveAllGuesses(poolId: string, guessesData: { matchId: string, homeGuess: number, awayGuess: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  // Filter out guesses for matches that have already started
  const matchIds = guessesData.map((g: any) => g.matchId);
  const dbMatches = await db.select().from(matches).where(inArray(matches.id, matchIds));
  
  const now = new Date();
  const validGuesses = guessesData.filter((g: any) => {
    const match = dbMatches.find((m: any) => m.id === g.matchId);
    return match && now < new Date(match.startTime);
  });

  if (validGuesses.length === 0) return;

  for (const guess of validGuesses) {
    await db.insert(guesses).values({
      userId: user.id,
      poolId,
      matchId: guess.matchId,
      homeGuess: guess.homeGuess,
      awayGuess: guess.awayGuess,
    }).onConflictDoUpdate({
      target: [guesses.userId, guesses.poolId, guesses.matchId],
      set: { 
        homeGuess: guess.homeGuess, 
        awayGuess: guess.awayGuess,
        createdAt: new Date(), // Update timestamp on change
      },
    });
  }

  revalidatePath("/palpites");
}

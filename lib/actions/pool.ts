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

  // Save bonus guesses if provided
  if (bonusGuesses) {
    await db.update(usersToPools)
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

  if (guessesData.length === 0) {
    revalidatePath("/palpites");
    return;
  }

  // Filter out guesses for matches that have already started
  const matchIds = guessesData.map((g: any) => g.matchId);
  const dbMatches = await db.select().from(matches).where(inArray(matches.id, matchIds));
  
  const now = new Date();
  const validGuesses = guessesData.filter((g: any) => {
    const match = dbMatches.find((m: any) => m.id === g.matchId);
    // Allow saving if at least one is provided, and match hasn't started
    return match && now < new Date(match.startTime) && (g.homeGuess !== "" || g.awayGuess !== "");
  });

  if (validGuesses.length === 0) {
    console.log("No valid guesses to save (all matches might have started or all inputs empty).");
    return;
  }

  console.log(`Saving ${validGuesses.length} guesses for user ${user.id} in pool ${poolId}`);

  for (const guess of validGuesses) {
    const h = (guess.homeGuess === "" || guess.homeGuess === null) ? null : Number(guess.homeGuess);
    const a = (guess.awayGuess === "" || guess.awayGuess === null) ? null : Number(guess.awayGuess);

    await db.insert(guesses).values({
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

  revalidatePath("/palpites");
}

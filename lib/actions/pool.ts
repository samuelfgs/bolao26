"use server";

import { db } from "@/lib/db";
import { pools, usersToPools, guesses, matches } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function createPool(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

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

  revalidatePath("/dashboard");
  return { code };
}

export async function joinPool(code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const [pool] = await db.select().from(pools).where(eq(pools.code, code.toUpperCase()));
  if (!pool) throw new Error("Pool not found");

  await db.insert(usersToPools).values({
    userId: user.id,
    poolId: pool.id,
  }).onConflictDoNothing();

  revalidatePath("/dashboard");
  return { poolId: pool.id };
}

export async function saveGuess(poolId: string, matchId: string, homeGuess: number, awayGuess: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Fetch match to check timestamp
  const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
  if (!match) throw new Error("Match not found");

  // 2. BACKEND VALIDATION: Reject late guesses
  if (new Date() >= new Date(match.startTime)) {
    throw new Error("Match already started. Guess rejected.");
  }

  // 3. Upsert guess
  await db.insert(guesses).values({
    userId: user.id,
    poolId,
    matchId,
    homeGuess,
    awayGuess,
  }).onConflictDoUpdate({
    target: [guesses.userId, guesses.poolId, guesses.matchId],
    set: { homeGuess, awayGuess },
  });

  revalidatePath("/palpites");
}

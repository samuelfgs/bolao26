import { db } from "@/lib/db";
import { matches, guesses, usersToPools, pools } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PalpitesList } from "./palpites-list";

export default async function PalpitesPage({ searchParams }: { searchParams: { poolId?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const sp = await searchParams;
  let poolId = sp.poolId;

  if (!poolId) {
    const userPools = await db.select({
      id: pools.id,
      name: pools.name
    })
    .from(usersToPools)
    .innerJoin(pools, eq(usersToPools.poolId, pools.id))
    .where(eq(usersToPools.userId, user.id));

    if (userPools.length === 0) {
      redirect("/onboarding");
    }

    poolId = userPools[0].id;
  }

  const allMatches = await db.select().from(matches).orderBy(matches.startTime);
  const userGuesses = await db.select().from(guesses).where(
    and(
      eq(guesses.userId, user.id),
      eq(guesses.poolId, poolId as string)
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32 pt-8">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <PalpitesList 
          poolId={poolId as string} 
          allMatches={allMatches} 
          initialGuesses={userGuesses.map((g: any) => ({
            matchId: g.matchId,
            homeGuess: g.homeGuess,
            awayGuess: g.awayGuess
          }))} 
        />
      </div>
    </div>
  );
}

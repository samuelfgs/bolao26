import { db } from "@/lib/db";
import { matches, guesses, usersToPools, pools } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PalpitesList } from "./palpites-list";
import { ensureApproved } from "@/lib/actions/auth";

export default async function PalpitesPage({ searchParams }: { searchParams: { poolId?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const sp = await searchParams;
  const poolId = await ensureApproved(user.id, sp.poolId);

  const allMatches = await db.select().from(matches).orderBy(matches.startTime);
  const userGuesses = await db.select().from(guesses).where(
    and(
      eq(guesses.userId, user.id),
      eq(guesses.poolId, poolId as string)
    )
  );

  const [poolMembership] = await db.select({
    campeao: usersToPools.campeao,
    artilheiro: usersToPools.artilheiro,
    craque: usersToPools.craque,
  }).from(usersToPools).where(
    and(
      eq(usersToPools.userId, user.id),
      eq(usersToPools.poolId, poolId as string)
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
          initialBonus={{
            campeao: poolMembership?.campeao || "",
            artilheiro: poolMembership?.artilheiro || "",
            craque: poolMembership?.craque || "",
          }}
        />
      </div>
    </div>
  );
}

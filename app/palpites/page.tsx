import { db } from "@/lib/db";
import { matches, guesses } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { MatchCard } from "@/components/MatchCard";
import { and, eq } from "drizzle-orm";

export default async function PalpitesPage({ searchParams }: { searchParams: { poolId?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Unauthorized</div>;

  const poolId = (await searchParams).poolId;
  if (!poolId) return <div>Selecione um bolão</div>;

  const allMatches = await db.select().from(matches).orderBy(matches.startTime);
  const userGuesses = await db.select().from(guesses).where(
    and(
      eq(guesses.userId, user.id),
      eq(guesses.poolId, poolId)
    )
  );

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Meus Palpites</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allMatches.map((match) => {
          const guess = userGuesses.find((g) => g.matchId === match.id);
          return (
            <MatchCard
              key={match.id}
              match={match}
              poolId={poolId}
              initialGuess={guess ? { homeGuess: guess.homeGuess, awayGuess: guess.awayGuess } : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

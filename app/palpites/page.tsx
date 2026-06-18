import { db } from "@/lib/db";
import { matches, guesses, usersToPools } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq, inArray, type InferSelectModel } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PalpitesList } from "./palpites-list";
import { ensureApproved } from "@/lib/actions/auth";

type Match = InferSelectModel<typeof matches>;

export default async function PalpitesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const poolId = await ensureApproved(user.id);

  const allMatches: Match[] = await db.select().from(matches).orderBy(matches.startTime);
  
  const lockedMatches = allMatches.filter((m: Match) => new Date(m.startTime) <= new Date());
  let communityTrends: Record<string, any> = {};

  if (lockedMatches.length > 0) {
    const lockedMatchIds = lockedMatches.map(m => m.id);
    const allCommunityGuesses = await db.select({
        matchId: guesses.matchId,
        homeGuess: guesses.homeGuess,
        awayGuess: guesses.awayGuess
    }).from(guesses).where(and(
        eq(guesses.poolId, poolId),
        inArray(guesses.matchId, lockedMatchIds)
    ));

    type CommunityGuess = typeof allCommunityGuesses[number];
    const guessesByMatch = allCommunityGuesses.reduce((acc: Record<string, CommunityGuess[]>, guess: CommunityGuess) => {
      if (!acc[guess.matchId]) {
        acc[guess.matchId] = [];
      }
      acc[guess.matchId].push(guess);
      return acc;
    }, {});

    for (const matchId in guessesByMatch) {
      const matchGuesses = guessesByMatch[matchId];
      const totalGuesses = matchGuesses.length;
      if (totalGuesses === 0) continue;

      let homeWins = 0;
      let awayWins = 0;
      let ties = 0;

      matchGuesses.forEach((g: CommunityGuess) => {
        if (g.homeGuess! > g.awayGuess!) homeWins++;
        else if (g.awayGuess! > g.homeGuess!) awayWins++;
        else ties++;
      });

      communityTrends[matchId] = {
        total: totalGuesses,
        home: Math.round((homeWins / totalGuesses) * 100),
        tie: Math.round((ties / totalGuesses) * 100),
        away: Math.round((awayWins / totalGuesses) * 100),
      };
    }
  }
  
  const userGuesses = await db.select().from(guesses).where(
    and(
      eq(guesses.userId, user.id),
      eq(guesses.poolId, poolId)
    )
  );

  type UserGuess = typeof userGuesses[number];

  const initialGuessesWithPoints = userGuesses.map((g: UserGuess) => {
    const match = allMatches.find(m => m.id === g.matchId);
    let pts = 0;
    if (match && g.homeGuess !== null && g.awayGuess !== null && match.homeScore !== null && match.awayScore !== null) {
      const exactScore = g.homeGuess === match.homeScore && g.awayGuess === match.awayScore;
      const guessWinner = g.homeGuess > g.awayGuess ? "home" : g.homeGuess < g.awayGuess ? "away" : "draw";
      const matchWinner = match.homeScore > match.awayScore ? "home" : match.homeScore < match.awayScore ? "away" : "draw";
      if (exactScore) pts = 3;
      else if (guessWinner === matchWinner) pts = 1;
    }
    return {
      matchId: g.matchId,
      homeGuess: g.homeGuess,
      awayGuess: g.awayGuess,
      points: pts
    };
  });

  const [poolMembership] = await db.select({
    campeao: usersToPools.campeao,
    artilheiro: usersToPools.artilheiro,
    craque: usersToPools.craque,
  }).from(usersToPools).where(
    and(
      eq(usersToPools.userId, user.id),
      eq(usersToPools.poolId, poolId)
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32 pt-8">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <PalpitesList 
          poolId={poolId} 
          allMatches={allMatches} 
          initialGuesses={initialGuessesWithPoints} 
          initialBonus={{
            campeao: poolMembership?.campeao || "",
            artilheiro: poolMembership?.artilheiro || "",
            craque: poolMembership?.craque || "",
          }}
          communityTrends={communityTrends}
        />
      </div>
    </div>
  );
}

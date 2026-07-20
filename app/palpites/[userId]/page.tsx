import { db } from "@/lib/db";
import { matches, guesses, usersToPools, users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq, lte, inArray, type InferSelectModel } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PalpitesList } from "../palpites-list";
import { ensureApproved } from "@/lib/actions/auth";
import Link from "next/link";

type Match = InferSelectModel<typeof matches>;

export default async function PalpitesUserPage({ 
  params,
}: { 
  params: Promise<{ userId: string }>,
}) {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect("/");
  }

  const p = await params;
  const targetUserId = p.userId;

  if (targetUserId === currentUser.id) {
    redirect("/palpites");
  }
  
  const poolId = await ensureApproved(currentUser.id);

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

  const allUserGuesses = await db.select().from(guesses).where(
    and(
      eq(guesses.userId, targetUserId),
      eq(guesses.poolId, poolId)
    )
  );
  
  type UserGuess = typeof allUserGuesses[number];

  const matchesById = new Map(allMatches.map(m => [m.id, m]));

  const visibleGuesses = allUserGuesses.filter((guess: UserGuess) => {
    const match = matchesById.get(guess.matchId);
    return match && new Date(match.startTime) <= new Date();
  });

  const visibleGuessesWithPoints = visibleGuesses.map((g: UserGuess) => {
    const match = matchesById.get(g.matchId);
    let pts = 0;
    if (match && g.homeGuess !== null && g.awayGuess !== null && match.homeScore !== null && match.awayScore !== null) {
      const exactScore = g.homeGuess === match.homeScore && g.awayGuess === match.awayScore;
      const guessWinner = g.homeGuess > g.awayGuess ? "home" : g.homeGuess < g.awayGuess ? "away" : "draw";
      const matchWinner = match.homeScore > match.awayScore ? "home" : match.homeScore < match.awayScore ? "away" : "draw";
      if (exactScore) {
        pts = match.stage === "group" ? 3 : 5;
      } else if (guessWinner === matchWinner) {
        pts = match.stage === "group" ? 1 : 3;
      }
    }
    return {
      matchId: g.matchId,
      homeGuess: g.homeGuess,
      awayGuess: g.awayGuess,
      points: pts
    };
  });

  const bonusDeadline = new Date("2026-06-13T03:00:00Z");
  const isBonusLocked = new Date() >= bonusDeadline;

  const [poolMembership] = isBonusLocked
    ? await db.select({
        campeao: usersToPools.campeao,
        artilheiro: usersToPools.artilheiro,
        craque: usersToPools.craque,
      }).from(usersToPools).where(
        and(
          eq(usersToPools.userId, targetUserId),
          eq(usersToPools.poolId, poolId)
        )
      )
    : [null];

  const [targetUser] = await db.select({ name: users.name, email: users.email, nickname: users.nickname }).from(users).where(eq(users.id, targetUserId));
  const targetUserName = targetUser?.nickname || (targetUser?.name || targetUser?.email.split('@')[0] || "").split(' ')[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-32 pt-8">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="mb-8 p-6 bg-stadium-green-800 text-white rounded-3xl shadow-lg border-4 border-stadium-green-900 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full border-x-4 border-white"></div>
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stadium-yellow mb-1">Visualizando palpites de</p>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">{targetUserName}</h1>
            </div>
            <Link href="/ranking" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/20">
              Voltar ao Ranking
            </Link>
          </div>
        </div>
        <PalpitesList 
          poolId={poolId} 
          allMatches={allMatches} 
          initialGuesses={visibleGuessesWithPoints} 
          initialBonus={{
            campeao: poolMembership?.campeao || "",
            artilheiro: poolMembership?.artilheiro || "",
            craque: poolMembership?.craque || "",
          }}
          isReadOnly={true}
          hideBonus={!isBonusLocked}
          communityTrends={communityTrends}
        />
      </div>
    </div>
  );
}

import { db } from "@/lib/db";
import { users, guesses, usersToPools, pools } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, sum, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function RankingPage({ searchParams }: { searchParams: { poolId?: string } }) {
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
    })
    .from(usersToPools)
    .where(eq(usersToPools.userId, user.id));

    if (userPools.length === 0) {
      redirect("/onboarding");
    }
    poolId = userPools[0].id;
  }

  // Fetch leaderboard data
  const leaderboard = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      totalPoints: sum(guesses.points).mapWith(Number),
    })
    .from(users)
    .innerJoin(usersToPools, eq(users.id, usersToPools.userId))
    .leftJoin(guesses, eq(users.id, guesses.userId))
    .where(eq(usersToPools.poolId, poolId as string))
    .groupBy(users.id)
    .orderBy(desc(sum(guesses.points)));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Banner */}
      <div className="bg-stadium-green-800 text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full border-x-4 border-white"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-2">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Ranking do <span className="text-stadium-yellow">Bolão</span>
          </h1>
          <p className="text-green-200 font-medium">Quem está dominando o campo? Confira a liderança.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-black text-gray-400 border-b border-gray-50 bg-gray-50/50">
                <th className="p-6 w-16 text-center">Pos</th>
                <th className="p-6">Participante</th>
                <th className="p-6 w-24 text-center">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player: any, idx: number) => (
                <tr key={player.id} className="border-b border-gray-50 last:border-0 hover:bg-stadium-green-50 transition-colors group">
                  <td className="p-6 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black ${
                      idx === 0 ? 'bg-stadium-yellow text-stadium-green-900 ring-4 ring-stadium-yellow/20' : 
                      idx === 1 ? 'bg-gray-200 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="font-black text-stadium-green-900 uppercase tracking-tight text-lg">
                      {player.name || player.email.split('@')[0]}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
                      {idx === 0 ? "🏆 Artilheiro" : "Participante"}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="text-2xl font-black text-stadium-green-600 tabular-nums">
                      {player.totalPoints || 0}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {leaderboard.length === 0 && (
            <div className="p-20 text-center space-y-4">
               <p className="text-gray-400 font-black uppercase italic tracking-widest">Nenhum participante ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

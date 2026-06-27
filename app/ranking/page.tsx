import { db } from "@/lib/db";
import { users, usersToPools } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ensureApproved } from "@/lib/actions/auth";
import Link from "next/link";
import { LiveUpdateTrigger } from "@/components/LiveUpdateTrigger";

export default async function RankingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const poolId = await ensureApproved(user.id);

  // Fetch leaderboard data
  const leaderboard = await db
    .select({
      id: users.id,
      name: users.name,
      nickname: users.nickname,
      email: users.email,
      P: usersToPools.totalPoints,
      C: usersToPools.totalCravadas,
      A: usersToPools.totalAcertos,
      C1: usersToPools.cravadasFase1,
      C2: usersToPools.cravadasFase2,
      A1: usersToPools.acertosFase1,
      A2: usersToPools.acertosFase2,
    })
    .from(users)
    .innerJoin(usersToPools, eq(users.id, usersToPools.userId))
    .where(eq(usersToPools.poolId, poolId))
    .orderBy(
      desc(usersToPools.totalPoints), 
      desc(usersToPools.totalCravadas),
      users.name
    );

  type LeaderboardPlayer = typeof leaderboard[number];

  return (
    <>
      <LiveUpdateTrigger />
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header Banner */}
        <div className="bg-stadium-green-800 text-white py-12 px-6 relative overflow-hidden mb-10">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full border-x-4 border-white"></div>
          </div>
          <div className="max-w-4xl mx-auto relative z-10 text-center space-y-2">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              Ranking do <span className="text-stadium-yellow">Bolão</span>
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 md:p-8 -mt-8 relative z-20">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-black text-gray-400 border-b border-gray-50 bg-gray-50/50">
                  <th className="p-4 sm:p-6 w-12 sm:w-16 text-center">Pos</th>
                  <th className="p-4 sm:p-6">Participante</th>
                  <th className="p-4 sm:p-6 w-16 sm:w-20 text-center">P</th>
                  <th className="p-4 sm:p-6 w-12 sm:w-16 text-center text-stadium-green-600 hidden md:table-cell">C1</th>
                  <th className="p-4 sm:p-6 w-12 sm:w-16 text-center text-stadium-green-600 hidden md:table-cell">C2</th>
                  <th className="p-4 sm:p-6 w-12 sm:w-16 text-center text-stadium-green-600 hidden md:table-cell">A1</th>
                  <th className="p-4 sm:p-6 w-12 sm:w-16 text-center text-stadium-green-600 hidden md:table-cell">A2</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player: LeaderboardPlayer, idx: number) => (
                  <tr key={player.id} className="border-b border-gray-50 last:border-0 hover:bg-stadium-green-50 transition-colors group text-sm">
                    <td className="p-4 sm:p-6 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black ${
                        idx === 0 ? 'bg-stadium-yellow text-stadium-green-900 ring-4 ring-stadium-yellow/20' : 
                        idx === 1 ? 'bg-gray-200 text-gray-700' :
                        idx === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="p-4 sm:p-6">
                      <Link 
                        href={player.id === user.id ? `/palpites` : `/palpites/${player.id}`}
                        className="font-black text-stadium-green-900 uppercase tracking-tight hover:text-stadium-green-600 transition-colors"
                      >
                        {player.nickname || (player.name || player.email!.split('@')[0]).split(' ')[0]}
                      </Link>
                      {/* Mobile stats row */}
                      <div className="md:hidden text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                        <span>C1: <strong className="text-gray-600">{player.C1}</strong></span>
                        <span>C2: <strong className="text-gray-600">{player.C2}</strong></span>
                        <span>A1: <strong className="text-gray-600">{player.A1}</strong></span>
                        <span>A2: <strong className="text-gray-600">{player.A2}</strong></span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6 text-center font-black text-base sm:text-lg text-stadium-green-900 tabular-nums">
                      {player.P}
                    </td>
                    <td className="p-4 sm:p-6 text-center font-bold text-gray-500 tabular-nums hidden md:table-cell">
                      {player.C1}
                    </td>
                    <td className="p-4 sm:p-6 text-center font-bold text-gray-500 tabular-nums hidden md:table-cell">
                      {player.C2}
                    </td>
                    <td className="p-4 sm:p-6 text-center font-bold text-gray-500 tabular-nums hidden md:table-cell">
                      {player.A1}
                    </td>
                    <td className="p-4 sm:p-6 text-center font-bold text-gray-500 tabular-nums hidden md:table-cell">
                      {player.A2}
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

            {/* Legenda */}
            <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-stadium-green-800 text-white rounded-md flex items-center justify-center text-[10px] font-black">P</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pontos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-stadium-green-600 text-stadium-green-800 rounded-md flex items-center justify-center text-[10px] font-black">C1</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cravadas Gp</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-stadium-green-600 text-stadium-green-800 rounded-md flex items-center justify-center text-[10px] font-black">C2</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cravadas Play</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-stadium-green-600 text-stadium-green-800 rounded-md flex items-center justify-center text-[10px] font-black">A1</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Acertos Gp</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-stadium-green-600 text-stadium-green-800 rounded-md flex items-center justify-center text-[10px] font-black">A2</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Acertos Play</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

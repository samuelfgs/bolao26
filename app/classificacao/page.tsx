import { db } from "@/lib/db";
import { matches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { teamNameTranslations, flagCodeMap } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ensureApproved } from "@/lib/actions/auth";

interface TeamStats {
  name: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export default async function ClassificacaoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  await ensureApproved(user.id);

  const allGroupMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.stage, "group"));

  const groupStats: Record<string, Record<string, TeamStats>> = {};

  allGroupMatches.forEach((match: any) => {
    const groupName = match.group?.replace('GROUP_', 'Grupo ') || "Outros";
    if (!groupStats[groupName]) groupStats[groupName] = {};

    const processTeam = (teamName: string, score: number | null, opponentScore: number | null) => {
      if (!groupStats[groupName][teamName]) {
        groupStats[groupName][teamName] = {
          name: teamName,
          points: 0,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
        };
      }

      if (match.status === "finished" && score !== null && opponentScore !== null) {
        const stats = groupStats[groupName][teamName];
        stats.played += 1;
        stats.goalsFor += score;
        stats.goalsAgainst += opponentScore;
        stats.goalDifference = stats.goalsFor - stats.goalsAgainst;

        if (score > opponentScore) {
          stats.wins += 1;
          stats.points += 3;
        } else if (score === opponentScore) {
          stats.draws += 1;
          stats.points += 1;
        } else {
          stats.losses += 1;
        }
      }
    };

    processTeam(match.homeTeam, match.homeScore, match.awayScore);
    processTeam(match.awayTeam, match.awayScore, match.homeScore);
  });

  const sortedGroups = Object.entries(groupStats).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Banner */}
      <div className="bg-stadium-green-800 text-white py-12 px-6 relative overflow-hidden mb-10">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full border-x-4 border-white"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-2">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Classificação <span className="text-stadium-yellow">Oficial</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8 -mt-8 relative z-20 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sortedGroups.map(([groupName, teams]) => {
            const sortedTeams = Object.values(teams).sort((a, b) => {
              if (b.points !== a.points) return b.points - a.points;
              if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
              return b.goalsFor - a.goalsFor;
            });

            return (
              <div key={groupName} className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100 flex flex-col">
                <div className="bg-stadium-green-600 p-4 text-white font-black uppercase italic tracking-widest text-sm flex justify-between items-center shrink-0">
                  <span>{groupName}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[400px]">
                    <thead>
                      <tr className="text-[9px] uppercase font-black text-gray-400 border-b border-gray-50 bg-gray-50/50">
                        <th className="py-3 px-4 w-8 text-center">#</th>
                        <th className="py-3 px-2">Seleção</th>
                        <th className="py-3 px-2 w-8 text-center bg-stadium-green-50/50">P</th>
                        <th className="py-3 px-2 w-8 text-center">J</th>
                        <th className="py-3 px-2 w-8 text-center">V</th>
                        <th className="py-3 px-2 w-8 text-center">E</th>
                        <th className="py-3 px-2 w-8 text-center">D</th>
                        <th className="py-3 px-2 w-8 text-center hidden sm:table-cell">GP</th>
                        <th className="py-3 px-2 w-8 text-center hidden sm:table-cell">GC</th>
                        <th className="py-3 px-2 w-8 text-center">SG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTeams.map((team, idx) => {
                        const tName = team.name.trim();
                        const translatedName = teamNameTranslations[tName] || tName;
                        const flagCode = flagCodeMap[tName] || "un";

                        return (
                          <tr key={team.name} className="border-b border-gray-50 last:border-0 hover:bg-stadium-green-50 transition-colors group">
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-black ${idx < 2 ? 'bg-stadium-green-100 text-stadium-green-800' : 'bg-gray-100 text-gray-400'}`}>
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-4 px-2 font-black text-stadium-green-900 uppercase tracking-tight text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-4 relative bg-gray-100 rounded-sm overflow-hidden border border-gray-100 shadow-xs shrink-0">
                                  <img 
                                    src={`https://flagcdn.com/w40/${flagCode}.png`} 
                                    alt={tName} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <span className="truncate max-w-[80px] sm:max-w-none">
                                  {translatedName}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center font-black text-stadium-green-800 text-xs bg-stadium-green-50/30">{team.points}</td>
                            <td className="py-4 px-2 text-center font-bold text-gray-400 text-[10px]">{team.played}</td>
                            <td className="py-4 px-2 text-center font-bold text-gray-600 text-[10px]">{team.wins}</td>
                            <td className="py-4 px-2 text-center font-bold text-gray-600 text-[10px]">{team.draws}</td>
                            <td className="py-4 px-2 text-center font-bold text-gray-600 text-[10px]">{team.losses}</td>
                            <td className="py-4 px-2 text-center font-medium text-gray-400 text-[10px] hidden sm:table-cell">{team.goalsFor}</td>
                            <td className="py-4 px-2 text-center font-medium text-gray-400 text-[10px] hidden sm:table-cell">{team.goalsAgainst}</td>
                            <td className="py-4 px-2 text-center font-bold text-stadium-green-700 text-[10px]">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-stadium-green-900 uppercase italic tracking-tighter">Mata-Mata</h2>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["32 Avos", "Oitavas", "Quartas", "Semi / Final"].map((stage) => (
               <div key={stage} className="p-8 rounded-3xl bg-white border-2 border-dashed border-gray-200 text-center space-y-3 grayscale opacity-60">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-xs font-black text-gray-400 uppercase italic">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

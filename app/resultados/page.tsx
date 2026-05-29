import { db } from "@/lib/db";
import { matches } from "@/lib/db/schema";
import { ne } from "drizzle-orm";

export default async function ResultadosPage() {
  const pastMatches = await db
    .select()
    .from(matches)
    .where(ne(matches.status, "scheduled"))
    .orderBy(matches.startTime);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Resultados Reais</h1>
      <div className="space-y-4">
        {pastMatches.map((match) => (
          <div key={match.id} className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex-1 text-right font-medium">{match.homeTeam}</div>
            <div className="px-8 font-bold text-xl">
              {match.homeScore} - {match.awayScore}
            </div>
            <div className="flex-1 text-left font-medium">{match.awayTeam}</div>
            <div className="ml-4 text-xs font-bold uppercase text-gray-400">
              {match.status}
            </div>
          </div>
        ))}
        {pastMatches.length === 0 && <p className="text-gray-500">Nenhum resultado disponível ainda.</p>}
      </div>
    </div>
  );
}

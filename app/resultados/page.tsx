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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Banner */}
      <div className="bg-stadium-green-800 text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full border-x-4 border-white"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-2">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Resultados <span className="text-stadium-yellow">Reais</span>
          </h1>
          <p className="text-green-200 font-medium">Confira o placar final das batalhas em campo.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-8 -mt-8 relative z-20 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {pastMatches.map((match: any) => (
            <div key={match.id} className="bg-white p-6 rounded-3xl shadow-xl border-2 border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group hover:border-stadium-green-500 transition-all">
              <div className="absolute top-0 left-0 w-2 h-full bg-stadium-green-600"></div>
              
              <div className="flex-1 text-center md:text-right">
                <div className="text-2xl font-black text-stadium-green-900 uppercase italic tracking-tighter">{match.homeTeam}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mandante</div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="bg-stadium-green-50 px-8 py-3 rounded-2xl border-2 border-stadium-green-100 flex items-center gap-4">
                  <span className="text-4xl font-black text-stadium-green-800">{match.homeScore}</span>
                  <span className="text-gray-200 font-black text-2xl italic">x</span>
                  <span className="text-4xl font-black text-stadium-green-800">{match.awayScore}</span>
                </div>
                <div className="text-[10px] font-black text-stadium-green-600 uppercase tracking-widest px-3 py-1 bg-stadium-green-100 rounded-full">
                  Finalizado
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="text-2xl font-black text-stadium-green-900 uppercase italic tracking-tighter">{match.awayTeam}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visitante</div>
              </div>

              <div className="absolute bottom-2 right-4 text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                {new Date(match.startTime).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}

          {pastMatches.length === 0 && (
            <div className="p-20 bg-white rounded-3xl shadow-xl border-2 border-dashed border-gray-200 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 font-black uppercase italic tracking-widest">Nenhum resultado disponível</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

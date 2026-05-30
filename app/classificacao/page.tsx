export default function ClassificacaoPage() {
  const groups = [
    { name: "Grupo A", teams: ["Brasil", "França", "Egito", "Canadá"] },
    { name: "Grupo B", teams: ["Argentina", "Espanha", "Japão", "Nigéria"] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Banner */}
      <div className="bg-stadium-green-800 text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full border-x-4 border-white"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-2">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Classificação <span className="text-stadium-yellow">Oficial</span>
          </h1>
          <p className="text-green-200 font-medium">Acompanhe a jornada rumo à taça da Copa 2026.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-8 -mt-8 relative z-20 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {groups.map((group) => (
            <div key={group.name} className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
              <div className="bg-stadium-green-600 p-4 text-white font-black uppercase italic tracking-widest text-sm flex justify-between items-center">
                <span>{group.name}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Fase de Grupos</span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-black text-gray-400 border-b border-gray-50">
                    <th className="p-4 w-12 text-center">Pos</th>
                    <th className="p-4">Seleção</th>
                    <th className="p-4 w-12 text-center">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {group.teams.map((team, idx) => (
                    <tr key={team} className="border-b border-gray-50 last:border-0 hover:bg-stadium-green-50 transition-colors group">
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black ${idx < 2 ? 'bg-stadium-green-100 text-stadium-green-800' : 'bg-gray-100 text-gray-400'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="p-4 font-black text-stadium-green-900 uppercase tracking-tight group-hover:translate-x-1 transition-transform">{team}</td>
                      <td className="p-4 text-center font-black text-stadium-green-800">0</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-50 p-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center border-t border-gray-100">
                Os 2 melhores avançam para as oitavas
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-stadium-green-900 uppercase italic tracking-tighter">Mata-Mata</h2>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          <div className="p-12 rounded-3xl bg-white border-2 border-dashed border-gray-200 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full text-gray-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-black text-gray-400 uppercase italic">Chaveamento Bloqueado</p>
              <p className="text-sm text-gray-400 font-medium italic">O chaveamento será liberado automaticamente após a fase de grupos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegulamentoPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Banner */}
      <div className="bg-stadium-green-800 text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full border-x-4 border-white"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-2">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Regulamento <span className="text-stadium-yellow">Oficial</span>
          </h1>
          <p className="text-green-200 font-medium">Conheça as regras do jogo e a pontuação.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-8 -mt-8 relative z-20 space-y-8">
        
        {/* Como Funciona */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
          <div className="bg-stadium-green-600 p-4 text-white font-black uppercase italic tracking-widest text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Como Funciona
          </div>
          <div className="p-6 text-gray-600 space-y-4 text-sm font-medium leading-relaxed">
            <p>
              O Bolão 2026 é uma competição de palpites focada na Copa do Mundo. Seu objetivo é prever o resultado exato ou o vencedor de cada partida.
            </p>
            <p>
              Você pode alterar seus palpites quantas vezes quiser <strong className="text-stadium-green-800">até o horário de início oficial</strong> de cada jogo. Após o apito inicial, a partida ficará bloqueada.
            </p>
          </div>
        </div>

        {/* Pontuação */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
          <div className="bg-stadium-green-600 p-4 text-white font-black uppercase italic tracking-widest text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Sistema de Pontuação
          </div>
          
          <div className="p-6 space-y-8">
            {/* Fase de Grupos */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-stadium-green-900 uppercase tracking-tight border-b-2 border-gray-100 pb-2">Primeira Fase (Grupos)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-4">
                  <div className="bg-stadium-yellow text-stadium-green-900 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-black text-stadium-green-900 uppercase text-sm">Cravada (Placar Exato)</h4>
                    <p className="text-xs text-gray-500 font-medium">Acertar o vencedor e a quantidade exata de gols de cada time.</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-4">
                  <div className="bg-stadium-green-100 text-stadium-green-800 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-black text-stadium-green-900 uppercase text-sm">Acerto (Resultado)</h4>
                    <p className="text-xs text-gray-500 font-medium">Acertar apenas quem ganhou ou se foi empate, sem acertar o placar exato.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mata-Mata */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-stadium-green-900 uppercase tracking-tight border-b-2 border-gray-100 pb-2">A partir dos 32 Avos (Mata-Mata)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-4">
                  <div className="bg-stadium-yellow text-stadium-green-900 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0">
                    5
                  </div>
                  <div>
                    <h4 className="font-black text-stadium-green-900 uppercase text-sm">Cravada (Placar Exato)</h4>
                    <p className="text-xs text-gray-500 font-medium">Acertar o vencedor e a quantidade exata de gols (tempo normal).</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-4">
                  <div className="bg-stadium-green-100 text-stadium-green-800 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-black text-stadium-green-900 uppercase text-sm">Acerto (Resultado)</h4>
                    <p className="text-xs text-gray-500 font-medium">Acertar quem avançou ou se o jogo foi para os pênaltis.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Palpites Especiais */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
          <div className="bg-stadium-green-600 p-4 text-white font-black uppercase italic tracking-widest text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Palpites Especiais (Bônus)
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 font-medium mb-1">
              Estes palpites extras são definidos no início do torneio e renderão pontos bônus no final da Copa do Mundo.
            </p>
            <p className="text-xs text-red-600 font-bold mb-6 italic italic">
              * Estes palpites serão encerrados no início da primeira partida do torneio.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                <div className="text-3xl">🏆</div>
                <h4 className="font-black text-stadium-green-900 uppercase text-sm">Campeão</h4>
                <div className="bg-stadium-yellow text-stadium-green-900 px-3 py-1 rounded-full font-black text-sm w-max mt-auto">
                  +10 Pontos
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                <img src="/golden-boot.png" alt="Artilheiro" className="w-8 h-8 object-contain" />
                <h4 className="font-black text-stadium-green-900 uppercase text-sm">Artilheiro</h4>
                <div className="bg-stadium-green-100 text-stadium-green-800 px-3 py-1 rounded-full font-black text-sm w-max mt-auto">
                  +7 Pontos
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center gap-2">
                <img src="/bola-de-ouro.png" alt="Craque" className="w-8 h-8 object-contain" />
                <h4 className="font-black text-stadium-green-900 uppercase text-sm">Craque da Copa</h4>
                <div className="bg-stadium-green-100 text-stadium-green-800 px-3 py-1 rounded-full font-black text-sm w-max mt-auto">
                  +7 Pontos
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Critérios de Desempate */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-100">
          <div className="bg-stadium-green-600 p-4 text-white font-black uppercase italic tracking-widest text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Critérios de Desempate
          </div>
          <div className="p-6">
            <ol className="space-y-3 text-sm font-medium text-gray-600 list-decimal list-inside ml-2">
              <li className="pl-2">
                <strong className="text-stadium-green-900 uppercase text-xs">Mais Pontos:</strong> O participante com a maior soma de pontos ganha.
              </li>
              <li className="pl-2">
                <strong className="text-stadium-green-900 uppercase text-xs">Mais Cravadas:</strong> Persistindo o empate, quem acertou o placar exato (Cravadas) mais vezes fica à frente.
              </li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}

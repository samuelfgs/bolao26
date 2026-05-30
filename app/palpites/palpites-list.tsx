"use client";

import { useState, useEffect } from "react";
import { MatchCard } from "@/components/MatchCard";
import { saveAllGuesses } from "@/lib/actions/pool";
import { toast } from "sonner";

interface Guess {
  matchId: string;
  homeGuess: number | string;
  awayGuess: number | string;
}

interface PalpitesListProps {
  poolId: string;
  allMatches: any[];
  initialGuesses: Guess[];
  initialBonus: { campeao: string, artilheiro: string, craque: string };
}

export function PalpitesList({ poolId, allMatches, initialGuesses, initialBonus }: PalpitesListProps) {
  const [loading, setLoading] = useState(false);
  const [guesses, setGuesses] = useState<Record<string, { home: string | number, away: string | number }>>(
    Object.fromEntries(initialGuesses.map(g => [g.matchId, { home: g.homeGuess ?? "", away: g.awayGuess ?? "" }]))
  );
  
  const [bonus, setBonus] = useState(initialBonus);

  useEffect(() => {
    setGuesses(Object.fromEntries(initialGuesses.map(g => [g.matchId, { home: g.homeGuess ?? "", away: g.awayGuess ?? "" }])));
    setBonus(initialBonus);
  }, [initialGuesses, initialBonus]);
  
  const [hasChanges, setHasChanges] = useState(false);
  
  // Track current round per group
  const [groupRounds, setGroupRounds] = useState<Record<string, number>>({});

  const handleGuessChange = (matchId: string, home: string, away: string) => {
    setGuesses(prev => ({
      ...prev,
      [matchId]: { home, away }
    }));
    setHasChanges(true);
  };

  const handleBonusChange = (field: "campeao" | "artilheiro" | "craque", value: string) => {
    setBonus(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    setLoading(true);
    const guessesToSave = Object.entries(guesses)
      .filter(([_, val]) => val.home !== "" || val.away !== "")
      .map(([matchId, val]) => ({
        matchId,
        homeGuess: val.home,
        awayGuess: val.away
      }));

    try {
      await saveAllGuesses(poolId, guessesToSave as any, bonus);
      setHasChanges(false);
      toast.success("Palpites salvos com sucesso!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar palpites");
    } finally {
      setLoading(false);
    }
  };

  // Get unique groups
  const allGroups = Array.from(new Set(allMatches.map(m => m.group))).filter(Boolean).sort();

  return (
    <div className="space-y-16">
      {/* Bonus Guesses */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-stadium-green-600 space-y-6">
        <h2 className="text-2xl font-black text-stadium-green-900 uppercase italic tracking-tighter border-b-2 border-gray-100 pb-2">
          Palpites Especiais
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 ml-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
              </svg>
              Campeão
            </label>
            <input
              type="text"
              placeholder="Ex: Brasil"
              value={bonus.campeao}
              onChange={(e) => handleBonusChange("campeao", e.target.value)}
              className="w-full border-2 border-gray-100 p-4 rounded-2xl text-sm font-black text-stadium-green-900 focus:border-stadium-green-500 focus:outline-hidden transition-all uppercase placeholder:normal-case placeholder:font-medium placeholder:text-gray-300"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 ml-1">
              <svg className="w-4 h-4 text-stadium-green-600" fill="currentColor" viewBox="0 0 24 24">
                {/* Soccer Shoe (Chuteira) */}
                <path d="M21.99 15.3c-.02-.12-.04-.25-.09-.36-.05-.12-.12-.22-.19-.32l-3-4C18.17 9.87 17.11 9.4 16 9.4c-.03 0-.07 0-.1.01l-5.69 1.14c-1.02.21-1.74 1.15-1.63 2.19.06.57.34 1.1.8 1.48l1.4.92c.62.4 1.4.52 2.06.33L16 14.5l1.64 2.18c.31.41.83.6 1.33.5.5-.1 1.08-.34 1.42-.71l1.5-1.5c.08-.1.11-.21.1-.37zM4 2v2c0 1.1.9 2 2 2h1v1.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V6h1c1.1 0 2-.9 2-2V2H4zm5 3H7V3h2v2z"/>
              </svg>
              Artilheiro
            </label>
            <input
              type="text"
              placeholder="Ex: Mbappé"
              value={bonus.artilheiro}
              onChange={(e) => handleBonusChange("artilheiro", e.target.value)}
              className="w-full border-2 border-gray-100 p-4 rounded-2xl text-sm font-black text-stadium-green-900 focus:border-stadium-green-500 focus:outline-hidden transition-all uppercase placeholder:normal-case placeholder:font-medium placeholder:text-gray-300"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 ml-1">
              <img src="/bola-de-ouro.png" alt="Bola de Ouro" className="w-5 h-5 object-contain" />
              Craque da Copa
            </label>

            <input
              type="text"
              placeholder="Ex: Vinícius Jr."
              value={bonus.craque}
              onChange={(e) => handleBonusChange("craque", e.target.value)}
              className="w-full border-2 border-gray-100 p-4 rounded-2xl text-sm font-black text-stadium-green-900 focus:border-stadium-green-500 focus:outline-hidden transition-all uppercase placeholder:normal-case placeholder:font-medium placeholder:text-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Group Sections */}
      {allGroups.map(groupName => {
        const currentRound = groupRounds[groupName] || 1;
        const groupMatches = allMatches.filter(m => m.group === groupName && m.matchday === currentRound);
        const displayName = groupName?.replace('GROUP_', 'GRUPO ');

        return (
          <div key={groupName} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-stadium-green-600 pb-4">
              <h2 className="text-3xl font-black text-stadium-green-900 uppercase italic tracking-tighter">
                {displayName}
              </h2>

              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200 self-start md:self-center">
                {[1, 2, 3].map((r) => (
                  <button
                    key={r}
                    onClick={() => setGroupRounds(prev => ({ ...prev, [groupName]: r }))}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      currentRound === r 
                        ? "bg-stadium-green-600 text-white shadow-md scale-105" 
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    R{r}
                  </button>
                ))}
              </div>
            </div>

            {groupMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    currentGuess={guesses[match.id] || { home: "", away: "" }}
                    onGuessChange={(home, away) => handleGuessChange(match.id, home, away)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center">
                <p className="text-gray-400 font-black uppercase italic text-xs">Nenhuma partida para a Rodada {currentRound} do {displayName}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Batch Save Button */}
      {hasChanges && (
        <div className="fixed bottom-4 sm:bottom-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className="w-full sm:w-auto bg-stadium-yellow text-stadium-green-900 font-black px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl shadow-2xl hover:bg-yellow-300 transform hover:scale-105 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-3 border-4 border-stadium-green-900 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-4 border-stadium-green-900 border-t-transparent animate-spin rounded-full"></div>
                Salvando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                <span className="truncate">Salvar Palpites</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

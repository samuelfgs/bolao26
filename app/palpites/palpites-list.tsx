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
}

export function PalpitesList({ poolId, allMatches, initialGuesses }: PalpitesListProps) {
  const [loading, setLoading] = useState(false);
  const [guesses, setGuesses] = useState<Record<string, { home: string | number, away: string | number }>>(
    Object.fromEntries(initialGuesses.map(g => [g.matchId, { home: g.homeGuess ?? "", away: g.awayGuess ?? "" }]))
  );

  useEffect(() => {
    setGuesses(Object.fromEntries(initialGuesses.map(g => [g.matchId, { home: g.homeGuess ?? "", away: g.awayGuess ?? "" }])));
  }, [initialGuesses]);
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
      await saveAllGuesses(poolId, guessesToSave as any);
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

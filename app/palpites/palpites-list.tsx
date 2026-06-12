"use client";

import { useState, useEffect } from "react";
import { MatchCard } from "@/components/MatchCard";
import { saveAllGuesses } from "@/lib/actions/pool";
import { toast } from "sonner";

interface Guess {
  matchId: string;
  homeGuess: number | string;
  awayGuess: number | string;
  points?: number | null;
}

interface PalpitesListProps {
  poolId: string;
  allMatches: any[];
  initialGuesses: Guess[];
  initialBonus: { campeao: string, artilheiro: string, craque: string };
  isReadOnly?: boolean;
  hideBonus?: boolean;
  communityTrends?: Record<string, { total: number; home: number; tie: number; away: number; }>;
}

export function PalpitesList({ 
  poolId, 
  allMatches, 
  initialGuesses, 
  initialBonus, 
  isReadOnly = false, 
  hideBonus = false,
  communityTrends = {} 
}: PalpitesListProps) {
  const [loading, setLoading] = useState(false);
  const [guesses, setGuesses] = useState<Record<string, { home: string | number, away: string | number, points?: number | null }>>(
    Object.fromEntries(initialGuesses.map(g => [g.matchId, { home: g.homeGuess ?? "", away: g.awayGuess ?? "", points: g.points }]))
  );
  
  const [bonus, setBonus] = useState(initialBonus);

  useEffect(() => {
    setGuesses(Object.fromEntries(initialGuesses.map(g => [g.matchId, { home: g.homeGuess ?? "", away: g.awayGuess ?? "", points: g.points }])));
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
    const now = new Date();

    const guessesToSave = Object.entries(guesses)
      .filter(([matchId, val]) => {
        // Filter out empty guesses
        if (val.home === "" && val.away === "") return false;

        // Filter out matches that have already started or are locked
        const match = allMatches.find(m => m.id === matchId);
        if (!match) return false;

        const isLocked = isReadOnly || 
                        now >= new Date(match.startTime) || 
                        match.status === "live" || 
                        match.status === "finished";
        
        return !isLocked;
      })
      .map(([matchId, val]) => ({
        matchId,
        homeGuess: val.home,
        awayGuess: val.away
      }));

    try {
      // Only send bonus if not locked
      await saveAllGuesses(poolId, guessesToSave as any, isBonusLocked ? undefined : bonus);
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

  // Deadline: Midnight BRT between June 11 and June 12, 2026
  const bonusDeadline = new Date("2026-06-13T03:00:00Z");
  const isBonusLocked = new Date() >= bonusDeadline;

  return (
    <div className="space-y-16">
      {/* Bonus Guesses */}
      {!hideBonus && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-stadium-green-600 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-2">
            <h2 className="text-2xl font-black text-stadium-green-900 uppercase italic tracking-tighter">
              Palpites Especiais
            </h2>
            {isBonusLocked && (
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                Encerrado
              </span>
            )}
          </div>
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
                disabled={isReadOnly || isBonusLocked}
                onChange={(e) => handleBonusChange("campeao", e.target.value)}
                className="w-full border-2 border-gray-100 p-4 rounded-2xl text-sm font-black text-stadium-green-900 focus:border-stadium-green-500 focus:outline-hidden transition-all uppercase placeholder:normal-case placeholder:font-medium placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 ml-1">
                <img src="/golden-boot.png" alt="Artilheiro" className="w-5 h-5 object-contain" />
                Artilheiro
              </label>
              <input
                type="text"
                placeholder="Ex: Mbappé"
                value={bonus.artilheiro}
                disabled={isReadOnly || isBonusLocked}
                onChange={(e) => handleBonusChange("artilheiro", e.target.value)}
                className="w-full border-2 border-gray-100 p-4 rounded-2xl text-sm font-black text-stadium-green-900 focus:border-stadium-green-500 focus:outline-hidden transition-all uppercase placeholder:normal-case placeholder:font-medium placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400"
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
                disabled={isReadOnly || isBonusLocked}
                onChange={(e) => handleBonusChange("craque", e.target.value)}
                className="w-full border-2 border-gray-100 p-4 rounded-2xl text-sm font-black text-stadium-green-900 focus:border-stadium-green-500 focus:outline-hidden transition-all uppercase placeholder:normal-case placeholder:font-medium placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>
        </div>
      )}

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
                    isReadOnly={isReadOnly}
                    trend={communityTrends[match.id]}
                    points={guesses[match.id]?.points}
                    isSaved={
                      (() => {
                        const initial = initialGuesses.find(ig => ig.matchId === match.id);
                        const currentHome = guesses[match.id]?.home?.toString() ?? "";
                        const currentAway = guesses[match.id]?.away?.toString() ?? "";
                        const savedHome = initial?.homeGuess?.toString() ?? "";
                        const savedAway = initial?.awayGuess?.toString() ?? "";
                        
                        return (
                          currentHome !== "" && 
                          currentAway !== "" && 
                          currentHome === savedHome &&
                          currentAway === savedAway
                        );
                      })()
                    }
                    isDraft={
                      (() => {
                        const initial = initialGuesses.find(ig => ig.matchId === match.id);
                        const currentHome = guesses[match.id]?.home?.toString() ?? "";
                        const currentAway = guesses[match.id]?.away?.toString() ?? "";
                        const savedHome = initial?.homeGuess?.toString() ?? "";
                        const savedAway = initial?.awayGuess?.toString() ?? "";
                        
                        // If current input is empty, it's not a draft (it's pending)
                        if (currentHome === "" && currentAway === "") return false;
                        
                        // It's a draft if it differs from what's saved
                        return currentHome !== savedHome || currentAway !== savedAway;
                      })()
                    }
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
      {!isReadOnly && hasChanges && (
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

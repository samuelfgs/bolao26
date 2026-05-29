"use client";

import { useState, useEffect } from "react";
import { saveGuess } from "@/lib/actions/pool";

interface MatchCardProps {
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    startTime: Date;
    homeScore?: number | null;
    awayScore?: number | null;
  };
  initialGuess?: {
    homeGuess: number;
    awayGuess: number;
  };
  poolId: string;
}

export function MatchCard({ match, initialGuess, poolId }: MatchCardProps) {
  const [homeGuess, setHomeGuess] = useState(initialGuess?.homeGuess?.toString() || "");
  const [awayGuess, setAwayGuess] = useState(initialGuess?.awayGuess?.toString() || "");
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkLock = () => {
      setIsLocked(new Date() >= new Date(match.startTime));
    };
    checkLock();
    const interval = setInterval(checkLock, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [match.startTime]);

  async function handleSave() {
    setLoading(true);
    try {
      await saveGuess(poolId, match.id, parseInt(homeGuess), parseInt(awayGuess));
      alert("Palpite salvo!");
    } catch (e: any) {
      alert(e.message || "Erro ao salvar palpite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 border rounded-xl shadow-sm bg-white space-y-4">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{new Date(match.startTime).toLocaleString()}</span>
        {isLocked && <span className="text-red-500 font-bold uppercase text-xs">Bloqueado</span>}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right font-semibold">{match.homeTeam}</div>
        
        <div className="flex items-center gap-2">
          <input
            type="number"
            disabled={isLocked}
            className="w-12 h-10 border text-center rounded-md disabled:bg-gray-100"
            value={homeGuess}
            onChange={(e) => setHomeGuess(e.target.value)}
          />
          <span className="text-gray-400">x</span>
          <input
            type="number"
            disabled={isLocked}
            className="w-12 h-10 border text-center rounded-md disabled:bg-gray-100"
            value={awayGuess}
            onChange={(e) => setAwayGuess(e.target.value)}
          />
        </div>

        <div className="flex-1 text-left font-semibold">{match.awayTeam}</div>
      </div>

      {isLocked ? (
        <div className="text-center pt-2">
          <p className="text-sm font-medium">Placar Real: {match.homeScore ?? "-"} x {match.awayScore ?? "-"}</p>
        </div>
      ) : (
        <button
          onClick={handleSave}
          disabled={loading || !homeGuess || !awayGuess}
          className="w-full py-2 bg-yellow-400 font-bold rounded-lg hover:bg-yellow-500 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar Palpite"}
        </button>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { getTeamFlagCode, getTranslatedTeamName } from "@/lib/constants";

interface MatchCardProps {
  match: {
    id: string;
    apiId: number | null;
    homeTeam: string;
    awayTeam: string;
    startTime: Date;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
  };
  currentGuess: { home: string | number; away: string | number };
  onGuessChange: (home: string, away: string) => void;
}

export function MatchCard({ match, currentGuess, onGuessChange }: MatchCardProps) {
  const isLocked = new Date() >= new Date(match.startTime);
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setFormattedDate(
      new Date(match.startTime).toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    );
  }, [match.startTime]);

  const handleAdjust = (type: "home" | "away", delta: number) => {
    const current = Number(type === "home" ? currentGuess.home : currentGuess.away) || 0;
    const next = Math.max(0, current + delta);
    if (type === "home") {
      onGuessChange(next.toString(), currentGuess.away.toString());
    } else {
      onGuessChange(currentGuess.home.toString(), next.toString());
    }
  };

  return (
    <div className={`p-4 border-2 rounded-3xl shadow-sm bg-white space-y-4 relative overflow-hidden transition-all ${isLocked ? 'opacity-75 bg-gray-50' : 'hover:border-stadium-green-400'}`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${isLocked ? 'bg-gray-300' : 'bg-stadium-green-600'}`}></div>
      
      <div className="flex justify-center items-center text-[9px] font-black uppercase tracking-widest text-gray-400 relative h-4">
        <div className="flex items-center gap-1">
          {formattedDate && (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formattedDate}
            </>
          )}
        </div>
        {isLocked && (
          <span className="absolute right-0 bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1 font-black text-[7px]">
            BLOQUEADO
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <div className="w-10 h-7 sm:w-12 sm:h-8 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-100 shadow-xs shrink-0">
            <img src={`https://flagcdn.com/w80/${getTeamFlagCode(match.homeTeam)}.png`} alt={match.homeTeam} className="w-full h-full object-cover" />
          </div>
          <div className="text-[10px] sm:text-[11px] font-black text-stadium-green-900 leading-tight uppercase tracking-tight text-center truncate w-full px-1">
            {getTranslatedTeamName(match.homeTeam)}
          </div>
        </div>
        
        {/* Score Inputs with Adjusters */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Home Score */}
          <div className="flex flex-col items-center gap-0.5">
            <button 
              type="button"
              disabled={isLocked}
              onClick={() => handleAdjust("home", 1)}
              className="w-10 h-6 flex items-center justify-center bg-gray-50 text-gray-400 rounded-t-lg hover:bg-stadium-green-100 hover:text-stadium-green-800 disabled:opacity-0 transition-all font-black text-xs border border-b-0 border-gray-100 shadow-xs"
            >
              ▲
            </button>
            <input
              type="number"
              disabled={isLocked}
              className="w-10 h-10 border-x-2 border-gray-100 bg-white text-center text-xl font-black text-stadium-green-800 focus:outline-hidden disabled:bg-gray-50 disabled:text-gray-400 transition-all placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={currentGuess.home}
              onChange={(e) => onGuessChange(e.target.value, currentGuess.away.toString())}
            />
            <button 
              type="button"
              disabled={isLocked}
              onClick={() => handleAdjust("home", -1)}
              className="w-10 h-6 flex items-center justify-center bg-gray-50 text-gray-400 rounded-b-lg hover:bg-stadium-green-100 hover:text-stadium-green-800 disabled:opacity-0 transition-all font-black text-xs border border-t-0 border-gray-100 shadow-xs"
            >
              ▼
            </button>
          </div>

          <span className="text-gray-300 font-black text-[10px] sm:text-xs italic">X</span>

          {/* Away Score */}
          <div className="flex flex-col items-center gap-0.5">
            <button 
              type="button"
              disabled={isLocked}
              onClick={() => handleAdjust("away", 1)}
              className="w-10 h-6 flex items-center justify-center bg-gray-50 text-gray-400 rounded-t-lg hover:bg-stadium-green-100 hover:text-stadium-green-800 disabled:opacity-0 transition-all font-black text-xs border border-b-0 border-gray-100 shadow-xs"
            >
              ▲
            </button>
            <input
              type="number"
              disabled={isLocked}
              className="w-10 h-10 border-x-2 border-gray-100 bg-white text-center text-xl font-black text-stadium-green-800 focus:outline-hidden disabled:bg-gray-50 disabled:text-gray-400 transition-all placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={currentGuess.away}
              onChange={(e) => onGuessChange(currentGuess.home.toString(), e.target.value)}
            />
            <button 
              type="button"
              disabled={isLocked}
              onClick={() => handleAdjust("away", -1)}
              className="w-10 h-6 flex items-center justify-center bg-gray-50 text-gray-400 rounded-b-lg hover:bg-stadium-green-100 hover:text-stadium-green-800 disabled:opacity-0 transition-all font-black text-xs border border-t-0 border-gray-100 shadow-xs"
            >
              ▼
            </button>
          </div>
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <div className="w-10 h-7 sm:w-12 sm:h-8 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-100 shadow-xs shrink-0">
            <img src={`https://flagcdn.com/w80/${getTeamFlagCode(match.awayTeam)}.png`} alt={match.awayTeam} className="w-full h-full object-cover" />
          </div>
          <div className="text-[10px] sm:text-[11px] font-black text-stadium-green-900 leading-tight uppercase tracking-tight text-center truncate w-full px-1">
            {getTranslatedTeamName(match.awayTeam)}
          </div>
        </div>
      </div>

      {isLocked && (
        <div className="bg-stadium-green-50 p-2 rounded-xl border border-stadium-green-100">
          <p className="text-[9px] font-black text-stadium-green-800 uppercase tracking-widest text-center">
            Final: <span className="text-xs ml-1">{match.homeScore ?? "-"} x {match.awayScore ?? "-"}</span>
          </p>
        </div>
      )}
    </div>
  );
}


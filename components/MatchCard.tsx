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
  isReadOnly?: boolean;
  points?: number | null;
  trend?: {
    total: number;
    home: number;
    tie: number;
    away: number;
  };
}

export function MatchCard({ match, currentGuess, onGuessChange, isReadOnly = false, points, trend }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const isLocked = isReadOnly || new Date() >= new Date(match.startTime) || isLive || isFinished;
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
    <div className={`p-4 border-2 rounded-3xl shadow-sm bg-white space-y-4 relative overflow-hidden transition-all ${isLocked ? 'bg-gray-50' : 'hover:border-stadium-green-400'} ${isLive ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${isLocked ? 'bg-gray-300' : 'bg-stadium-green-600'} ${isLive ? 'bg-red-500' : ''}`}></div>
      
      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-400 relative h-4">
        <div className="flex items-center gap-1">
          {isLive ? (
            <span className="flex items-center gap-1 text-red-600 animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
              AO VIVO
            </span>
          ) : (
            formattedDate && (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formattedDate}
              </>
            )
          )}
        </div>

        {points !== undefined && points !== null && isLocked && (
          <div className={`px-2 py-0.5 rounded-full font-black text-[9px] flex items-center gap-1 ${points > 0 ? 'bg-stadium-yellow text-stadium-green-900' : 'bg-gray-200 text-gray-400'}`}>
            {isLive && <span className="w-1 h-1 bg-stadium-green-900 rounded-full animate-pulse"></span>}
            {points} {points === 1 ? 'PONTO' : 'PONTOS'} {isLive && '(LIVE)'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-2 min-h-[100px]">
        {/* Home Team */}
        <div className="flex flex-col items-center justify-center text-center gap-1.5 min-w-0">
          <div className="w-10 h-7 sm:w-12 sm:h-8 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-100 shadow-xs">
            <img src={`https://flagcdn.com/w80/${getTeamFlagCode(match.homeTeam)}.png`} alt={match.homeTeam} className="w-full h-full object-cover" />
          </div>
          <div className="text-[10px] sm:text-[11px] font-black text-stadium-green-900 leading-tight uppercase tracking-tight truncate w-full px-1">
            {getTranslatedTeamName(match.homeTeam)}
          </div>
        </div>
        
        {/* Score Inputs with Adjusters */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Home Score */}
          <div className="flex flex-col items-center justify-center min-h-[80px]">
            {!isLocked && (
              <button 
                type="button"
                onClick={() => handleAdjust("home", 1)}
                className="w-10 h-6 flex items-center justify-center bg-gray-50 text-gray-400 rounded-t-lg hover:bg-stadium-green-100 hover:text-stadium-green-800 transition-all font-black text-xs border border-b-0 border-gray-100 shadow-xs"
              >
                ▲
              </button>
            )}
            <input
              type="number"
              disabled={isLocked}
              className={`w-10 h-10 border-x-2 border-gray-100 bg-white text-center text-xl font-black text-stadium-green-800 focus:outline-hidden disabled:bg-gray-50 disabled:text-gray-400 transition-all placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isLocked ? 'border-transparent' : ''}`}
              value={currentGuess.home}
              onChange={(e) => onGuessChange(e.target.value, currentGuess.away.toString())}
            />
            {!isLocked && (
              <button 
                type="button"
                onClick={() => handleAdjust("home", -1)}
                className="w-10 h-6 flex items-center justify-center bg-gray-50 text-gray-400 rounded-b-lg hover:bg-stadium-green-100 hover:text-stadium-green-800 transition-all font-black text-xs border border-t-0 border-gray-100 shadow-xs"
              >
                ▼
              </button>
            )}
          </div>

          <span className="text-gray-300 font-black text-[10px] sm:text-xs italic">X</span>

          {/* Away Score */}
          <div className="flex flex-col items-center justify-center min-h-[80px]">
            {!isLocked && (
              <button 
                type="button"
                onClick={() => handleAdjust("away", 1)}
                className="w-10 h-6 flex items-center justify-center bg-gray-50 text-gray-400 rounded-t-lg hover:bg-stadium-green-100 hover:text-stadium-green-800 transition-all font-black text-xs border border-b-0 border-gray-100 shadow-xs"
              >
                ▲
              </button>
            )}
            <input
              type="number"
              disabled={isLocked}
              className={`w-10 h-10 border-x-2 border-gray-100 bg-white text-center text-xl font-black text-stadium-green-800 focus:outline-hidden disabled:bg-gray-50 disabled:text-gray-400 transition-all placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isLocked ? 'border-transparent' : ''}`}
              value={currentGuess.away}
              onChange={(e) => onGuessChange(currentGuess.home.toString(), e.target.value)}
            />
            {!isLocked && (
              <button 
                type="button"
                onClick={() => handleAdjust("away", -1)}
                className="w-10 h-6 flex items-center justify-center bg-gray-50 text-gray-400 rounded-b-lg hover:bg-stadium-green-100 hover:text-stadium-green-800 transition-all font-black text-xs border border-t-0 border-gray-100 shadow-xs"
              >
                ▼
              </button>
            )}
          </div>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center justify-center text-center gap-1.5 min-w-0">
          <div className="w-10 h-7 sm:w-12 sm:h-8 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-100 shadow-xs">
            <img src={`https://flagcdn.com/w80/${getTeamFlagCode(match.awayTeam)}.png`} alt={match.awayTeam} className="w-full h-full object-cover" />
          </div>
          <div className="text-[10px] sm:text-[11px] font-black text-stadium-green-900 leading-tight uppercase tracking-tight truncate w-full px-1">
            {getTranslatedTeamName(match.awayTeam)}
          </div>
        </div>
      </div>
      
      {(isLive || isFinished) && match.homeScore !== null && (
        <div className={`${isLive ? 'bg-red-50 border-red-100' : 'bg-stadium-green-50 border-stadium-green-100'} p-2 rounded-xl border`}>
          <p className={`text-[9px] font-black uppercase tracking-widest text-center ${isLive ? 'text-red-700' : 'text-stadium-green-800'}`}>
            {isLive ? 'Placar ao Vivo:' : 'Placar Final:'} <span className="text-xs ml-1">{match.homeScore ?? "0"} x {match.awayScore ?? "0"}</span>
          </p>
        </div>
      )}
      
      {isLocked && trend && trend.total > 0 && (
        <div className={`pt-4 space-y-2 ${(isLive || isFinished) && match.homeScore !== null ? 'border-t border-gray-100 mt-2' : 'mt-4 border-t-2 border-gray-100'}`}>
            <h3 className="text-center text-[9px] font-black uppercase tracking-widest text-gray-400">
              Tendência da Comunidade ({trend.total} {trend.total > 1 ? 'Palpites' : 'Palpite'})
            </h3>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
              <div className="bg-blue-500 h-full" style={{ width: `${trend.home}%` }} title={`${getTranslatedTeamName(match.homeTeam)} Vence: ${trend.home}%`}></div>
              <div className="bg-gray-400 h-full" style={{ width: `${trend.tie}%` }} title={`Empate: ${trend.tie}%`}></div>
              <div className="bg-yellow-500 h-full" style={{ width: `${trend.away}%` }} title={`${getTranslatedTeamName(match.awayTeam)} Vence: ${trend.away}%`}></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-500">
              <span className="text-blue-600">{trend.home}% {getTranslatedTeamName(match.homeTeam)}</span>
              <span className="text-gray-600">{trend.tie}% Empate</span>
              <span className="text-yellow-600">{trend.away}% {getTranslatedTeamName(match.awayTeam)}</span>
            </div>
        </div>
      )}
    </div>
  );
}

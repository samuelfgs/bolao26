"use client";

import { useState, useEffect } from "react";

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

export const teamNameTranslations: Record<string, string> = {
  "Mexico": "México",
  "South Africa": "África do Sul",
  "South Korea": "Coreia do Sul",
  "Czechia": "Tchéquia",
  "Canada": "Canadá",
  "Bosnia-Herzegovina": "Bósnia e Herz.",
  "United States": "EUA",
  "Paraguay": "Paraguai",
  "Qatar": "Catar",
  "Switzerland": "Suíça",
  "Brazil": "Brasil",
  "Morocco": "Marrocos",
  "Haiti": "Haiti",
  "Scotland": "Escócia",
  "Australia": "Austrália",
  "Turkey": "Turquia",
  "Germany": "Alemanha",
  "Curaçao": "Curaçao",
  "Netherlands": "Holanda",
  "Japan": "Japão",
  "Ivory Coast": "Costa do Marfim",
  "Ecuador": "Equador",
  "Sweden": "Suécia",
  "Tunisia": "Tunísia",
  "Spain": "Espanha",
  "Cape Verde Islands": "Cabo Verde",
  "Belgium": "Bélgica",
  "Egypt": "Egito",
  "Saudi Arabia": "Arábia Saudita",
  "Uruguay": "Uruguai",
  "Iran": "Irã",
  "New Zealand": "Nova Zelândia",
  "France": "França",
  "Senegal": "Senegal",
  "Iraq": "Iraque",
  "Norway": "Noruega",
  "Argentina": "Argentina",
  "Algeria": "Argélia",
  "Austria": "Áustria",
  "Jordan": "Jordânia",
  "Portugal": "Portugal",
  "Congo DR": "RD Congo",
  "England": "Inglaterra",
  "Croatia": "Croácia",
  "Ghana": "Gana",
  "Panama": "Panamá",
  "Uzbekistan": "Uzbequistão",
  "Colombia": "Colômbia"
};

export const flagCodeMap: Record<string, string> = {
  "Mexico": "mx", "South Africa": "za", "South Korea": "kr", "Czechia": "cz",
  "Canada": "ca", "Bosnia-Herzegovina": "ba", "United States": "us", "Paraguay": "py",
  "Qatar": "qa", "Switzerland": "ch", "Brazil": "br", "Morocco": "ma",
  "Haiti": "ht", "Scotland": "gb-sct", "Australia": "au", "Turkey": "tr",
  "Germany": "de", "Curaçao": "cw", "Netherlands": "nl", "Japan": "jp",
  "Ivory Coast": "ci", "Ecuador": "ec", "Sweden": "se", "Tunisia": "tn",
  "Spain": "es", "Cape Verde Islands": "cv", "Belgium": "be", "Egypt": "eg",
  "Saudi Arabia": "sa", "Uruguay": "uy", "Iran": "ir", "New Zealand": "nz",
  "France": "fr", "Senegal": "sn", "Iraq": "iq", "Norway": "no",
  "Argentina": "ar", "Algeria": "dz", "Austria": "at", "Jordan": "jo",
  "Portugal": "pt", "Congo DR": "cd", "England": "gb-eng", "Croatia": "hr",
  "Ghana": "gh", "Panama": "pa", "Uzbekistan": "uz", "Colombia": "co"
};

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

  const getFlagUrl = (teamName: string) => {
    const code = flagCodeMap[teamName] || "un";
    return `https://flagcdn.com/w80/${code}.png`;
  };

  const translateTeam = (name: string) => teamNameTranslations[name] || name;

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
            <img src={getFlagUrl(match.homeTeam)} alt={match.homeTeam} className="w-full h-full object-cover" />
          </div>
          <div className="text-[10px] sm:text-[11px] font-black text-stadium-green-900 leading-tight uppercase tracking-tight text-center truncate w-full px-1">
            {translateTeam(match.homeTeam)}
          </div>
        </div>
        
        {/* Score Inputs with Adjusters */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Home Score */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button 
              type="button"
              disabled={isLocked}
              onClick={() => handleAdjust("home", -1)}
              className="w-6 h-8 flex items-center justify-center bg-white text-gray-400 rounded-lg hover:text-stadium-green-800 disabled:opacity-0 transition-all font-black text-xs border border-gray-100 shadow-xs"
            >
              -
            </button>
            <input
              type="number"
              disabled={isLocked}
              className="w-8 h-8 bg-transparent text-center text-lg font-black text-stadium-green-800 focus:outline-hidden disabled:text-gray-400 transition-all placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={currentGuess.home}
              onChange={(e) => onGuessChange(e.target.value, currentGuess.away.toString())}
            />
            <button 
              type="button"
              disabled={isLocked}
              onClick={() => handleAdjust("home", 1)}
              className="w-6 h-8 flex items-center justify-center bg-white text-gray-400 rounded-lg hover:text-stadium-green-800 disabled:opacity-0 transition-all font-black text-xs border border-gray-100 shadow-xs"
            >
              +
            </button>
          </div>

          <span className="text-gray-300 font-black text-[10px] italic">X</span>

          {/* Away Score */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button 
              type="button"
              disabled={isLocked}
              onClick={() => handleAdjust("away", -1)}
              className="w-6 h-8 flex items-center justify-center bg-white text-gray-400 rounded-lg hover:text-stadium-green-800 disabled:opacity-0 transition-all font-black text-xs border border-gray-100 shadow-xs"
            >
              -
            </button>
            <input
              type="number"
              disabled={isLocked}
              className="w-8 h-8 bg-transparent text-center text-lg font-black text-stadium-green-800 focus:outline-hidden disabled:text-gray-400 transition-all placeholder:text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={currentGuess.away}
              onChange={(e) => onGuessChange(currentGuess.home.toString(), e.target.value)}
            />
            <button 
              type="button"
              disabled={isLocked}
              onClick={() => handleAdjust("away", 1)}
              className="w-6 h-8 flex items-center justify-center bg-white text-gray-400 rounded-lg hover:text-stadium-green-800 disabled:opacity-0 transition-all font-black text-xs border border-gray-100 shadow-xs"
            >
              +
            </button>
          </div>
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
          <div className="w-10 h-7 sm:w-12 sm:h-8 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-100 shadow-xs shrink-0">
            <img src={getFlagUrl(match.awayTeam)} alt={match.awayTeam} className="w-full h-full object-cover" />
          </div>
          <div className="text-[10px] sm:text-[11px] font-black text-stadium-green-900 leading-tight uppercase tracking-tight text-center truncate w-full px-1">
            {translateTeam(match.awayTeam)}
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

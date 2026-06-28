"use client";

import { useState, useEffect } from "react";
import { getTeamFlagCode, getTranslatedTeamName, getTranslatedStageName } from "@/lib/constants";
import { getMatchGuesses } from "@/lib/actions/pool";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"; // Wait, I might need to create this too or just use a div

interface MatchCardProps {
  poolId: string;
  match: {
    id: string;
    apiId: number | null;
    homeTeam: string;
    awayTeam: string;
    startTime: Date;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
    stage: string;
  };
  currentGuess: { home: string | number; away: string | number };
  onGuessChange: (home: string, away: string) => void;
  isReadOnly?: boolean;
  points?: number | null;
  isSaved?: boolean;
  isDraft?: boolean;
  trend?: {
    total: number;
    home: number;
    tie: number;
    away: number;
  };
}

export function MatchCard({ 
  poolId,
  match, 
  currentGuess, 
  onGuessChange, 
  isReadOnly = false, 
  points, 
  isSaved = false, 
  isDraft = false,
  trend 
}: MatchCardProps) {
  const isMock = match.id.startsWith("mock-");
  const isHomeReal = !isMock && match.homeTeam && getTeamFlagCode(match.homeTeam) !== "un";
  const isAwayReal = !isMock && match.awayTeam && getTeamFlagCode(match.awayTeam) !== "un";
  
  const homeTeamDisplayName = isHomeReal ? getTranslatedTeamName(match.homeTeam) : "TBD";
  const awayTeamDisplayName = isAwayReal ? getTranslatedTeamName(match.awayTeam) : "TBD";

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const isLocked = isReadOnly || new Date() >= new Date(match.startTime) || isLive || isFinished || !isHomeReal || !isAwayReal;
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [allGuesses, setAllGuesses] = useState<any[]>([]);
  const [loadingGuesses, setLoadingGuesses] = useState(false);

  const mockIndex = isMock ? parseInt(match.id.split("-").pop() || "0") + 1 : 0;
  const mockLabel = isMock ? (match.stage === "final" ? (mockIndex === 1 ? "Disputa de 3º Lugar" : "Final") : `${getTranslatedStageName(match.stage)} #${mockIndex}`) : "";


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

  const fetchGuesses = async () => {
    setLoadingGuesses(true);
    try {
      const data = await getMatchGuesses(poolId, match.id);
      setAllGuesses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingGuesses(false);
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
          ) : isMock ? (
            <span className="text-stadium-green-700 font-black">
              {mockLabel}
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
          <div className={`px-2 py-0.5 rounded-full font-black text-[9px] flex items-center gap-1 ${
            points === 3
              ? 'bg-green-100 text-green-800'
              : points === 1
                ? 'bg-yellow-100 text-yellow-800'
                : points === 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-200 text-gray-400'
          }`}>
            {isLive && <span className={`w-1 h-1 rounded-full animate-pulse ${
              points === 3 ? 'bg-green-800' : points === 1 ? 'bg-yellow-800' : 'bg-red-700'
            }`}></span>}
            {points} {points === 1 ? 'PONTO' : 'PONTOS'} {isLive && '(LIVE)'}
          </div>
        )}

        {!isLocked && isSaved && (
          <div className="px-2 py-0.5 rounded-full font-black text-[9px] bg-stadium-green-100 text-stadium-green-800 flex items-center gap-1 border border-stadium-green-200">
            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
            SALVO
          </div>
        )}

        {!isLocked && !isSaved && isDraft && (
          <div className="px-2 py-0.5 rounded-full font-black text-[9px] bg-orange-100 text-orange-700 flex items-center gap-1 border border-orange-200">
            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            RASCUNHO
          </div>
        )}

        {!isLocked && !isSaved && !isDraft && (
          <div className="px-2 py-0.5 rounded-full font-black text-[9px] bg-red-100 text-red-700 flex items-center gap-1 border border-red-200 animate-pulse">
            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            PENDENTE
          </div>
        )}

        {isLocked && (!isHomeReal || !isAwayReal) && (
          <div className="px-2 py-0.5 rounded-full font-black text-[9px] bg-gray-100 text-gray-500 flex items-center gap-1 border border-gray-200">
            <svg className="w-2 h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            AGUARDANDO TIMES
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-2 min-h-[100px]">
        {/* Home Team */}
        <div className="flex flex-col items-center justify-center text-center gap-1.5 min-w-0">
          <div className="w-10 h-7 sm:w-12 sm:h-8 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-100 shadow-xs flex items-center justify-center shrink-0">
            {isHomeReal ? (
              <img src={`https://flagcdn.com/w80/${getTeamFlagCode(match.homeTeam)}.png`} alt={match.homeTeam} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 text-gray-400 font-black text-xs flex items-center justify-center">?</div>
            )}
          </div>
          <div className="text-[10px] sm:text-[11px] font-black text-stadium-green-900 leading-tight uppercase tracking-tight truncate w-full px-1">
            {homeTeamDisplayName}
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
          <div className="w-10 h-7 sm:w-12 sm:h-8 relative bg-gray-100 rounded-lg overflow-hidden border border-gray-100 shadow-xs flex items-center justify-center shrink-0">
            {isAwayReal ? (
              <img src={`https://flagcdn.com/w80/${getTeamFlagCode(match.awayTeam)}.png`} alt={match.awayTeam} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 text-gray-400 font-black text-xs flex items-center justify-center">?</div>
            )}
          </div>
          <div className="text-[10px] sm:text-[11px] font-black text-stadium-green-900 leading-tight uppercase tracking-tight truncate w-full px-1">
            {awayTeamDisplayName}
          </div>
        </div>
      </div>
      
      {(isLive || isFinished) && match.homeScore !== null && (
        <div className={`p-2 rounded-xl border ${
          points === 3
            ? 'bg-green-50 border-green-100'
            : points === 1
              ? 'bg-yellow-50 border-yellow-100'
              : points === 0
                ? 'bg-red-50 border-red-100'
                : 'bg-stadium-green-50 border-stadium-green-100'
        }`}>
          <p className={`text-[9px] font-black uppercase tracking-widest text-center ${
            points === 3
              ? 'text-green-800'
              : points === 1
                ? 'text-yellow-800'
                : points === 0
                  ? 'text-red-700'
                  : 'text-stadium-green-800'
          }`}>
            {isLive ? 'Placar ao Vivo:' : 'Placar Final:'} <span className="text-xs ml-1">{match.homeScore ?? "0"} x {match.awayScore ?? "0"}</span>
          </p>
        </div>
      )}
      
      {isLocked && trend && trend.total > 0 && (
        <div className={`pt-4 space-y-3 ${(isLive || isFinished) && match.homeScore !== null ? 'border-t border-gray-100 mt-2' : 'mt-4 border-t-2 border-gray-100'}`}>
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

            <Dialog>
              <DialogTrigger asChild>
                <button 
                  onClick={fetchGuesses}
                  className="w-full mt-2 py-2 border-2 border-stadium-green-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-stadium-green-700 hover:bg-stadium-green-50 hover:border-stadium-green-200 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver todos palpites
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader className="space-y-4 items-center">
                  <DialogTitle className="text-xl font-black text-stadium-green-900 uppercase italic tracking-tighter text-center">
                    Todos os Palpites
                  </DialogTitle>
                  
                  <div className="space-y-3 flex flex-col items-center w-full">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-5 relative bg-gray-100 rounded-md overflow-hidden border border-gray-100 shadow-xs">
                          <img src={`https://flagcdn.com/w80/${getTeamFlagCode(match.homeTeam)}.png`} alt={match.homeTeam} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-stadium-green-900 uppercase italic tracking-tighter">
                          {getTranslatedTeamName(match.homeTeam)}
                        </span>
                      </div>
                      <span className="text-gray-300 font-black text-[10px] italic">X</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-stadium-green-900 uppercase italic tracking-tighter">
                          {getTranslatedTeamName(match.awayTeam)}
                        </span>
                        <div className="w-8 h-5 relative bg-gray-100 rounded-md overflow-hidden border border-gray-100 shadow-xs">
                          <img src={`https://flagcdn.com/w80/${getTeamFlagCode(match.awayTeam)}.png`} alt={match.awayTeam} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>

                    {(isLive || isFinished) && match.homeScore !== null && (
                      <div className={`p-2 rounded-xl border inline-block ${
                        isLive ? 'bg-red-50 border-red-100' : 'bg-stadium-green-50 border-stadium-green-100'
                      }`}>
                        <p className={`text-[9px] font-black uppercase tracking-widest text-center ${
                          isLive ? 'text-red-700' : 'text-stadium-green-800'
                        }`}>
                          {isLive ? 'Placar ao Vivo:' : 'Placar Final:'} <span className="text-xs ml-1">{match.homeScore} x {match.awayScore}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </DialogHeader>
                <ScrollArea className="h-[400px] w-full pr-4">
                  {loadingGuesses ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-stadium-green-600 border-t-transparent animate-spin rounded-full"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Carregando palpites...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4 w-full min-w-0">
                      {allGuesses.length > 0 ? allGuesses.map((g, i) => (
                        <div key={i} className={`grid grid-cols-[1fr_auto] items-center p-3 rounded-2xl border gap-4 w-full min-w-0 ${
                          g.points === 3 
                            ? 'bg-green-100 border-green-200' 
                            : g.points === 1 
                              ? 'bg-yellow-100 border-yellow-200' 
                              : 'bg-red-50 border-red-100'
                        }`}>
                          <span className={`text-xs font-black uppercase truncate min-w-0 block ${
                            g.points === 3 
                              ? 'text-green-900' 
                              : g.points === 1 
                                ? 'text-yellow-900' 
                                : 'text-red-900'
                          }`}>
                            {g.userNickname || (g.userName || "Usuário").split(' ')[0]}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                             <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 shrink-0 ${
                               g.points === 3 
                                 ? 'bg-white border-green-200' 
                                 : g.points === 1 
                                   ? 'bg-white border-yellow-200' 
                                   : 'bg-white border-red-100'
                             }`}>
                                <span className="text-sm font-black text-stadium-green-800">{g.homeGuess}</span>
                                <span className="text-[10px] font-black text-gray-300">X</span>
                                <span className="text-sm font-black text-stadium-green-800">{g.awayGuess}</span>
                             </div>
                          </div>
                        </div>
                      )) : (
                        <p className="text-center py-8 text-xs font-medium text-gray-400">Nenhum palpite registrado para este jogo.</p>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
        </div>
      )}
    </div>
  );
}

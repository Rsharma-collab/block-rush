import React from 'react';
import { RotateCcw, Home, Trophy, Zap, Mountain, Flame } from 'lucide-react';
import { HighScoreRecord, PlayerStats } from '../types';

interface GameOverModalProps {
  stats: PlayerStats;
  highScore: HighScoreRecord | null;
  isNewRecord: boolean;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  isNewRecord,
  onPlayAgain,
  onMainMenu,
}) => {
  const distanceKm = (stats.distance / 1000).toFixed(2);

  return (
    <div id="game-over-modal" className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-30 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-stone-900/95 border-2 border-stone-700 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center text-center">
        {/* Header */}
        <div className="relative mb-2">
          {isNewRecord && (
            <div className="mb-2 px-3.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-full shadow-lg animate-bounce inline-block">
              ⭐ NEW PERSONAL RECORD! ⭐
            </div>
          )}
          <h2 className="text-4xl sm:text-5xl font-black text-red-500 tracking-wider font-mono drop-shadow-[0_4px_10px_rgba(239,68,68,0.5)]">
            RUN OVER!
          </h2>
        </div>

        {/* Final Score Hero */}
        <div className="w-full my-4 p-4 bg-stone-950/80 rounded-2xl border border-stone-800 flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">FINAL SCORE</span>
          <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-wider tabular-nums my-1">
            {stats.score.toLocaleString()}
          </span>
          {highScore && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300/80 mt-1 font-mono">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>ALL-TIME BEST: {highScore.score.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Detailed Run Statistics */}
        <div className="w-full grid grid-cols-2 gap-2.5 my-2">
          {/* Distance */}
          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-semibold mb-1">
              <Mountain className="w-3.5 h-3.5 text-sky-400" />
              <span>DISTANCE</span>
            </div>
            <span className="text-lg font-black text-white font-mono">{distanceKm} KM</span>
          </div>

          {/* G-Cores */}
          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-semibold mb-1">
              <span className="text-xs">💎</span>
              <span>G-CORES</span>
            </div>
            <span className="text-lg font-black text-cyan-300 font-mono">{stats.gCores}</span>
          </div>

          {/* Highest Combo */}
          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>MAX COMBO</span>
            </div>
            <span className="text-lg font-black text-amber-300 font-mono">×{stats.maxCombo}</span>
          </div>

          {/* Events Survived */}
          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/60 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-semibold mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>EVENTS CLEARED</span>
            </div>
            <span className="text-lg font-black text-orange-300 font-mono">{stats.eventsSurvived}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-4">
          <button
            id="btn-play-again"
            onClick={onPlayAgain}
            className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-base rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            id="btn-gameover-menu"
            onClick={onMainMenu}
            className="py-3.5 px-6 bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-stone-200 font-bold text-base rounded-xl border border-stone-600 shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};

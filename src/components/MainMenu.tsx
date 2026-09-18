import React from 'react';
import { Play, Trophy, Settings, HelpCircle, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { HighScoreRecord } from '../types';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenHighScores: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  highScore: HighScoreRecord | null;
  soundEnabled: boolean;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenHighScores,
  onOpenSettings,
  onOpenHowToPlay,
  highScore,
  soundEnabled,
  onToggleMute,
}) => {
  return (
    <div id="main-menu-overlay" className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 pointer-events-auto select-none z-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Version Badge */}
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-cyan-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>VOXEL ENDLESS RUNNER</span>
        </div>

        {/* Quick Audio Mute & Settings */}
        <div className="flex items-center gap-2">
          <button
            id="btn-menu-mute"
            onClick={onToggleMute}
            className="p-2.5 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-xl border border-white/15 text-white/90 transition-transform active:scale-95 cursor-pointer"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </button>
          <button
            id="btn-menu-settings"
            onClick={onOpenSettings}
            className="p-2.5 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-xl border border-white/15 text-white/90 transition-transform active:scale-95 cursor-pointer"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Branding & Action */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        {/* Stylized Voxel Title */}
        <div className="relative inline-block mb-2">
          <h1
            id="app-title"
            className="text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-orange-600 tracking-wider drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] uppercase font-mono"
            style={{
              textShadow: '0 4px 0 #78350f, 0 8px 0 #451a03, 0 12px 20px rgba(0,0,0,0.8)',
            }}
          >
            BLOCK RUSH
          </h1>
        </div>

        {/* Subtitle */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-0.5 w-8 bg-gradient-to-r from-transparent to-amber-400" />
          <p className="text-sm sm:text-lg font-black tracking-[0.25em] text-white/90 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            RUN. BUILD. SURVIVE.
          </p>
          <div className="h-0.5 w-8 bg-gradient-to-l from-transparent to-amber-400" />
        </div>

        {/* High Score Preview Pill */}
        {highScore && (
          <div className="mb-6 bg-black/60 backdrop-blur-md px-5 py-2 rounded-2xl border border-amber-500/40 shadow-xl flex items-center gap-3">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-white/70">BEST SCORE:</span>
              <span className="font-mono font-black text-amber-300 text-base">{highScore.score.toLocaleString()}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/70">{(highScore.distance / 1000).toFixed(2)} KM</span>
            </div>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {/* PLAY BUTTON */}
          <button
            id="btn-play-game"
            onClick={onStartGame}
            className="w-full py-4 px-8 bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-700 hover:from-emerald-300 hover:to-green-600 text-white font-black text-xl rounded-2xl shadow-[0_6px_0_#065f46,0_12px_24px_rgba(0,0,0,0.6)] active:translate-y-1 active:shadow-[0_2px_0_#065f46] transition-all flex items-center justify-center gap-3 cursor-pointer border-t border-white/30"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>PLAY</span>
          </button>

          {/* Secondary Buttons Grid */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              id="btn-high-scores"
              onClick={onOpenHighScores}
              className="py-3 px-4 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl border border-white/15 text-white/90 font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>RECORDS</span>
            </button>

            <button
              id="btn-how-to-play"
              onClick={onOpenHowToPlay}
              className="py-3 px-4 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl border border-white/15 text-white/90 font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>GUIDE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-xs text-white/60 font-mono">
        <span className="hidden sm:inline">Use [A/D] or [Arrows] to switch lanes • [Space] Jump • [Down] Slide • [E] Build Bridge</span>
        <span className="sm:hidden">Swipe or use touch controls to jump, slide, switch lanes and build!</span>
      </div>
    </div>
  );
};

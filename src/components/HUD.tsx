import React from 'react';
import { BiomeType, PlayerStats, WorldEventType } from '../types';
import { Shield, Zap, Magnet, Feather, Pause, Hammer } from 'lucide-react';
import { GAME_CONSTANTS } from '../game/constants';

interface HUDProps {
  stats: PlayerStats;
  biome: BiomeType;
  event: WorldEventType;
  comboMultiplier: number;
  onPause: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  onBuild: () => void;
  touchControlsVisible: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  biome,
  event,
  comboMultiplier,
  onPause,
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
  onBuild,
  touchControlsVisible,
}) => {
  const distanceKm = (stats.distance / 1000).toFixed(2);

  // Biome name display
  const biomeNames: Record<BiomeType, string> = {
    FOREST: '🌲 FOREST',
    MOUNTAINS: '🏔️ MOUNTAINS',
    CAVE: '🪨 DEEP CAVE',
    LAVA_ZONE: '🌋 LAVA ZONE',
    NIGHT_FOREST: '🌙 NIGHT FOREST',
  };

  return (
    <div id="game-hud" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 select-none z-10">
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Health & Biome */}
        <div className="flex flex-col gap-2">
          {/* Health Hearts */}
          <div id="hud-health" className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-lg pointer-events-auto">
            {Array.from({ length: stats.maxHealth }).map((_, i) => (
              <span
                key={i}
                className={`text-2xl transition-transform duration-200 ${
                  i < stats.health ? 'scale-100 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'scale-90 opacity-25 grayscale'
                }`}
              >
                ❤️
              </span>
            ))}
            {stats.hasShield && (
              <span className="ml-1.5 px-2 py-0.5 bg-sky-500/30 border border-sky-400 text-sky-200 text-xs font-bold rounded-md flex items-center gap-1 animate-pulse">
                <Shield className="w-3.5 h-3.5 text-sky-400" /> SHIELD
              </span>
            )}
          </div>

          {/* Biome Indicator */}
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10 text-xs font-semibold text-white/80 self-start">
            {biomeNames[biome]}
          </div>
        </div>

        {/* Top-Center: Score & Distance & Combo */}
        <div className="flex flex-col items-center">
          <div id="hud-score" className="bg-black/70 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/15 shadow-2xl flex flex-col items-center text-center">
            <span className="text-xs tracking-widest text-emerald-400 font-bold uppercase">SCORE</span>
            <span className="text-3xl sm:text-4xl font-black text-white tracking-wider tabular-nums font-mono drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {stats.score.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-white/70 font-mono tracking-wide">
              DISTANCE: {distanceKm} KM
            </span>
          </div>

          {/* Combo Multiplier Badge */}
          {comboMultiplier > 1 && (
            <div
              id="hud-combo"
              className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-sm sm:text-base px-4 py-1 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.7)] border-2 border-yellow-200 animate-bounce"
            >
              ⚡ COMBO ×{comboMultiplier}
            </div>
          )}
        </div>

        {/* Top-Right: G-Cores, Blocks, Pause */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            {/* G-Cores */}
            <div id="hud-gcores" className="bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/40 shadow-lg flex items-center gap-2">
              <span className="text-xl filter drop-shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse">💎</span>
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold">G-CORES</span>
                <span className="text-lg font-black text-cyan-100 font-mono leading-none">{stats.gCores}</span>
              </div>
            </div>

            {/* Blocks Resource */}
            <div id="hud-blocks" className="bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-500/40 shadow-lg flex items-center gap-2">
              <span className="text-xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">🧱</span>
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">BLOCKS</span>
                <span className="text-lg font-black text-amber-100 font-mono leading-none">
                  {stats.blocks}/{GAME_CONSTANTS.MAX_BLOCKS}
                </span>
              </div>
            </div>

            {/* Pause Button */}
            <button
              id="btn-pause-game"
              onClick={onPause}
              className="p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl border border-white/15 text-white/90 transition-transform active:scale-95 shadow-md cursor-pointer"
              title="Pause Game (ESC / P)"
            >
              <Pause className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Center Event Banner Notifications */}
      {event !== 'NONE' && (
        <div className="self-center my-auto pointer-events-none animate-pulse">
          {event === 'NIGHT_SHIFT' && (
            <div className="bg-indigo-950/90 border-2 border-indigo-400 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.6)] text-center backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black text-indigo-200 tracking-wider">🌙 NIGHT SHIFT ACTIVE</div>
              <div className="text-xs text-indigo-300">Visibility reduced • Obstacles increased</div>
            </div>
          )}
          {event === 'LAVA_RUSH' && (
            <div className="bg-red-950/90 border-2 border-red-500 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.8)] text-center backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black text-red-200 tracking-wider">🌋 LAVA RUSH!</div>
              <div className="text-xs text-red-300">Molten surge behind! Maintain speed!</div>
            </div>
          )}
          {event === 'REDSTONE_STORM' && (
            <div className="bg-fuchsia-950/90 border-2 border-fuchsia-400 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(217,70,239,0.7)] text-center backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black text-fuchsia-200 tracking-wider">⚡ REDSTONE STORM!</div>
              <div className="text-xs text-fuchsia-300">Hazardous energy surges across the track!</div>
            </div>
          )}
          {event === 'G_CORE_RUSH' && (
            <div className="bg-teal-950/90 border-2 border-teal-400 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(20,184,166,0.8)] text-center backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black text-teal-200 tracking-wider">💎 G-CORE RUSH!</div>
              <div className="text-xs text-teal-300">Massive collectible showers! Grab as many as you can!</div>
            </div>
          )}
        </div>
      )}

      {/* Block Builder Gap Warning Prompt */}
      {stats.upcomingGapLane !== null && (
        <div className="self-center mb-4 pointer-events-auto">
          <div
            onClick={onBuild}
            className={`px-5 py-2.5 rounded-2xl border-2 flex items-center gap-3 backdrop-blur-md shadow-2xl cursor-pointer transition-all transform active:scale-95 ${
              stats.isBuildingAvailable
                ? 'bg-amber-600/90 hover:bg-amber-500 border-yellow-300 text-white animate-bounce'
                : 'bg-red-900/80 border-red-500 text-red-200'
            }`}
          >
            <span className="text-2xl">⚠️</span>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider uppercase">
                {stats.isBuildingAvailable ? 'GAP AHEAD! PRESS [E] TO BUILD BRIDGE' : 'GAP AHEAD! NEED 4 BLOCKS! SWITCH LANES!'}
              </span>
              <span className="text-xs opacity-80">
                {stats.isBuildingAvailable
                  ? `Uses ${GAME_CONSTANTS.BLOCKS_PER_BRIDGE} blocks (${stats.blocks} available)`
                  : `Current blocks: ${stats.blocks}/${GAME_CONSTANTS.BLOCKS_PER_BRIDGE}`}
              </span>
            </div>
            {stats.isBuildingAvailable && (
              <button
                id="btn-hud-build"
                onClick={onBuild}
                className="px-3 py-1 bg-yellow-400 text-black font-black text-xs rounded-lg shadow uppercase"
              >
                Build [E]
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Bar: Power-up Timers & Touch Controls */}
      <div className="flex flex-col gap-3">
        {/* Active Power-Ups Row */}
        <div className="flex items-center justify-center gap-3">
          {stats.activePowerUps.REDSTONE_BOOST > 0 && (
            <div className="bg-red-950/80 border border-red-500 px-3 py-1.5 rounded-xl flex items-center gap-2 text-red-200 shadow-md backdrop-blur-sm">
              <Zap className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-xs font-bold">REDSTONE</span>
              <span className="text-xs font-mono font-bold text-white">
                {stats.activePowerUps.REDSTONE_BOOST.toFixed(1)}s
              </span>
            </div>
          )}

          {stats.activePowerUps.MAGNET > 0 && (
            <div className="bg-purple-950/80 border border-purple-500 px-3 py-1.5 rounded-xl flex items-center gap-2 text-purple-200 shadow-md backdrop-blur-sm">
              <Magnet className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-xs font-bold">MAGNET</span>
              <span className="text-xs font-mono font-bold text-white">
                {stats.activePowerUps.MAGNET.toFixed(1)}s
              </span>
            </div>
          )}

          {stats.activePowerUps.ELYTRA > 0 && (
            <div className="bg-amber-950/80 border border-amber-500 px-3 py-1.5 rounded-xl flex items-center gap-2 text-amber-200 shadow-md backdrop-blur-sm">
              <Feather className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-bold">ELYTRA</span>
              <span className="text-xs font-mono font-bold text-white">
                {stats.activePowerUps.ELYTRA.toFixed(1)}s
              </span>
            </div>
          )}
        </div>

        {/* Mobile On-Screen Touch Controls (shown on small screens or when enabled) */}
        {touchControlsVisible && (
          <div className="w-full flex items-center justify-between pointer-events-auto px-2 pb-2">
            {/* Left/Right Directional Buttons */}
            <div className="flex items-center gap-3">
              <button
                id="btn-touch-left"
                onClick={onMoveLeft}
                className="w-14 h-14 bg-black/60 hover:bg-black/80 active:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
              >
                ◀
              </button>
              <button
                id="btn-touch-right"
                onClick={onMoveRight}
                className="w-14 h-14 bg-black/60 hover:bg-black/80 active:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
              >
                ▶
              </button>
            </div>

            {/* Build Button */}
            <button
              id="btn-touch-build"
              onClick={onBuild}
              disabled={stats.blocks < GAME_CONSTANTS.BLOCKS_PER_BRIDGE}
              className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer ${
                stats.blocks >= GAME_CONSTANTS.BLOCKS_PER_BRIDGE
                  ? 'bg-amber-600 border-yellow-300 text-white'
                  : 'bg-black/40 border-white/10 text-white/30'
              }`}
            >
              <Hammer className="w-5 h-5" />
              <span className="text-[9px] font-bold">BUILD [E]</span>
            </button>

            {/* Jump & Slide Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                id="btn-touch-slide"
                onClick={onSlide}
                className="w-14 h-14 bg-blue-600/80 hover:bg-blue-500 active:bg-blue-400 backdrop-blur-md rounded-2xl border border-blue-300/40 text-white font-black text-xs flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
              >
                <span>▼</span>
                <span className="text-[10px]">SLIDE</span>
              </button>
              <button
                id="btn-touch-jump"
                onClick={onJump}
                className="w-14 h-14 bg-emerald-600/80 hover:bg-emerald-500 active:bg-emerald-400 backdrop-blur-md rounded-2xl border border-emerald-300/40 text-white font-black text-xs flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
              >
                <span>▲</span>
                <span className="text-[10px]">JUMP</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

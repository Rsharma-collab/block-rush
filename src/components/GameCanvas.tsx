import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { BiomeType, GameSettings, GameState, PlayerStats, WorldEventType } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  settings: GameSettings;
  onStatsUpdate: (stats: PlayerStats, biome: BiomeType, event: WorldEventType) => void;
  onGameOver: (finalStats: PlayerStats) => void;
  onPause: () => void;
  engineRef: React.MutableRefObject<GameEngine | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  settings,
  onStatsUpdate,
  onGameOver,
  onPause,
  engineRef,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Swipe detection coordinates
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize GameEngine
    const engine = new GameEngine(
      containerRef.current,
      settings,
      onStatsUpdate,
      onGameOver
    );
    engineRef.current = engine;

    // Keyboard listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid handling if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const code = e.code;

      if (code === 'Escape' || code === 'KeyP') {
        e.preventDefault();
        onPause();
        return;
      }

      if (engine.state !== 'PLAYING') return;

      if (code === 'KeyA' || code === 'ArrowLeft') {
        e.preventDefault();
        engine.moveLeft();
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        e.preventDefault();
        engine.moveRight();
      } else if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') {
        e.preventDefault();
        engine.jump();
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        e.preventDefault();
        engine.slide();
      } else if (code === 'KeyE') {
        e.preventDefault();
        engine.activateBlockBuilder();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync settings when changed
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateSettings(settings);
    }
  }, [settings]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current || e.changedTouches.length === 0) return;
    const start = touchStartPos.current;
    const end = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now(),
    };

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const elapsed = end.time - start.time;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    const engine = engineRef.current;
    if (!engine || engine.state !== 'PLAYING') return;

    // Minimum swipe threshold
    if (absDx > 35 || absDy > 35) {
      if (absDx > absDy) {
        // Horizontal swipe
        if (dx > 0) {
          engine.moveRight();
        } else {
          engine.moveLeft();
        }
      } else {
        // Vertical swipe
        if (dy < 0) {
          engine.jump();
        } else {
          engine.slide();
        }
      }
    } else if (elapsed < 250) {
      // Tap detected: if building is available, activate block builder!
      if (engine.stats.isBuildingAvailable) {
        engine.activateBlockBuilder();
      }
    }

    touchStartPos.current = null;
  };

  return (
    <div
      id="game-canvas-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full overflow-hidden bg-stone-950 select-none cursor-grab active:cursor-grabbing"
    />
  );
};

import { useState, useRef, useEffect, useCallback } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { HighScoreModal } from './components/HighScoreModal';
import { BiomeType, GameSettings, GameState, HighScoreRecord, PlayerStats, WorldEventType } from './types';
import { GameEngine } from './game/GameEngine';
import { sound } from './audio/SoundSystem';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  HIGH_SCORES: 'block_rush_high_scores_v1',
  SETTINGS: 'block_rush_settings_v1',
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.7,
  musicVolume: 0.4,
  touchControlsVisible: true,
  shadowsEnabled: true,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [highScores, setHighScores] = useState<HighScoreRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentStats, setCurrentStats] = useState<PlayerStats>({
    score: 0,
    distance: 0,
    gCores: 0,
    blocks: 6,
    health: 3,
    maxHealth: 3,
    combo: 1,
    maxCombo: 1,
    eventsSurvived: 0,
    activePowerUps: {
      SHIELD: 0,
      REDSTONE_BOOST: 0,
      MAGNET: 0,
      ELYTRA: 0,
    },
    hasShield: false,
    isBuildingAvailable: false,
    upcomingGapLane: null,
  });

  const [currentBiome, setCurrentBiome] = useState<BiomeType>('FOREST');
  const [currentEvent, setCurrentEvent] = useState<WorldEventType>('NONE');
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Modals
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showHighScores, setShowHighScores] = useState<boolean>(false);

  const engineRef = useRef<GameEngine | null>(null);

  // Save settings on update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Handle stats update from GameEngine
  const handleStatsUpdate = useCallback((stats: PlayerStats, biome: BiomeType, event: WorldEventType) => {
    setCurrentStats({ ...stats });
    setCurrentBiome(biome);
    setCurrentEvent(event);
  }, []);

  // Handle game over
  const handleGameOver = useCallback((finalStats: PlayerStats) => {
    setGameState('GAME_OVER');

    // Check if new record
    const bestScore = highScores.length > 0 ? highScores[0].score : 0;
    const isNewBest = finalStats.score > bestScore;
    setIsNewRecord(isNewBest);

    if (isNewBest) {
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
    }

    // Save record
    const newRecord: HighScoreRecord = {
      score: finalStats.score,
      distance: finalStats.distance,
      gCores: finalStats.gCores,
      maxCombo: finalStats.maxCombo,
      date: new Date().toISOString(),
    };

    const updated = [...highScores, newRecord]
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    setHighScores(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(updated));
    } catch {}
  }, [highScores]);

  // Actions
  const handleStartGame = () => {
    setIsNewRecord(false);
    setGameState('PLAYING');
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handlePause = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
      if (engineRef.current) {
        engineRef.current.pauseGame();
      }
    }
  };

  const handleResume = () => {
    if (gameState === 'PAUSED') {
      setGameState('PLAYING');
      if (engineRef.current) {
        engineRef.current.resumeGame();
      }
    }
  };

  const handleRestart = () => {
    setIsNewRecord(false);
    setGameState('PLAYING');
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleMainMenu = () => {
    setGameState('MENU');
    if (engineRef.current) {
      engineRef.current.returnToMenu();
    }
  };

  const handleToggleMute = () => {
    const newSoundState = !settings.soundEnabled;
    setSettings((prev) => ({
      ...prev,
      soundEnabled: newSoundState,
      musicEnabled: newSoundState,
    }));
  };

  const handleClearRecords = () => {
    setHighScores([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.HIGH_SCORES);
    } catch {}
  };

  const bestHighScore = highScores.length > 0 ? highScores[0] : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans text-white select-none">
      {/* 3D Three.js WebGL Canvas */}
      <GameCanvas
        gameState={gameState}
        settings={settings}
        onStatsUpdate={handleStatsUpdate}
        onGameOver={handleGameOver}
        onPause={handlePause}
        engineRef={engineRef}
      />

      {/* In-Game HUD (visible during play and pause) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <HUD
          stats={currentStats}
          biome={currentBiome}
          event={currentEvent}
          comboMultiplier={engineRef.current ? engineRef.current.getComboMultiplier() : 1}
          onPause={handlePause}
          onMoveLeft={() => engineRef.current?.moveLeft()}
          onMoveRight={() => engineRef.current?.moveRight()}
          onJump={() => engineRef.current?.jump()}
          onSlide={() => engineRef.current?.slide()}
          onBuild={() => engineRef.current?.activateBlockBuilder()}
          touchControlsVisible={settings.touchControlsVisible}
        />
      )}

      {/* Main Menu Screen */}
      {gameState === 'MENU' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenHighScores={() => setShowHighScores(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          highScore={bestHighScore}
          soundEnabled={settings.soundEnabled}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          stats={currentStats}
          highScore={bestHighScore}
          isNewRecord={isNewRecord}
          onPlayAgain={handleRestart}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* High Scores Modal */}
      {showHighScores && (
        <HighScoreModal
          records={highScores}
          onClose={() => setShowHighScores(false)}
          onClearRecords={handleClearRecords}
        />
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

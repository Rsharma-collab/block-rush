export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type BiomeType = 'FOREST' | 'MOUNTAINS' | 'CAVE' | 'LAVA_ZONE' | 'NIGHT_FOREST';

export type PowerUpType = 'SHIELD' | 'REDSTONE_BOOST' | 'MAGNET' | 'ELYTRA';

export type WorldEventType = 'NONE' | 'NIGHT_SHIFT' | 'LAVA_RUSH' | 'REDSTONE_STORM' | 'G_CORE_RUSH';

export interface PowerUpActive {
  type: PowerUpType;
  remainingTime: number; // in seconds
  totalTime: number;
}

export interface PlayerStats {
  score: number;
  distance: number; // in meters
  gCores: number;
  blocks: number;
  health: number;
  maxHealth: number;
  combo: number;
  maxCombo: number;
  eventsSurvived: number;
  activePowerUps: Record<PowerUpType, number>; // remaining seconds
  hasShield: boolean;
  isBuildingAvailable: boolean;
  upcomingGapLane: number | null;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
  touchControlsVisible: boolean;
  shadowsEnabled: boolean;
}

export interface HighScoreRecord {
  score: number;
  distance: number;
  gCores: number;
  maxCombo: number;
  date: string;
}

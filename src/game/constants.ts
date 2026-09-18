import { BiomeType } from '../types';

export const GAME_CONSTANTS = {
  // Lanes
  LANE_WIDTH: 2.5,
  LANES: [-2.5, 0, 2.5] as const,

  // Speed and Physics
  INITIAL_SPEED: 18.0, // units per second forward
  MAX_SPEED: 34.0,
  SPEED_ACCELERATION: 0.12, // speed increase per 100 meters
  REDSTONE_BOOST_SPEED: 36.0,

  // Player Jump & Slide
  JUMP_FORCE: 14.5,
  GRAVITY: -38.0,
  SLIDE_DURATION: 0.75, // seconds
  PLAYER_NORMAL_HEIGHT: 1.8,
  PLAYER_SLIDE_HEIGHT: 0.8,
  PLAYER_WIDTH: 0.9,
  LANE_CHANGE_SPEED: 16.0, // smooth interpolation speed

  // World Generation
  CHUNK_LENGTH: 40.0,
  VISIBLE_CHUNKS: 6,
  FOG_NEAR: 40.0,
  FOG_FAR: 160.0,

  // Elytra Flight
  ELYTRA_HEIGHT: 4.8,

  // Block Builder Mechanic
  BLOCKS_PER_BRIDGE: 4,
  MAX_BLOCKS: 20,

  // Combo Settings
  COMBO_THRESHOLDS: [
    { count: 0, mult: 1 },
    { count: 10, mult: 2 },
    { count: 25, mult: 3 },
    { count: 50, mult: 4 },
  ],

  // Power-up durations (seconds)
  POWERUP_DURATIONS: {
    SHIELD: 9999, // until hit
    REDSTONE_BOOST: 7.0,
    MAGNET: 10.0,
    ELYTRA: 9.0,
  },

  MAGNET_RADIUS: 14.0,

  // World Events
  EVENT_INTERVAL_MIN: 30, // seconds
  EVENT_INTERVAL_MAX: 50,
  EVENT_DURATION: 14, // seconds
};

export interface BiomeConfig {
  name: string;
  groundColor: number;
  groundSideColor: number;
  trackColor: number;
  trackBorderColor: number;
  skyColor: number;
  fogColor: number;
  ambientColor: number;
  sunColor: number;
  particleColor: number;
  description: string;
}

export const BIOMES: Record<BiomeType, BiomeConfig> = {
  FOREST: {
    name: 'Overworld Forest',
    groundColor: 0x48a032,
    groundSideColor: 0x6e492b,
    trackColor: 0x82a558,
    trackBorderColor: 0x5a3e1b,
    skyColor: 0x72c2fc,
    fogColor: 0x8fd6ff,
    ambientColor: 0xffffff,
    sunColor: 0xfffaed,
    particleColor: 0x7ae85a,
    description: 'Vibrant grassy plains with oak trees and clear skies',
  },
  MOUNTAINS: {
    name: 'Snowy Peaks',
    groundColor: 0xdde5ee,
    groundSideColor: 0x6b7280,
    trackColor: 0x8a9ba8,
    trackBorderColor: 0x475569,
    skyColor: 0x93c5fd,
    fogColor: 0xc7d2fe,
    ambientColor: 0xf1f5f9,
    sunColor: 0xffffff,
    particleColor: 0xf8fafc,
    description: 'Crisp alpine ridges with stone craigs and snow drifts',
  },
  CAVE: {
    name: 'Deep Caverns',
    groundColor: 0x27272a,
    groundSideColor: 0x18181b,
    trackColor: 0x3f3f46,
    trackBorderColor: 0x09090b,
    skyColor: 0x09090b,
    fogColor: 0x18181b,
    ambientColor: 0x67e8f9,
    sunColor: 0x22d3ee,
    particleColor: 0x06b6d4,
    description: 'Underground tunnels illuminated by bioluminescent crystals',
  },
  LAVA_ZONE: {
    name: 'Molten Chasm',
    groundColor: 0x450a0a,
    groundSideColor: 0x1f1212,
    trackColor: 0x261b1b,
    trackBorderColor: 0x7f1d1d,
    skyColor: 0x1c0c0c,
    fogColor: 0x450a0a,
    ambientColor: 0xfca5a5,
    sunColor: 0xf97316,
    particleColor: 0xff6600,
    description: 'Cracked obsidian crust with bubbling magma flows',
  },
  NIGHT_FOREST: {
    name: 'Midnight Woods',
    groundColor: 0x1e293b,
    groundSideColor: 0x0f172a,
    trackColor: 0x1e1b4b,
    trackBorderColor: 0x312e81,
    skyColor: 0x050518,
    fogColor: 0x0f172a,
    ambientColor: 0x818cf8,
    sunColor: 0x6366f1,
    particleColor: 0xa855f7,
    description: 'Enchanted nighttime canopy under a luminous voxel moon',
  },
};

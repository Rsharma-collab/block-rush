import * as THREE from 'three';
import { BiomeType, GameSettings, GameState, PlayerStats, PowerUpType, WorldEventType } from '../types';
import { sound } from '../audio/SoundSystem';
import { BIOMES, GAME_CONSTANTS } from './constants';
import { VoxelModels } from './VoxelModels';
import { WorldManager } from './WorldManager';

export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private worldManager: WorldManager;

  // Lights & Fog
  private ambientLight: THREE.AmbientLight;
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private fog: THREE.Fog;

  // Player state
  private playerObject: ReturnType<typeof VoxelModels.createPlayer>;
  private playerX: number = 0;
  private targetLane: number = 0; // -1, 0, 1
  private playerY: number = 0;
  private playerZ: number = 0;
  private velocityY: number = 0;
  private isGrounded: boolean = true;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private invulnerableTimer: number = 0;

  // Game stats
  public stats: PlayerStats;
  public state: GameState = 'MENU';
  public currentBiome: BiomeType = 'FOREST';
  public currentEvent: WorldEventType = 'NONE';
  private eventTimer: number = 0;
  private nextEventTriggerTimer: number = 35;

  // Camera Shake & Dynamic Effects
  private cameraShake: number = 0;
  private baseFov: number = 60;
  private runningSpeed: number = GAME_CONSTANTS.INITIAL_SPEED;

  // Animation Frame
  private animFrameId: number | null = null;
  private clock: THREE.Clock;
  private onStatsUpdate: (stats: PlayerStats, biome: BiomeType, event: WorldEventType) => void;
  private onGameOver: (finalStats: PlayerStats) => void;
  private settings: GameSettings;

  // Custom visual particles
  private fxParticles: {
    mesh: THREE.Mesh;
    vx: number;
    vy: number;
    vz: number;
    life: number;
    maxLife: number;
  }[] = [];

  constructor(
    container: HTMLElement,
    settings: GameSettings,
    onStatsUpdate: (stats: PlayerStats, biome: BiomeType, event: WorldEventType) => void,
    onGameOver: (finalStats: PlayerStats) => void
  ) {
    this.container = container;
    this.settings = settings;
    this.onStatsUpdate = onStatsUpdate;
    this.onGameOver = onGameOver;
    this.clock = new THREE.Clock();

    // Scene
    this.scene = new THREE.Scene();
    this.fog = new THREE.Fog(BIOMES.FOREST.fogColor, GAME_CONSTANTS.FOG_NEAR, GAME_CONSTANTS.FOG_FAR);
    this.scene.fog = this.fog;

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(this.baseFov, aspect, 0.1, 250);
    this.camera.position.set(0, 4.2, -6.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = this.settings.shadowsEnabled;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    this.ambientLight = new THREE.AmbientLight(BIOMES.FOREST.ambientColor, 0.7);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(BIOMES.FOREST.sunColor, 1.1);
    this.sunLight.position.set(15, 30, 20);
    this.sunLight.castShadow = this.settings.shadowsEnabled;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 70;
    this.sunLight.shadow.camera.left = -15;
    this.sunLight.shadow.camera.right = 15;
    this.sunLight.shadow.camera.top = 20;
    this.sunLight.shadow.camera.bottom = -10;
    this.scene.add(this.sunLight);

    // Player
    this.playerObject = VoxelModels.createPlayer();
    this.scene.add(this.playerObject.root);

    // World Manager
    this.worldManager = new WorldManager(this.scene);

    // Initial stats
    this.stats = this.createInitialStats();

    // Event listeners
    window.addEventListener('resize', this.handleResize);

    // Start loop
    this.startLoop();
  }

  private createInitialStats(): PlayerStats {
    return {
      score: 0,
      distance: 0,
      gCores: 0,
      blocks: 6, // starting blocks for Block Builder
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
    };
  }

  public updateSettings(newSettings: GameSettings) {
    this.settings = newSettings;
    sound.setSfxVolume(newSettings.soundEnabled ? newSettings.sfxVolume : 0);
    sound.setMusicVolume(newSettings.musicEnabled ? newSettings.musicVolume : 0);
    this.renderer.shadowMap.enabled = newSettings.shadowsEnabled;
  }

  public startGame() {
    this.state = 'PLAYING';
    this.stats = this.createInitialStats();
    this.runningSpeed = GAME_CONSTANTS.INITIAL_SPEED;
    this.playerX = 0;
    this.targetLane = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.invulnerableTimer = 0;
    this.currentEvent = 'NONE';
    this.eventTimer = 0;
    this.nextEventTriggerTimer = 35;

    this.worldManager.init();
    this.updateBiomeTheme('FOREST');

    if (this.settings.musicEnabled) {
      sound.startMusic();
    }
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      sound.stopMusic();
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      if (this.settings.musicEnabled) {
        sound.startMusic();
      }
    }
  }

  public returnToMenu() {
    this.state = 'MENU';
    sound.stopMusic();
    this.playerZ = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.worldManager.init();
  }

  // --- CONTROLS ---

  public moveLeft() {
    if (this.state !== 'PLAYING') return;
    if (this.targetLane > -1) {
      this.targetLane -= 1;
      sound.playLaneSwitch();
    }
  }

  public moveRight() {
    if (this.state !== 'PLAYING') return;
    if (this.targetLane < 1) {
      this.targetLane += 1;
      sound.playLaneSwitch();
    }
  }

  public jump() {
    if (this.state !== 'PLAYING') return;
    // Jump if grounded or if currently gliding with Elytra
    if (this.isGrounded || this.stats.activePowerUps.ELYTRA > 0) {
      this.velocityY = GAME_CONSTANTS.JUMP_FORCE;
      this.isGrounded = false;
      this.isSliding = false;
      this.slideTimer = 0;
      sound.playJump();
      this.spawnJumpParticles();
    }
  }

  public slide() {
    if (this.state !== 'PLAYING') return;
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = GAME_CONSTANTS.SLIDE_DURATION;
      // If in mid-air, fast-drop down
      if (!this.isGrounded) {
        this.velocityY = -22;
      }
      sound.playSlide();
      this.spawnSlideParticles();
    }
  }

  /**
   * Block Builder mechanic: Press E to build temporary bridge across upcoming gap
   */
  public activateBlockBuilder() {
    if (this.state !== 'PLAYING') return;

    const gapInfo = this.worldManager.getUpcomingGap(this.playerZ, this.targetLane);
    if (gapInfo && this.stats.blocks >= GAME_CONSTANTS.BLOCKS_PER_BRIDGE) {
      const built = this.worldManager.buildBridge(gapInfo.obstacle);
      if (built) {
        this.stats.blocks -= GAME_CONSTANTS.BLOCKS_PER_BRIDGE;
        this.stats.score += 50;
        sound.playBuildBridge();
        this.spawnBuildParticles(gapInfo.obstacle.mesh.position);
        this.cameraShake = 0.3;
      }
    }
  }

  // --- PARTICLES & FX ---

  private spawnJumpParticles() {
    for (let i = 0; i < 8; i++) {
      this.createVoxelParticle(
        this.playerX + (Math.random() - 0.5) * 0.5,
        this.playerY + 0.1,
        this.playerZ + (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 4,
        Math.random() * 3,
        -this.runningSpeed * 0.3,
        0xd1d5db,
        0.35
      );
    }
  }

  private spawnSlideParticles() {
    for (let i = 0; i < 10; i++) {
      this.createVoxelParticle(
        this.playerX + (Math.random() - 0.5) * 0.6,
        0.1,
        this.playerZ + (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 3,
        Math.random() * 2,
        -this.runningSpeed * 0.6,
        0x94a3b8,
        0.4
      );
    }
  }

  private spawnCollectParticles(x: number, y: number, z: number, color: number) {
    for (let i = 0; i < 12; i++) {
      this.createVoxelParticle(
        x,
        y,
        z,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        color,
        0.5
      );
    }
  }

  private spawnBuildParticles(pos: THREE.Vector3) {
    for (let i = 0; i < 20; i++) {
      this.createVoxelParticle(
        pos.x + (Math.random() - 0.5) * 2,
        pos.y + Math.random() * 1.5,
        pos.z + (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 5,
        Math.random() * 5,
        (Math.random() - 0.5) * 5,
        0x38bdf8,
        0.7
      );
    }
  }

  private createVoxelParticle(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    color: number,
    life: number
  ) {
    const size = 0.12 + Math.random() * 0.12;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshBasicMaterial({ color })
    );
    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    this.fxParticles.push({
      mesh,
      vx,
      vy,
      vz,
      life,
      maxLife: life,
    });
  }

  private updateParticles(delta: number) {
    for (let i = this.fxParticles.length - 1; i >= 0; i--) {
      const p = this.fxParticles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.fxParticles.splice(i, 1);
        continue;
      }

      p.mesh.position.x += p.vx * delta;
      p.mesh.position.y += p.vy * delta;
      p.mesh.position.z += p.vz * delta;
      p.vy -= 12 * delta; // particle gravity

      const scale = p.life / p.maxLife;
      p.mesh.scale.set(scale, scale, scale);
    }
  }

  // --- MAIN LOOP ---

  private startLoop() {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const time = this.clock.getElapsedTime();

      if (this.state === 'PLAYING') {
        this.updateGameplay(delta, time);
      } else if (this.state === 'MENU') {
        // Idle runner animation on menu
        this.playerObject.updateAnimation(time, false, false, false, 0.8);
        this.camera.position.set(Math.sin(time * 0.5) * 3, 3.5, -6);
        this.camera.lookAt(0, 1.2, 0);
      }

      this.updateParticles(delta);
      this.renderer.render(this.scene, this.camera);
    };

    this.animFrameId = requestAnimationFrame(animate);
  }

  private updateGameplay(delta: number, time: number) {
    // 1. Calculate running speed with Redstone Boost
    let targetSpeed = GAME_CONSTANTS.INITIAL_SPEED + (this.stats.distance / 100) * GAME_CONSTANTS.SPEED_ACCELERATION;
    targetSpeed = Math.min(targetSpeed, GAME_CONSTANTS.MAX_SPEED);

    const hasRedstone = this.stats.activePowerUps.REDSTONE_BOOST > 0;
    if (hasRedstone) {
      targetSpeed = GAME_CONSTANTS.REDSTONE_BOOST_SPEED;
    }

    this.runningSpeed = THREE.MathUtils.lerp(this.runningSpeed, targetSpeed, delta * 4);

    // 2. Advance player forward along Z
    this.playerZ += this.runningSpeed * delta;
    this.stats.distance = Math.floor(this.playerZ);

    // Score from distance (doubled with Redstone Boost)
    const scoreMultiplier = this.getComboMultiplier() * (hasRedstone ? 2 : 1);
    this.stats.score += Math.floor(this.runningSpeed * delta * scoreMultiplier * 0.5);

    // 3. Smooth lane switching
    const targetX = this.targetLane * GAME_CONSTANTS.LANE_WIDTH;
    const prevX = this.playerX;
    this.playerX = THREE.MathUtils.lerp(this.playerX, targetX, delta * GAME_CONSTANTS.LANE_CHANGE_SPEED);
    const laneSwitchSpeed = (this.playerX - prevX) / delta;

    // 4. Vertical Physics & Jump / Slide / Elytra
    const isGliding = this.stats.activePowerUps.ELYTRA > 0;

    if (isGliding) {
      // Smoothly soar up to Elytra height
      this.playerY = THREE.MathUtils.lerp(this.playerY, GAME_CONSTANTS.ELYTRA_HEIGHT, delta * 5);
      this.isGrounded = false;
      this.velocityY = 0;
    } else {
      if (!this.isGrounded) {
        this.velocityY += GAME_CONSTANTS.GRAVITY * delta;
        this.playerY += this.velocityY * delta;

        if (this.playerY <= 0) {
          this.playerY = 0;
          this.velocityY = 0;
          this.isGrounded = true;
          this.spawnJumpParticles();
        }
      }
    }

    // Slide timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Invulnerability timer
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
      // Visual blink
      this.playerObject.root.visible = Math.floor(time * 20) % 2 === 0;
    } else {
      this.playerObject.root.visible = true;
    }

    // 5. Update Player Position & Rotation
    this.playerObject.root.position.set(this.playerX, this.playerY, this.playerZ);

    // Lean into lane switches
    const targetRoll = -laneSwitchSpeed * 0.08;
    this.playerObject.root.rotation.z = THREE.MathUtils.lerp(this.playerObject.root.rotation.z, targetRoll, delta * 12);

    // Shield visibility
    const hasShield = this.stats.hasShield || this.stats.activePowerUps.SHIELD > 0;
    this.playerObject.shieldMesh.visible = hasShield;
    if (hasShield) {
      this.playerObject.shieldMesh.rotation.y += delta * 2;
      this.playerObject.shieldMesh.rotation.x += delta * 1.5;
    }

    // Character animation
    this.playerObject.updateAnimation(
      time,
      !this.isGrounded,
      this.isSliding,
      isGliding,
      this.runningSpeed / GAME_CONSTANTS.INITIAL_SPEED
    );

    // 6. Power-Up Timers & Magnet Attraction
    (['REDSTONE_BOOST', 'MAGNET', 'ELYTRA'] as PowerUpType[]).forEach((type) => {
      if (this.stats.activePowerUps[type] > 0) {
        this.stats.activePowerUps[type] -= delta;
        if (this.stats.activePowerUps[type] <= 0) {
          this.stats.activePowerUps[type] = 0;
        }
      }
    });

    if (this.stats.activePowerUps.MAGNET > 0) {
      this.worldManager.attractCollectibles(this.playerX, this.playerY, this.playerZ, delta);
    }

    // 7. World Manager update
    this.worldManager.update(this.playerZ, delta, time);

    // Biome check
    const newBiome = this.worldManager.getCurrentBiome();
    if (newBiome !== this.currentBiome) {
      this.currentBiome = newBiome;
      this.updateBiomeTheme(newBiome);
    }

    // 8. World Events progression
    this.updateWorldEvents(delta);

    // 9. Block Builder Gap Detection
    const upcomingGap = this.worldManager.getUpcomingGap(this.playerZ, this.targetLane);
    this.stats.isBuildingAvailable = upcomingGap !== null && this.stats.blocks >= GAME_CONSTANTS.BLOCKS_PER_BRIDGE;
    this.stats.upcomingGapLane = upcomingGap ? upcomingGap.obstacle.lane : null;

    // 10. Collision Detection (Collectibles & Obstacles)
    this.checkCollisions(time);

    // 11. Camera Follow & Dynamic Polish
    this.updateCamera(delta, isGliding);

    // 12. Push stats to UI
    this.onStatsUpdate(this.stats, this.currentBiome, this.currentEvent);
  }

  private updateCamera(delta: number, isGliding: boolean) {
    // Camera smoothly follows player Z and X
    const targetCamX = this.playerX * 0.45;
    const targetCamY = isGliding ? 6.5 : 4.0 + (this.playerY > 0 ? this.playerY * 0.4 : 0);
    const targetCamZ = this.playerZ - 6.5;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, delta * 10);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, delta * 8);
    this.camera.position.z = targetCamZ;

    // Camera look target ahead of player
    const lookTarget = new THREE.Vector3(this.playerX * 0.2, 1.4 + this.playerY * 0.3, this.playerZ + 12);

    // Camera shake impact
    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake * 1.5;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake * 1.5;
      this.cameraShake = Math.max(0, this.cameraShake - delta * 2.5);
    }

    this.camera.lookAt(lookTarget);

    // FOV expands during speed boost
    const targetFov = this.stats.activePowerUps.REDSTONE_BOOST > 0 ? 72 : 60;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 6);
    this.camera.updateProjectionMatrix();

    // Sun follows player
    this.sunLight.position.set(this.playerX + 15, 30, this.playerZ + 20);
    this.sunLight.target.position.set(this.playerX, 0, this.playerZ);
    this.sunLight.target.updateMatrixWorld();
  }

  private checkCollisions(time: number) {
    // Player Hitbox
    const pWidth = GAME_CONSTANTS.PLAYER_WIDTH * 0.5;
    const pHeight = this.isSliding ? GAME_CONSTANTS.PLAYER_SLIDE_HEIGHT : GAME_CONSTANTS.PLAYER_NORMAL_HEIGHT;
    const pMinX = this.playerX - pWidth;
    const pMaxX = this.playerX + pWidth;
    const pMinY = this.playerY;
    const pMaxY = this.playerY + pHeight;
    const pMinZ = this.playerZ - 0.4;
    const pMaxZ = this.playerZ + 0.4;

    const isGliding = this.stats.activePowerUps.ELYTRA > 0;

    // A. Collectibles
    this.worldManager.collectibles.forEach((c) => {
      if (c.collected) return;
      const dx = Math.abs(this.playerX - c.mesh.position.x);
      const dy = Math.abs(this.playerY + 0.8 - c.mesh.position.y);
      const dz = Math.abs(this.playerZ - c.mesh.position.z);

      if (dx < 0.9 && dy < 1.2 && dz < 1.1) {
        c.collected = true;
        this.scene.remove(c.mesh);

        if (c.type === 'G_CORE') {
          this.stats.gCores += 1;
          this.stats.score += 10 * this.getComboMultiplier();
          sound.playCollectGCore(this.stats.combo);
          this.incrementCombo();
          this.spawnCollectParticles(c.mesh.position.x, c.mesh.position.y, c.mesh.position.z, 0x06b6d4);
        } else if (c.type === 'BLOCK') {
          this.stats.blocks = Math.min(GAME_CONSTANTS.MAX_BLOCKS, this.stats.blocks + 1);
          this.stats.score += 15;
          sound.playCollectBlock();
          this.spawnCollectParticles(c.mesh.position.x, c.mesh.position.y, c.mesh.position.z, 0xf59e0b);
        } else if (c.type === 'POWER_UP' && c.powerUpType) {
          this.activatePowerUp(c.powerUpType);
          this.spawnCollectParticles(c.mesh.position.x, c.mesh.position.y, c.mesh.position.z, 0xec4899);
        }
      }
    });

    // If invulnerable, skip obstacle hits
    if (this.invulnerableTimer > 0) return;

    // B. Obstacles
    for (const obs of this.worldManager.obstacles) {
      // If gap has bridge, player can run right across it safely!
      if (obs.type === 'GAP' && obs.hasBridge) {
        continue;
      }

      // If player is soaring high with Elytra, pass safely above all ground obstacles!
      if (isGliding && this.playerY > 3.0) {
        continue;
      }

      const h = obs.hitbox;
      const overlapX = pMinX < h.maxX && pMaxX > h.minX;
      const overlapY = pMinY < h.maxY && pMaxY > h.minY;
      const overlapZ = pMinZ < h.maxZ && pMaxZ > h.minZ;

      if (overlapX && overlapY && overlapZ) {
        this.handleObstacleHit(obs);
        break;
      }
    }
  }

  private handleObstacleHit(obs: any) {
    // 1. Check Shield
    if (this.stats.hasShield || this.stats.activePowerUps.SHIELD > 0) {
      this.stats.hasShield = false;
      this.stats.activePowerUps.SHIELD = 0;
      sound.playShieldBreak();
      this.cameraShake = 0.5;
      this.invulnerableTimer = 1.2;
      this.resetCombo();
      this.spawnCollectParticles(this.playerX, this.playerY + 0.9, this.playerZ, 0x38bdf8);
      return;
    }

    // 2. Take damage
    this.stats.health -= 1;
    this.resetCombo();
    sound.playHit();
    this.cameraShake = 0.8;
    this.invulnerableTimer = 1.5;

    if (this.stats.health <= 0) {
      this.stats.health = 0;
      this.triggerGameOver();
    }
  }

  private activatePowerUp(type: PowerUpType) {
    sound.playPowerUp();
    this.cameraShake = 0.2;

    if (type === 'SHIELD') {
      this.stats.hasShield = true;
      this.stats.activePowerUps.SHIELD = 9999;
    } else {
      this.stats.activePowerUps[type] = GAME_CONSTANTS.POWERUP_DURATIONS[type];
    }
  }

  private incrementCombo() {
    this.stats.combo += 1;
    if (this.stats.combo > this.stats.maxCombo) {
      this.stats.maxCombo = this.stats.combo;
    }
  }

  private resetCombo() {
    this.stats.combo = 1;
  }

  public getComboMultiplier(): number {
    const c = this.stats.combo;
    if (c >= 50) return 4;
    if (c >= 25) return 3;
    if (c >= 10) return 2;
    return 1;
  }

  private updateWorldEvents(delta: number) {
    if (this.currentEvent === 'NONE') {
      this.nextEventTriggerTimer -= delta;
      if (this.nextEventTriggerTimer <= 0) {
        // Trigger random world event
        const events: WorldEventType[] = ['NIGHT_SHIFT', 'LAVA_RUSH', 'REDSTONE_STORM', 'G_CORE_RUSH'];
        this.currentEvent = events[Math.floor(Math.random() * events.length)];
        this.eventTimer = GAME_CONSTANTS.EVENT_DURATION;
        sound.playEventAlert();
        this.cameraShake = 0.6;
        this.applyEventAtmosphere(this.currentEvent);
      }
    } else {
      this.eventTimer -= delta;
      if (this.eventTimer <= 0) {
        // Event survived!
        this.stats.eventsSurvived += 1;
        this.stats.score += 500;
        this.currentEvent = 'NONE';
        this.nextEventTriggerTimer =
          GAME_CONSTANTS.EVENT_INTERVAL_MIN +
          Math.random() * (GAME_CONSTANTS.EVENT_INTERVAL_MAX - GAME_CONSTANTS.EVENT_INTERVAL_MIN);
        this.updateBiomeTheme(this.currentBiome);
      }
    }
  }

  private updateBiomeTheme(biome: BiomeType) {
    const config = BIOMES[biome];
    this.scene.background = new THREE.Color(config.skyColor);
    this.fog.color.setHex(config.fogColor);
    this.ambientLight.color.setHex(config.ambientColor);
    this.sunLight.color.setHex(config.sunColor);
  }

  private applyEventAtmosphere(event: WorldEventType) {
    if (event === 'NIGHT_SHIFT') {
      this.scene.background = new THREE.Color(0x050510);
      this.fog.color.setHex(0x050510);
      this.fog.near = 15;
      this.fog.far = 70;
      this.ambientLight.intensity = 0.3;
      this.sunLight.intensity = 0.4;
    } else if (event === 'LAVA_RUSH') {
      this.scene.background = new THREE.Color(0x380505);
      this.fog.color.setHex(0x7f1d1d);
      this.ambientLight.color.setHex(0xf87171);
      this.ambientLight.intensity = 0.8;
      this.sunLight.color.setHex(0xf97316);
    } else if (event === 'REDSTONE_STORM') {
      this.scene.background = new THREE.Color(0x2e0820);
      this.fog.color.setHex(0x831843);
      this.ambientLight.color.setHex(0xf472b6);
    } else if (event === 'G_CORE_RUSH') {
      this.scene.background = new THREE.Color(0x042f2e);
      this.fog.color.setHex(0x115e59);
      this.ambientLight.color.setHex(0x2dd4bf);
    }
  }

  private triggerGameOver() {
    this.state = 'GAME_OVER';
    sound.stopMusic();
    this.onGameOver(this.stats);
  }

  private handleResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    sound.stopMusic();
    this.worldManager.clear();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

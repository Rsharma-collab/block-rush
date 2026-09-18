import * as THREE from 'three';
import { BiomeType, PowerUpType } from '../types';
import { BIOMES, GAME_CONSTANTS } from './constants';
import { VoxelModels } from './VoxelModels';

export interface ActiveObstacle {
  id: number;
  mesh: THREE.Object3D;
  lane: number; // -1, 0, 1
  z: number;
  type: 'LOW_BARRIER' | 'HIGH_BARRIER' | 'SOLID_WALL' | 'LAVA' | 'GAP' | 'VOLT_CREATURE' | 'MOVING_BLOCK';
  hitbox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  hasBridge?: boolean;
  bridgeMesh?: THREE.Object3D;
  update?: (delta: number, time: number) => void;
  // Moving block or enemy patrol state
  patrolDir?: number;
  baseLane?: number;
}

export interface ActiveCollectible {
  id: number;
  mesh: THREE.Object3D;
  lane: number;
  z: number;
  y: number;
  type: 'G_CORE' | 'BLOCK' | 'POWER_UP';
  powerUpType?: PowerUpType;
  collected: boolean;
  initialY: number;
}

export class WorldManager {
  private scene: THREE.Scene;
  private chunks: {
    mesh: THREE.Group;
    zStart: number;
    zEnd: number;
    biome: BiomeType;
  }[] = [];

  private nextChunkZ: number = 0;
  private currentBiome: BiomeType = 'FOREST';
  private currentDistance: number = 0;

  // Active items
  public obstacles: ActiveObstacle[] = [];
  public collectibles: ActiveCollectible[] = [];
  private entityIdCounter: number = 1;

  // Particle systems
  private ambientParticles: THREE.Points | null = null;
  private particlePositions: Float32Array | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public init() {
    this.clear();
    this.nextChunkZ = -20; // start slightly behind player

    // Spawn initial safe starting chunks
    for (let i = 0; i < GAME_CONSTANTS.VISIBLE_CHUNKS; i++) {
      this.spawnChunk(i < 2); // first 2 chunks completely obstacle-free
    }

    this.createAmbientParticles();
  }

  public clear() {
    this.chunks.forEach((c) => this.scene.remove(c.mesh));
    this.chunks = [];

    this.obstacles.forEach((o) => {
      this.scene.remove(o.mesh);
      if (o.bridgeMesh) this.scene.remove(o.bridgeMesh);
    });
    this.obstacles = [];

    this.collectibles.forEach((c) => this.scene.remove(c.mesh));
    this.collectibles = [];

    if (this.ambientParticles) {
      this.scene.remove(this.ambientParticles);
      this.ambientParticles = null;
    }
  }

  private determineBiome(distance: number): BiomeType {
    // Biome progression every 350 meters
    const cycle = Math.floor(distance / 350) % 5;
    switch (cycle) {
      case 0:
        return 'FOREST';
      case 1:
        return 'MOUNTAINS';
      case 2:
        return 'CAVE';
      case 3:
        return 'LAVA_ZONE';
      case 4:
        return 'NIGHT_FOREST';
      default:
        return 'FOREST';
    }
  }

  public getCurrentBiome(): BiomeType {
    return this.currentBiome;
  }

  private createAmbientParticles() {
    const count = 300;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }

    this.particlePositions = positions;
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: BIOMES[this.currentBiome].particleColor,
      size: 0.35,
      transparent: true,
      opacity: 0.7,
    });

    this.ambientParticles = new THREE.Points(geom, mat);
    this.scene.add(this.ambientParticles);
  }

  public updateParticles(playerZ: number, delta: number) {
    if (!this.ambientParticles || !this.particlePositions) return;

    const positions = this.particlePositions;
    for (let i = 0; i < positions.length / 3; i++) {
      // Float gently downward and forward
      positions[i * 3 + 1] -= delta * 0.8;
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 14;
      }
      // Keep centered around player Z
      if (positions[i * 3 + 2] < playerZ - 30) {
        positions[i * 3 + 2] = playerZ + 80;
      } else if (positions[i * 3 + 2] > playerZ + 90) {
        positions[i * 3 + 2] = playerZ - 20;
      }
    }

    const posAttr = this.ambientParticles.geometry.attributes.position as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
  }

  /**
   * Spawns a chunk ahead in the world.
   */
  private spawnChunk(isSafeStart: boolean = false) {
    const chunkLength = GAME_CONSTANTS.CHUNK_LENGTH;
    const zStart = this.nextChunkZ;
    const zEnd = zStart + chunkLength;
    this.nextChunkZ = zEnd;

    this.currentBiome = this.determineBiome(Math.max(0, zStart));
    const biomeConfig = BIOMES[this.currentBiome];

    const chunkGroup = new THREE.Group();

    // 3-lane track ground (center width: 8.5)
    const trackGeom = new THREE.BoxGeometry(8.2, 0.4, chunkLength);
    const trackMat = new THREE.MeshLambertMaterial({ color: biomeConfig.trackColor });
    const trackMesh = new THREE.Mesh(trackGeom, trackMat);
    trackMesh.position.set(0, -0.2, zStart + chunkLength / 2);
    trackMesh.receiveShadow = true;
    chunkGroup.add(trackMesh);

    // Track lane stripes (separating lanes -1, 0, 1)
    const stripeGeom = new THREE.BoxGeometry(0.12, 0.05, chunkLength);
    const stripeMat = new THREE.MeshLambertMaterial({ color: biomeConfig.trackBorderColor });

    const leftStripe = new THREE.Mesh(stripeGeom, stripeMat);
    leftStripe.position.set(-1.25, 0.03, zStart + chunkLength / 2);
    const rightStripe = new THREE.Mesh(stripeGeom, stripeMat);
    rightStripe.position.set(1.25, 0.03, zStart + chunkLength / 2);
    chunkGroup.add(leftStripe, rightStripe);

    // Track outer raised borders
    const curbGeom = new THREE.BoxGeometry(0.4, 0.5, chunkLength);
    const curbMat = new THREE.MeshLambertMaterial({ color: biomeConfig.groundSideColor });
    const leftCurb = new THREE.Mesh(curbGeom, curbMat);
    leftCurb.position.set(-4.2, 0.05, zStart + chunkLength / 2);
    const rightCurb = new THREE.Mesh(curbGeom, curbMat);
    rightCurb.position.set(4.2, 0.05, zStart + chunkLength / 2);
    chunkGroup.add(leftCurb, rightCurb);

    // Surrounding terrain blocks on left and right
    const terrainWidth = 24.0;
    const terrainGeom = new THREE.BoxGeometry(terrainWidth, 0.6, chunkLength);
    const terrainMat = new THREE.MeshLambertMaterial({ color: biomeConfig.groundColor });

    const leftTerrain = new THREE.Mesh(terrainGeom, terrainMat);
    leftTerrain.position.set(-4.2 - terrainWidth / 2, -0.2, zStart + chunkLength / 2);
    leftTerrain.receiveShadow = true;

    const rightTerrain = new THREE.Mesh(terrainGeom, terrainMat);
    rightTerrain.position.set(4.2 + terrainWidth / 2, -0.2, zStart + chunkLength / 2);
    rightTerrain.receiveShadow = true;

    chunkGroup.add(leftTerrain, rightTerrain);

    // Scenery props (Trees / Mountains / Crystal pillars)
    const propsCount = Math.floor(chunkLength / 10);
    for (let i = 0; i < propsCount; i++) {
      const propZ = zStart + i * 10 + 5;
      // Left side prop
      if (Math.random() > 0.3) {
        const leftProp =
          Math.random() > 0.4
            ? VoxelModels.createVoxelTree(this.currentBiome)
            : VoxelModels.createMountainRock(this.currentBiome);
        leftProp.position.set(-6.5 - Math.random() * 8, 0, propZ);
        chunkGroup.add(leftProp);
      }
      // Right side prop
      if (Math.random() > 0.3) {
        const rightProp =
          Math.random() > 0.4
            ? VoxelModels.createVoxelTree(this.currentBiome)
            : VoxelModels.createMountainRock(this.currentBiome);
        rightProp.position.set(6.5 + Math.random() * 8, 0, propZ);
        chunkGroup.add(rightProp);
      }
    }

    this.scene.add(chunkGroup);
    this.chunks.push({
      mesh: chunkGroup,
      zStart,
      zEnd,
      biome: this.currentBiome,
    });

    // Spawn obstacles and collectibles on this chunk if not safe start
    if (!isSafeStart) {
      this.populateChunk(zStart, zEnd);
    }
  }

  /**
   * Spawns obstacles, G-Cores, and power-ups inside a chunk.
   */
  private populateChunk(zStart: number, zEnd: number) {
    const chunkLength = zEnd - zStart;
    const lanes = [-1, 0, 1];

    // Difficulty scaling factor based on distance
    const distFactor = Math.min(1.0, zStart / 1200);
    const numObstacles = Math.floor(2 + Math.random() * 2 + distFactor * 2);

    const stepZ = chunkLength / (numObstacles + 1);

    for (let i = 1; i <= numObstacles; i++) {
      const obsZ = zStart + i * stepZ + (Math.random() - 0.5) * 3;
      const targetLane = lanes[Math.floor(Math.random() * lanes.length)];
      const laneX = targetLane * GAME_CONSTANTS.LANE_WIDTH;

      const rand = Math.random();

      if (rand < 0.22) {
        // LOW BARRIER (requires JUMP)
        const mesh = VoxelModels.createLowBarrier();
        mesh.position.set(laneX, 0, obsZ);
        this.scene.add(mesh);
        this.obstacles.push({
          id: this.entityIdCounter++,
          mesh,
          lane: targetLane,
          z: obsZ,
          type: 'LOW_BARRIER',
          hitbox: {
            minX: laneX - 1.1,
            maxX: laneX + 1.1,
            minY: 0,
            maxY: 0.95,
            minZ: obsZ - 0.35,
            maxZ: obsZ + 0.35,
          },
        });
      } else if (rand < 0.42) {
        // HIGH BARRIER (requires SLIDE)
        const mesh = VoxelModels.createHighBarrier();
        mesh.position.set(laneX, 0, obsZ);
        this.scene.add(mesh);
        this.obstacles.push({
          id: this.entityIdCounter++,
          mesh,
          lane: targetLane,
          z: obsZ,
          type: 'HIGH_BARRIER',
          hitbox: {
            minX: laneX - 1.2,
            maxX: laneX + 1.2,
            minY: 1.15,
            maxY: 2.8,
            minZ: obsZ - 0.4,
            maxZ: obsZ + 0.4,
          },
        });
      } else if (rand < 0.62) {
        // SOLID WALL (requires LANE SWITCH)
        const mesh = VoxelModels.createSolidWall();
        mesh.position.set(laneX, 0, obsZ);
        this.scene.add(mesh);
        this.obstacles.push({
          id: this.entityIdCounter++,
          mesh,
          lane: targetLane,
          z: obsZ,
          type: 'SOLID_WALL',
          hitbox: {
            minX: laneX - 1.15,
            maxX: laneX + 1.15,
            minY: 0,
            maxY: 3.2,
            minZ: obsZ - 0.5,
            maxZ: obsZ + 0.5,
          },
        });
      } else if (rand < 0.76) {
        // LAVA POOL (requires JUMP or switch)
        const mesh = VoxelModels.createLavaPool();
        mesh.position.set(laneX, 0, obsZ);
        this.scene.add(mesh);
        this.obstacles.push({
          id: this.entityIdCounter++,
          mesh,
          lane: targetLane,
          z: obsZ,
          type: 'LAVA',
          hitbox: {
            minX: laneX - 1.1,
            maxX: laneX + 1.1,
            minY: 0,
            maxY: 0.5,
            minZ: obsZ - 1.6,
            maxZ: obsZ + 1.6,
          },
        });
      } else if (rand < 0.88) {
        // TRACK GAP (Can be bridged with BLOCK BUILDER [E] or jumped/switched)
        // Visually cut out a hole in the lane
        const gapMesh = new THREE.Group();
        const holeFloor = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 0.45, 6.0),
          new THREE.MeshLambertMaterial({ color: 0x09090b })
        );
        holeFloor.position.set(laneX, -0.2, obsZ);
        gapMesh.add(holeFloor);
        this.scene.add(gapMesh);

        this.obstacles.push({
          id: this.entityIdCounter++,
          mesh: gapMesh,
          lane: targetLane,
          z: obsZ,
          type: 'GAP',
          hasBridge: false,
          hitbox: {
            minX: laneX - 1.15,
            maxX: laneX + 1.15,
            minY: 0,
            maxY: 1.0,
            minZ: obsZ - 2.8,
            maxZ: obsZ + 2.8,
          },
        });
      } else {
        // ORIGINAL ENEMY: VOLT CREATURE (slowly patrols between lanes)
        const volt = VoxelModels.createVoltCreature();
        volt.mesh.position.set(laneX, 0, obsZ);
        this.scene.add(volt.mesh);

        let curX = laneX;
        let pDir = 1;

        const updateEnemy = (delta: number, time: number) => {
          volt.update(delta, time);
          // Slow oscillation across adjacent lane
          curX += pDir * delta * 2.2;
          if (curX > 2.5) {
            curX = 2.5;
            pDir = -1;
          } else if (curX < -2.5) {
            curX = -2.5;
            pDir = 1;
          }
          volt.mesh.position.x = curX;
        };

        this.obstacles.push({
          id: this.entityIdCounter++,
          mesh: volt.mesh,
          lane: targetLane,
          z: obsZ,
          type: 'VOLT_CREATURE',
          update: updateEnemy,
          hitbox: {
            minX: laneX - 0.7,
            maxX: laneX + 0.7,
            minY: 0,
            maxY: 1.7,
            minZ: obsZ - 0.6,
            maxZ: obsZ + 0.6,
          },
        });
      }
    }

    // Spawn G-CORES trails
    const numGCoreTrails = 2 + Math.floor(Math.random() * 2);
    for (let t = 0; t < numGCoreTrails; t++) {
      const trailLane = lanes[Math.floor(Math.random() * lanes.length)];
      const trailZ = zStart + 5 + t * 14 + Math.random() * 4;
      const trailCount = 3 + Math.floor(Math.random() * 3);

      for (let c = 0; c < trailCount; c++) {
        const itemZ = trailZ + c * 2.4;
        const mesh = VoxelModels.createGCore();
        const itemY = 0.9;
        mesh.position.set(trailLane * GAME_CONSTANTS.LANE_WIDTH, itemY, itemZ);
        this.scene.add(mesh);

        this.collectibles.push({
          id: this.entityIdCounter++,
          mesh,
          lane: trailLane,
          z: itemZ,
          y: itemY,
          type: 'G_CORE',
          collected: false,
          initialY: itemY,
        });
      }
    }

    // Spawn Building Blocks (+1 resource for Block Builder)
    if (Math.random() > 0.35) {
      const blockLane = lanes[Math.floor(Math.random() * lanes.length)];
      const blockZ = zStart + 12 + Math.random() * 15;
      const mesh = VoxelModels.createBlockItem();
      mesh.position.set(blockLane * GAME_CONSTANTS.LANE_WIDTH, 0.8, blockZ);
      this.scene.add(mesh);

      this.collectibles.push({
        id: this.entityIdCounter++,
        mesh,
        lane: blockLane,
        z: blockZ,
        y: 0.8,
        type: 'BLOCK',
        collected: false,
        initialY: 0.8,
      });
    }

    // Spawn Power-Up (Shield, Redstone Boost, Magnet, Elytra)
    if (Math.random() < 0.45) {
      const powerUpTypes: PowerUpType[] = ['SHIELD', 'REDSTONE_BOOST', 'MAGNET', 'ELYTRA'];
      const chosenType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      const puLane = lanes[Math.floor(Math.random() * lanes.length)];
      const puZ = zStart + 18 + Math.random() * 12;

      const mesh = VoxelModels.createPowerUpItem(chosenType);
      mesh.position.set(puLane * GAME_CONSTANTS.LANE_WIDTH, 1.1, puZ);
      this.scene.add(mesh);

      this.collectibles.push({
        id: this.entityIdCounter++,
        mesh,
        lane: puLane,
        z: puZ,
        y: 1.1,
        type: 'POWER_UP',
        powerUpType: chosenType,
        collected: false,
        initialY: 1.1,
      });
    }
  }

  /**
   * Main update tick for world manager
   */
  public update(playerZ: number, delta: number, time: number) {
    this.currentDistance = Math.max(0, playerZ);

    // Recycle chunks that have passed behind player
    const recycleThreshold = playerZ - 30;
    while (this.chunks.length > 0 && this.chunks[0].zEnd < recycleThreshold) {
      const oldChunk = this.chunks.shift();
      if (oldChunk) {
        this.scene.remove(oldChunk.mesh);
      }
    }

    // Keep ahead chunks spawned
    const targetZAhead = playerZ + GAME_CONSTANTS.VISIBLE_CHUNKS * GAME_CONSTANTS.CHUNK_LENGTH;
    while (this.nextChunkZ < targetZAhead) {
      this.spawnChunk(false);
    }

    // Update ambient particles
    this.updateParticles(playerZ, delta);

    // Update animated obstacles (enemies)
    this.obstacles.forEach((obs) => {
      if (obs.update) {
        obs.update(delta, time);
        // Refresh dynamic hitbox for moving enemy
        obs.hitbox.minX = obs.mesh.position.x - 0.7;
        obs.hitbox.maxX = obs.mesh.position.x + 0.7;
      }
    });

    // Rotate collectibles & bob them gently
    this.collectibles.forEach((c) => {
      if (!c.collected) {
        c.mesh.rotation.y += delta * 3.5;
        c.mesh.position.y = c.initialY + Math.sin(time * 5 + c.id) * 0.15;
      }
    });

    // Cleanup passed obstacles & collectibles
    this.obstacles = this.obstacles.filter((obs) => {
      if (obs.z < playerZ - 20) {
        this.scene.remove(obs.mesh);
        if (obs.bridgeMesh) this.scene.remove(obs.bridgeMesh);
        return false;
      }
      return true;
    });

    this.collectibles = this.collectibles.filter((c) => {
      if (c.collected || c.z < playerZ - 20) {
        this.scene.remove(c.mesh);
        return false;
      }
      return true;
    });
  }

  /**
   * Check if there is an upcoming gap within warning distance (for Block Builder)
   */
  public getUpcomingGap(playerZ: number, playerLane: number): { obstacle: ActiveObstacle; distance: number } | null {
    for (const obs of this.obstacles) {
      if (obs.type === 'GAP' && !obs.hasBridge) {
        const dist = obs.z - playerZ;
        if (dist > 0 && dist < 32 && obs.lane === playerLane) {
          return { obstacle: obs, distance: dist };
        }
      }
    }
    return null;
  }

  /**
   * Build bridge across gap
   */
  public buildBridge(gapObstacle: ActiveObstacle): boolean {
    if (gapObstacle.type !== 'GAP' || gapObstacle.hasBridge) return false;

    const bridgeMesh = VoxelModels.createBridgeMesh();
    bridgeMesh.position.set(gapObstacle.lane * GAME_CONSTANTS.LANE_WIDTH, 0, gapObstacle.z);
    this.scene.add(bridgeMesh);

    gapObstacle.hasBridge = true;
    gapObstacle.bridgeMesh = bridgeMesh;

    return true;
  }

  /**
   * Attract nearby G-Cores towards the player (G-CORE MAGNET power-up)
   */
  public attractCollectibles(playerX: number, playerY: number, playerZ: number, delta: number) {
    const magnetRadiusSq = GAME_CONSTANTS.MAGNET_RADIUS * GAME_CONSTANTS.MAGNET_RADIUS;

    this.collectibles.forEach((c) => {
      if (c.collected) return;
      const dx = playerX - c.mesh.position.x;
      const dy = playerY - c.mesh.position.y;
      const dz = playerZ - c.mesh.position.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < magnetRadiusSq && dz > -2) {
        // Smoothly pull towards player
        c.mesh.position.x += dx * delta * 7;
        c.mesh.position.y += dy * delta * 7;
        c.mesh.position.z += dz * delta * 7;
      }
    });
  }
}

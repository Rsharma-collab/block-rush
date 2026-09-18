import * as THREE from 'three';
import { BiomeType, PowerUpType } from '../types';
import { GAME_CONSTANTS } from './constants';

export class VoxelModels {
  // Shared materials & geometries cache for high performance
  private static blockGeom = new THREE.BoxGeometry(1, 1, 1);
  private static sharedMaterials: Map<string, THREE.Material> = new Map();

  private static getMaterial(color: number, emissive: number = 0, roughness: number = 0.6): THREE.MeshLambertMaterial {
    const key = `${color}_${emissive}_${roughness}`;
    if (!this.sharedMaterials.has(key)) {
      this.sharedMaterials.set(
        key,
        new THREE.MeshLambertMaterial({
          color,
          emissive,
          emissiveIntensity: emissive > 0 ? 0.6 : 0,
        })
      );
    }
    return this.sharedMaterials.get(key) as THREE.MeshLambertMaterial;
  }

  /**
   * Builds the original Player Character: "Blocky Courier"
   */
  public static createPlayer(): {
    root: THREE.Group;
    body: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    wings: THREE.Group;
    shieldMesh: THREE.Mesh;
    updateAnimation: (time: number, isJumping: boolean, isSliding: boolean, isGliding: boolean, speedRatio: number) => void;
  } {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    // Torso (Cyan/Teal Tech Runner Tunic)
    const torsoMat = this.getMaterial(0x0284c7);
    const accentMat = this.getMaterial(0x38bdf8, 0x0284c7);
    const skinMat = this.getMaterial(0xfbcfe8); // stylized light block skin
    const hairMat = this.getMaterial(0x334155); // charcoal hair
    const pantsMat = this.getMaterial(0x1e293b); // dark runner pants
    const shoeMat = this.getMaterial(0xe2e8f0);

    // Torso block
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.4), torsoMat);
    torso.position.y = 0.8;
    torso.castShadow = true;
    bodyGroup.add(torso);

    // Runner chest crest
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), accentMat);
    crest.position.set(0, 0.85, 0.21);
    bodyGroup.add(crest);

    // Courier Backpack
    const packMat = this.getMaterial(0xb45309);
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.25), packMat);
    pack.position.set(0, 0.8, -0.25);
    bodyGroup.add(pack);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.45, 0);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Hair cap
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.25, 0.57), hairMat);
    hair.position.y = 0.18;
    headGroup.add(hair);

    // Runner visor / goggles (glowing amber)
    const visorMat = this.getMaterial(0xf59e0b, 0xf59e0b);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.1), visorMat);
    visor.position.set(0, 0.04, 0.26);
    headGroup.add(visor);

    bodyGroup.add(headGroup);

    // Arms
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.48, 1.15, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.7, 0.24), torsoMat);
    leftArmMesh.position.y = -0.32;
    leftArmMesh.castShadow = true;
    leftArm.add(leftArmMesh);
    bodyGroup.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.48, 1.15, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.7, 0.24), torsoMat);
    rightArmMesh.position.y = -0.32;
    rightArmMesh.castShadow = true;
    rightArm.add(rightArmMesh);
    bodyGroup.add(rightArm);

    // Legs
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.2, 0.45, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.55, 0.26), pantsMat);
    leftLegMesh.position.y = -0.22;
    leftLegMesh.castShadow = true;
    leftLeg.add(leftLegMesh);
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.35), shoeMat);
    leftShoe.position.set(0, -0.42, 0.04);
    leftLeg.add(leftShoe);
    bodyGroup.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.2, 0.45, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.55, 0.26), pantsMat);
    rightLegMesh.position.y = -0.22;
    rightLegMesh.castShadow = true;
    rightLeg.add(rightLegMesh);
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.35), shoeMat);
    rightShoe.position.set(0, -0.42, 0.04);
    rightLeg.add(rightShoe);
    bodyGroup.add(rightLeg);

    // Elytra Glider Wings (hidden by default)
    const wings = new THREE.Group();
    const wingMat = this.getMaterial(0x818cf8, 0x4f46e5);
    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 1.4), wingMat);
    leftWing.position.set(-0.55, 0, -0.4);
    leftWing.rotation.z = 0.2;
    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 1.4), wingMat);
    rightWing.position.set(0.55, 0, -0.4);
    rightWing.rotation.z = -0.2;
    wings.add(leftWing, rightWing);
    wings.position.set(0, 0.9, -0.3);
    wings.visible = false;
    bodyGroup.add(wings);

    // Shield Dome
    const shieldGeom = new THREE.IcosahedronGeometry(1.2, 1);
    const shieldMat = new THREE.MeshLambertMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    const shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
    shieldMesh.position.set(0, 0.9, 0);
    shieldMesh.visible = false;
    root.add(shieldMesh);

    // Animation controller
    const updateAnimation = (
      time: number,
      isJumping: boolean,
      isSliding: boolean,
      isGliding: boolean,
      speedRatio: number
    ) => {
      wings.visible = isGliding;

      if (isGliding) {
        // Wings flutter smoothly, player tilts forward
        bodyGroup.rotation.x = 0.65;
        bodyGroup.position.y = 0.3;
        leftWing.rotation.y = Math.sin(time * 12) * 0.15;
        rightWing.rotation.y = -Math.sin(time * 12) * 0.15;
        leftLeg.rotation.x = 0.4;
        rightLeg.rotation.x = 0.4;
        leftArm.rotation.x = -0.6;
        rightArm.rotation.x = -0.6;
        return;
      }

      if (isSliding) {
        // Slide pose: player leans back and drops low to ground
        bodyGroup.position.y = -0.45;
        bodyGroup.rotation.x = -0.8;
        leftLeg.rotation.x = 1.3;
        rightLeg.rotation.x = 1.1;
        leftArm.rotation.x = -1.2;
        rightArm.rotation.x = -1.2;
        return;
      }

      if (isJumping) {
        // Jumping pose: knees tucked up, arms elevated
        bodyGroup.position.y = 0;
        bodyGroup.rotation.x = 0.15;
        leftLeg.rotation.x = -0.9;
        rightLeg.rotation.x = -0.4;
        leftArm.rotation.x = 0.8;
        rightArm.rotation.x = 0.8;
        return;
      }

      // Normal Running stride
      bodyGroup.position.y = Math.abs(Math.sin(time * 14 * speedRatio)) * 0.12;
      bodyGroup.rotation.x = 0.1; // slight forward lean
      bodyGroup.rotation.y = Math.sin(time * 7 * speedRatio) * 0.05;

      const runCycle = time * 14 * speedRatio;
      leftLeg.rotation.x = Math.sin(runCycle) * 0.85;
      rightLeg.rotation.x = -Math.sin(runCycle) * 0.85;
      leftArm.rotation.x = -Math.sin(runCycle) * 0.85;
      rightArm.rotation.x = Math.sin(runCycle) * 0.85;
    };

    return { root, body: bodyGroup, leftLeg, rightLeg, leftArm, rightArm, wings, shieldMesh, updateAnimation };
  }

  /**
   * Builds the original G-CORE collectible:
   * Glowing multicolor faceted energy object with subtle G-inspired notch.
   */
  public static createGCore(): THREE.Group {
    const group = new THREE.Group();

    // Geometric segmented energy ring forming a stylised open G
    const coreMat = new THREE.MeshLambertMaterial({
      color: 0x06b6d4, // Cyan/Teal
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
    });
    const notchMat = new THREE.MeshLambertMaterial({
      color: 0xf59e0b, // Amber gold
      emissive: 0xd97706,
      emissiveIntensity: 0.9,
    });
    const accentMat = new THREE.MeshLambertMaterial({
      color: 0xec4899, // Magenta
      emissive: 0xdb2777,
      emissiveIntensity: 0.9,
    });

    const cubeGeom = new THREE.BoxGeometry(0.24, 0.24, 0.24);

    // Create 3D voxel ring segments that loop around with an inner notch
    const segments = [
      // Top horizontal bar
      { x: -0.24, y: 0.36, z: 0, mat: coreMat },
      { x: 0.0, y: 0.36, z: 0, mat: coreMat },
      { x: 0.24, y: 0.36, z: 0, mat: coreMat },
      // Left vertical spine
      { x: -0.36, y: 0.18, z: 0, mat: coreMat },
      { x: -0.36, y: 0.0, z: 0, mat: coreMat },
      { x: -0.36, y: -0.18, z: 0, mat: coreMat },
      // Bottom horizontal bar
      { x: -0.24, y: -0.36, z: 0, mat: coreMat },
      { x: 0.0, y: -0.36, z: 0, mat: coreMat },
      { x: 0.24, y: -0.36, z: 0, mat: coreMat },
      // Right bottom spur
      { x: 0.36, y: -0.18, z: 0, mat: accentMat },
      { x: 0.36, y: 0.0, z: 0, mat: accentMat },
      // Inward G-spur
      { x: 0.18, y: 0.0, z: 0, mat: notchMat },
    ];

    segments.forEach((seg) => {
      const mesh = new THREE.Mesh(cubeGeom, seg.mat);
      mesh.position.set(seg.x, seg.y, seg.z);
      group.add(mesh);
    });

    // Central pulsing diamond core
    const diamondGeom = new THREE.OctahedronGeometry(0.18);
    const diamond = new THREE.Mesh(
      diamondGeom,
      new THREE.MeshLambertMaterial({
        color: 0xffffff,
        emissive: 0x38bdf8,
        emissiveIntensity: 1.0,
      })
    );
    group.add(diamond);

    return group;
  }

  /**
   * Building Block collectible (resource for Block Builder)
   */
  public static createBlockItem(): THREE.Group {
    const group = new THREE.Group();
    const blockMat = this.getMaterial(0xb45309, 0x78350f); // Wood/stone block
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), blockMat);
    mesh.castShadow = true;
    group.add(mesh);

    // Glowing border edges
    const border = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({ color: 0xfef08a, linewidth: 2 })
    );
    group.add(border);

    return group;
  }

  /**
   * Power-Up Token
   */
  public static createPowerUpItem(type: PowerUpType): THREE.Group {
    const group = new THREE.Group();

    // Floating orb base
    let color = 0x38bdf8;
    let emissive = 0x0284c7;

    if (type === 'REDSTONE_BOOST') {
      color = 0xef4444;
      emissive = 0xb91c1c;
    } else if (type === 'MAGNET') {
      color = 0xa855f7;
      emissive = 0x7e22ce;
    } else if (type === 'ELYTRA') {
      color = 0xf59e0b;
      emissive = 0xb45309;
    }

    const orbMat = new THREE.MeshLambertMaterial({
      color,
      emissive,
      emissiveIntensity: 0.9,
    });

    const box = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.65), orbMat);
    group.add(box);

    const ring = new THREE.LineSegments(
      new THREE.EdgesGeometry(box.geometry),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
    );
    group.add(ring);

    return group;
  }

  /**
   * Original Enemy: VOLT CREATURE
   * A glowing hostile block automaton that patrols across lanes
   */
  public static createVoltCreature(): {
    mesh: THREE.Group;
    update: (delta: number, time: number) => void;
  } {
    const root = new THREE.Group();

    const bodyMat = this.getMaterial(0x1e1b4b, 0x312e81); // deep indigo
    const electricMat = this.getMaterial(0x06b6d4, 0x22d3ee); // pulsing electric cyan
    const eyeMat = this.getMaterial(0xf43f5e, 0xe11d48); // hostile ruby eyes

    // Main torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.8), bodyMat);
    torso.position.y = 0.75;
    torso.castShadow = true;
    root.add(torso);

    // Floating electric horns
    const hornGeom = new THREE.BoxGeometry(0.2, 0.5, 0.2);
    const leftHorn = new THREE.Mesh(hornGeom, electricMat);
    leftHorn.position.set(-0.4, 1.4, 0);
    const rightHorn = new THREE.Mesh(hornGeom, electricMat);
    rightHorn.position.set(0.4, 1.4, 0);
    root.add(leftHorn, rightHorn);

    // Hostile glowing eyes
    const eyeGeom = new THREE.BoxGeometry(0.2, 0.12, 0.1);
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.25, 0.85, 0.41);
    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.25, 0.85, 0.41);
    root.add(leftEye, rightEye);

    // 4 stubby crawler legs
    const legGeom = new THREE.BoxGeometry(0.25, 0.4, 0.25);
    const legs: THREE.Mesh[] = [];
    const legPositions = [
      [-0.4, 0.2, 0.25],
      [0.4, 0.2, 0.25],
      [-0.4, 0.2, -0.25],
      [0.4, 0.2, -0.25],
    ];

    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeom, bodyMat);
      leg.position.set(lx, ly, lz);
      root.add(leg);
      legs.push(leg);
    });

    const update = (delta: number, time: number) => {
      // Hover and step animation
      torso.position.y = 0.75 + Math.sin(time * 6) * 0.08;
      leftHorn.position.y = 1.4 + Math.sin(time * 9) * 0.06;
      rightHorn.position.y = 1.4 - Math.sin(time * 9) * 0.06;

      legs.forEach((leg, idx) => {
        leg.position.y = 0.2 + Math.abs(Math.sin(time * 8 + idx * 1.5)) * 0.1;
      });
    };

    return { mesh: root, update };
  }

  /**
   * Obstacles
   */
  public static createLowBarrier(): THREE.Group {
    const group = new THREE.Group();
    // Voxel wooden/spiked hurdle (height 0.85)
    const woodMat = this.getMaterial(0x78350f);
    const postGeom = new THREE.BoxGeometry(0.25, 0.85, 0.25);
    const leftPost = new THREE.Mesh(postGeom, woodMat);
    leftPost.position.set(-1.0, 0.425, 0);
    const rightPost = new THREE.Mesh(postGeom, woodMat);
    rightPost.position.set(1.0, 0.425, 0);

    const railGeom = new THREE.BoxGeometry(2.3, 0.28, 0.2);
    const rail = new THREE.Mesh(railGeom, woodMat);
    rail.position.set(0, 0.7, 0);

    // Hazard stripes or warning block
    const warningMat = this.getMaterial(0xf59e0b, 0xd97706);
    const warningBlock = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.29, 0.22), warningMat);
    warningBlock.position.set(0, 0.7, 0);

    group.add(leftPost, rightPost, rail, warningBlock);
    return group;
  }

  public static createHighBarrier(): THREE.Group {
    const group = new THREE.Group();
    // High overhead arch / beam (height 1.35 to 2.8, player must slide underneath!)
    const stoneMat = this.getMaterial(0x52525b);
    const cautionMat = this.getMaterial(0xeab308, 0xca8a04);

    const leftCol = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.7, 0.4), stoneMat);
    leftCol.position.set(-1.1, 1.35, 0);
    const rightCol = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.7, 0.4), stoneMat);
    rightCol.position.set(1.1, 1.35, 0);

    // Overhead beam, clears 1.15m from floor
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 0.5), cautionMat);
    beam.position.set(0, 1.9, 0);

    group.add(leftCol, rightCol, beam);
    return group;
  }

  public static createSolidWall(): THREE.Group {
    const group = new THREE.Group();
    // Solid block pillar spanning 1 full lane (must switch lane)
    const wallMat = this.getMaterial(0x3f3f46, 0x18181b);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(2.1, 3.2, 0.8), wallMat);
    wall.position.set(0, 1.6, 0);
    wall.castShadow = true;

    // Stone brick detail pattern
    const runeMat = this.getMaterial(0x06b6d4, 0x0891b2);
    const rune = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.82), runeMat);
    rune.position.set(0, 1.6, 0);

    group.add(wall, rune);
    return group;
  }

  public static createLavaPool(): THREE.Group {
    const group = new THREE.Group();
    // Glowing lava pit in the track
    const rimMat = this.getMaterial(0x292524);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.15, 3.5), rimMat);
    rim.position.set(0, 0.02, 0);

    const lavaMat = new THREE.MeshLambertMaterial({
      color: 0xf97316,
      emissive: 0xe11d48,
      emissiveIntensity: 0.9,
    });
    const lava = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 3.3), lavaMat);
    lava.position.set(0, 0.05, 0);

    group.add(rim, lava);
    return group;
  }

  /**
   * Temporary Block Bridge built by player with [E]
   */
  public static createBridgeMesh(): THREE.Group {
    const group = new THREE.Group();
    const bridgeMat = this.getMaterial(0x0284c7, 0x0369a1);
    const slabMat = this.getMaterial(0x38bdf8, 0x0ea5e9);

    const length = 7.0;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, length), bridgeMat);
    slab.position.set(0, -0.15, 0);

    // Glowing runway edges
    const leftRunway = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.45, length), slabMat);
    leftRunway.position.set(-1.15, -0.1, 0);
    const rightRunway = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.45, length), slabMat);
    rightRunway.position.set(1.15, -0.1, 0);

    group.add(slab, leftRunway, rightRunway);
    return group;
  }

  /**
   * Scenery: Voxel Trees & Rocks
   */
  public static createVoxelTree(biome: BiomeType): THREE.Group {
    const tree = new THREE.Group();

    let trunkColor = 0x5a3e1b;
    let foliageColor = 0x2e7d32;

    if (biome === 'MOUNTAINS') {
      foliageColor = 0x1e3a2b; // dark pine
    } else if (biome === 'CAVE') {
      trunkColor = 0x3f3f46;
      foliageColor = 0x06b6d4; // glowing cave stalagmite / giant mushroom
    } else if (biome === 'LAVA_ZONE') {
      trunkColor = 0x27272a;
      foliageColor = 0x991b1b; // scorched crimson
    } else if (biome === 'NIGHT_FOREST') {
      foliageColor = 0x4338ca; // indigo enchanted foliage
    }

    const trunk = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 3.5, 0.8),
      this.getMaterial(trunkColor)
    );
    trunk.position.y = 1.75;
    trunk.castShadow = true;
    tree.add(trunk);

    // Blocky layered leaves
    const foliageMat = this.getMaterial(foliageColor);
    const layer1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 3.2), foliageMat);
    layer1.position.y = 3.8;
    layer1.castShadow = true;

    const layer2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 2.4), foliageMat);
    layer2.position.y = 5.0;
    layer2.castShadow = true;

    const layer3 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 1.4), foliageMat);
    layer3.position.y = 6.0;
    layer3.castShadow = true;

    tree.add(layer1, layer2, layer3);
    return tree;
  }

  public static createMountainRock(biome: BiomeType): THREE.Group {
    const rock = new THREE.Group();
    const color = biome === 'LAVA_ZONE' ? 0x18181b : biome === 'MOUNTAINS' ? 0x94a3b8 : 0x52525b;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 4.5, 3.5),
      this.getMaterial(color)
    );
    mesh.position.y = 2.25;
    mesh.castShadow = true;
    rock.add(mesh);
    return rock;
  }
}

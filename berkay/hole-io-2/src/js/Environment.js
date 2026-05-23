import * as THREE from 'three';

const OBJECT_COLORS = {
  cone: 0xff3333,
  bench: 0x8b4513,
  mailbox: 0xff0000,
  tree: 0x228b22,
  lamp: 0xffff00,
  car: 0xff6600,
  stall: 0xffcc00,
  house: 0xaa6633,
  truck: 0xcc6600,
  building: 0x4488ff,
  tower: 0x5599ff,
  apartment: 0x6699ff
};

const OBJECT_SIZES = {
  cone: 0.3,
  bench: 0.4,
  mailbox: 0.35,
  tree: 0.5,
  lamp: 0.4,
  car: 0.9,
  stall: 1.0,
  house: 1.2,
  truck: 1.1,
  building: 1.8,
  tower: 2.0,
  apartment: 2.2
};

const OBJECT_SCORES = {
  cone: 10, bench: 10, mailbox: 10, tree: 10, lamp: 10,
  car: 50, stall: 50, house: 50, truck: 50,
  building: 200, tower: 200, apartment: 200
};

export function spawnEnvironment(state) {
  const worldSize = state.config.game.worldSize;
  const spawnConfig = state.config.environment;

  // Near spawn zone - small objects
  spawnObjectGroup(state, spawnConfig.spawnSmall, -worldSize, -worldSize / 2, 0, worldSize / 2);

  // Mid zone - medium objects
  spawnObjectGroup(state, spawnConfig.spawnMedium, -worldSize / 2, worldSize / 2, -worldSize / 3, worldSize / 3);

  // Far zone - large objects
  spawnObjectGroup(state, spawnConfig.spawnLarge, worldSize / 3, worldSize, worldSize / 3, worldSize);
}

function spawnObjectGroup(state, templates, xMin, xMax, zMin, zMax) {
  const count = Math.floor(templates.length * 3);

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const x = xMin + Math.random() * (xMax - xMin);
    const z = zMin + Math.random() * (zMax - zMin);

    createConsumableObject(state, template.type, x, z);
  }
}

export function createConsumableObject(state, type, x, z) {
  const size = OBJECT_SIZES[type] || 0.5;
  const color = OBJECT_COLORS[type] || 0xffffff;
  const score = OBJECT_SCORES[type] || 10;

  // Create mesh based on type
  let geometry;
  switch (type) {
    case 'cone':
      geometry = new THREE.ConeGeometry(size / 2, size, 8);
      break;
    case 'tree':
      geometry = new THREE.ConeGeometry(size / 3, size, 6);
      break;
    default:
      geometry = new THREE.BoxGeometry(size, size, size);
  }

  const material = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.3,
    roughness: 0.7
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, size / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.userData = {
    type: type,
    size: size,
    score: score,
    consumed: false,
    animating: false,
    consumeStart: 0,
    consumeDuration: 0,
    consumeStartPos: new THREE.Vector3(),
    consumeStartScale: new THREE.Vector3(1, 1, 1)
  };

  state.objectsLayer.add(mesh);
  state.spawnedObjects.push(mesh);

  return mesh;
}

export function updateEnvironment(state, delta) {
  // Update consumption animations
  for (let i = state.spawnedObjects.length - 1; i >= 0; i--) {
    const obj = state.spawnedObjects[i];

    if (obj.userData.animating) {
      const elapsed = state.gameTime - obj.userData.consumeStart;
      const progress = elapsed / obj.userData.consumeDuration;

      if (progress >= 1) {
        obj.userData.animating = false;
        obj.visible = false;
      } else {
        // Scale down
        obj.scale.lerpVectors(
          obj.userData.consumeStartScale,
          new THREE.Vector3(0.1, 0.1, 0.1),
          progress
        );

        // Move toward hole
        obj.position.lerpVectors(
          obj.userData.consumeStartPos,
          state.playerHole.position,
          Math.pow(progress, 0.8)
        );
      }
    }
  }
}

export function checkCollisions(state, playerHole) {
  const holeDiameter = playerHole.userData.diameter;
  const holeRadius = holeDiameter / 2;
  const holePos = playerHole.position;

  const consumed = [];

  for (let i = 0; i < state.spawnedObjects.length; i++) {
    const obj = state.spawnedObjects[i];
    if (!obj.visible || obj.userData.consumed) continue;

    // Distance-based collision
    const distance = holePos.distanceTo(obj.position);
    const objRadius = obj.userData.size / 2;

    if (distance < holeRadius + objRadius * 0.7) {
      // Check if object is small enough to consume
      if (obj.userData.size <= holeDiameter * 0.9) {
        consumed.push({
          object: obj,
          score: obj.userData.score,
          size: obj.userData.size
        });

        obj.userData.consumed = true;
        obj.userData.animating = true;
        obj.userData.consumeStart = state.gameTime;
        obj.userData.consumeDuration = state.config.player.consumptionAnimDuration;
        obj.userData.consumeStartPos = obj.position.clone();
        obj.userData.consumeStartScale = obj.scale.clone();
      }
    }
  }

  return consumed;
}

export function cleanupEnvironment(state) {
  state.spawnedObjects.forEach(obj => {
    obj.geometry?.dispose();
    obj.material?.dispose();
    state.objectsLayer.remove(obj);
  });
  state.spawnedObjects = [];
}

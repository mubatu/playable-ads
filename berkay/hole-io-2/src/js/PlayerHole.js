import * as THREE from 'three';

export function createPlayerHole(config) {
  const group = new THREE.Group();
  group.position.set(0, 0, 0.01);

  // Create the hole mesh with a radial gradient material
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 90);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
  gradient.addColorStop(1, 'rgba(50, 50, 50, 0.3)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;

  const geometry = new THREE.CircleGeometry(config.player.initialDiameter / 2, 32);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2; // Rotate to face up
  group.add(mesh);

  // Shadow circle
  const shadowGeo = new THREE.CircleGeometry(config.player.initialDiameter / 2, 32);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.3
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.z = -0.01;
  shadowMesh.rotation.x = Math.PI / 2;
  group.add(shadowMesh);

  group.userData = {
    diameter: config.player.initialDiameter,
    maxDiameter: config.player.maxDiameter,
    holeMesh: mesh,
    shadowMesh: shadowMesh,
    geometry: geometry,
    material: material,
    texture: texture,
    canvas: canvas,
    pulseTime: 0
  };

  return group;
}

export function updatePlayerHole(hole, delta) {
  // Pulse animation when growing
  hole.userData.pulseTime += delta;
  const pulse = Math.sin(hole.userData.pulseTime * 8) * 0.02 + 1;
  hole.scale.set(pulse, 1, pulse);
}

export function consumeObject(state, holeGroup, object, scorePoints) {
  const duration = state.config.player.consumptionAnimDuration;
  const startPos = object.position.clone();
  const startScale = object.scale.clone();
  const startTime = state.gameTime;

  // Animation callback
  object.userData.animating = true;
  object.userData.consumeStart = startTime;
  object.userData.consumeDuration = duration;
  object.userData.consumeStartPos = startPos;
  object.userData.consumeStartScale = startScale;

  // Grow the hole
  growHole(state, holeGroup);

  // Create particle effect
  createConsumptionParticles(state, startPos);

  return duration;
}

export function growHole(state, holeGroup) {
  const hole = holeGroup.userData;
  const sizeIncrease = 0.05; // Default for small objects
  const newDiameter = Math.min(hole.diameter + sizeIncrease, hole.maxDiameter);

  hole.diameter = newDiameter;
  const radius = newDiameter / 2;

  // Update geometry
  hole.holeMesh.geometry.dispose();
  hole.shadowMesh.geometry.dispose();

  const newGeo = new THREE.CircleGeometry(radius, 32);
  hole.holeMesh.geometry = newGeo;
  hole.shadowMesh.geometry = newGeo;

  holeGroup.userData.geometry = newGeo;

  // Camera should zoom out slightly
  state.userData = state.userData || {};
  state.userData.cameraZoom = 8 + (newDiameter * 0.5);
}

export function getHoleDiameter(holeGroup) {
  return holeGroup.userData.diameter;
}

export function getHoleRadius(holeGroup) {
  return holeGroup.userData.diameter / 2;
}

function createConsumptionParticles(state, position) {
  const particleCount = 8;
  for (let i = 0; i < particleCount; i++) {
    const particle = state.particlePool.get();
    if (!particle) continue;

    particle.visible = true;
    particle.position.copy(position);

    const angle = (i / particleCount) * Math.PI * 2;
    const speed = 3 + Math.random() * 2;
    particle.userData.velocity.x = Math.cos(angle) * speed;
    particle.userData.velocity.y = Math.random() * 2 - 1;
    particle.userData.velocity.z = Math.sin(angle) * speed;
    particle.userData.life = 0;
    particle.userData.maxLife = 0.5;

    state.particlesLayer.add(particle);
    state.activeParticles.add(particle);
  }
}

export function updateConsumptionAnimation(state, object, delta) {
  if (!object.userData.animating) return false;

  const elapsed = state.gameTime - object.userData.consumeStart;
  const duration = object.userData.consumeDuration;
  const progress = elapsed / duration;

  if (progress >= 1) {
    object.userData.animating = false;
    object.visible = false;
    return false;
  }

  // Animate scale down
  const scale = object.userData.consumeStartScale.clone().multiplyScalar(1 - progress);
  object.scale.copy(scale);

  // Animate toward hole
  const holePos = state.playerHole.position;
  object.position.lerpVectors(
    object.userData.consumeStartPos,
    holePos,
    Math.pow(progress, 0.8)
  );

  return true;
}

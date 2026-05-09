import * as THREE from 'three';
import { ObjectPool } from '../../../../reusables/components/ObjectPool.js';
import '../../../../reusables/components/HandTutorial.js';

const CONFIG = {
  worldHeight: 16,
  gravity: -22,
  flapVelocity: 8.2,
  birdRadius: 0.38,
  obstacleTarget: 10,
  obstacleSpacing: 4.9,
  startSpeed: 3.15,
  maxSpeed: 4.55,
  gapHalfHeight: 2.15,
  poolSize: 5,
};

const root = document.querySelector('#game-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x83d9ff);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
root.appendChild(renderer.domElement);

root.insertAdjacentHTML(
  'beforeend',
  `<div class="hud">
    <div class="top-bar">
      <div class="progress-pill" id="progress">0 / ${CONFIG.obstacleTarget}</div>
    </div>
    <div class="instruction-pill" id="instruction">
      <strong>Tap to Fly</strong>
      <span>Tap to flap!</span>
    </div>
  </div>
  <div class="flash" id="hit-flash"></div>
  <div class="overlay" id="end-overlay">
    <div class="panel">
      <h1 id="end-title">Great Job!</h1>
      <p id="end-subtitle">You flew through every obstacle.</p>
      <div class="button-row">
        <button class="game-button" id="cta-button">Play Now</button>
        <button class="game-button secondary" id="replay-button">Replay</button>
      </div>
    </div>
  </div>`
);

const progressEl = document.querySelector('#progress');
const instructionEl = document.querySelector('#instruction');
const overlayEl = document.querySelector('#end-overlay');
const titleEl = document.querySelector('#end-title');
const subtitleEl = document.querySelector('#end-subtitle');
const ctaButton = document.querySelector('#cta-button');
const replayButton = document.querySelector('#replay-button');
const hitFlashEl = document.querySelector('#hit-flash');

let worldWidth = 9;
let worldTop = CONFIG.worldHeight / 2;
let worldBottom = -CONFIG.worldHeight / 2;
let handTutorial = null;
let lastNow = 0;

const state = {
  phase: 'ready',
  birdY: 0,
  birdVelocity: 0,
  progress: 0,
  spawned: 0,
  nextSpawnX: 0,
  speed: CONFIG.startSpeed,
  idleTime: 0,
};

const obstacleLayer = new THREE.Group();
scene.add(obstacleLayer);

const activeObstacles = [];
const palette = {
  spike: 0x20577a,
  spikeDark: 0x153d5c,
  diamond: 0xf25d5d,
  diamondDark: 0xba3b4a,
  bird: 0xffd84d,
  wing: 0xff9e3d,
  beak: 0xff7043,
};

createBackground();

const bird = createBird();
scene.add(bird);

const obstaclePool = new ObjectPool(createObstacleSet, resetObstacleSet, CONFIG.poolSize);

resize();
resetGame();
window.addEventListener('resize', resize);
window.addEventListener('pointerdown', handlePointerDown, { passive: false });
ctaButton.addEventListener('pointerdown', stopButtonPointer);
replayButton.addEventListener('pointerdown', stopButtonPointer);
ctaButton.addEventListener('click', handleCta);
replayButton.addEventListener('click', resetGame);

renderer.setAnimationLoop(update);

function createBackground() {
  const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.72 });
  const cloudGeometry = new THREE.CircleGeometry(0.5, 24);
  const cloudPositions = [
    [-3.2, 4.7, 1.2],
    [2.9, 5.1, 0.9],
    [0.2, 3.7, 1.0],
    [-2.2, -5.4, 0.75],
  ];

  cloudPositions.forEach(([x, y, scale]) => {
    const cloud = new THREE.Group();
    for (let i = 0; i < 4; i += 1) {
      const puff = new THREE.Mesh(cloudGeometry, cloudMaterial);
      puff.position.set((i - 1.5) * 0.45, Math.sin(i) * 0.08, -1);
      puff.scale.setScalar(scale * (0.72 + i * 0.08));
      cloud.add(puff);
    }
    cloud.position.set(x, y, 0);
    scene.add(cloud);
  });

  const bandGeometry = new THREE.PlaneGeometry(80, 1.2);
  const bandMaterial = new THREE.MeshBasicMaterial({ color: 0x65c774 });
  const topBand = new THREE.Mesh(bandGeometry, bandMaterial);
  const bottomBand = new THREE.Mesh(bandGeometry, bandMaterial);
  topBand.position.set(0, CONFIG.worldHeight / 2 + 0.55, -0.5);
  bottomBand.position.set(0, -CONFIG.worldHeight / 2 - 0.55, -0.5);
  scene.add(topBand, bottomBand);
}

function createBird() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 32),
    new THREE.MeshBasicMaterial({ color: palette.bird })
  );
  group.add(body);

  const wing = createPolygonMesh(
    [
      { x: -0.16, y: 0.03 },
      { x: -0.74, y: -0.2 },
      { x: -0.16, y: -0.34 },
    ],
    palette.wing
  );
  wing.position.z = 0.05;
  group.add(wing);

  const beak = createPolygonMesh(
    [
      { x: 0.42, y: 0.08 },
      { x: 0.88, y: -0.05 },
      { x: 0.42, y: -0.18 },
    ],
    palette.beak
  );
  beak.position.z = 0.07;
  group.add(beak);

  const eye = new THREE.Mesh(
    new THREE.CircleGeometry(0.07, 16),
    new THREE.MeshBasicMaterial({ color: 0x173047 })
  );
  eye.position.set(0.18, 0.17, 0.08);
  group.add(eye);

  group.position.set(-2.35, 0, 0.4);
  return group;
}

function createObstacleSet() {
  const group = new THREE.Group();
  group.visible = false;
  group.userData = {
    hazards: [],
    passed: false,
    index: 0,
  };
  return group;
}

function resetObstacleSet(group) {
  clearObstacleSet(group);
  group.visible = false;
  group.position.set(0, 0, 0);
  group.userData.passed = false;
}

function clearObstacleSet(group) {
  while (group.children.length > 0) {
    const child = group.children[group.children.length - 1];
    group.remove(child);
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      child.material.dispose();
    }
  }
  group.userData.hazards.length = 0;
}

function configureObstacleSet(group, index, x) {
  clearObstacleSet(group);
  group.visible = true;
  group.position.set(x, 0, 0);
  group.userData.passed = false;
  group.userData.index = index;

  const gapY = getGapY(index);
  const gapTop = gapY + CONFIG.gapHalfHeight;
  const gapBottom = gapY - CONFIG.gapHalfHeight;
  const style = index % 4;

  if (style === 0) {
    addPolygonHazard(group, [
      { x: -0.9, y: worldTop + 0.7 },
      { x: 0.9, y: worldTop + 0.7 },
      { x: 0, y: gapTop },
    ], palette.spike);
    addPolygonHazard(group, [
      { x: -0.95, y: worldBottom - 0.7 },
      { x: 0.95, y: worldBottom - 0.7 },
      { x: -0.06, y: gapBottom },
    ], palette.spikeDark);
    return;
  }

  if (style === 1) {
    addPolygonHazard(group, [
      { x: -0.72, y: worldTop + 0.65 },
      { x: 0.52, y: worldTop + 0.65 },
      { x: 0.1, y: gapTop + 0.22 },
      { x: -0.2, y: gapTop },
    ], palette.spike);
    addPolygonHazard(group, [
      { x: -0.66, y: worldBottom - 0.65 },
      { x: 0.68, y: worldBottom - 0.65 },
      { x: 0.28, y: gapBottom },
      { x: -0.08, y: gapBottom - 0.24 },
    ], palette.spikeDark);
    addDiamondHazard(group, gapY > 0 ? gapBottom - 1.0 : gapTop + 1.0);
    return;
  }

  if (style === 2) {
    addPolygonHazard(group, [
      { x: -0.76, y: worldTop + 0.75 },
      { x: 0.84, y: worldTop + 0.75 },
      { x: 0.26, y: gapTop + 0.15 },
      { x: -0.16, y: gapTop - 0.1 },
    ], palette.spike);
    addPolygonHazard(group, [
      { x: -0.74, y: worldBottom - 0.75 },
      { x: 0.78, y: worldBottom - 0.75 },
      { x: 0.2, y: gapBottom + 0.1 },
      { x: -0.14, y: gapBottom - 0.14 },
    ], palette.spikeDark);
    return;
  }

  addPolygonHazard(group, [
    { x: -0.55, y: worldTop + 0.7 },
    { x: 0.6, y: worldTop + 0.7 },
    { x: 0.35, y: gapTop + 0.42 },
    { x: 0.02, y: gapTop - 0.04 },
    { x: -0.32, y: gapTop + 0.28 },
  ], palette.spike);
  addPolygonHazard(group, [
    { x: -0.85, y: worldBottom - 0.7 },
    { x: 0.55, y: worldBottom - 0.7 },
    { x: 0.15, y: gapBottom - 0.28 },
    { x: -0.18, y: gapBottom + 0.04 },
    { x: -0.4, y: gapBottom - 0.4 },
  ], palette.spikeDark);
}

function addDiamondHazard(group, centerY) {
  addPolygonHazard(group, [
    { x: 0, y: centerY + 0.62 },
    { x: 0.48, y: centerY },
    { x: 0, y: centerY - 0.62 },
    { x: -0.48, y: centerY },
  ], palette.diamond);
}

function addPolygonHazard(group, vertices, color) {
  const mesh = createPolygonMesh(vertices, color);
  mesh.position.z = 0.2;
  group.add(mesh);
  group.userData.hazards.push({
    collider: insetPolygon(vertices, 0.88),
  });
}

function createPolygonMesh(vertices, color) {
  const shape = new THREE.Shape();
  shape.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < vertices.length; i += 1) {
    shape.lineTo(vertices[i].x, vertices[i].y);
  }
  shape.closePath();

  return new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({ color })
  );
}

function insetPolygon(vertices, scale) {
  const center = vertices.reduce(
    (acc, vertex) => {
      acc.x += vertex.x;
      acc.y += vertex.y;
      return acc;
    },
    { x: 0, y: 0 }
  );
  center.x /= vertices.length;
  center.y /= vertices.length;

  return vertices.map((vertex) => ({
    x: center.x + (vertex.x - center.x) * scale,
    y: center.y + (vertex.y - center.y) * scale,
  }));
}

function getGapY(index) {
  const pattern = [0.1, -1.05, 1.18, -0.35, 0.95, -1.22, 0.35, 1.32, -0.78, 0.58];
  return pattern[index % pattern.length];
}

function spawnObstacle() {
  const group = obstaclePool.get();
  configureObstacleSet(group, state.spawned, state.nextSpawnX);
  if (!group.parent) {
    obstacleLayer.add(group);
  }
  activeObstacles.push(group);
  state.spawned += 1;
  state.nextSpawnX += CONFIG.obstacleSpacing;
}

function maintainObstacleQueue() {
  while (
    state.spawned < CONFIG.obstacleTarget &&
    state.nextSpawnX < worldWidth / 2 + CONFIG.obstacleSpacing * 3.2
  ) {
    spawnObstacle();
  }
}

function handlePointerDown(event) {
  if (event.target.closest('.game-button')) {
    return;
  }

  event.preventDefault();

  if (state.phase === 'ready') {
    startGame();
  }

  if (state.phase === 'playing') {
    flap();
  }
}

function startGame() {
  state.phase = 'playing';
  instructionEl.style.display = 'none';
  stopHandTutorial();
}

function flap() {
  state.birdVelocity = CONFIG.flapVelocity;
  bird.scale.set(1.08, 0.92, 1);
  window.setTimeout(() => bird.scale.set(1, 1, 1), 80);
}

function resetGame() {
  state.phase = 'ready';
  state.birdY = 0;
  state.birdVelocity = 0;
  state.progress = 0;
  state.spawned = 0;
  state.speed = CONFIG.startSpeed;
  state.idleTime = 0;
  state.nextSpawnX = worldWidth / 2 + 3.2;

  overlayEl.classList.remove('visible');
  hitFlashEl.classList.remove('visible');
  instructionEl.style.display = 'block';
  progressEl.textContent = `0 / ${CONFIG.obstacleTarget}`;

  while (activeObstacles.length > 0) {
    const group = activeObstacles.pop();
    obstaclePool.release(group);
  }

  bird.position.set(-worldWidth * 0.24, 0, 0.4);
  bird.rotation.z = 0;
  maintainObstacleQueue();
  startHandTutorial();
}

function endGame(result) {
  if (state.phase === 'ended') {
    return;
  }

  state.phase = 'ended';
  stopHandTutorial();

  if (result === 'win') {
    titleEl.textContent = 'Great Job!';
    subtitleEl.textContent = 'You flew through all 10 obstacles.';
    replayButton.textContent = 'Replay';
  } else {
    titleEl.textContent = 'Try Again!';
    subtitleEl.textContent = 'One hit ends the flight. Retry or keep playing.';
    replayButton.textContent = 'Retry';
    hitFlashEl.classList.add('visible');
    window.setTimeout(() => hitFlashEl.classList.remove('visible'), 180);
  }

  overlayEl.classList.add('visible');
}

function handleCta() {
  window.dispatchEvent(new CustomEvent('playable:cta', { detail: { label: 'Play Now' } }));
  console.info('Play Now CTA clicked. Add the final store URL or ad-network callback here.');
}

function stopButtonPointer(event) {
  event.stopPropagation();
}

function startHandTutorial() {
  stopHandTutorial();

  if (!window.HandTutorial) {
    return;
  }

  handTutorial = new window.HandTutorial({
    container: root,
    renderer,
    camera,
    assetUrl: '/src/assets/hand-1.svg',
    gesture: 'tap',
    from: { x: 0.58, y: 0.58 },
    to: { x: 0.58, y: 0.58 },
    size: 92,
    anchor: { x: 0.38, y: 0.14 },
    repeat: true,
  });
  handTutorial.play();
}

function stopHandTutorial() {
  if (!handTutorial) {
    return;
  }

  handTutorial.destroy();
  handTutorial = null;
}

function update(now) {
  const delta = Math.min((now - lastNow) / 1000 || 0, 0.033);
  lastNow = now;

  if (handTutorial) {
    handTutorial.update(now);
  }

  if (state.phase === 'ready') {
    state.idleTime += delta;
    state.birdY = Math.sin(state.idleTime * 3.4) * 0.18;
    bird.position.y = state.birdY;
    bird.rotation.z = Math.sin(state.idleTime * 3.4) * 0.08;
  }

  if (state.phase === 'playing') {
    updatePlaying(delta);
  }

  renderer.render(scene, camera);
}

function updatePlaying(delta) {
  state.speed = Math.min(CONFIG.maxSpeed, state.speed + delta * 0.16);
  state.birdVelocity += CONFIG.gravity * delta;
  state.birdY += state.birdVelocity * delta;
  bird.position.y = state.birdY;
  bird.rotation.z = THREE.MathUtils.clamp(state.birdVelocity / 14, -0.65, 0.45);

  for (let i = activeObstacles.length - 1; i >= 0; i -= 1) {
    const group = activeObstacles[i];
    group.position.x -= state.speed * delta;

    if (!group.userData.passed && group.position.x < bird.position.x - 0.72) {
      group.userData.passed = true;
      state.progress += 1;
      progressEl.textContent = `${state.progress} / ${CONFIG.obstacleTarget}`;

      if (state.progress >= CONFIG.obstacleTarget) {
        endGame('win');
        return;
      }
    }

    if (group.position.x < -worldWidth / 2 - 2.4) {
      activeObstacles.splice(i, 1);
      obstaclePool.release(group);
    }
  }

  maintainObstacleQueue();

  if (
    state.birdY + CONFIG.birdRadius > worldTop ||
    state.birdY - CONFIG.birdRadius < worldBottom ||
    hitsAnyHazard()
  ) {
    endGame('lose');
  }
}

function hitsAnyHazard() {
  const cx = bird.position.x;
  const cy = bird.position.y;
  const radius = CONFIG.birdRadius * 0.84;

  for (const group of activeObstacles) {
    for (const hazard of group.userData.hazards) {
      if (circleIntersectsPolygon(cx, cy, radius, hazard.collider, group.position.x)) {
        return true;
      }
    }
  }

  return false;
}

function circleIntersectsPolygon(cx, cy, radius, vertices, offsetX) {
  if (pointInPolygon(cx, cy, vertices, offsetX)) {
    return true;
  }

  const radiusSq = radius * radius;
  for (let i = 0; i < vertices.length; i += 1) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    if (distanceToSegmentSq(cx, cy, a.x + offsetX, a.y, b.x + offsetX, b.y) <= radiusSq) {
      return true;
    }
  }

  return false;
}

function pointInPolygon(px, py, vertices, offsetX) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i, i += 1) {
    const xi = vertices[i].x + offsetX;
    const yi = vertices[i].y;
    const xj = vertices[j].x + offsetX;
    const yj = vertices[j].y;
    const intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function distanceToSegmentSq(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy || 1;
  const t = THREE.MathUtils.clamp(((px - ax) * dx + (py - ay) * dy) / lengthSq, 0, 1);
  const closestX = ax + dx * t;
  const closestY = ay + dy * t;
  const diffX = px - closestX;
  const diffY = py - closestY;
  return diffX * diffX + diffY * diffY;
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / Math.max(height, 1);
  worldWidth = CONFIG.worldHeight * aspect;
  worldTop = CONFIG.worldHeight / 2;
  worldBottom = -CONFIG.worldHeight / 2;

  camera.left = -worldWidth / 2;
  camera.right = worldWidth / 2;
  camera.top = CONFIG.worldHeight / 2;
  camera.bottom = -CONFIG.worldHeight / 2;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  bird.position.x = -worldWidth * 0.24;
}

import * as THREE from 'three';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import '../../../../reusables/components/HandTutorial.js';
import handAsset from '../assets/hand-point.svg?url';

const DOWNLOAD_URL = 'https://www.google.com';
const TARGET_PASSES = 10;

const WORLD_TOP = 5.35;
const WORLD_BOTTOM = -5.35;
const BIRD_X = -2.0;
const BIRD_RADIUS = 0.22;
const GRAVITY = -11;
const FLAP_IMPULSE = 6.1;
const SCROLL_SPEED = 3.05;
const OBSTACLE_SPACING = 3.42;
const GATE_HALF_WIDTH = 0.68;

const BACKGROUND_SIZE = { width: 8, height: 14 };

function circleHitsRect(cx, cy, r, left, right, bottom, top) {
  const nx = Math.max(left, Math.min(cx, right));
  const ny = Math.max(bottom, Math.min(cy, top));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

function openStore() {
  window.open(DOWNLOAD_URL, '_blank', 'noopener,noreferrer');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7ec8e3);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 30);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
SceneSetup.configureRenderer(renderer);
document.body.appendChild(renderer.domElement);

function fitCamera() {
  SceneSetup.fitOrthographicCamera(camera, BACKGROUND_SIZE);
}

fitCamera();

const ambient = new THREE.AmbientLight(0xffffff, 0.92);
scene.add(ambient);

const dir = new THREE.DirectionalLight(0xffffff, 0.35);
dir.position.set(2, 6, 4);
scene.add(dir);

const floorGeo = new THREE.PlaneGeometry(40, 0.35);
const floorMat = new THREE.MeshBasicMaterial({ color: 0x3d6b2e });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.position.set(0, WORLD_BOTTOM - 0.2, -0.5);
scene.add(floor);

const ceil = new THREE.Mesh(floorGeo, floorMat);
ceil.position.set(0, WORLD_TOP + 0.2, -0.5);
scene.add(ceil);

const spikeMat = new THREE.MeshBasicMaterial({ color: 0x1e1e24 });
const birdMat = new THREE.MeshBasicMaterial({ color: 0xffb020 });

const bird = new THREE.Mesh(new THREE.CircleGeometry(BIRD_RADIUS, 24), birdMat);
bird.position.set(BIRD_X, 0, 0.5);
scene.add(bird);

let gameState = 'idle';
let birdVelY = 0;
let passCount = 0;
let obstacleSerial = 0;
let obstacles = [];
let spawnLeadX = 6;
let handTutorial = null;

const hudEl = document.createElement('div');
hudEl.id = 'hud-progress';
hudEl.textContent = `0 / ${TARGET_PASSES}`;
hudEl.style.display = 'none';
document.body.appendChild(hudEl);

function buildEndOverlay(id, opts) {
  const el = document.createElement('div');
  el.id = id;
  el.className = 'end-overlay';
  el.innerHTML = `
    <h2></h2>
    <p></p>
    <div class="btn-row"></div>
  `;
  const title = el.querySelector('h2');
  const sub = el.querySelector('p');
  const row = el.querySelector('.btn-row');
  title.textContent = opts.title;
  sub.textContent = opts.subtitle;

  if (opts.showRetry) {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn-secondary';
    retry.textContent = 'Retry';
    retry.addEventListener('click', () => {
      el.classList.remove('is-visible');
      resetRun({ showHand: false });
    });
    row.appendChild(retry);
  }

  const dl = document.createElement('button');
  dl.type = 'button';
  dl.className = 'btn-primary';
  dl.textContent = 'Download Now';
  dl.addEventListener('click', openStore);
  row.appendChild(dl);

  document.body.appendChild(el);
  return el;
}

const winOverlay = buildEndOverlay('overlay-win', {
  title: 'You did it!',
  subtitle: 'You cleared 10 obstacles. Download the full game to keep playing.',
  showRetry: false,
});

const loseOverlay = buildEndOverlay('overlay-lose', {
  title: 'Nice try!',
  subtitle: 'Avoid the spikes and the floor. Retry or download to play more.',
  showRetry: true,
});

function gateColliders(obs) {
  const { x, gapY, gapSize } = obs;
  const g = gapSize * 0.5;
  return [
    {
      left: x - GATE_HALF_WIDTH,
      right: x + GATE_HALF_WIDTH,
      bottom: gapY + g,
      top: WORLD_TOP,
    },
    {
      left: x - GATE_HALF_WIDTH,
      right: x + GATE_HALF_WIDTH,
      bottom: WORLD_BOTTOM,
      top: gapY - g,
    },
  ];
}

function diamondColliders(x) {
  return [
    { left: x - 0.52, right: x + 0.52, bottom: 3.05, top: WORLD_TOP },
    { left: x - 0.92, right: x + 0.92, bottom: -0.82, top: 0.82 },
    { left: x - 0.52, right: x + 0.52, bottom: WORLD_BOTTOM, top: -3.05 },
  ];
}

function buildGateGroup(gapY, gapSize) {
  const group = new THREE.Group();
  const topH = WORLD_TOP - gapY - gapSize * 0.5;
  const botH = gapY - WORLD_BOTTOM - gapSize * 0.5;
  if (topH > 0.08) {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(0.72, topH, 3), spikeMat);
    mesh.rotation.x = Math.PI;
    mesh.position.y = gapSize * 0.5 + topH * 0.5;
    group.add(mesh);
  }
  if (botH > 0.08) {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(0.72, botH, 3), spikeMat);
    mesh.position.y = -gapSize * 0.5 - botH * 0.5;
    group.add(mesh);
  }
  return group;
}

function buildDiamondGroup() {
  const group = new THREE.Group();
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.15, 3), spikeMat);
  top.rotation.x = Math.PI;
  top.position.set(0, 4.35, 0);
  group.add(top);
  const mid = new THREE.Mesh(new THREE.OctahedronGeometry(0.88, 0), spikeMat);
  mid.rotation.z = Math.PI / 4;
  group.add(mid);
  const bot = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.15, 3), spikeMat);
  bot.position.set(0, -4.35, 0);
  group.add(bot);
  return group;
}

function spawnObstacle(x, kindIndex) {
  const isDiamond = kindIndex % 3 === 2;
  const obs = {
    id: obstacleSerial++,
    type: isDiamond ? 'diamond' : 'gate',
    x,
    passed: false,
    group: new THREE.Group(),
  };

  if (isDiamond) {
    obs.gapY = 0;
    obs.gapSize = 0;
    obs.group = buildDiamondGroup();
    obs.group.position.set(x, 0, 0);
  } else {
    obs.gapY = (Math.random() - 0.5) * 2.2;
    obs.gapSize = 2.0 + Math.random() * 0.35;
    obs.group = buildGateGroup(obs.gapY, obs.gapSize);
    obs.group.position.set(x, obs.gapY, 0);
  }

  scene.add(obs.group);
  obstacles.push(obs);
}

function collidersFor(obs) {
  if (obs.type === 'diamond') {
    return diamondColliders(obs.x);
  }
  return gateColliders(obs);
}

function removeObstacle(obs) {
  scene.remove(obs.group);
  obs.group.traverse((ch) => {
    if (ch.geometry) ch.geometry.dispose();
  });
}

function clearObstacles() {
  obstacles.forEach(removeObstacle);
  obstacles = [];
}

function ensureSpawns() {
  let maxX = spawnLeadX;
  for (let i = 0; i < obstacles.length; i += 1) {
    maxX = Math.max(maxX, obstacles[i].x);
  }
  while (maxX < BIRD_X + 26 && passCount < TARGET_PASSES) {
    maxX += OBSTACLE_SPACING;
    spawnObstacle(maxX, obstacles.length);
  }
}

function resetRun({ showHand }) {
  winOverlay.classList.remove('is-visible');
  loseOverlay.classList.remove('is-visible');
  gameState = showHand ? 'idle' : 'playing';
  birdVelY = 0;
  bird.position.y = 0;
  passCount = 0;
  hudEl.textContent = `0 / ${TARGET_PASSES}`;
  hudEl.style.display = showHand ? 'none' : 'block';
  clearObstacles();
  spawnLeadX = 6;
  obstacleSerial = 0;
  for (let i = 0; i < 5; i += 1) {
    spawnObstacle(spawnLeadX + i * OBSTACLE_SPACING, i);
  }

  if (handTutorial) {
    handTutorial.destroy();
    handTutorial = null;
  }

  if (showHand) {
    handTutorial = new window.HandTutorial({
      container: document.body,
      renderer,
      camera,
      assetUrl: handAsset,
      gesture: 'tap',
      from: { space: 'screen', x: 0.5, y: 0.58 },
      to: { space: 'screen', x: 0.5, y: 0.42 },
      loop: true,
      zIndex: 40,
      size: 128,
    });
    handTutorial.play();
  }
}

function lose() {
  if (gameState !== 'playing') return;
  gameState = 'lost';
  hudEl.style.display = 'none';
  loseOverlay.classList.add('is-visible');
  if (handTutorial) {
    handTutorial.destroy();
    handTutorial = null;
  }
}

function win() {
  if (gameState !== 'playing') return;
  gameState = 'won';
  hudEl.style.display = 'none';
  winOverlay.classList.add('is-visible');
  if (handTutorial) {
    handTutorial.destroy();
    handTutorial = null;
  }
}

function checkBounds() {
  const y = bird.position.y;
  if (y + BIRD_RADIUS >= WORLD_TOP || y - BIRD_RADIUS <= WORLD_BOTTOM) {
    lose();
    return true;
  }
  return false;
}

function checkCollisions() {
  const cx = bird.position.x;
  const cy = bird.position.y;
  const r = BIRD_RADIUS;
  for (let i = 0; i < obstacles.length; i += 1) {
    const cols = collidersFor(obstacles[i]);
    for (let j = 0; j < cols.length; j += 1) {
      const c = cols[j];
      if (circleHitsRect(cx, cy, r, c.left, c.right, c.bottom, c.top)) {
        lose();
        return;
      }
    }
  }
}

function checkPasses(dt) {
  for (let i = 0; i < obstacles.length; i += 1) {
    const o = obstacles[i];
    if (o.passed) continue;
    if (o.x + GATE_HALF_WIDTH < BIRD_X - 0.08) {
      o.passed = true;
      passCount += 1;
      hudEl.textContent = `${passCount} / ${TARGET_PASSES}`;
      if (passCount >= TARGET_PASSES) {
        win();
        return;
      }
    }
  }
}

function flap() {
  birdVelY = FLAP_IMPULSE;
}

function onPointerDown(e) {
  if (e.target.closest('.end-overlay') || e.target.closest('button')) {
    return;
  }
  if (gameState === 'idle') {
    if (handTutorial) {
      handTutorial.destroy();
      handTutorial = null;
    }
    gameState = 'playing';
    hudEl.style.display = 'block';
    flap();
    return;
  }
  if (gameState === 'playing') {
    flap();
  }
}

window.addEventListener('pointerdown', onPointerDown, { passive: true });

window.addEventListener('resize', () => {
  SceneSetup.configureRenderer(renderer);
  fitCamera();
});

resetRun({ showHand: true });

let last = performance.now();
renderer.setAnimationLoop((now) => {
  const dt = Math.min(0.05, (now - last) * 0.001);
  last = now;

  if (handTutorial) {
    handTutorial.update(now);
  }

  if (gameState === 'playing') {
    birdVelY += GRAVITY * dt;
    bird.position.y += birdVelY * dt;
    bird.rotation.z = THREE.MathUtils.clamp(-birdVelY * 0.12, -0.9, 0.9);

    for (let i = obstacles.length - 1; i >= 0; i -= 1) {
      const o = obstacles[i];
      o.x -= SCROLL_SPEED * dt;
      if (o.type === 'diamond') {
        o.group.position.set(o.x, 0, 0);
      } else {
        o.group.position.set(o.x, o.gapY, 0);
      }
      if (o.x < -9) {
        removeObstacle(o);
        obstacles.splice(i, 1);
      }
    }

    ensureSpawns();
    if (!checkBounds()) {
      checkCollisions();
      if (gameState === 'playing') {
        checkPasses(dt);
      }
    }
  }

  renderer.render(scene, camera);
});

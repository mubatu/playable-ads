import * as THREE from 'three';
import handAssetUrl from '../assets/hand-1.svg?url';

const HAND_URL = handAssetUrl;
const WIN_TARGET = 10;
const CTA_URL = 'https://www.google.com';

const BIRD_X = -3.15;
const BIRD_RADIUS = 0.32;
const GRAVITY = 26;
const FLAP_IMPULSE = 8.2;
const SCROLL_SPEED = 3.9;
const OBSTACLE_SPACING = 5.6;
const WORLD_TOP = 9.35;
const WORLD_BOTTOM = -9.35;
const OBSTACLE_HALF_WIDTH = 1.55;

class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this._create = createFn;
    this._reset = resetFn;
    this._free = [];
    for (let i = 0; i < initialSize; i += 1) {
      this._free.push(createFn());
    }
  }

  get() {
    return this._free.pop() ?? this._create();
  }

  release(obj) {
    this._reset(obj);
    this._free.push(obj);
  }
}

function distPointSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = x1 + t * dx;
  const qy = y1 + t * dy;
  const ddx = px - qx;
  const ddy = py - qy;
  return Math.sqrt(ddx * ddx + ddy * ddy);
}

function circleHitsSegments(cx, cy, r, worldX, segments) {
  const pad = 0.02;
  for (let i = 0; i < segments.length; i += 1) {
    const s = segments[i];
    const x1 = s.x1 + worldX;
    const x2 = s.x2 + worldX;
    if (distPointSegment(cx, cy, x1, s.y1, x2, s.y2) < r + pad) {
      return true;
    }
  }
  return false;
}

function pushTriEdges(segments, ax, ay, bx, by, cx, cy) {
  segments.push({ x1: ax, y1: ay, x2: bx, y2: by });
  segments.push({ x1: bx, y1: by, x2: cx, y2: cy });
  segments.push({ x1: cx, y1: cy, x2: ax, y2: ay });
}

function pushLoopEdges(segments, pts) {
  const n = pts.length;
  for (let i = 0; i < n; i += 1) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    segments.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }
}

function clearGroup(group) {
  while (group.children.length) {
    const m = group.children[0];
    if (m.geometry) m.geometry.dispose();
    group.remove(m);
  }
}

function addFilledPolygon(group, material, pts) {
  const shape = new THREE.Shape();
  shape.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i += 1) {
    shape.lineTo(pts[i].x, pts[i].y);
  }
  shape.lineTo(pts[0].x, pts[0].y);
  const geom = new THREE.ShapeGeometry(shape);
  const mesh = new THREE.Mesh(geom, material);
  group.add(mesh);
}

function buildObstaclePattern(patternIndex, group, segments) {
  clearGroup(group);
  segments.length = 0;
  const ink = new THREE.MeshBasicMaterial({ color: 0x141414 });

  if (patternIndex === 0) {
    const top = [
      { x: -1.25, y: WORLD_TOP },
      { x: 1.25, y: WORLD_TOP },
      { x: 0, y: 4.4 },
    ];
    const bot = [
      { x: -1.25, y: WORLD_BOTTOM },
      { x: 1.25, y: WORLD_BOTTOM },
      { x: 0, y: -4.4 },
    ];
    addFilledPolygon(group, ink, top);
    addFilledPolygon(group, ink, bot);
    pushTriEdges(segments, top[0].x, top[0].y, top[1].x, top[1].y, top[2].x, top[2].y);
    pushTriEdges(segments, bot[0].x, bot[0].y, bot[1].x, bot[1].y, bot[2].x, bot[2].y);
  } else if (patternIndex === 1) {
    const top = [
      { x: -1.05, y: WORLD_TOP },
      { x: 1.05, y: WORLD_TOP },
      { x: 0, y: 7.1 },
    ];
    const diamond = [
      { x: 0, y: 2.35 },
      { x: 1.2, y: 0 },
      { x: 0, y: -2.35 },
      { x: -1.2, y: 0 },
    ];
    const bot = [
      { x: -1.05, y: WORLD_BOTTOM },
      { x: 1.05, y: WORLD_BOTTOM },
      { x: 0, y: -7.1 },
    ];
    addFilledPolygon(group, ink, top);
    addFilledPolygon(group, ink, diamond);
    addFilledPolygon(group, ink, bot);
    pushTriEdges(segments, top[0].x, top[0].y, top[1].x, top[1].y, top[2].x, top[2].y);
    pushLoopEdges(segments, diamond);
    pushTriEdges(segments, bot[0].x, bot[0].y, bot[1].x, bot[1].y, bot[2].x, bot[2].y);
  } else {
    const top = [
      { x: -1.35, y: WORLD_TOP },
      { x: 1.35, y: WORLD_TOP },
      { x: 0.15, y: 5.2 },
    ];
    const bot = [
      { x: -1.15, y: WORLD_BOTTOM },
      { x: 1.15, y: WORLD_BOTTOM },
      { x: -0.35, y: -2.9 },
    ];
    addFilledPolygon(group, ink, top);
    addFilledPolygon(group, ink, bot);
    pushTriEdges(segments, top[0].x, top[0].y, top[1].x, top[1].y, top[2].x, top[2].y);
    pushTriEdges(segments, bot[0].x, bot[0].y, bot[1].x, bot[1].y, bot[2].x, bot[2].y);
  }
}

function createObstacleSlot() {
  return {
    group: new THREE.Group(),
    segments: [],
    worldX: 0,
    passed: false,
    pattern: 0,
    inUse: false,
  };
}

function resetObstacleSlot(slot) {
  clearGroup(slot.group);
  slot.segments.length = 0;
  slot.passed = false;
  slot.inUse = false;
  slot.worldX = 0;
}

const app = document.getElementById('app');
const tapLayer = document.getElementById('tap-layer');
const handHint = document.getElementById('hand-hint');
const handImg = document.getElementById('hand-img');
const progressLabel = document.getElementById('progress-label');
const overlayWin = document.getElementById('overlay-win');
const overlayLose = document.getElementById('overlay-lose');
const btnDownloadWin = document.getElementById('btn-download-win');
const btnDownloadLose = document.getElementById('btn-download-lose');
const btnRetry = document.getElementById('btn-retry');

handImg.src = HAND_URL;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0xf7f7f7, 1);
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const clock = new THREE.Clock();

let viewW = 1;
let viewH = 1;
let worldHalfW = 5.5;
let worldHalfH = 10;

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

function resize() {
  viewW = window.innerWidth;
  viewH = window.innerHeight;
  const aspect = viewW / Math.max(viewH, 1);
  worldHalfH = 10;
  worldHalfW = worldHalfH * aspect;
  camera.left = -worldHalfW;
  camera.right = worldHalfW;
  camera.top = worldHalfH;
  camera.bottom = -worldHalfH;
  camera.updateProjectionMatrix();
  renderer.setSize(viewW, viewH, false);
}

resize();
window.addEventListener('resize', resize);

const obstaclePool = new ObjectPool(createObstacleSlot, resetObstacleSlot, 10);
const activeObstacles = [];

let state = 'idle';
let birdY = 0;
let birdVy = 0;
let cleared = 0;
let patternCursor = 0;

const birdGroup = new THREE.Group();
const birdMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
const body = new THREE.Mesh(new THREE.CircleGeometry(0.38, 28), birdMat);
const wingShape = new THREE.Shape();
wingShape.moveTo(0.05, 0.05);
wingShape.lineTo(0.85, 0.55);
wingShape.lineTo(0.25, -0.15);
wingShape.lineTo(0.05, 0.05);
const wing = new THREE.Mesh(new THREE.ShapeGeometry(wingShape), birdMat);
wing.position.set(-0.05, 0.08, 0.01);
birdGroup.add(body);
birdGroup.add(wing);
birdGroup.position.set(BIRD_X, birdY, 0);
scene.add(birdGroup);

function setHandVisible(visible) {
  handHint.classList.toggle('visible', visible);
}

function setHud() {
  progressLabel.textContent = `Passed: ${cleared} / ${WIN_TARGET}`;
}

function openCta() {
  if (typeof window.mraid !== 'undefined' && window.mraid && typeof window.mraid.open === 'function') {
    try {
      window.mraid.open(CTA_URL);
      return;
    } catch (_) {
      /* fall through */
    }
  }
  window.open(CTA_URL, '_blank', 'noopener,noreferrer');
}

function spawnObstacleAt(x) {
  const slot = obstaclePool.get();
  slot.inUse = true;
  slot.worldX = x;
  slot.pattern = patternCursor % 3;
  patternCursor += 1;
  buildObstaclePattern(slot.pattern, slot.group, slot.segments);
  slot.group.position.set(slot.worldX, 0, 0);
  scene.add(slot.group);
  activeObstacles.push(slot);
}

function releaseObstacle(slot) {
  scene.remove(slot.group);
  obstaclePool.release(slot);
}

function clearAllObstacles() {
  while (activeObstacles.length) {
    releaseObstacle(activeObstacles.pop());
  }
}

function layoutInitialObstacles() {
  clearAllObstacles();
  let x = 5.2;
  for (let i = 0; i < 5; i += 1) {
    spawnObstacleAt(x);
    x += OBSTACLE_SPACING;
  }
}

function resetRound() {
  state = 'idle';
  birdY = 0;
  birdVy = 0;
  birdGroup.position.y = birdY;
  cleared = 0;
  patternCursor = 0;
  layoutInitialObstacles();
  setHud();
  overlayWin.classList.remove('visible');
  overlayLose.classList.remove('visible');
  tapLayer.classList.remove('disabled');
  setHandVisible(true);
}

function win() {
  state = 'won';
  tapLayer.classList.add('disabled');
  setHandVisible(false);
  overlayWin.classList.add('visible');
}

function lose() {
  state = 'lost';
  tapLayer.classList.add('disabled');
  setHandVisible(false);
  overlayLose.classList.add('visible');
}

function maybeSpawnTrail() {
  let maxX = -Infinity;
  for (let i = 0; i < activeObstacles.length; i += 1) {
    const o = activeObstacles[i];
    maxX = Math.max(maxX, o.worldX + OBSTACLE_HALF_WIDTH);
  }
  if (!Number.isFinite(maxX)) {
    return;
  }
  while (maxX < BIRD_X + worldHalfW + OBSTACLE_SPACING * 2) {
    maxX += OBSTACLE_SPACING;
    spawnObstacleAt(maxX);
  }
}

function recycleObstacles() {
  const leftBound = -worldHalfW - 6;
  for (let i = activeObstacles.length - 1; i >= 0; i -= 1) {
    const o = activeObstacles[i];
    if (o.worldX + OBSTACLE_HALF_WIDTH < leftBound) {
      activeObstacles.splice(i, 1);
      releaseObstacle(o);
    }
  }
  maybeSpawnTrail();
}

function updatePlaying(dt) {
  birdVy -= GRAVITY * dt;
  birdY += birdVy * dt;
  birdGroup.position.y = birdY;

  const top = WORLD_TOP - BIRD_RADIUS;
  const bottom = WORLD_BOTTOM + BIRD_RADIUS;
  if (birdY > top || birdY < bottom) {
    lose();
    return;
  }

  for (let i = 0; i < activeObstacles.length; i += 1) {
    const o = activeObstacles[i];
    o.worldX -= SCROLL_SPEED * dt;
    o.group.position.x = o.worldX;

    if (circleHitsSegments(BIRD_X, birdY, BIRD_RADIUS, o.worldX, o.segments)) {
      lose();
      return;
    }

    if (!o.passed && o.worldX + OBSTACLE_HALF_WIDTH < BIRD_X - 0.08) {
      o.passed = true;
      cleared += 1;
      setHud();
      if (cleared >= WIN_TARGET) {
        win();
        return;
      }
    }
  }

  recycleObstacles();
}

function onTapDown(e) {
  e.preventDefault();
  if (state === 'idle') {
    state = 'playing';
    setHandVisible(false);
    birdVy = FLAP_IMPULSE;
    return;
  }
  if (state === 'playing') {
    birdVy = FLAP_IMPULSE;
  }
}

tapLayer.addEventListener('pointerdown', onTapDown, { passive: false });

btnDownloadWin.addEventListener('click', () => openCta());
btnDownloadLose.addEventListener('click', () => openCta());
btnRetry.addEventListener('click', () => resetRound());

resetRound();

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (state === 'playing') {
    updatePlaying(dt);
  } else {
    birdGroup.position.y = birdY;
  }
  renderer.render(scene, camera);
});

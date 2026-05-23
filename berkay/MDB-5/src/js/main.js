import * as THREE from 'three';
import '../../../../reusables/components/HandTutorial.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';

/** @param {number} cx @param {number} cy @param {number} r @param {[number, number][]} verts */
function circleHitsConvexPoly(cx, cy, r, verts) {
  if (verts.length < 3) {
    return false;
  }

  if (pointInPolygon(cx, cy, verts)) {
    return true;
  }

  const n = verts.length;
  for (let i = 0; i < n; i += 1) {
    const a = verts[i];
    const b = verts[(i + 1) % n];
    if (distancePointSegment(cx, cy, a[0], a[1], b[0], b[1]) < r) {
      return true;
    }
  }

  return false;
}

function pointInPolygon(x, y, verts) {
  let inside = false;
  const n = verts.length;

  for (let i = 0, j = n - 1; i < n; j = i, i += 1) {
    const xi = verts[i][0];
    const yi = verts[i][1];
    const xj = verts[j][0];
    const yj = verts[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 0.000001) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

function distancePointSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq < 1e-8) {
    return Math.hypot(px - x1, py - y1);
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const qx = x1 + t * dx;
  const qy = y1 + t * dy;

  return Math.hypot(px - qx, py - qy);
}

/** Shrink polygon toward centroid for forgiving hazard hit areas. */
function insetPolygon(verts, factor) {
  let cx = 0;
  let cy = 0;
  const n = verts.length;

  for (let i = 0; i < n; i += 1) {
    cx += verts[i][0];
    cy += verts[i][1];
  }

  cx /= n;
  cy /= n;

  return verts.map(([x, y]) => [cx + (x - cx) * factor, cy + (y - cy) * factor]);
}

function makeTriangleShape(p0, p1, p2) {
  const shape = new THREE.Shape();
  shape.moveTo(p0[0], p0[1]);
  shape.lineTo(p1[0], p1[1]);
  shape.lineTo(p2[0], p2[1]);
  shape.lineTo(p0[0], p0[1]);

  return shape;
}

function addTriangleMesh(group, p0, p1, p2, color, depth) {
  const shape = makeTriangleShape(p0, p1, p2);
  const geom = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  const mat = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geom, mat);

  group.add(mesh);

  return mesh;
}

function addDiamondMesh(group, halfW, halfH, color, depth) {
  const shape = new THREE.Shape();
  shape.moveTo(0, halfH);
  shape.lineTo(halfW, 0);
  shape.lineTo(0, -halfH);
  shape.lineTo(-halfW, 0);
  shape.lineTo(0, halfH);
  const geom = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ color }));

  group.add(mesh);

  return mesh;
}

/**
 * @returns {{ group: THREE.Group, collidersLocal: [number, number][][], passMaxLocalX: number }}
 */
function buildChunk1() {
  const group = new THREE.Group();
  const obstacleColor = 0x2a2a2a;

  const top = [
    [-1.05, 4.6],
    [1.05, 4.6],
    [0, 0.95],
  ];
  const bottom = [
    [-1.05, -4.6],
    [1.05, -4.6],
    [0, -0.95],
  ];

  addTriangleMesh(group, top[0], top[1], top[2], obstacleColor, 0.35);
  addTriangleMesh(group, bottom[0], bottom[1], bottom[2], obstacleColor, 0.35);

  const collidersLocal = [insetPolygon(top, 0.86), insetPolygon(bottom, 0.86)];
  const passMaxLocalX = 1.15;

  return { group, collidersLocal, passMaxLocalX };
}

function buildChunk2() {
  const group = new THREE.Group();
  const obstacleColor = 0x2a2a2a;

  const topSpike = [
    [-0.55, 4.5],
    [0.55, 4.5],
    [0, 2.35],
  ];
  addTriangleMesh(group, topSpike[0], topSpike[1], topSpike[2], obstacleColor, 0.35);

  addDiamondMesh(group, 1.05, 1.55, obstacleColor, 0.35);

  const bottomSpike = [
    [-0.55, -4.5],
    [0.55, -4.5],
    [0, -2.35],
  ];
  addTriangleMesh(group, bottomSpike[0], bottomSpike[1], bottomSpike[2], obstacleColor, 0.35);

  const diamondVerts = insetPolygon(
    [
      [0, 1.55],
      [1.05, 0],
      [0, -1.55],
      [-1.05, 0],
    ],
    0.84,
  );

  const collidersLocal = [
    insetPolygon(topSpike, 0.86),
    diamondVerts,
    insetPolygon(bottomSpike, 0.86),
  ];
  const passMaxLocalX = 1.2;

  return { group, collidersLocal, passMaxLocalX };
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
SceneSetup.configureRenderer(renderer);
document.body.appendChild(renderer.domElement);

const backgroundSize = { width: 12, height: 9 };
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
SceneSetup.fitOrthographicCamera(camera, backgroundSize);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const birdX = -2.15;
let birdY = 0.35;
let birdVy = 0;
const birdRadius = 0.26;
const birdVisualRadius = 0.34;

const birdGroup = new THREE.Group();
birdGroup.position.set(birdX, birdY, 0.5);
const birdBody = new THREE.Mesh(
  new THREE.CircleGeometry(birdVisualRadius, 28),
  new THREE.MeshBasicMaterial({ color: 0xf4c430 }),
);
const beak = new THREE.Mesh(
  new THREE.ConeGeometry(0.14, 0.32, 8),
  new THREE.MeshBasicMaterial({ color: 0xff8c00 }),
);
beak.rotation.z = -Math.PI / 2;
beak.position.set(birdVisualRadius * 0.65, 0, 0.02);
birdGroup.add(birdBody);
birdGroup.add(beak);
scene.add(birdGroup);

const chunks = [
  { ...buildChunk1(), startX: 4.8, id: 0, passed: false },
  { ...buildChunk2(), startX: 11.2, id: 1, passed: false },
  { ...buildChunk1(), startX: 17.6, id: 2, passed: false },
];

for (let i = 0; i < chunks.length; i += 1) {
  chunks[i].group.position.set(chunks[i].startX, 0, 0);
  scene.add(chunks[i].group);
}

const scrollSpeed = 2.35;
const gravity = 11.5;
const flapVel = 4.85;
const worldTop = 4.35;
const worldBottom = -4.35;

let gameState = 'idle';
let gatesCleared = 0;

const hudEl = document.getElementById('hud');
const endOverlay = document.getElementById('end-overlay');
const endTitle = document.getElementById('end-title');
const endSubtitle = document.getElementById('end-subtitle');
const endCta = document.getElementById('end-cta');
const endReplay = document.getElementById('end-replay');

function updateHud() {
  hudEl.textContent = `Gates: ${gatesCleared} / 3`;
}

function showEnd(title, subtitle, ctaText) {
  endTitle.textContent = title;
  endSubtitle.textContent = subtitle;
  endCta.textContent = ctaText;
  endOverlay.classList.add('visible');
}

function hideEnd() {
  endOverlay.classList.remove('visible');
}

endCta.addEventListener('click', () => {
  if (typeof window.mraid !== 'undefined' && window.mraid.open) {
    window.mraid.open('');
  } else {
    window.open('https://example.com', '_blank', 'noopener');
  }
});

endReplay.addEventListener('click', () => {
  resetRun();
});

/** @type {InstanceType<typeof window.HandTutorial> | null} */
let handTutorial = null;

if (typeof window.HandTutorial === 'function') {
  handTutorial = new window.HandTutorial({
    container: document.body,
    renderer,
    camera,
    assetUrl: new URL('../assets/hand-1.svg', import.meta.url).href,
    gesture: 'tap',
    from: { space: 'screen', x: 0.5, y: 0.58 },
    to: { space: 'screen', x: 0.5, y: 0.42 },
    duration: 1.05,
    loop: true,
    loopDelay: 0.4,
    size: 132,
    rotation: -18,
    anchor: { x: 0.22, y: 0.08 },
    zIndex: 18,
  });

  handTutorial.play();
}

function destroyHand() {
  if (handTutorial) {
    handTutorial.destroy();
    handTutorial = null;
  }
}

function resetRun() {
  gameState = 'idle';
  birdY = 0.35;
  birdVy = 0;
  birdGroup.position.y = birdY;
  gatesCleared = 0;

  for (let i = 0; i < chunks.length; i += 1) {
    chunks[i].group.position.x = chunks[i].startX;
    chunks[i].passed = false;
  }

  hideEnd();
  updateHud();

  if (typeof window.HandTutorial === 'function' && !handTutorial) {
    handTutorial = new window.HandTutorial({
      container: document.body,
      renderer,
      camera,
      assetUrl: new URL('../assets/hand-1.svg', import.meta.url).href,
      gesture: 'tap',
      from: { space: 'screen', x: 0.5, y: 0.58 },
      to: { space: 'screen', x: 0.5, y: 0.42 },
      duration: 1.05,
      loop: true,
      loopDelay: 0.4,
      size: 132,
      rotation: -18,
      anchor: { x: 0.22, y: 0.08 },
      zIndex: 18,
    });
    handTutorial.play();
  }
}

function onFlap() {
  birdVy = flapVel;
}

function checkCollisions() {
  for (let c = 0; c < chunks.length; c += 1) {
    const chunk = chunks[c];
    const ox = chunk.group.position.x;

    for (let p = 0; p < chunk.collidersLocal.length; p += 1) {
      const local = chunk.collidersLocal[p];
      const world = local.map(([lx, ly]) => [lx + ox, ly]);

      if (circleHitsConvexPoly(birdX, birdY, birdRadius, world)) {
        return true;
      }
    }
  }

  return false;
}

function updatePassedGates() {
  for (let c = 0; c < chunks.length; c += 1) {
    const chunk = chunks[c];

    if (chunk.passed) {
      continue;
    }

    const trailing = chunk.group.position.x + chunk.passMaxLocalX;

    if (trailing < birdX - 0.35) {
      chunk.passed = true;
      gatesCleared += 1;
      updateHud();

      if (gatesCleared >= 3) {
        gameState = 'won';
        destroyHand();
        showEnd('Nice flying!', 'You cleared every gate from the sketch.', 'Play now');
        return;
      }
    }
  }
}

function lose() {
  if (gameState !== 'playing') {
    return;
  }

  gameState = 'lost';
  destroyHand();
  showEnd('Try again', 'Tap at the right moment to slip through the gaps.', 'Play now');
}

function onPointerDown() {
  if (gameState === 'won' || gameState === 'lost') {
    return;
  }

  if (gameState === 'idle') {
    gameState = 'playing';
    destroyHand();
    onFlap();
    return;
  }

  if (gameState === 'playing') {
    onFlap();
  }
}

window.addEventListener('pointerdown', onPointerDown, { passive: true });

function onResize() {
  SceneSetup.configureRenderer(renderer);
  SceneSetup.fitOrthographicCamera(camera, backgroundSize);
}

window.addEventListener('resize', onResize);

renderer.setAnimationLoop((timeMs) => {
  const dt = Math.min(0.033, 1 / 60);

  if (handTutorial) {
    handTutorial.update(timeMs);
  }

  if (gameState === 'playing') {
    birdVy -= gravity * dt;
    birdVy = Math.max(-8.5, Math.min(8.5, birdVy));
    birdY += birdVy * dt;
    birdGroup.position.y = birdY;

    for (let i = 0; i < chunks.length; i += 1) {
      chunks[i].group.position.x -= scrollSpeed * dt;
    }

    if (birdY > worldTop || birdY < worldBottom) {
      lose();
    } else if (checkCollisions()) {
      lose();
    } else {
      updatePassedGates();
    }
  } else if (gameState === 'idle') {
    birdY += Math.sin(timeMs * 0.003) * 0.012;
    birdGroup.position.y = birdY;
  }

  renderer.render(scene, camera);
});

updateHud();

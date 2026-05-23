import * as THREE from 'three';
import '../../../../reusables/components/HandTutorial.js';

/** Built-in tutorial hand: classic “pointing” silhouette + stroke so it reads on mobile (data URL). */
const BUILTIN_HAND_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">',
  '<path d="M51 106c-10-10-15-23-15-36 0-9 5-15 11-15 5 0 8 3 10 7V30c0-5 4-9 9-9s9 4 9 9v21h2V35c0-5 4-9 9-9s9 4 9 9v20h2V43c0-5 4-9 9-9s9 4 9 9v34c0 24-16 43-41 43H74c-9 0-17-5-23-14z" ',
  'fill="#fff7ed" stroke="#0f172a" stroke-width="2.75" stroke-linejoin="round"/>',
  '</svg>'
].join('');

const HAND_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(BUILTIN_HAND_SVG)}`;

const BIRD_X = -4.2;
const BIRD_RADIUS = 0.42;
const BIRD_HIT = BIRD_RADIUS * 0.88;
const GRAVITY = -20;
const FLAP_VY = 8.2;
const SCROLL_SPEED = 5.2;
const GAP_HALF = 1.35;
const PIPE_HIT_W = 0.95;
const CEIL = 4.35;
const FLOOR = -4.35;
const WIN_SEGMENTS = 3;

const PIPE_SPECS = [
  { kind: 'pair', x: 6, gapY: 0.4 },
  { kind: 'diamond', x: 14 },
  { kind: 'pair', x: 22, gapY: -0.15 }
];

function createBird() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CircleGeometry(BIRD_RADIUS, 20),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  );
  body.renderOrder = 2;
  const wing = new THREE.Mesh(
    new THREE.ShapeGeometry(
      (() => {
        const s = new THREE.Shape();
        s.moveTo(0, 0);
        s.lineTo(0.55, 0.15);
        s.lineTo(0.1, 0.45);
        s.closePath();
        return s;
      })()
    ),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
  );
  wing.position.set(-0.05, -0.05, 0.01);
  wing.renderOrder = 3;
  const eye = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 12),
    new THREE.MeshBasicMaterial({ color: 0x1e293b })
  );
  eye.position.set(0.18, 0.08, 0.02);
  eye.renderOrder = 4;
  g.add(body, wing, eye);
  g.position.set(BIRD_X, 0, 0);
  return g;
}

function createSpike(height, pointUp) {
  const geo = new THREE.ConeGeometry(0.55, height, 3);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x15803d,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.z = Math.PI;
  mesh.rotation.x = pointUp ? 0 : Math.PI;
  return mesh;
}

function buildPipePair(gapCenterY) {
  const group = new THREE.Group();
  const topH = CEIL - (gapCenterY + GAP_HALF);
  const botH = gapCenterY - GAP_HALF - FLOOR;
  const top = createSpike(Math.max(0.4, topH), false);
  top.position.set(0, gapCenterY + GAP_HALF + topH / 2, 0);
  const bot = createSpike(Math.max(0.4, botH), true);
  bot.position.set(0, gapCenterY - GAP_HALF - botH / 2, 0);
  group.add(top, bot);
  return { group, gapCenterY, scored: false };
}

/** Middle beat: central diamond + top/bottom spikes (upper or lower lane). Colliders are conservative vs art. */
function buildDiamondGate() {
  const group = new THREE.Group();
  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.05, 0),
    new THREE.MeshBasicMaterial({ color: 0xd97706, side: THREE.DoubleSide })
  );
  diamond.scale.set(1, 1.45, 1);
  diamond.rotation.z = Math.PI / 4;
  group.add(diamond);

  const top = createSpike(1.55, false);
  top.position.set(0, 3.05, 0);
  const bot = createSpike(1.55, true);
  bot.position.set(0, -3.05, 0);
  group.add(top, bot);

  return { group, scored: false, kind: 'diamond' };
}

function circleRectOverlap(cx, cy, r, rx, ry, rw, rh) {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

function hitTestPipe(birdY, pipeX, gapY) {
  const cx = BIRD_X;
  const cy = birdY;
  const r = BIRD_HIT;
  const x0 = pipeX - PIPE_HIT_W;
  const w = PIPE_HIT_W * 2;
  const topRect = { x: x0, y: gapY + GAP_HALF, w, h: CEIL - (gapY + GAP_HALF) };
  const botRect = { x: x0, y: FLOOR, w, h: gapY - GAP_HALF - FLOOR };
  if (topRect.h > 0.05 && circleRectOverlap(cx, cy, r, topRect.x, topRect.y, topRect.w, topRect.h)) {
    return true;
  }
  if (botRect.h > 0.05 && circleRectOverlap(cx, cy, r, botRect.x, botRect.y, botRect.w, botRect.h)) {
    return true;
  }
  return false;
}

function hitTestDiamondGate(birdY, worldX) {
  const cx = BIRD_X;
  const cy = birdY;
  const r = BIRD_HIT;
  const x0 = worldX - 0.82;
  const w = 1.64;

  if (circleRectOverlap(cx, cy, r, x0, 1.42, w, CEIL - 1.42)) {
    return true;
  }
  if (circleRectOverlap(cx, cy, r, x0, FLOOR, w, -1.42 - FLOOR)) {
    return true;
  }

  const dx = cx - worldX;
  const dy = cy;
  const diamondR = 0.88;
  if (dx * dx + dy * dy < (r + diamondR) * (r + diamondR)) {
    return true;
  }

  return false;
}

function setupCamera(renderer) {
  const aspect = Math.max(0.5, renderer.domElement.clientWidth / renderer.domElement.clientHeight);
  const viewH = 11;
  const viewW = viewH * aspect;
  const cam = new THREE.OrthographicCamera(-viewW / 2, viewW / 2, viewH / 2, -viewH / 2, 0.1, 50);
  cam.position.set(0, 0, 10);
  return cam;
}

function resize(camera, renderer) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  const aspect = Math.max(0.5, w / h);
  const viewH = 11;
  const viewW = viewH * aspect;
  camera.left = -viewW / 2;
  camera.right = viewW / 2;
  camera.top = viewH / 2;
  camera.bottom = -viewH / 2;
  camera.updateProjectionMatrix();
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7dd3fc);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = setupCamera(renderer);

const clouds = new THREE.Group();
for (let i = 0; i < 5; i += 1) {
  const puff = new THREE.Mesh(
    new THREE.CircleGeometry(0.9 + Math.random() * 0.4, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
  );
  puff.position.set(-8 + i * 4.2 + Math.random() * 1.5, 3 + Math.random() * 1.8, -2);
  clouds.add(puff);
}
scene.add(clouds);

const bird = createBird();
scene.add(bird);

const segments = PIPE_SPECS.map((spec) => {
  if (spec.kind === 'pair') {
    const pair = buildPipePair(spec.gapY);
    pair.group.position.x = spec.x;
    pair.baseX = spec.x;
    pair.kind = 'pair';
    scene.add(pair.group);
    return pair;
  }
  const gate = buildDiamondGate();
  gate.group.position.x = spec.x;
  gate.baseX = spec.x;
  scene.add(gate.group);
  return gate;
});

const hint = document.createElement('div');
hint.className = 'game-ui';
hint.innerHTML = '<p class="game-ui__hint">Tap to fly</p>';
document.body.appendChild(hint);

const endScreen = document.createElement('div');
endScreen.className = 'end-screen';
endScreen.hidden = true;
endScreen.innerHTML =
  '<h2 id="end-title"></h2><p id="end-sub"></p><button type="button" id="end-cta">Play Now</button>';
document.body.appendChild(endScreen);

let gameState = 'waiting';
let birdVy = 0;
let handTutorial = null;
let score = 0;

function showEnd(title, sub, ctaText) {
  endScreen.hidden = false;
  endScreen.querySelector('#end-title').textContent = title;
  endScreen.querySelector('#end-sub').textContent = sub;
  endScreen.querySelector('#end-cta').textContent = ctaText;
}

function resetGame() {
  gameState = 'waiting';
  birdVy = 0;
  score = 0;
  bird.position.y = 0;
  bird.rotation.z = 0;
  segments.forEach((seg, i) => {
    seg.group.position.x = PIPE_SPECS[i].x;
    seg.scored = false;
  });
  endScreen.hidden = true;
  hint.querySelector('.game-ui__hint').classList.remove('game-ui__hint--hidden');
  startHandTutorial();
}

function startHandTutorial() {
  if (handTutorial) {
    handTutorial.destroy();
    handTutorial = null;
  }
  if (!window.HandTutorial) {
    return;
  }
  handTutorial = new window.HandTutorial({
    container: document.body,
    renderer,
    camera,
    assetUrl: HAND_DATA_URL,
    gesture: 'tap',
    from: { space: 'screen', x: 0.5, y: 0.52 },
    to: { space: 'screen', x: 0.5, y: 0.52 },
    duration: 1.1,
    loop: true,
    loopDelay: 0.35,
    size: 132,
    anchor: { x: 0.45, y: 0.22 },
    rotation: -8,
    zIndex: 96,
    hideOnComplete: false
  });
  handTutorial.play();
}

function stopHandTutorial() {
  if (handTutorial) {
    handTutorial.destroy();
    handTutorial = null;
  }
}

function flap() {
  if (gameState === 'waiting') {
    gameState = 'playing';
    stopHandTutorial();
    hint.querySelector('.game-ui__hint').classList.add('game-ui__hint--hidden');
    birdVy = FLAP_VY;
    return;
  }
  if (gameState === 'playing') {
    birdVy = FLAP_VY;
  }
}

function onPointerDown(e) {
  if (e.target.closest('.end-screen')) {
    return;
  }
  e.preventDefault();
  if (gameState === 'ended') {
    return;
  }
  flap();
}

renderer.domElement.addEventListener('pointerdown', onPointerDown, { passive: false });

endScreen.querySelector('#end-cta').addEventListener('click', () => {
  if (gameState === 'ended') {
    resetGame();
  }
});

window.addEventListener('resize', () => {
  resize(camera, renderer);
});

startHandTutorial();

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  const now = performance.now();

  if (handTutorial) {
    handTutorial.update(now);
  }

  clouds.children.forEach((c, i) => {
    c.position.x += dt * 0.35 * (1 + i * 0.05);
    if (c.position.x > 14) {
      c.position.x = -14;
    }
  });

  if (gameState === 'waiting') {
    bird.position.y = Math.sin(now * 0.003) * 0.35;
    bird.rotation.z = Math.sin(now * 0.002) * 0.08;
    renderer.render(scene, camera);
    return;
  }

  if (gameState === 'playing') {
    birdVy += GRAVITY * dt;
    bird.position.y += birdVy * dt;
    bird.rotation.z = THREE.MathUtils.clamp(-birdVy * 0.06, -0.9, 0.6);

    segments.forEach((seg) => {
      seg.group.position.x -= SCROLL_SPEED * dt;
      const px = seg.group.position.x;
      if (gameState !== 'playing') {
        return;
      }
      if (!seg.scored && px + PIPE_HIT_W < BIRD_X - BIRD_RADIUS * 0.5) {
        seg.scored = true;
        score += 1;
        if (score >= WIN_SEGMENTS) {
          gameState = 'ended';
          stopHandTutorial();
          showEnd('You cleared it!', 'Tap below to play the full game.', 'Play Now');
        }
      }
      let hit = false;
      if (seg.kind === 'diamond') {
        hit = hitTestDiamondGate(bird.position.y, px);
      } else {
        hit = hitTestPipe(bird.position.y, px, seg.gapCenterY);
      }
      if (gameState === 'playing' && hit) {
        gameState = 'ended';
        stopHandTutorial();
        showEnd('Oops!', 'You hit an obstacle.', 'Try Again');
      }
    });

    if (gameState === 'playing' && (bird.position.y > CEIL - BIRD_RADIUS || bird.position.y < FLOOR + BIRD_RADIUS)) {
      gameState = 'ended';
      stopHandTutorial();
      showEnd('Oops!', 'Stay in the sky.', 'Try Again');
    }
  }

  renderer.render(scene, camera);
});

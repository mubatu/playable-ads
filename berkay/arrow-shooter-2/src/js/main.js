import * as THREE from 'three';
import '../../../../reusables/components/HandTutorial.js';
import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { ObjectPool } from '../../../../reusables/components/ObjectPool.js';

const CONFIG_PATH = 'src/config/game-config.json';
const DEFAULT_CONFIG = {
  rows: 8,
  columns: 8,
  cellSize: 0.5,
  arrowHeadScale: 1,
  boardY: -0.35,
  worldHeight: 9.4,
  camera: {
    fov: 38,
    position: [0, -7.2, 8.6],
    target: [0, -0.35, 0]
  },
  visual3d: {
    cellDepth: 0.08,
    arrowDepth: 0.18,
    connectorDepth: 0.1,
    boardDepth: 0.18,
    railRadius: 0.035
  },
  conveyorCapacity: 5,
  conveyorSpeed: 1.35,
  conveyorSegmentSpacing: 0.34,
  conveyorBlockRadius: 0.28,
  jamGraceSeconds: 1.15,
  shooterY: 3.12,
  shooterAimXThreshold: 0.12,
  shooterAimYThreshold: 0.055,
  storeUrl: '',
  tutorialHandUrl: 'src/assets/hand-1.svg',
  shooterBullets: 5,
  fireInterval: 0.045,
  copy: {
    initialPrompt: 'Tap a free arrow',
    activePrompt: 'Match colors to destroy arrows',
    blockedPrompt: 'Blocked! Clear a path first.',
    conveyorBlockedPrompt: 'Wait for the conveyor gap!',
    conveyorFullPrompt: 'Conveyor is full!',
    tapBoardPrompt: 'Tap an arrow on the board',
    clearPrompt: '+10 Clear!',
    winPrompt: 'Board cleared!',
    losePrompt: 'Conveyor jammed!',
    winTitle: 'Board Cleared!',
    loseTitle: 'Conveyor Jammed!',
    winSubtitle: 'Great solve - keep clearing puzzles.',
    loseSubtitle: 'Try a smarter order and keep the arrows moving.'
  },
  shooterSlots: [
    { color: 'red', x: -1.55, queue: ['green', 'red', 'yellow', 'blue', 'green', 'red'] },
    { color: 'blue', x: 0, queue: ['yellow', 'green', 'blue', 'red', 'yellow', 'green'] },
    { color: 'yellow', x: 1.55, queue: ['blue', 'red', 'green', 'yellow', 'blue', 'red'] }
  ],
  arrowLayout: [
    { dir: 'U', color: 'red', cells: [[0, 0], [1, 0], [1, 1]] },
    { dir: 'U', color: 'blue', cells: [[0, 3], [1, 3]] },
    { dir: 'U', color: 'yellow', cells: [[0, 6], [1, 6], [1, 7]] },
    { dir: 'L', color: 'green', cells: [[2, 0], [2, 1], [3, 1]] },
    { dir: 'R', color: 'red', cells: [[2, 7], [2, 6], [3, 6]] },
    { dir: 'L', color: 'blue', cells: [[4, 0], [4, 1], [5, 1], [5, 2]] },
    { dir: 'R', color: 'yellow', cells: [[4, 7], [4, 6], [5, 6], [5, 5]] },
    { dir: 'D', color: 'green', cells: [[7, 0], [6, 0], [6, 1]] },
    { dir: 'D', color: 'red', cells: [[7, 3], [6, 3], [6, 4]] },
    { dir: 'D', color: 'blue', cells: [[7, 7], [6, 7]] },
    { dir: 'U', color: 'yellow', cells: [[3, 3], [4, 3]] },
    { dir: 'D', color: 'green', cells: [[3, 4], [2, 4], [2, 5]] },
    { dir: 'L', color: 'red', cells: [[5, 4], [5, 3]] }
  ]
};
let CONFIG = DEFAULT_CONFIG;

const COLORS = {
  red: { fill: 0xff5b70, dark: 0x9d253b, text: '#ff5b70' },
  blue: { fill: 0x4fd5ff, dark: 0x1d6f9e, text: '#4fd5ff' },
  yellow: { fill: 0xffd24d, dark: 0x9d7324, text: '#ffd24d' },
  green: { fill: 0x5af28e, dark: 0x1e8f54, text: '#5af28e' }
};

const DIRECTIONS = {
  U: { row: -1, col: 0, angle: 0 },
  R: { row: 0, col: 1, angle: -Math.PI * 0.5 },
  D: { row: 1, col: 0, angle: Math.PI },
  L: { row: 0, col: -1, angle: Math.PI * 0.5 }
};

const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 50);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
let grid = [];
const arrows = [];
const arrowHitMeshes = [];
const conveyor = [];
const moving = [];
const bullets = [];
const particles = [];
const shooters = [];

let score = 0;
let clearedCount = 0;
let gameEnded = false;
let hasUserInteracted = false;
let tutorial = null;
let tutorialDelay = 0.7;
let promptTimer = 0;
let jamTimer = 0;

let hud = null;
let overlay = null;
let shared = null;
let bulletPool = null;
let particlePool = null;
let conveyorPath = null;

function init() {
  grid = Array.from({ length: CONFIG.rows }, () => Array(CONFIG.columns).fill(null));
  hud = createHud();
  overlay = createOverlay();
  shared = createSharedResources();
  bulletPool = new ObjectPool(createBullet, resetBullet, 10);
  particlePool = new ObjectPool(createParticle, resetParticle, 48);
  conveyorPath = createConveyorPath();
  addStage();
  configureCamera();
  buildBoard();
  buildShooters();
  buildConveyorTrack();
  updateHud();
  updateHighlights();
  window.addEventListener('resize', resize);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  resize();
  renderer.setAnimationLoop(tick);
}

function createSharedResources() {
  const visual = CONFIG.visual3d || DEFAULT_CONFIG.visual3d;
  return {
    cellGeometry: new THREE.BoxGeometry(CONFIG.cellSize * 0.92, CONFIG.cellSize * 0.92, visual.cellDepth),
    hitGeometry: new THREE.BoxGeometry(CONFIG.cellSize, CONFIG.cellSize, visual.arrowDepth * 1.3),
    arrowGeometry: createArrowGeometry(),
    arrowUnitGeometry: new THREE.BoxGeometry(CONFIG.cellSize * 0.74, CONFIG.cellSize * 0.36, visual.arrowDepth),
    connectorGeometry: new THREE.BoxGeometry(CONFIG.cellSize * 0.42, CONFIG.cellSize * 0.18, visual.connectorDepth),
    pipGeometry: new THREE.CylinderGeometry(0.035, 0.035, 0.025, 16),
    bulletGeometry: new THREE.SphereGeometry(0.095, 16, 16),
    particleGeometry: new THREE.BoxGeometry(0.055, 0.055, 0.055)
  };
}

function createHud() {
  const root = document.createElement('div');
  root.className = 'hud';
  root.innerHTML = [
    '<div class="score-card">',
    '  <div>Score <span data-score>0</span></div>',
    '  <div>Left <span data-left>0</span></div>',
    '  <div>Lane <span data-lane>0/5</span></div>',
    '</div>',
    `<div class="prompt-card" data-prompt>${CONFIG.copy.initialPrompt}</div>`
  ].join('');
  document.body.appendChild(root);

  return {
    root,
    score: root.querySelector('[data-score]'),
    left: root.querySelector('[data-left]'),
    lane: root.querySelector('[data-lane]'),
    prompt: root.querySelector('[data-prompt]')
  };
}

function createOverlay() {
  const root = document.createElement('div');
  root.className = 'overlay';
  root.hidden = true;
  root.innerHTML = [
    '<div class="panel">',
    `  <h1 data-title>${CONFIG.copy.winTitle}</h1>`,
    `  <p data-subtitle>${CONFIG.copy.winSubtitle}</p>`,
    '  <div class="button-row">',
    '    <button data-cta>Play Now</button>',
    '    <button class="secondary" data-retry hidden>Retry</button>',
    '  </div>',
    '</div>'
  ].join('');
  document.body.appendChild(root);

  const cta = root.querySelector('[data-cta]');
  const retry = root.querySelector('[data-retry]');
  cta.addEventListener('click', () => {
    if (CONFIG.storeUrl) {
      window.location.href = CONFIG.storeUrl;
      return;
    }
    console.info('CTA clicked: configure CONFIG.storeUrl with the final store URL.');
  });
  retry.addEventListener('click', () => window.location.reload());

  return {
    root,
    title: root.querySelector('[data-title]'),
    subtitle: root.querySelector('[data-subtitle]'),
    retry
  };
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function configureCamera() {
  const cameraConfig = CONFIG.camera || DEFAULT_CONFIG.camera;
  const position = cameraConfig.position || DEFAULT_CONFIG.camera.position;
  const target = cameraConfig.target || DEFAULT_CONFIG.camera.target;
  camera.fov = cameraConfig.fov || DEFAULT_CONFIG.camera.fov;
  camera.position.set(position[0], position[1], position[2]);
  camera.lookAt(target[0], target[1], target[2]);
  camera.updateProjectionMatrix();
}

function createLitMaterial(options) {
  return new THREE.MeshStandardMaterial({
    color: options.color,
    roughness: options.roughness ?? 0.55,
    metalness: options.metalness ?? 0.04,
    transparent: options.transparent || false,
    opacity: options.opacity ?? 1,
    emissive: options.emissive || 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0
  });
}

function prepareMesh(mesh, castsShadow = true, receivesShadow = true) {
  mesh.castShadow = castsShadow;
  mesh.receiveShadow = receivesShadow;
  return mesh;
}

function addStage() {
  scene.background = new THREE.Color(0x081020);
  scene.fog = new THREE.Fog(0x081020, 11, 22);

  const boardWidth = CONFIG.columns * CONFIG.cellSize;
  const boardHeight = CONFIG.rows * CONFIG.cellSize;
  const visual = CONFIG.visual3d || DEFAULT_CONFIG.visual3d;
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(boardWidth + 0.55, boardHeight + 0.55, visual.boardDepth),
    createLitMaterial({ color: 0x101a33, roughness: 0.7 })
  );
  panel.position.set(0, CONFIG.boardY, -0.12);
  prepareMesh(panel, false, true);
  scene.add(panel);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(2.95, 0.035, 8, 96),
    createLitMaterial({ color: 0x2b456f, roughness: 0.45, emissive: 0x10294d, emissiveIntensity: 0.18 })
  );
  rim.position.set(0, CONFIG.boardY - 0.15, 0.04);
  rim.scale.set(1.08, 0.92, 1);
  prepareMesh(rim, true, false);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 18),
    createLitMaterial({ color: 0x07101f, roughness: 0.9 })
  );
  floor.position.set(0, CONFIG.boardY - 0.6, -0.28);
  prepareMesh(floor, false, true);
  scene.add(floor);

  const ambient = new THREE.HemisphereLight(0x85b7ff, 0x050812, 1.15);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(-3.5, -5, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -7;
  keyLight.shadow.camera.right = 7;
  keyLight.shadow.camera.top = 7;
  keyLight.shadow.camera.bottom = -7;
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0x62f4ff, 1.3, 9);
  rimLight.position.set(3.4, 2.5, 3.2);
  scene.add(rimLight);
}

function buildBoard() {
  for (let row = 0; row < CONFIG.rows; row += 1) {
    for (let col = 0; col < CONFIG.columns; col += 1) {
      const cell = new THREE.Mesh(
        shared.cellGeometry,
        createLitMaterial({
          color: (row + col) % 2 ? 0x1a2d57 : 0x233d70,
          roughness: 0.62,
          emissive: (row + col) % 2 ? 0x030a18 : 0x06112a,
          emissiveIntensity: 0.25
        })
      );
      const position = cellToWorld(row, col);
      cell.position.set(position.x, position.y, 0.02);
      prepareMesh(cell, true, true);
      scene.add(cell);
    }
  }

  getInitialArrowData().forEach((data, index) => {
    const arrow = createArrow({ ...data, id: index });
    arrows.push(arrow);
    arrow.cells.forEach(([row, col]) => {
      grid[row][col] = arrow;
    });
    scene.add(arrow.group);
  });
}

function getInitialArrowData() {
  return CONFIG.arrowLayout;
}

function createArrow(data) {
  const color = COLORS[data.color];
  const group = new THREE.Group();
  const [headRow, headCol] = data.cells[0];
  data.row = headRow;
  data.col = headCol;
  const position = cellToWorld(data.row, data.col);
  const unitMeshes = [];
  const shadowMeshes = [];
  const connectorMeshes = [];
  const connectorShadowMeshes = [];
  const hitMeshes = [];

  data.cells.forEach(([row, col], index) => {
    const cellPosition = cellToWorld(row, col);
    const localX = cellPosition.x - position.x;
    const localY = cellPosition.y - position.y;
    const geometry = index === 0 ? shared.arrowGeometry : shared.arrowUnitGeometry;
    const unit = new THREE.Mesh(
      geometry,
      createLitMaterial({ color: color.fill, roughness: 0.38, emissive: color.dark, emissiveIntensity: 0.14 })
    );
    const shadow = new THREE.Mesh(
      geometry,
      createLitMaterial({ color: color.dark, roughness: 0.75, transparent: true, opacity: 0.42 })
    );
    const hit = new THREE.Mesh(
      shared.hitGeometry,
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    const rotation = index === 0 ? DIRECTIONS[data.dir].angle : getUnitRotation(data.cells, index);

    unit.position.set(localX, localY, 0.02);
    shadow.position.set(localX + 0.04, localY - 0.04, 0);
    hit.position.set(localX, localY, 0.06);
    unit.rotation.z = rotation;
    shadow.rotation.z = rotation;
    prepareMesh(unit, true, true);
    prepareMesh(shadow, false, true);
    group.add(shadow, unit, hit);
    unitMeshes.push(unit);
    shadowMeshes.push(shadow);
    hitMeshes.push(hit);
    arrowHitMeshes.push(hit);
  });

  for (let i = 0; i < data.cells.length - 1; i += 1) {
    const [rowA, colA] = data.cells[i];
    const [rowB, colB] = data.cells[i + 1];
    const pointA = cellToWorld(rowA, colA);
    const pointB = cellToWorld(rowB, colB);
    const localX = (pointA.x + pointB.x) * 0.5 - position.x;
    const localY = (pointA.y + pointB.y) * 0.5 - position.y;
    const rotation = Math.abs(pointA.x - pointB.x) > Math.abs(pointA.y - pointB.y) ? 0 : Math.PI * 0.5;
    const connector = new THREE.Mesh(
      shared.connectorGeometry,
      createLitMaterial({ color: 0xaeb9c9, roughness: 0.48, metalness: 0.08 })
    );
    const connectorShadow = new THREE.Mesh(
      shared.connectorGeometry,
      createLitMaterial({ color: 0x3a4558, roughness: 0.72, transparent: true, opacity: 0.55 })
    );
    connector.position.set(localX, localY, 0.015);
    connectorShadow.position.set(localX + 0.04, localY - 0.04, 0.005);
    connector.rotation.z = rotation;
    connectorShadow.rotation.z = rotation;
    prepareMesh(connector, true, true);
    prepareMesh(connectorShadow, false, true);
    group.add(connectorShadow, connector);
    connectorMeshes.push(connector);
    connectorShadowMeshes.push(connectorShadow);
  }

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(CONFIG.cellSize * 0.38, CONFIG.cellSize * 0.44, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
  );
  ring.position.z = 0.03;

  group.position.set(position.x, position.y, 0.12);
  group.add(ring);

  const pips = [];
  for (let i = 0; i < data.cells.length; i += 1) {
    const pip = new THREE.Mesh(
      shared.pipGeometry,
      createLitMaterial({ color: 0xffffff, roughness: 0.3, emissive: 0xffffff, emissiveIntensity: 0.2, transparent: true, opacity: 0.88 })
    );
    pip.position.set((i - (data.cells.length - 1) * 0.5) * 0.11, -0.28, 0.08);
    pip.rotation.x = Math.PI * 0.5;
    prepareMesh(pip, true, false);
    group.add(pip);
    pips.push(pip);
  }

  const arrow = {
    ...data,
    health: data.cells.length,
    maxHealth: data.cells.length,
    state: 'board',
    group,
    unitMeshes,
    shadowMeshes,
    connectorMeshes,
    connectorShadowMeshes,
    ring,
    hitMeshes,
    pips,
    target: null,
    exitInfo: null,
    conveyorDistance: 0,
    entryDistance: 0,
    impactPoint: new THREE.Vector3(position.x, position.y, 0.18),
    pendingHits: 0,
    shakeTime: 0,
    shakeBaseX: position.x
  };
  hitMeshes.forEach((hit) => {
    hit.userData.arrow = arrow;
  });
  updateArrowHealth(arrow);
  return arrow;
}

function createArrowGeometry() {
  const scale = CONFIG.arrowHeadScale || 1;
  const shape = new THREE.Shape();
  shape.moveTo(-0.16 * scale, -0.32 * scale);
  shape.lineTo(0.16 * scale, -0.32 * scale);
  shape.lineTo(0.16 * scale, 0.1 * scale);
  shape.lineTo(0.31 * scale, 0.1 * scale);
  shape.lineTo(0, 0.34 * scale);
  shape.lineTo(-0.31 * scale, 0.1 * scale);
  shape.lineTo(-0.16 * scale, 0.1 * scale);
  shape.lineTo(-0.16 * scale, -0.32 * scale);
  return new THREE.ExtrudeGeometry(shape, {
    depth: (CONFIG.visual3d || DEFAULT_CONFIG.visual3d).arrowDepth,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 2
  });
}

function getUnitRotation(cells, index) {
  const current = cells[index];
  const next = cells[index + 1] || cells[index - 1];
  if (!next) {
    return 0;
  }

  const dRow = next[0] - current[0];
  const dCol = next[1] - current[1];
  return Math.abs(dCol) > Math.abs(dRow) ? 0 : Math.PI * 0.5;
}

function createTextSprite(text, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.34, 0.34, 1);
  sprite.userData.canvas = canvas;
  sprite.userData.context = context;
  sprite.userData.texture = texture;
  sprite.userData.options = options;
  updateTextSprite(sprite, text, options);
  return sprite;
}

function updateTextSprite(sprite, text, options = sprite.userData.options || {}) {
  const canvas = sprite.userData.canvas;
  const context = sprite.userData.context;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = options.background || '#4fd5ff';
  context.beginPath();
  context.arc(64, 64, 46, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 8;
  context.strokeStyle = 'rgba(255,255,255,0.9)';
  context.stroke();
  context.fillStyle = options.color || '#ffffff';
  context.font = `900 ${options.fontSize || 54}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(String(text), 64, 66);
  sprite.userData.texture.needsUpdate = true;
}

function buildShooters() {
  const specs = CONFIG.shooterSlots;

  specs.forEach((spec, index) => {
    const group = new THREE.Group();
    const shooter = {
      group,
      color: spec.color,
      bullets: CONFIG.shooterBullets,
      queue: getShooterQueue(index, spec),
      pips: [],
      muzzle: null,
      base: null,
      barrel: null,
      countSprite: null,
      slotX: spec.x,
      slotY: CONFIG.shooterY,
      active: true,
      replacing: false,
      replaceTimer: 0,
      spawnedReplacement: false,
      fireCooldown: 0
    };
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.38, 0.28),
      createLitMaterial({ color: COLORS[spec.color].dark, roughness: 0.42, metalness: 0.06 })
    );
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.14, 0.58, 18),
      createLitMaterial({ color: COLORS[spec.color].fill, roughness: 0.34, metalness: 0.12, emissive: COLORS[spec.color].dark, emissiveIntensity: 0.2 })
    );
    shooter.base = base;
    shooter.barrel = barrel;
    barrel.position.y = -0.34;
    barrel.rotation.x = Math.PI * 0.5;
    shooter.muzzle = new THREE.Object3D();
    shooter.muzzle.position.set(0, -0.6, 0.1);
    prepareMesh(base, true, true);
    prepareMesh(barrel, true, true);
    group.add(base, barrel, shooter.muzzle);

    for (let i = 0; i < CONFIG.shooterBullets; i += 1) {
      const pip = new THREE.Mesh(
        shared.pipGeometry,
        createLitMaterial({ color: 0xffffff, roughness: 0.28, emissive: COLORS[spec.color].fill, emissiveIntensity: 0.26, transparent: true, opacity: 0.9 })
      );
      pip.position.set(-0.28 + i * 0.14, 0.26, 0.08);
      pip.rotation.x = Math.PI * 0.5;
      prepareMesh(pip, true, false);
      group.add(pip);
      shooter.pips.push(pip);
    }

    shooter.countSprite = createTextSprite(String(shooter.bullets), {
      fontSize: 54,
      color: '#ffffff',
      background: COLORS[spec.color].text
    });
    shooter.countSprite.position.set(0, 0.02, 0.14);
    group.add(shooter.countSprite);

    group.position.set(spec.x, CONFIG.shooterY, 0.2);
    scene.add(group);
    shooters.push(shooter);
    updateShooterVisual(shooter);
  });
}

function getShooterQueue(index, spec) {
  if (spec.queue && spec.queue.length) {
    return spec.queue.slice();
  }

  return CONFIG.shooterSlots[(index + 1) % CONFIG.shooterSlots.length].queue.slice();
}

function buildConveyorTrack() {
  const points = conveyorPath.points.map((point) => new THREE.Vector3(point.x, point.y, 0.035));
  points.push(points[0].clone());
  const visual = CONFIG.visual3d || DEFAULT_CONFIG.visual3d;
  const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0);

  const rail = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 120, visual.railRadius, 8, true),
    createLitMaterial({ color: 0x5d729d, roughness: 0.35, metalness: 0.15, emissive: 0x153966, emissiveIntensity: 0.25 })
  );
  prepareMesh(rail, true, true);
  scene.add(rail);

  conveyorPath.points.forEach((point) => {
    const corner = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 12),
      createLitMaterial({ color: 0x92f7ff, roughness: 0.25, emissive: 0x2fd8ff, emissiveIntensity: 0.32 })
    );
    corner.position.set(point.x, point.y, 0.06);
    prepareMesh(corner, true, false);
    scene.add(corner);
  });
}

function tick() {
  const delta = Math.min(clock.getDelta(), 0.033);
  const now = performance.now();

  if (!gameEnded) {
    updateMoving(delta);
    updateConveyorArrows(delta);
    updateArrows(delta);
    updateShooters(delta);
    updateCombat(delta);
    updateParticles(delta);
    updateTutorial(delta, now);
    updatePrompt(delta);
    checkEndState(delta);
  }

  renderer.render(scene, camera);
}

function onPointerDown(event) {
  if (gameEnded) {
    return;
  }

  hasUserInteracted = true;
  destroyTutorial();

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(arrowHitMeshes, false);
  const arrow = hits.length ? hits[0].object.userData.arrow : null;
  if (!arrow || arrow.state !== 'board') {
    setPrompt(CONFIG.copy.tapBoardPrompt);
    return;
  }

  if (!canArrowExit(arrow)) {
    arrow.shakeBaseX = arrow.group.position.x;
    arrow.shakeTime = 0.28;
    setPrompt(CONFIG.copy.blockedPrompt);
    return;
  }

  if (isConveyorBlockingExit(arrow)) {
    arrow.shakeBaseX = arrow.group.position.x;
    arrow.shakeTime = 0.28;
    setPrompt(CONFIG.copy.conveyorBlockedPrompt);
    return;
  }

  if (conveyor.length >= CONFIG.conveyorCapacity) {
    setPrompt(CONFIG.copy.conveyorFullPrompt);
    checkEndState(0);
    return;
  }

  moveArrowToConveyor(arrow);
}

function canArrowExit(arrow) {
  arrow.exitInfo = findSnakeExit(arrow);
  return Boolean(arrow.exitInfo);
}

function findSnakeExit(arrow) {
  const dir = DIRECTIONS[arrow.dir];
  const startRow = arrow.row + dir.row;
  const startCol = arrow.col + dir.col;
  const queue = [];
  const visited = new Set();
  const parents = new Map();
  const ownCells = new Set(arrow.cells.map(([row, col]) => `${row},${col}`));
  const headKey = `${arrow.row},${arrow.col}`;

  if (isOutsideGrid(startRow, startCol)) {
    return getExitInfo(arrow.row, arrow.col, dir, [[arrow.row, arrow.col]]);
  }

  if (isBlockedForSnake(startRow, startCol, arrow, ownCells)) {
    return null;
  }

  queue.push([startRow, startCol]);
  visited.add(`${startRow},${startCol}`);
  parents.set(`${startRow},${startCol}`, headKey);

  while (queue.length > 0) {
    const [row, col] = queue.shift();
    const neighbors = [
      { row: row - 1, col, dir: DIRECTIONS.U },
      { row, col: col + 1, dir: DIRECTIONS.R },
      { row: row + 1, col, dir: DIRECTIONS.D },
      { row, col: col - 1, dir: DIRECTIONS.L }
    ];

    for (let i = 0; i < neighbors.length; i += 1) {
      const next = neighbors[i];

      if (isOutsideGrid(next.row, next.col)) {
        return getExitInfo(row, col, next.dir, buildSnakePath(row, col, parents, headKey));
      }

      const key = `${next.row},${next.col}`;
      if (visited.has(key) || isBlockedForSnake(next.row, next.col, arrow, ownCells)) {
        continue;
      }

      visited.add(key);
      parents.set(key, `${row},${col}`);
      queue.push([next.row, next.col]);
    }
  }

  return null;
}

function isOutsideGrid(row, col) {
  return row < 0 || row >= CONFIG.rows || col < 0 || col >= CONFIG.columns;
}

function isBlockedForSnake(row, col, arrow, ownCells) {
  const occupant = grid[row] && grid[row][col];
  return Boolean(occupant && occupant !== arrow && !ownCells.has(`${row},${col}`));
}

function buildSnakePath(row, col, parents, headKey) {
  const path = [];
  let key = `${row},${col}`;

  while (key) {
    const parts = key.split(',');
    path.push([Number(parts[0]), Number(parts[1])]);

    if (key === headKey) {
      break;
    }

    key = parents.get(key);
  }

  return path.reverse();
}

function getExitInfo(row, col, dir, path) {
  if (dir === DIRECTIONS.U) {
    return { side: 'U', row, col, path };
  }

  if (dir === DIRECTIONS.R) {
    return { side: 'R', row, col, path };
  }

  if (dir === DIRECTIONS.D) {
    return { side: 'D', row, col, path };
  }

  return { side: 'L', row, col, path };
}

function isConveyorBlockingExit(arrow) {
  const corridor = getExitCorridor(arrow);
  const blockers = conveyor.filter((candidate) => candidate !== arrow && candidate.state !== 'cleared');

  return blockers.some((candidate) => getVisibleArrowUnitPositions(candidate).some((position) => (
    isPointInExitCorridor(position, corridor)
  )));
}

function getExitCorridor(arrow) {
  const head = cellToWorld(arrow.row, arrow.col);
  const entry = sampleConveyor(getEntryDistance(arrow));
  const minX = Math.min(head.x, entry.x) - CONFIG.conveyorBlockRadius;
  const maxX = Math.max(head.x, entry.x) + CONFIG.conveyorBlockRadius;
  const minY = Math.min(head.y, entry.y) - CONFIG.conveyorBlockRadius;
  const maxY = Math.max(head.y, entry.y) + CONFIG.conveyorBlockRadius;

  return { minX, maxX, minY, maxY };
}

function isPointInExitCorridor(point, corridor) {
  return point.x >= corridor.minX &&
    point.x <= corridor.maxX &&
    point.y >= corridor.minY &&
    point.y <= corridor.maxY;
}

function getVisibleArrowUnitPositions(arrow) {
  return arrow.unitMeshes
    .filter((mesh) => mesh.visible)
    .map((mesh) => {
      const position = new THREE.Vector3();
      mesh.getWorldPosition(position);
      return position;
    });
}

function moveArrowToConveyor(arrow) {
  arrow.cells.forEach(([row, col]) => {
    grid[row][col] = null;
  });
  arrow.state = 'moving';
  arrow.ring.material.opacity = 0;
  arrow.entryDistance = getEntryDistance(arrow);
  arrow.conveyorDistance = arrow.entryDistance;
  conveyor.push(arrow);
  arrow.hitMeshes.forEach((hit) => {
    hit.visible = false;
  });
  startReleaseAnimation(arrow, () => {
    arrow.state = 'conveyor';
    setPrompt(CONFIG.copy.activePrompt);
    updateHighlights();
    updateHud();
  });
  updateHighlights();
  updateHud();
}

function updateConveyorArrows(delta) {
  conveyor.forEach((arrow) => {
    if (arrow.state !== 'conveyor') {
      return;
    }

    arrow.conveyorDistance = wrapDistance(arrow.conveyorDistance + CONFIG.conveyorSpeed * delta);
    placeArrowOnConveyor(arrow);
  });
}

function updateMoving(delta) {
  for (let i = moving.length - 1; i >= 0; i -= 1) {
    const item = moving[i];
    item.elapsed += delta;

    if (item.type === 'release') {
      updateReleaseAnimation(item);

      if (item.elapsed >= item.duration) {
        moving.splice(i, 1);
        item.onComplete();
      }
      continue;
    }

    const alpha = Math.min(item.elapsed / item.duration, 1);
    const eased = 1 - Math.pow(1 - alpha, 3);
    item.arrow.group.position.lerpVectors(item.from, item.to, eased);
    item.arrow.group.scale.setScalar(1 + Math.sin(alpha * Math.PI) * 0.12);

    if (alpha >= 1) {
      item.arrow.group.scale.setScalar(1);
      moving.splice(i, 1);
      item.onComplete();
    }
  }
}

function startReleaseAnimation(arrow, onComplete) {
  const route = buildReleaseRoute(arrow);
  arrow.group.position.set(0, 0, 0);
  arrow.group.rotation.z = 0;
  arrow.group.scale.setScalar(1);
  arrow.ring.visible = false;
  arrow.pips.forEach((pip) => {
    pip.visible = false;
  });

  moving.push({
    type: 'release',
    arrow,
    route,
    elapsed: 0,
    duration: Math.max((route.endDistance - route.headStartDistance) / (CONFIG.conveyorSpeed * 2.4), 0.72),
    onComplete
  });
}

function updateReleaseAnimation(item) {
  const arrow = item.arrow;
  const alpha = Math.min(item.elapsed / item.duration, 1);
  const eased = alpha < 0.5 ? 2 * alpha * alpha : 1 - Math.pow(-2 * alpha + 2, 2) * 0.5;
  const headDistance = item.route.headStartDistance +
    (item.route.endDistance - item.route.headStartDistance) * eased;

  arrow.unitMeshes.forEach((mesh, index) => {
    const sample = sampleReleaseRoute(item.route, headDistance - index * CONFIG.cellSize);
    mesh.position.set(sample.x, sample.y, 0.18);
    mesh.rotation.z = sample.rotation;
    arrow.shadowMeshes[index].position.set(sample.x + 0.04, sample.y - 0.04, 0.14);
    arrow.shadowMeshes[index].rotation.z = sample.rotation;

    if (index === 0) {
      arrow.impactPoint.copy(mesh.position);
    }
  });

  arrow.connectorMeshes.forEach((mesh, index) => {
    placeConnectorBetween(mesh, arrow.unitMeshes[index], arrow.unitMeshes[index + 1], 0.16);
    placeConnectorBetween(arrow.connectorShadowMeshes[index], arrow.shadowMeshes[index], arrow.shadowMeshes[index + 1], 0.13);
  });

  if (alpha >= 1) {
    arrow.conveyorDistance = item.route.endConveyorDistance;
    placeArrowOnConveyor(arrow);
  }
}

function buildReleaseRoute(arrow) {
  const bodyPoints = arrow.cells.slice().reverse().map(([row, col]) => {
    const point = cellToWorld(row, col);
    return new THREE.Vector3(point.x, point.y, 0.18);
  });
  const pathCells = (arrow.exitInfo && arrow.exitInfo.path ? arrow.exitInfo.path : [[arrow.row, arrow.col]]);
  const pathPoints = pathCells.slice(1).map(([row, col]) => {
    const point = cellToWorld(row, col);
    return new THREE.Vector3(point.x, point.y, 0.18);
  });
  const conveyorEntry = sampleConveyor(arrow.entryDistance);
  const conveyorLead = sampleConveyor(arrow.entryDistance + CONFIG.conveyorSegmentSpacing * 1.5);
  const points = bodyPoints
    .concat(pathPoints)
    .concat([
      new THREE.Vector3(conveyorEntry.x, conveyorEntry.y, 0.18),
      new THREE.Vector3(conveyorLead.x, conveyorLead.y, 0.18)
    ]);
  const distances = [0];
  let length = 0;

  for (let i = 1; i < points.length; i += 1) {
    length += points[i].distanceTo(points[i - 1]);
    distances.push(length);
  }

  return {
    points,
    distances,
    headStartDistance: distances[Math.max(arrow.cells.length - 1, 0)],
    endDistance: length,
    endConveyorDistance: arrow.entryDistance + CONFIG.conveyorSegmentSpacing * 1.5
  };
}

function sampleReleaseRoute(route, distance) {
  const clamped = Math.min(Math.max(distance, 0), route.endDistance);
  let segmentIndex = 0;

  for (let i = 0; i < route.distances.length - 1; i += 1) {
    if (clamped >= route.distances[i] && clamped <= route.distances[i + 1]) {
      segmentIndex = i;
      break;
    }
  }

  const from = route.points[segmentIndex];
  const to = route.points[Math.min(segmentIndex + 1, route.points.length - 1)];
  const segmentStart = route.distances[segmentIndex];
  const segmentLength = Math.max(route.distances[segmentIndex + 1] - segmentStart, 0.0001);
  const local = Math.min(Math.max((clamped - segmentStart) / segmentLength, 0), 1);
  const x = from.x + (to.x - from.x) * local;
  const y = from.y + (to.y - from.y) * local;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const rotation = Math.atan2(-dx, dy);

  return { x, y, rotation };
}

function placeConnectorBetween(connector, firstUnit, secondUnit, z) {
  const dx = secondUnit.position.x - firstUnit.position.x;
  const dy = secondUnit.position.y - firstUnit.position.y;
  connector.position.set(
    (firstUnit.position.x + secondUnit.position.x) * 0.5,
    (firstUnit.position.y + secondUnit.position.y) * 0.5,
    z
  );
  connector.rotation.z = Math.atan2(dy, dx);
}

function arrangeArrowForConveyor(arrow) {
  arrow.ring.visible = false;
  arrow.pips.forEach((pip) => {
    pip.visible = false;
  });
  arrow.hitMeshes.forEach((hit) => {
    hit.visible = false;
  });
  arrow.group.position.set(0, 0, 0);
  arrow.group.rotation.z = 0;
  placeArrowOnConveyor(arrow);
}

function placeArrowOnConveyor(arrow) {
  arrow.group.position.set(0, 0, 0);
  arrow.group.rotation.z = 0;
  arrow.impactPoint.set(0, 0, 0);

  arrow.unitMeshes.forEach((mesh, index) => {
    const sample = sampleConveyor(arrow.conveyorDistance - index * CONFIG.conveyorSegmentSpacing);
    mesh.position.set(sample.x, sample.y, 0.18);
    mesh.rotation.z = sample.rotation;
    arrow.shadowMeshes[index].position.set(sample.x + 0.04, sample.y - 0.04, 0.14);
    arrow.shadowMeshes[index].rotation.z = sample.rotation;

    if (index === 0) {
      arrow.impactPoint.set(sample.x, sample.y, 0.18);
    }
  });

  arrow.connectorMeshes.forEach((mesh, index) => {
    const sample = sampleConveyor(arrow.conveyorDistance - (index + 0.5) * CONFIG.conveyorSegmentSpacing);
    mesh.position.set(sample.x, sample.y, 0.16);
    mesh.rotation.z = sample.rotation;
    arrow.connectorShadowMeshes[index].position.set(sample.x + 0.04, sample.y - 0.04, 0.13);
    arrow.connectorShadowMeshes[index].rotation.z = sample.rotation;
  });
}

function updateArrows(delta) {
  arrows.forEach((arrow) => {
    if (arrow.shakeTime > 0) {
      arrow.shakeTime = Math.max(0, arrow.shakeTime - delta);
      arrow.group.position.x = arrow.shakeBaseX + Math.sin(arrow.shakeTime * 90) * 0.04;
      if (arrow.shakeTime === 0) {
        arrow.group.position.x = arrow.shakeBaseX;
      }
    }

    if (arrow.state === 'board' && arrow.ring.material.opacity > 0) {
      arrow.ring.scale.setScalar(1 + Math.sin(performance.now() * 0.006) * 0.05);
    }
  });
}

function updateCombat(delta) {
  shooters.forEach((shooter) => {
    if (!shooter.active || shooter.replacing) {
      return;
    }

    shooter.fireCooldown -= delta;

    while (shooter.fireCooldown <= 0 && shooter.bullets > 0) {
      const target = findTargetForShooter(shooter);
      if (!target) {
        break;
      }

      fireBullet(shooter, target);
      shooter.fireCooldown += CONFIG.fireInterval;
    }
  });

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.elapsed += delta;
    const alpha = Math.min(bullet.elapsed / bullet.duration, 1);
    bullet.mesh.position.lerpVectors(bullet.from, bullet.to, alpha);
    bullet.mesh.scale.setScalar(1.25 - alpha * 0.35);

    if (alpha >= 1) {
      applyBulletHit(bullet);
      bullets.splice(i, 1);
      bulletPool.release(bullet);
    }
  }
}

function findTargetForShooter(shooter) {
  if (!shooter.active || shooter.replacing || shooter.bullets <= 0) {
    return null;
  }

  for (let i = 0; i < conveyor.length; i += 1) {
    const arrow = conveyor[i];
    const shootableUnits = getShootableUnits(arrow, shooter);

    if (shootableUnits.length > 0) {
      return {
        arrow,
        position: shootableUnits[0].position,
        unitIndex: shootableUnits[0].index
      };
    }
  }

  return null;
}

function isInShooterZone(arrow, shooter) {
  return getShootableUnits(arrow, shooter).length > 0;
}

function getShootableUnits(arrow, shooter) {
  if (
    arrow.state !== 'conveyor' ||
    arrow.color !== shooter.color ||
    arrow.health <= 0 ||
    !shooter.active ||
    shooter.replacing
  ) {
    return [];
  }

  if (arrow.pendingHits > 0) {
    return [];
  }

  const units = [];
  if (arrow.health <= 0) {
    return units;
  }

  arrow.unitMeshes.forEach((mesh, index) => {
    if (!mesh.visible || index >= arrow.health) {
      return;
    }

    const position = mesh.position;
    if (
      Math.abs(position.y - conveyorPath.topY) < CONFIG.shooterAimYThreshold &&
      Math.abs(position.x - shooter.group.position.x) < CONFIG.shooterAimXThreshold
    ) {
      units.push({ index, position: position.clone() });
    }
  });

  return units;
}

function fireBullet(shooter, target) {
  const bullet = bulletPool.get();
  const from = shooter.group.localToWorld(shooter.muzzle.position.clone());
  const to = target.position.clone();
  target.arrow.pendingHits += 1;
  shooter.bullets -= 1;
  updateShooterVisual(shooter);

  bullet.shooter = shooter;
  bullet.target = target.arrow;
  bullet.targetUnitIndex = target.unitIndex;
  bullet.from.copy(from);
  bullet.to.copy(to);
  bullet.elapsed = 0;
  bullet.duration = 0.18;
  bullet.mesh.material.color.setHex(COLORS[shooter.color].fill);
  bullet.mesh.position.copy(from);
  bullet.mesh.scale.setScalar(1.25);
  bullet.mesh.visible = true;
  bullets.push(bullet);

  if (shooter.bullets <= 0) {
    beginShooterReplacement(shooter);
  }
}

function applyBulletHit(bullet) {
  const arrow = bullet.target;
  if (arrow) {
    arrow.pendingHits = Math.max(arrow.pendingHits - 1, 0);
  }

  if (!arrow || arrow.health <= 0 || arrow.state !== 'conveyor') {
    return;
  }

  arrow.health -= 1;
  updateArrowHealth(arrow);
  spawnParticles(bullet.to, COLORS[arrow.color].fill);

  if (arrow.health <= 0) {
    clearArrow(arrow);
  }
}

function beginShooterReplacement(shooter) {
  if (shooter.replacing) {
    return;
  }

  shooter.active = false;
  shooter.replacing = true;
  shooter.replaceTimer = 0;
  shooter.spawnedReplacement = false;
  updateShooterVisual(shooter);
}

function updateShooters(delta) {
  shooters.forEach((shooter) => {
    if (!shooter.replacing) {
      return;
    }

    shooter.replaceTimer += delta;

    if (shooter.replaceTimer < 0.18) {
      const alpha = shooter.replaceTimer / 0.18;
      shooter.group.position.y = shooter.slotY + alpha * 0.55;
      shooter.group.scale.setScalar(1 - alpha * 0.18);
      return;
    }

    if (shooter.replaceTimer < 0.24) {
      shooter.group.visible = false;
      return;
    }

    if (!shooter.spawnedReplacement) {
      refillShooter(shooter);
      shooter.group.position.set(shooter.slotX, shooter.slotY + 0.92, 0.2);
      shooter.group.scale.setScalar(0.92);
      shooter.group.visible = true;
      shooter.spawnedReplacement = true;
    }

    const alpha = Math.min((shooter.replaceTimer - 0.25) / 0.42, 1);
    const eased = 1 - Math.pow(1 - alpha, 3);
    shooter.group.position.y = shooter.slotY + (1 - eased) * 0.92;
    shooter.group.scale.setScalar(0.92 + eased * 0.08);

    if (alpha >= 1) {
      shooter.group.position.set(shooter.slotX, shooter.slotY, 0.2);
      shooter.group.scale.setScalar(1);
      shooter.active = true;
      shooter.replacing = false;
      shooter.replaceTimer = 0;
      shooter.spawnedReplacement = false;
    }
  });
}

function refillShooter(shooter) {
  const nextColor = shooter.queue.shift();
  shooter.queue.push(shooter.color);
  shooter.color = nextColor;
  shooter.bullets = CONFIG.shooterBullets;
  updateShooterVisual(shooter);
}

function clearArrow(arrow) {
  arrow.state = 'cleared';
  score += 10;
  clearedCount += 1;
  const index = conveyor.indexOf(arrow);
  if (index >= 0) {
    conveyor.splice(index, 1);
  }
  scene.remove(arrow.group);
  updateHud();
  updateHighlights();
  setPrompt(CONFIG.copy.clearPrompt);
}

function checkEndState(delta = 0) {
  if (clearedCount >= arrows.length && conveyor.length === 0 && moving.length === 0 && bullets.length === 0) {
    endGame(true);
    return;
  }

  if (conveyor.length >= CONFIG.conveyorCapacity && bullets.length === 0 && !hasAnyFutureShooterMatch()) {
    jamTimer += delta;
  } else {
    jamTimer = 0;
  }

  if (jamTimer >= CONFIG.jamGraceSeconds) {
    endGame(false);
  }
}

function hasAnyFutureShooterMatch() {
  if (moving.some((item) => item.type === 'release')) {
    return true;
  }

  return shooters.some((shooter) => {
    if (shooter.replacing) {
      return true;
    }

    if (!shooter.active || shooter.bullets <= 0) {
      return false;
    }

    return conveyor.some((arrow) => (
      arrow.state === 'conveyor' &&
      arrow.color === shooter.color &&
      arrow.health > 0
    ));
  });
}

function endGame(won) {
  gameEnded = true;
  destroyTutorial();
  hud.prompt.textContent = won ? CONFIG.copy.winPrompt : CONFIG.copy.losePrompt;
  overlay.title.textContent = won ? CONFIG.copy.winTitle : CONFIG.copy.loseTitle;
  overlay.subtitle.textContent = won
    ? CONFIG.copy.winSubtitle
    : CONFIG.copy.loseSubtitle;
  overlay.retry.hidden = won;
  overlay.root.hidden = false;
}

function updateHighlights() {
  let firstValid = null;
  arrows.forEach((arrow) => {
    if (arrow.state !== 'board') {
      arrow.ring.material.opacity = 0;
      return;
    }

    const valid = canArrowExit(arrow);
    arrow.ring.material.color.setHex(valid ? 0xffffff : 0x334466);
    arrow.ring.material.opacity = valid ? 0.78 : 0.18;
    if (valid && !firstValid) {
      firstValid = arrow;
    }
  });
  updateTutorialTarget(firstValid);
}

function updateHud() {
  hud.score.textContent = String(score);
  hud.left.textContent = String(arrows.length - clearedCount);
  hud.lane.textContent = `${conveyor.length}/${CONFIG.conveyorCapacity}`;
}

function setPrompt(text) {
  hud.prompt.textContent = text;
  promptTimer = 1.15;
}

function updatePrompt(delta) {
  if (promptTimer <= 0) {
    return;
  }
  promptTimer -= delta;
  if (promptTimer <= 0 && !gameEnded) {
    hud.prompt.textContent = CONFIG.copy.initialPrompt;
  }
}

function updateTutorial(delta, now) {
  if (hasUserInteracted || !window.HandTutorial) {
    return;
  }

  if (tutorialDelay > 0) {
    tutorialDelay -= delta;
    if (tutorialDelay > 0) {
      return;
    }
    const target = arrows.find((arrow) => arrow.state === 'board' && canArrowExit(arrow));
    updateTutorialTarget(target);
    if (tutorial) {
      tutorial.play();
    }
  }

  if (tutorial) {
    tutorial.update(now);
  }
}

function updateTutorialTarget(arrow) {
  if (hasUserInteracted || !window.HandTutorial || !arrow) {
    return;
  }

  const point = {
    space: 'world',
    x: arrow.group.position.x,
    y: arrow.group.position.y,
    z: arrow.group.position.z
  };

  if (!tutorial) {
    tutorial = new window.HandTutorial({
      container: app,
      renderer,
      camera,
      assetUrl: CONFIG.tutorialHandUrl,
      gesture: 'tap',
      from: point,
      to: point,
      duration: 1.05,
      loop: true,
      loopDelay: 0.35,
      size: 112,
      anchor: { x: 0.22, y: 0.08 },
      showTrail: false,
      pulseColor: 'rgba(255, 255, 255, 0.78)'
    });
    return;
  }

  tutorial.setConfig({ from: point, to: point });
}

function destroyTutorial() {
  if (tutorial) {
    tutorial.destroy();
    tutorial = null;
  }
}

function animateTo(arrow, target, duration, onComplete) {
  moving.push({
    arrow,
    from: arrow.group.position.clone(),
    to: new THREE.Vector3(target.x, target.y, 0.16),
    elapsed: 0,
    duration,
    onComplete
  });
}

function updateArrowHealth(arrow) {
  arrow.pips.forEach((pip, index) => {
    pip.visible = arrow.state === 'board' && index < arrow.health;
  });
  arrow.unitMeshes.forEach((mesh, index) => {
    mesh.visible = index < arrow.health;
  });
  arrow.shadowMeshes.forEach((mesh, index) => {
    mesh.visible = index < arrow.health;
  });
  arrow.connectorMeshes.forEach((mesh, index) => {
    mesh.visible = index < arrow.health - 1;
  });
  arrow.connectorShadowMeshes.forEach((mesh, index) => {
    mesh.visible = index < arrow.health - 1;
  });
}

function updateShooterVisual(shooter) {
  const fill = COLORS[shooter.color].fill;
  const dark = COLORS[shooter.color].dark;
  shooter.base.material.color.setHex(dark);
  shooter.base.material.emissive.setHex(0x000000);
  shooter.barrel.material.color.setHex(fill);
  shooter.barrel.material.emissive.setHex(dark);
  shooter.pips.forEach((pip, index) => {
    pip.visible = index < shooter.bullets;
    pip.material.color.setHex(fill);
    pip.material.emissive.setHex(fill);
  });
  updateTextSprite(shooter.countSprite, shooter.bullets, {
    fontSize: 54,
    color: '#ffffff',
    background: COLORS[shooter.color].text
  });
}

function spawnParticles(position, color) {
  for (let i = 0; i < 8; i += 1) {
    const particle = particlePool.get();
    particle.mesh.position.copy(position);
    particle.mesh.material.color.setHex(color);
    particle.mesh.material.emissive.setHex(color);
    particle.mesh.visible = true;
    particle.life = 0.42;
    particle.velocity.set((Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 1.1, 0);
    particles.push(particle);
  }
}

function updateParticles(delta) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.life -= delta;
    particle.mesh.position.addScaledVector(particle.velocity, delta);
    particle.mesh.material.opacity = Math.max(particle.life / 0.42, 0);
    particle.mesh.rotation.z += delta * 8;

    if (particle.life <= 0) {
      particles.splice(i, 1);
      particlePool.release(particle);
    }
  }
}

function createBullet() {
  const mesh = new THREE.Mesh(
    shared.bulletGeometry,
    createLitMaterial({ color: 0xffffff, roughness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.55 })
  );
  mesh.visible = false;
  prepareMesh(mesh, true, false);
  scene.add(mesh);
  return {
    mesh,
    from: new THREE.Vector3(),
    to: new THREE.Vector3(),
    elapsed: 0,
    duration: 0.22,
    shooter: null,
    target: null,
    targetUnitIndex: 0
  };
}

function resetBullet(bullet) {
  bullet.mesh.visible = false;
  bullet.mesh.scale.setScalar(1);
  bullet.shooter = null;
  bullet.target = null;
  bullet.targetUnitIndex = 0;
  bullet.elapsed = 0;
}

function createParticle() {
  const mesh = new THREE.Mesh(
    shared.particleGeometry,
    createLitMaterial({ color: 0xffffff, roughness: 0.45, emissive: 0xffffff, emissiveIntensity: 0.2, transparent: true, opacity: 1 })
  );
  mesh.visible = false;
  prepareMesh(mesh, true, false);
  scene.add(mesh);
  return {
    mesh,
    velocity: new THREE.Vector3(),
    life: 0
  };
}

function resetParticle(particle) {
  particle.mesh.visible = false;
  particle.mesh.material.opacity = 1;
  particle.velocity.set(0, 0, 0);
  particle.life = 0;
}

function cellToWorld(row, col) {
  return {
    x: (col - (CONFIG.columns - 1) * 0.5) * CONFIG.cellSize,
    y: CONFIG.boardY + ((CONFIG.rows - 1) * 0.5 - row) * CONFIG.cellSize
  };
}

function createConveyorPath() {
  const boardWidth = CONFIG.columns * CONFIG.cellSize;
  const boardHeight = CONFIG.rows * CONFIG.cellSize;
  const left = -boardWidth * 0.5 - 0.48;
  const right = boardWidth * 0.5 + 0.48;
  const top = CONFIG.boardY + boardHeight * 0.5 + 0.5;
  const bottom = CONFIG.boardY - boardHeight * 0.5 - 0.86;
  const points = [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];
  const segments = [];
  let length = 0;

  for (let i = 0; i < points.length; i += 1) {
    const from = points[i];
    const to = points[(i + 1) % points.length];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);
    segments.push({ from, to, dx, dy, length: segmentLength, start: length });
    length += segmentLength;
  }

  return {
    points,
    segments,
    length,
    topY: top,
    bottomY: bottom,
    leftX: left,
    rightX: right
  };
}

function wrapDistance(distance) {
  return ((distance % conveyorPath.length) + conveyorPath.length) % conveyorPath.length;
}

function sampleConveyor(distance) {
  const wrapped = wrapDistance(distance);
  const segment = conveyorPath.segments.find((candidate) => (
    wrapped >= candidate.start && wrapped <= candidate.start + candidate.length
  )) || conveyorPath.segments[0];
  const local = Math.min(Math.max((wrapped - segment.start) / segment.length, 0), 1);
  const x = segment.from.x + segment.dx * local;
  const y = segment.from.y + segment.dy * local;
  const rotation = Math.atan2(-segment.dx, segment.dy);

  return { x, y, rotation };
}

function getEntryDistance(arrow) {
  const exitInfo = arrow.exitInfo || findSnakeExit(arrow) || { side: arrow.dir, row: arrow.row, col: arrow.col };
  const head = cellToWorld(exitInfo.row, exitInfo.col);
  const topSegment = conveyorPath.segments[0];
  const rightSegment = conveyorPath.segments[1];
  const bottomSegment = conveyorPath.segments[2];
  const leftSegment = conveyorPath.segments[3];

  if (exitInfo.side === 'U') {
    return topSegment.start + Math.max(0, Math.min(head.x - conveyorPath.leftX, topSegment.length));
  }

  if (exitInfo.side === 'R') {
    return rightSegment.start + Math.max(0, Math.min(conveyorPath.topY - head.y, rightSegment.length));
  }

  if (exitInfo.side === 'D') {
    return bottomSegment.start + Math.max(0, Math.min(conveyorPath.rightX - head.x, bottomSegment.length));
  }

  return leftSegment.start + Math.max(0, Math.min(head.y - conveyorPath.bottomY, leftSegment.length));
}

ConfigLoader.loadWithDefaults(CONFIG_PATH, DEFAULT_CONFIG).then((config) => {
  CONFIG = config;
  init();
}).catch((error) => {
  console.error(error);
  CONFIG = DEFAULT_CONFIG;
  init();
});

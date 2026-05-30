import * as THREE from 'three';
import { Background } from '../../../../reusables/components/Background.js';
import { SceneManager } from '../../../../reusables/components/SceneManager.js';
import { createGradientTexture } from '../../../../reusables/components/VisualUtils.js';
import { ObjectPool } from '../../../../reusables/components/ObjectPool.js';

export function createGameState(config) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera();
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });

  const bgTexture = createGradientTexture(
    config.background.gradientTop || '#87CEEB',
    config.background.gradientBottom || '#E0F6FF',
    4,
    8
  );
  const background = new Background(config.background, bgTexture);
  const sceneManager = new SceneManager(scene, renderer);

  // Create world container
  const world = new THREE.Group();
  scene.add(world);

  // Create layers
  const groundLayer = new THREE.Group();
  const objectsLayer = new THREE.Group();
  const particlesLayer = new THREE.Group();

  world.add(groundLayer);
  world.add(objectsLayer);
  world.add(particlesLayer);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(5, 5, 10);
  scene.add(ambientLight);
  scene.add(directionalLight);

  return {
    config: config,
    scene: scene,
    camera: camera,
    renderer: renderer,
    sceneManager: sceneManager,
    background: background,
    world: world,
    groundLayer: groundLayer,
    objectsLayer: objectsLayer,
    particlesLayer: particlesLayer,

    // Game state
    score: 0,
    gameOver: false,
    gameTime: 0,
    tutorialActive: true,
    hasUserInteracted: false,

    // Player hole
    playerHole: null,

    // Input
    moveCommand: { x: 0, y: 0 },
    joystick: null,

    // Objects
    spawnedObjects: [],
    objectPool: new ObjectPool(() => createConsumableObject(), (obj) => resetConsumableObject(obj), 50),

    // Particles
    particlePool: new ObjectPool(createParticle, resetParticle, 100),
    activeParticles: new Set(),

    // UI
    uiScene: null,
    ui: {},
    tutorial: null,

    // Timing
    clock: new THREE.Clock(),
    animationFrameId: null,
    onReset: null,

    // Camera
    cameraFollowLag: 0.1
  };
}

function createConsumableObject() {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff9500 })
  );
  mesh.userData = {
    size: 0.5,
    type: 'prop',
    consumed: false
  };
  return mesh;
}

function resetConsumableObject(obj) {
  obj.visible = true;
  obj.userData.consumed = false;
  obj.scale.set(1, 1, 1);
  obj.position.set(0, 0, 0);
}

function createParticle() {
  const particle = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xff6600 })
  );
  particle.visible = false;
  particle.userData = {
    life: 0,
    maxLife: 0.5,
    velocity: new THREE.Vector3()
  };
  return particle;
}

function resetParticle(p) {
  p.visible = false;
  p.userData.life = 0;
}

export function resetGame(state) {
  state.gameOver = false;
  state.score = 0;
  state.gameTime = 0;
  state.tutorialActive = true;
  state.hasUserInteracted = false;
  state.moveCommand.x = 0;
  state.moveCommand.y = 0;

  // Reset player hole
  if (state.playerHole) {
    state.playerHole.setSize(state.config.player.initialDiameter);
    state.playerHole.position.set(0, 0, 0);
  }

  // Clear spawned objects
  state.spawnedObjects.forEach(obj => {
    obj.visible = false;
    state.objectsLayer.remove(obj);
  });
  state.spawnedObjects = [];

  // Clear particles
  state.activeParticles.forEach(p => {
    p.visible = false;
    state.particlesLayer.remove(p);
  });
  state.activeParticles.clear();

  // Reset UI
  if (state.ui.scoreDisplay) {
    state.ui.scoreDisplay.setValue(0);
  }
  if (state.ui.gameOverOverlay) {
    state.ui.gameOverOverlay.hide();
  }

  if (state.onReset) {
    state.onReset(state);
  }
}

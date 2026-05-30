import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { createGameState, resetGame } from './GameState.js';
import { createPlayerHole, updatePlayerHole, getHoleDiameter } from './PlayerHole.js';
import { spawnEnvironment, updateEnvironment, checkCollisions, cleanupEnvironment } from './Environment.js';
import { addScore, updateGameTime, updatePlayerMovement, updateCamera, updateParticles } from './Gameplay.js';
import { buildHud, refreshScoreDisplay, showGameOver } from './Hud.js';
import { scheduleTutorial, destroyTutorial } from './Tutorial.js';

const CONFIG_PATH = 'src/config/game-config.json';
const appRoot = document.getElementById('app') || document.body;
const errorBanner = document.getElementById('error-banner');

function showError(message) {
  if (!errorBanner) return;
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}

function startLoop(state) {
  function frame(now) {
    const delta = Math.min(state.clock.getDelta(), 0.05);

    // Update game logic
    updateGameTime(state, delta);
    updatePlayerMovement(state, delta);
    updateCamera(state, delta);

    if (state.playerHole) {
      updatePlayerHole(state.playerHole, delta);

      // Check collisions
      const consumed = checkCollisions(state, state.playerHole);
      consumed.forEach(item => {
        addScore(state, item.score);
      });
    }

    updateEnvironment(state, delta);
    updateParticles(state, delta);

    // Update scene
    state.sceneManager.update(delta);

    // Update tutorial
    if (state.tutorial) {
      state.tutorial.update(now);
    }

    state.sceneManager.render(state.camera);
    state.animationFrameId = window.requestAnimationFrame(frame);
  }

  frame(performance.now());
}

function createGame(config) {
  const state = createGameState(config);
  const renderer = state.renderer;
  const camera = state.camera;
  const background = state.background;

  SceneSetup.configureRenderer(renderer);
  SceneSetup.fitOrthographicCamera(camera, background.size);

  appRoot.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.style.cursor = 'grab';

  // Add background
  state.sceneManager.addObject(background.mesh);

  // Create player hole
  const playerHole = createPlayerHole(config);
  state.world.add(playerHole);
  state.playerHole = playerHole;
  state.sceneManager.addObject(state.world);

  // Spawn environment
  spawnEnvironment(state);

  // Build HUD
  buildHud(state, function () {
    cleanupEnvironment(state);
    resetGame(state);
    startLoop(state);
  });

  refreshScoreDisplay(state);
  scheduleTutorial(state);

  // Handle window resize
  window.addEventListener('resize', function () {
    SceneSetup.configureRenderer(renderer);
    SceneSetup.fitOrthographicCamera(camera, background.size);
  });

  // Expose for debugging
  window.HoleIO = {
    state: state,
    config: config,
    scene: state.scene,
    camera: camera,
    renderer: renderer,
    playerHole: playerHole,
    world: state.world
  };

  startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
  createGame(config);
}).catch(function (error) {
  console.error(error);
  showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});

import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { createGameState, resetGame } from './GameState.js';
import { createPlayer } from './Player.js';
import { createEnvironment, createEnvironmentObjects, createBuildings } from './Environment.js';
import { buildHud, updateTimer, updateScore, showEndScreen, resetHud } from './Hud.js';
import { scheduleTutorial, updateTutorial, destroyTutorial } from './Tutorial.js';
import { checkCollisions, updateCamera, checkGameOver } from './Gameplay.js';

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

        if (state.gameStarted && !state.gameOver) {
            state.gameTime += delta;

            // Update player movement
            if (state.player && state.joystickCommand) {
                state.player.updatePosition(delta, state.joystickCommand.x, state.joystickCommand.y);
                state.player.updateAnimations(delta);
            }

            // Update tutorial
            updateTutorial(state, now);

            // Check collisions
            if (state.player) {
                const consumed = checkCollisions(state.player, state.environmentObjects);
                if (consumed.length > 0) {
                    let totalPoints = 0;
                    consumed.forEach(obj => {
                        // Animate consumption
                        const scale = 1 - (obj.diameter / state.player.maxDiameter) * 0.5;
                        state.player.animateConsume(obj.mesh);

                        // Calculate growth
                        let growAmount = 0.05;
                        if (obj.type === 'medium') growAmount = 0.1;
                        if (obj.type === 'large') growAmount = 0.2;

                        state.player.grow(growAmount);
                        totalPoints += obj.points;
                        state.consumedCount++;
                    });

                    if (totalPoints > 0) {
                        updateScore(state, totalPoints);
                    }
                }
            }

            // Update timer display
            updateTimer(state, 0);

            // Update camera
            if (state.player) {
                updateCamera(state);
            }

            // Check game over
            if (checkGameOver(state)) {
                state.gameOver = true;
                destroyTutorial(state);
                showEndScreen(state);
            }
        }

        state.sceneManager.update(delta);
        state.sceneManager.render(state.camera);

        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame(performance.now());
}

function createGame(config) {
    const state = createGameState(config);
    const renderer = state.renderer;
    const scene = state.scene;
    const camera = state.camera;

    appRoot.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    // Setup environment
    const environment = createEnvironment(config, scene);
    state.sceneManager.addObject(environment);

    // Create buildings (static decorative)
    createBuildings(config, scene);

    // Create player
    state.player = createPlayer(config);
    state.sceneManager.addObject(state.player.group);

    // Create environment objects to consume
    state.environmentObjects = createEnvironmentObjects(config, scene);

    // Build HUD
    buildHud(state, function() {
        resetGame(state);
        resetHud(state);
        state.gameStarted = false;
        state.gameTime = 0;
        scheduleTutorial(state);
    });

    // Setup window resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start game
    state.gameStarted = true;
    scheduleTutorial(state);

    window.HoleIoGame = {
        state: state,
        config: config,
        scene: scene,
        camera: camera,
        renderer: renderer
    };

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function(config) {
    createGame(config);
}).catch(function(error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});

import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { createGameState, resetGame } from './GameState.js';
import { buildShark } from './SharkBuilder.js';
import { updateShark } from './SharkController.js';
import { buildWorld } from './WorldBuilder.js';
import { spawnInitialEntities, respawnEntities } from './Spawner.js';
import { updateEntities } from './EntityUpdater.js';
import { checkCollisions, updateParticles } from './Collision.js';
import { updateHunger } from './HungerSystem.js';
import { updateGoldRush } from './GoldRush.js';
import { updateCamera } from './CameraController.js';
import { buildHud, updateHud, showGameOver, showCta, hideOverlays } from './Hud.js';
import { bindInteractions } from './Interaction.js';
import { scheduleTutorial } from './Tutorial.js';

var CONFIG_PATH = 'src/config/game-config.json';
var appRoot = document.getElementById('app') || document.body;
var errorBanner = document.getElementById('error-banner');

function showError(message) {
    if (!errorBanner) {
        return;
    }

    errorBanner.textContent = message;
    errorBanner.hidden = false;
}

function resetPlayable(state) {
    resetGame(state);
    spawnInitialEntities(state);
    hideOverlays(state);
    scheduleTutorial(state);
}

function startLoop(state) {
    function frame(now) {
        var delta = Math.min(state.clock.getDelta(), 0.05);

        if (state.gameStarted && !state.gameOver) {
            state.elapsedTime += delta;
        }

        updateShark(state, delta);
        updateEntities(state, delta, state.elapsedTime);
        updateHunger(state, delta);
        updateGoldRush(state, delta);
        checkCollisions(state);
        updateParticles(state, delta);
        updateCamera(state, delta);

        if (state.gameStarted && !state.gameOver) {
            state.respawnTimer += delta;
            if (state.respawnTimer >= state.config.spawn.respawnInterval) {
                state.respawnTimer = 0;
                respawnEntities(state);
            }
        }

        updateHud(state);

        if (state.tutorial) {
            state.tutorial.update(now);
        }

        if (state.gameOver && !state.gameOverShown) {
            state.gameOverShown = true;
            showGameOver(state);
        }

        if (!state.ctaShown && state.gameStarted && !state.gameOver) {
            if (state.score >= state.config.cta.showAfterScore || state.elapsedTime >= state.config.cta.showAfterSeconds) {
                state.ctaShown = true;
                showCta(state);
            }
        }

        state.sceneManager.render(state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame(performance.now());
}

function createGame(config) {
    var state = createGameState(config);
    var renderer = state.renderer;
    var camera = state.camera;

    SceneSetup.configureRenderer(renderer);
    SceneSetup.fitOrthographicCamera(camera, state.bgSize);

    appRoot.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    buildWorld(state);
    state.sceneManager.addObject(state.worldGroup);

    state.sharkGroup = buildShark(config.shark);
    state.worldGroup.add(state.sharkGroup);

    spawnInitialEntities(state);
    buildHud(state, function () {
        resetPlayable(state);
    });
    bindInteractions(state);
    scheduleTutorial(state);

    window.addEventListener('resize', function () {
        SceneSetup.configureRenderer(renderer);
        SceneSetup.fitOrthographicCamera(camera, state.bgSize);
    });

    window.HungryShark = {
        state: state,
        config: config,
        scene: state.scene,
        camera: camera,
        renderer: renderer
    };

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
    createGame(config);
}).catch(function (error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});

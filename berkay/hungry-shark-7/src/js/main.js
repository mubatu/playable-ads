import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { createGameState } from './GameState.js';
import { buildWorld, updateBubbles } from './WorldBuilder.js';
import { buildShark } from './SharkBuilder.js';
import { updateShark, applySharkTransform } from './SharkController.js';
import { spawnInitialEntities, recycleEntity } from './Spawner.js';
import { placeEntityRandom } from './EntityFactory.js';
import { updateEntities } from './EntityUpdater.js';
import { checkCollisions, updateParticles } from './Collision.js';
import { updateHunger } from './HungerSystem.js';
import { updateGoldRush } from './GoldRush.js';
import { updateCamera } from './CameraController.js';
import { buildHud, updateHud, showGameOver, showCta } from './Hud.js';
import { bindInteractions, readInput } from './Interaction.js';
import { scheduleTutorial, destroyTutorial } from './Tutorial.js';

var CONFIG_PATH = 'src/config/game-config.json';
var appRoot = document.getElementById('app') || document.body;
var errorBanner = document.getElementById('error-banner');

function showError(message) {
    if (!errorBanner) { return; }
    errorBanner.textContent = message;
    errorBanner.hidden = false;
}

function fitCamera(state) {
    var camera = state.camera;
    var world = state.config.world;
    var aspect = window.innerWidth / window.innerHeight;

    var halfH = Math.min(world.height, 14) * 0.5;
    var halfW = halfH * aspect;
    if (halfW * 2 > world.width) {
        halfW = world.width * 0.5;
        halfH = halfW / aspect;
    }

    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH;
    camera.bottom = -halfH;
    camera.near = 0.1;
    camera.far = 50;
    camera.position.set(0, 0, 10);
    camera.updateProjectionMatrix();
}

function startGame(state) {
    state.gameStarted = true;
    state.gameOver = false;
    state._gameOverShown = false;
    scheduleTutorial(state);
}

function resetGame(state) {
    var cfg = state.config;

    if (state.ui.gameOverOverlay) { state.ui.gameOverOverlay.hide(); }
    if (state.ui.ctaOverlay) { state.ui.ctaOverlay.hide(); }

    state.score = 0;
    state.elapsedTime = 0;
    state.eatenCount = 0;
    state.hunger = cfg.hunger.initial;
    state.health = cfg.health.initial;
    state.boost = cfg.boost.initial;
    state.goldRushCharge = 0;
    state.goldRushActive = false;
    state.goldRushTimer = 0;
    state.boosting = false;
    state.move.x = 0;
    state.move.y = 0;
    state.ctaShown = false;
    state._gameOverShown = false;
    state.gameOver = false;
    state.hasUserInteracted = false;

    state.shark.x = 0;
    state.shark.y = 0;
    state.shark.angle = 0;
    state.shark.size = cfg.shark.baseSize;
    state.camTargetX = undefined;
    state.camTargetY = undefined;
    applySharkTransform(state);

    if (state.sharkGroup) {
        state.sharkGroup.userData.material.color.set('#ffffff');
        state.sharkGroup.userData.material.map = state.textures.shark;
        state.sharkGroup.userData.material.needsUpdate = true;
    }

    // recycle every entity to a fresh spot
    var i;
    for (i = 0; i < state.entities.length; i += 1) {
        placeEntityRandom(state, state.entities[i], false);
    }

    // clear particles
    for (i = 0; i < state.particles.length; i += 1) {
        state.particles[i].active = false;
        state.particles[i].mesh.visible = false;
    }

    if (state.ui.scoreDisplay) { state.ui.scoreDisplay.setValue(0); }
    updateHud(state);

    startGame(state);
}

function startLoop(state) {
    function frame(now) {
        var delta = Math.min(state.clock.getDelta(), 0.05);

        readInput(state);
        updateBubbles(state, delta);

        if (state.gameStarted && !state.gameOver) {
            state.elapsedTime += delta;
        }

        updateShark(state, delta);
        updateEntities(state, delta);
        updateHunger(state, delta);
        updateGoldRush(state, delta);
        checkCollisions(state);
        updateParticles(state, delta);
        updateCamera(state, delta);
        updateHud(state);

        if (state.tutorial) {
            state.tutorial.update(now);
        }

        if (state.gameOver && !state._gameOverShown) {
            state._gameOverShown = true;
            destroyTutorial(state);
            showGameOver(state);
        }

        if (!state.ctaShown && state.gameStarted && !state.gameOver) {
            var cta = state.config.cta;
            if (state.score >= cta.showAfterScore || state.elapsedTime >= cta.showAfterSeconds) {
                state.ctaShown = true;
                showCta(state);
            }
        }

        state.renderer.render(state.scene, state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame(performance.now());
}

function createGame(config) {
    var state = createGameState(config);
    var renderer = state.renderer;

    SceneSetup.configureRenderer(renderer);
    fitCamera(state);

    appRoot.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    buildWorld(state);
    state.scene.add(state.worldGroup);

    state.sharkGroup = buildShark(state);
    state.worldGroup.add(state.sharkGroup);
    applySharkTransform(state);

    spawnInitialEntities(state);

    buildHud(state, {
        onPlay: function () { startGame(state); },
        onRestart: function () { resetGame(state); },
        onCta: function () {
            window.open(state.config.cta.url, '_blank');
        },
        onJoystickInit: function () {}
    });

    bindInteractions(state);
    updateHud(state);

    window.addEventListener('resize', function () {
        SceneSetup.configureRenderer(renderer);
        fitCamera(state);
    });

    window.HungryShark = { state: state, config: config, reset: function () { resetGame(state); } };

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
    createGame(config);
}).catch(function (error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});

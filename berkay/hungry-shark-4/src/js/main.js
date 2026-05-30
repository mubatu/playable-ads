import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { createGameState, resetGame } from './GameState.js';
import { createShark, updateShark, activateBoost } from './SharkController.js';
import { buildWorld } from './WorldBuilder.js';
import { updateSpawner } from './Spawner.js';
import { updateEntity, updateCoin } from './EntityFactory.js';
import { updateCollisions } from './Collision.js';
import { updateHunger } from './HungerSystem.js';
import { updateCamera } from './CameraController.js';
import { updateGoldRush } from './GoldRush.js';
import { setupInteraction } from './Interaction.js';
import { buildHud, updateHealthDisplay, showGameOver } from './Hud.js';
import { scheduleTutorial, updateTutorial, dismissTutorial } from './Tutorial.js';

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

function startLoop(state) {
    function frame(now) {
        var delta = Math.min(state.clock.getDelta(), 0.05);

        updateShark(state, delta);
        updateSpawner(state, delta);

        for (var i = state.entities.length - 1; i >= 0; i--) {
            var entity = state.entities[i];
            var alive = updateEntity(entity, delta, state.config);
            if (!alive) {
                state.entities.splice(i, 1);
                if (entity.mesh && entity.mesh.parent) {
                    entity.mesh.parent.remove(entity.mesh);
                }
            }
        }

        for (var i = state.coins.length - 1; i >= 0; i--) {
            var coin = state.coins[i];
            var alive = updateCoin(coin, delta);
            if (!alive) {
                if (coin.mesh && coin.mesh.parent) {
                    coin.mesh.parent.remove(coin.mesh);
                }
                state.coins.splice(i, 1);
            }
        }

        updateCollisions(state, delta);
        updateHunger(state, delta);
        updateCamera(state, delta);
        updateGoldRush(state, delta);
        updateHealthDisplay(state);
        updateTutorial(state, now);

        if (state.hasUserInteracted && !state.tutorial) {
            dismissTutorial(state);
        }

        if (state.shark.health <= 0 && !state.gameOver) {
            showGameOver(state);
        }

        if (state.shakeTime > 0) {
            state.shakeTime -= delta;
            var shakeIntensity = Math.max(state.shakeTime, 0) * 2;
            state.sharkGroup.position.x = (Math.random() - 0.5) * shakeIntensity * 0.05;
            state.sharkGroup.position.y = (Math.random() - 0.5) * shakeIntensity * 0.05;
        } else {
            state.sharkGroup.position.set(0, 0, 0);
        }

        state.renderer.render(state.scene, state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame(performance.now());
}

function createGame(config) {
    var state = createGameState(config);
    var renderer = state.renderer;
    var camera = state.camera;
    var background = state.background;

    SceneSetup.configureRenderer(renderer);
    SceneSetup.fitOrthographicCamera(camera, background.size);

    appRoot.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';

    state.scene.add(background.mesh);

    buildWorld(state);
    createShark(state);
    buildHud(state, function() {
        resetGame(state);
        startLoop(state);
    });

    setupInteraction(state);
    scheduleTutorial(state);

    document.addEventListener('pointerdown', function() {
        state.hasUserInteracted = true;
        dismissTutorial(state);
    }, { once: true });

    window.addEventListener('resize', function() {
        SceneSetup.configureRenderer(renderer);
        SceneSetup.fitOrthographicCamera(camera, background.size);
    });

    window.HungryShark = {
        state: state,
        config: config,
        scene: state.scene,
        camera: camera,
        renderer: renderer,
        shark: state.shark,
        activateBoost: function() { activateBoost(state); }
    };

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function(config) {
    createGame(config);
}).catch(function(error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});

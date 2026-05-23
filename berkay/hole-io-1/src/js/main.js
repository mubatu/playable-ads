import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { createGameState } from './GameState.js';
import { updateMovement, updateConsumption, updateCamera } from './Gameplay.js';
import { updateHolePulse } from './Hole.js';
import { updateParticles } from './ParticleFX.js';
import { buildHud, refreshScoreDisplay } from './Hud.js';
import { scheduleTutorial, dismissTutorial } from './Tutorial.js';

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

function bindInput(state) {
    var canvas = state.renderer.domElement;

    canvas.addEventListener('pointerdown', function () {
        if (!state.hasUserInteracted) {
            dismissTutorial(state);
        }
    });
}

function startLoop(state) {
    function frame() {
        var delta = Math.min(state.clock.getDelta(), 0.05);

        if (!state.gameOver) {
            updateMovement(state, delta);
            updateConsumption(state, delta);

            if (state.timer) {
                state.timer.update(delta);
            }
        }

        updateHolePulse(state.hole, delta);
        updateParticles(state.particlePool, delta);
        updateCamera(state, delta);

        if (state.tutorial) {
            state.tutorial.update(performance.now());
        }

        state.renderer.render(state.scene, state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame();
}

function createGame(config) {
    var state = createGameState(config);

    appRoot.appendChild(state.renderer.domElement);
    state.renderer.domElement.style.touchAction = 'none';

    buildHud(state, function () {
        window.open('https://google.com', '_blank');
    });

    refreshScoreDisplay(state);
    bindInput(state);
    scheduleTutorial(state);

    window.addEventListener('resize', function () {
        state.camera.aspect = window.innerWidth / window.innerHeight;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
    createGame(config);
}).catch(function (error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});

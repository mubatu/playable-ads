import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { createGameState, resetGame } from './GameState.js';
import { spawnEnvironment, updateEnvironment, cleanupEnvironment } from './Environment.js';
import { updatePlayerHole } from './Hole.js';
import { updateGameTime, updatePlayerMovement, updateCamera, processCollisions } from './Gameplay.js';
import { buildHud, refreshScoreDisplay } from './Hud.js';
import { scheduleTutorial, destroyTutorial } from './Tutorial.js';
import { updateParticles } from './ParticleFX.js';

var CONFIG_PATH = 'src/config/game-config.json';
var appRoot = document.getElementById('app') || document.body;
var errorBanner = document.getElementById('error-banner');

function showError(message) {
    if (!errorBanner) return;
    errorBanner.textContent = message;
    errorBanner.hidden = false;
}

function startLoop(state) {
    if (state.animationFrameId) {
        window.cancelAnimationFrame(state.animationFrameId);
    }

    function frame(now) {
        var delta = Math.min(state.clock.getDelta(), 0.05);

        if (!state.gameOver) {
            updateGameTime(state, delta);
            updatePlayerMovement(state, delta);
            updatePlayerHole(state.playerHole, delta);
            processCollisions(state);
        }

        updateCamera(state, delta);
        updateEnvironment(state, delta);
        updateParticles(state, delta);

        if (state.tutorial) {
            state.tutorial.update(now);
        }

        state.renderer.render(state.scene, state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame(performance.now());
}

function createGame(config) {
    var state = createGameState(config);
    var renderer = state.renderer;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    appRoot.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    spawnEnvironment(state);

    buildHud(state, function () {
        destroyTutorial(state);
        cleanupEnvironment(state);
        resetGame(state);
        spawnEnvironment(state);
        scheduleTutorial(state);
    });

    refreshScoreDisplay(state);
    scheduleTutorial(state);

    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        state.camera.aspect = window.innerWidth / window.innerHeight;
        state.camera.updateProjectionMatrix();
    });

    window.HoleIO3 = { state: state, config: config };

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
    createGame(config);
}).catch(function (error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});

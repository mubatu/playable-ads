import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { createGameState, populateWorld, resetGame } from './GameState.js';
import { buildHud } from './Hud.js';
import { updateGameplay } from './Gameplay.js';
import { startTutorial, dismissTutorial } from './Tutorial.js';

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

function moveMagnitude(state) {
    var c = state.move;
    if (!c) {
        return 0;
    }
    return Math.sqrt(c.x * c.x + c.y * c.y);
}

function startLoop(state) {
    function frame(now) {
        var delta = Math.min(state.clock.getDelta(), 0.05);

        if (!state.hasUserInteracted && moveMagnitude(state) > 0.15) {
            state.hasUserInteracted = true;
            dismissTutorial(state);
        }

        updateGameplay(state, delta);

        if (state.tutorial) {
            state.tutorial.update(now);
        }

        state.sceneManager.render(state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }
    frame(performance.now());
}

function createGame(config) {
    var state = createGameState(config);

    appRoot.appendChild(state.renderer.domElement);
    state.renderer.domElement.style.touchAction = 'none';

    state.sceneManager.addObject(state.ground);
    state.sceneManager.addObject(state.consumablesGroup);
    state.sceneManager.addObject(state.hole);

    populateWorld(state);

    function onDownload() {
        window.open(config.ctaUrl, '_blank');
    }

    function onPlayAgain() {
        resetGame(state);
        state.hasUserInteracted = false;
        startTutorial(state);
    }

    buildHud(state, onPlayAgain, onDownload);

    state.running = true;
    startTutorial(state);

    window.addEventListener('resize', function () {
        state.camera.aspect = window.innerWidth / window.innerHeight;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.HoleIO = { state: state, config: config };

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
    createGame(config);
}).catch(function (error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});

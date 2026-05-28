import { ConfigLoader } from '../../../../reusables/components/ConfigLoader.js';
import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { createGameState, resetGame } from './GameState.js';
import { buildHud, hideEndButtons } from './Hud.js';
import { setupTutorial } from './Tutorial.js';
import { updateGameplay, primeGameplay, initWorld } from './Gameplay.js';
import { configurePerspectiveCamera } from './CameraController.js';

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
    function frame() {
        var delta = Math.min(state.clock.getDelta(), 0.05);
        var now = performance.now();

        if (!state.gameEnded) {
            updateGameplay(state, delta);
        }

        if (state.tutorial) {
            state.tutorial.update(now);
        }

        state.sceneManager.render(state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame();
}

function createGame(config) {
    var state = createGameState(config);
    var renderer = state.renderer;
    var camera = state.camera;

    SceneSetup.configureRenderer(renderer);
    configurePerspectiveCamera(camera);

    appRoot.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    initWorld(state);

    buildHud(state, function () {
        hideEndButtons(state);
        resetGame(state);
        primeGameplay(state);
    });

    setupTutorial(state);
    primeGameplay(state);

    window.addEventListener('resize', function () {
        SceneSetup.configureRenderer(renderer);
        configurePerspectiveCamera(camera);
    });

    window.HoleIOPlayable = {
        state: state,
        config: config
    };

    startLoop(state);
}

ConfigLoader.load(CONFIG_PATH).then(function (config) {
    createGame(config);
}).catch(function (error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so the JSON config can load.');
});

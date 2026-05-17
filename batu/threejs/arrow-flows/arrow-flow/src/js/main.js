import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { CONFIG } from '../config/game-config.js';
import { LEVELS } from '../config/level-data.js';
import { createGameState, initializeLevel, resetGame, updateGame } from './GameState.js';
import { buildHud } from './Hud.js';
import { bindInteractions } from './Interaction.js';

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

        updateGame(state, delta, now);
        state.sceneManager.update(delta);
        state.sceneManager.render(state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame(performance.now());
}

function createGame() {
    var level = LEVELS[0];
    var state = createGameState(CONFIG, level);
    var renderer = state.renderer;
    var camera = state.camera;

    SceneSetup.configureRenderer(renderer);
    SceneSetup.fitOrthographicCamera(camera, state.background.size);

    appRoot.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    state.sceneManager.addObject(state.background.mesh);
    state.sceneManager.addObject(state.board);

    buildHud(state, function () {
        resetGame(state);
    });
    initializeLevel(state);
    bindInteractions(state);

    window.addEventListener('resize', function () {
        SceneSetup.configureRenderer(renderer);
        SceneSetup.fitOrthographicCamera(camera, state.background.size);
    });

    window.ArrowFlow = {
        state: state,
        config: CONFIG,
        level: level,
        scene: state.scene,
        camera: camera,
        renderer: renderer,
        board: state.board
    };

    startLoop(state);
}

try {
    createGame();
} catch (error) {
    console.error(error);
    showError(error.message);
}

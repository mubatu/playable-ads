import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { TextureUtils } from '../../../../reusables/components/TextureUtils.js';
import { GAME_CONFIG } from '../config/game-config.js';
import { createGameState, resetGame } from './GameState.js';
import { loadTileTextures } from './Tiles.js';
import { buildHud } from './Hud.js';
import { bindInteractions } from './Interaction.js';
import { updateAnimations, updateInteractables } from './Gameplay.js';
import { scheduleTutorial } from './Tutorial.js';

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

        updateAnimations(state, delta);

        if (state.tutorial) {
            state.tutorial.update(now);
        }

        if (state.shakeTime > 0) {
            state.shakeTime -= delta;
            state.board.position.x = (Math.random() - 0.5) * (state.shakeTime * 0.22);
            state.board.position.y = state.config.board.offsetY + ((Math.random() - 0.5) * (state.shakeTime * 0.22));
        } else {
            state.board.position.x = 0;
            state.board.position.y = state.config.board.offsetY;
        }

        state.sceneManager.update(delta);
        state.sceneManager.render(state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame(performance.now());
}

function startSession(state) {
    state.isPlaying = true;
    state.gameOver = false;
    state.locked = false;
    updateInteractables(state);
    scheduleTutorial(state);
}

function createGame(textures) {
    var state = createGameState(GAME_CONFIG, textures);
    var renderer = state.renderer;
    var camera = state.camera;
    var background = state.background;

    SceneSetup.configureRenderer(renderer);
    SceneSetup.fitOrthographicCamera(camera, background.size);

    appRoot.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'pointer';

    state.sceneManager.addObject(background.mesh);
    state.sceneManager.addObject(state.board);
    state.sceneManager.addObject(state.slotsGroup);

    resetGame(state, { startPlaying: false });

    buildHud(state, function () {
        if (state.ui.startOverlay) {
            state.ui.startOverlay.hide();
        }
        startSession(state);
    }, function () {
        resetGame(state, { startPlaying: true });
        startSession(state);
    });

    bindInteractions(state);

    window.addEventListener('resize', function () {
        SceneSetup.configureRenderer(renderer);
        SceneSetup.fitOrthographicCamera(camera, background.size);
    });

    window.Tumblestone3 = {
        state: state,
        config: GAME_CONFIG,
        scene: state.scene,
        camera: camera,
        renderer: renderer,
        board: state.board,
        grid: state.grid,
        sceneManager: state.sceneManager
    };

    startLoop(state);
}

Promise.all([
    TextureUtils.load(GAME_CONFIG.background.imageUrl),
    loadTileTextures(GAME_CONFIG.tiles)
]).then(function (results) {
    createGame({
        background: results[0],
        tiles: results[1]
    });
}).catch(function (error) {
    console.error(error);
    showError(error.message + ' Run this ad from a local server so image assets can load.');
});

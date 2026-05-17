import { SceneSetup } from '../../../../reusables/components/SceneSetup.js';
import { CONFIG } from '../config/game-config.js';
import { LEVELS } from '../config/level-data.js';
import { createGameState, initHud, startLevel, GameStatus } from './GameState.js';
import { bindInteractions } from './Input.js';
import { refreshHud, showEndOverlay } from './Hud.js';
import { updateArrowSystem, updateArrowVisuals, tryInsertWaitingCells } from './ArrowSystem.js';
import { resolveAllShots, hasAnyValidShot, updateShotEffects } from './ShooterSystem.js';
import { updateTutorial } from './Tutorial.js';

var appRoot = document.getElementById('app') || document.body;
var errorBanner = document.getElementById('error-banner');

function showError(message) {
    if (!errorBanner) {
        return;
    }
    errorBanner.textContent = message;
    errorBanner.hidden = false;
}

function evaluateEndState(state) {
    if (state.status !== GameStatus.PLAYING) {
        return;
    }

    if (state.cellsRemaining <= 0) {
        state.status = GameStatus.WIN;
        showEndOverlay(state, 'win');
        return;
    }

    if (state.framePath.isFull() && !hasAnyValidShot(state)) {
        state.status = GameStatus.LOSE;
        showEndOverlay(state, 'lose');
        return;
    }

    if (state.elapsedSeconds >= state.config.playableAd.maxSessionSeconds) {
        state.status = GameStatus.TIMEOUT;
        showEndOverlay(state, 'timeout');
    }
}

function updateGame(state, dt, now) {
    var moveTick = state.levels[state.levelIndex].frame.moveTickSeconds || state.config.frame.moveTickSeconds;

    updateShotEffects(state, dt);

    if (state.status === GameStatus.PLAYING) {
        state.elapsedSeconds += dt;
        state.inactivitySeconds += dt;
        updateArrowSystem(state, dt);

        state.frameTickAccumulator += dt;
        while (state.frameTickAccumulator >= moveTick) {
            state.frameTickAccumulator -= moveTick;
            state.framePath.step();
            resolveAllShots(state);
            tryInsertWaitingCells(state);
            resolveAllShots(state);
        }

        updateArrowVisuals(state, now / 1000);
        evaluateEndState(state);
        refreshHud(state);
    }

    updateTutorial(state, now);
}

function startLoop(state) {
    function frame(now) {
        var delta = Math.min(state.clock.getDelta(), 0.05);

        updateGame(state, delta, now);
        state.sceneManager.render(state.camera);
        state.animationFrameId = window.requestAnimationFrame(frame);
    }

    frame(performance.now());
}

function createGame() {
    var state = createGameState(CONFIG, LEVELS);

    SceneSetup.configureRenderer(state.renderer);
    SceneSetup.fitOrthographicCamera(state.camera, state.background.size);

    appRoot.appendChild(state.renderer.domElement);
    state.renderer.domElement.style.touchAction = 'none';

    state.scene.add(new window.THREE.AmbientLight(0xffffff, 0.82));
    state.scene.add(new window.THREE.DirectionalLight(0xffffff, 0.72));
    state.sceneManager.addObject(state.background.mesh);

    initHud(state);
    startLevel(state, 0);
    bindInteractions(state);

    window.addEventListener('resize', function () {
        SceneSetup.configureRenderer(state.renderer);
        SceneSetup.fitOrthographicCamera(state.camera, state.background.size);
    });

    window.ArrowFlow2 = {
        state: state,
        config: CONFIG,
        levels: LEVELS,
        scene: state.scene,
        camera: state.camera,
        renderer: state.renderer
    };

    startLoop(state);
}

try {
    createGame();
} catch (error) {
    console.error(error);
    showError(error.message);
}

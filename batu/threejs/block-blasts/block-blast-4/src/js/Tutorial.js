import { getCellWorldPosition } from './Board.js';
import { getFirstValidPlacement } from './Board.js';

function clearTutorialDelay(state) {
    if (state.tutorialDelayId) {
        window.clearTimeout(state.tutorialDelayId);
        state.tutorialDelayId = null;
    }
}

export function destroyTutorial(state) {
    clearTutorialDelay(state);

    if (state.tutorial) {
        state.tutorial.destroy();
        state.tutorial = null;
    }

    if (window.BlockBlast) {
        window.BlockBlast.tutorial = null;
    }
}

function getTutorialPoints(state) {
    var tutConfig = state.config.tutorial;
    var slot0 = state.traySlots && state.traySlots[0];
    var shape0;
    var placement;
    var toWorldPos;
    var fromX;
    var fromY;

    if (!slot0 || !slot0.shape) {
        return null;
    }

    shape0 = slot0.shape;
    placement = getFirstValidPlacement(state.grid, shape0.def);

    if (!placement) {
        return null;
    }

    toWorldPos = getCellWorldPosition(
        state.board,
        state.boardMetrics,
        placement.row,
        placement.col,
        state.config.blocks.baseZ
    );

    fromX = slot0.originalX;
    fromY = slot0.originalY;

    return {
        from: {
            space: 'world',
            x: fromX,
            y: fromY,
            z: state.config.blocks.baseZ
        },
        to: {
            space: 'world',
            x: toWorldPos.x,
            y: toWorldPos.y,
            z: toWorldPos.z
        }
    };
}

function ensureTutorial(state) {
    var tutConfig = state.config.tutorial;
    var pair;

    if (!tutConfig || !tutConfig.enabled || state.hasUserInteracted || !window.HandTutorial) {
        destroyTutorial(state);
        return;
    }

    pair = getTutorialPoints(state);

    if (!pair) {
        destroyTutorial(state);
        return;
    }

    if (!state.tutorial) {
        state.tutorial = new window.HandTutorial({
            container: state.renderer.domElement.parentElement,
            renderer: state.renderer,
            camera: state.camera,
            assetUrl: tutConfig.assetUrl,
            gesture: tutConfig.gesture || 'drag',
            duration: tutConfig.duration || 1.2,
            loop: true,
            loopDelay: tutConfig.loopDelay || 0.5,
            size: tutConfig.size || 120,
            rotation: 0,
            followDirection: false,
            flipX: false,
            showTrail: true,
            anchor: { x: 0.22, y: 0.08 },
            from: pair.from,
            to: pair.to
        });
    } else {
        state.tutorial.setConfig({
            assetUrl: tutConfig.assetUrl,
            gesture: tutConfig.gesture || 'drag',
            duration: tutConfig.duration || 1.2,
            loop: true,
            loopDelay: tutConfig.loopDelay || 0.5,
            size: tutConfig.size || 120
        });
        state.tutorial.setPoints(pair.from, pair.to);
    }

    if (window.BlockBlast) {
        window.BlockBlast.tutorial = state.tutorial;
    }
}

export function scheduleTutorial(state) {
    var tutConfig = state.config.tutorial;

    clearTutorialDelay(state);

    if (!tutConfig || !tutConfig.enabled || state.hasUserInteracted || !window.HandTutorial) {
        return;
    }

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;
        ensureTutorial(state);

        if (state.tutorial) {
            state.tutorial.play();
        }
    }, tutConfig.startDelayMs || 900);
}

export function dismissTutorial(state) {
    state.hasUserInteracted = true;
    destroyTutorial(state);
}

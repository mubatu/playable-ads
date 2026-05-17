import { findFirstClickableArrow, getArrowHeadCell } from './ArrowSystem.js';

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
}

export function dismissTutorial(state) {
    state.hasUserInteracted = true;
    destroyTutorial(state);
}

function getHintPoint(state) {
    var arrow = findFirstClickableArrow(state);
    var cell = arrow ? getArrowHeadCell(arrow) : null;

    if (!cell) {
        return null;
    }

    return {
        object3D: cell.group,
        offset: { z: 0.6 }
    };
}

function ensureTutorial(state) {
    var config = state.config.tutorial || {};
    var point;

    if (!config.enabled || state.hasUserInteracted || !window.HandTutorial) {
        destroyTutorial(state);
        return;
    }

    point = getHintPoint(state);
    if (!point) {
        destroyTutorial(state);
        return;
    }

    if (!state.tutorial) {
        state.tutorial = new window.HandTutorial({
            container: state.renderer.domElement.parentElement,
            renderer: state.renderer,
            camera: state.camera,
            assetUrl: config.assetUrl,
            gesture: 'tap',
            duration: config.duration || 0.9,
            loop: true,
            loopDelay: config.loopDelay || 0.45,
            size: config.size || 122,
            showTrail: false,
            pulseRadius: 30,
            pulseWidth: 5,
            anchor: { x: 0.22, y: 0.08 },
            from: point,
            to: point
        });
    } else {
        state.tutorial.setPoints(point, point);
    }
}

export function scheduleTutorial(state) {
    var config = state.config.tutorial || {};

    clearTutorialDelay(state);

    if (!config.enabled || state.hasUserInteracted || !window.HandTutorial) {
        return;
    }

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;
        ensureTutorial(state);
        if (state.tutorial) {
            state.tutorial.play();
        }
    }, config.startDelayMs || 1400);
}

export function updateTutorial(state, now) {
    if (!state.tutorial || state.hasUserInteracted) {
        return;
    }

    ensureTutorial(state);
    state.tutorial.update(now);
}

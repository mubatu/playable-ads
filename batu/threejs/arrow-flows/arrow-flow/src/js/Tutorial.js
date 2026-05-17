import { getFirstClickableArrow } from './Board.js';

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

function getArrowWorldPoint(state, arrow) {
    var key;
    var mesh;
    var worldPoint;

    if (!arrow) {
        return null;
    }

    key = arrow.head.row + ':' + arrow.head.col;
    mesh = arrow.meshesByCell[key];

    if (!mesh) {
        key = Object.keys(arrow.meshesByCell)[0];
        mesh = arrow.meshesByCell[key];
    }

    if (!mesh) {
        return null;
    }

    worldPoint = mesh.getWorldPosition(new window.THREE.Vector3());
    return {
        space: 'world',
        x: worldPoint.x,
        y: worldPoint.y,
        z: worldPoint.z + 0.4
    };
}

function ensureTutorial(state) {
    var tutorialConfig = state.config.tutorial || {};
    var arrow = getFirstClickableArrow(state);
    var point = getArrowWorldPoint(state, arrow);

    if (!tutorialConfig.enabled || state.hasUserInteracted || !window.HandTutorial || !point) {
        destroyTutorial(state);
        return;
    }

    if (!state.tutorial) {
        state.tutorial = new window.HandTutorial({
            container: state.renderer.domElement.parentElement,
            renderer: state.renderer,
            camera: state.camera,
            assetUrl: tutorialConfig.assetUrl,
            gesture: tutorialConfig.gesture || 'tap',
            duration: tutorialConfig.duration || 0.8,
            loop: true,
            loopDelay: tutorialConfig.loopDelay || 0.5,
            size: tutorialConfig.size || 116,
            rotation: -8,
            followDirection: false,
            showTrail: false,
            anchor: { x: 0.22, y: 0.08 },
            from: point,
            to: point
        });
    } else {
        state.tutorial.setPoints(point, point);
    }
}

export function scheduleTutorial(state) {
    var tutorialConfig = state.config.tutorial || {};

    clearTutorialDelay(state);

    if (!tutorialConfig.enabled || state.hasUserInteracted || !window.HandTutorial) {
        return;
    }

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;
        ensureTutorial(state);

        if (state.tutorial) {
            state.tutorial.play();
        }
    }, tutorialConfig.startDelayMs || 1000);
}

export function updateTutorialTarget(state) {
    if (!state.tutorial || state.hasUserInteracted) {
        return;
    }

    ensureTutorial(state);
}

export function dismissTutorial(state) {
    state.hasUserInteracted = true;
    destroyTutorial(state);
}

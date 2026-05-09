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

function getFirstInteractablePoint(state) {
    var tile = state.interactableTiles && state.interactableTiles.length > 0 ? state.interactableTiles[0] : null;
    var worldPosition;

    if (!tile || !tile.mesh) {
        return null;
    }

    state.board.updateMatrixWorld(true);
    worldPosition = tile.mesh.getWorldPosition(new window.THREE.Vector3());

    return {
        space: 'world',
        x: worldPosition.x,
        y: worldPosition.y,
        z: worldPosition.z
    };
}

function ensureTutorial(state) {
    var tutorialConfig = state.config.tutorial || {};
    var point;

    if (!tutorialConfig.enabled || !state.isPlaying || state.hasUserInteracted || !window.HandTutorial) {
        destroyTutorial(state);
        return;
    }

    point = getFirstInteractablePoint(state);

    if (!point) {
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
            duration: tutorialConfig.duration || 1.0,
            loop: true,
            loopDelay: tutorialConfig.loopDelay || 0.45,
            size: tutorialConfig.size || 122,
            rotation: 0,
            followDirection: false,
            flipX: false,
            showTrail: false,
            from: point
        });
    } else {
        state.tutorial.setPoints(point, point);
    }
}

export function scheduleTutorial(state) {
    var tutorialConfig = state.config.tutorial || {};

    clearTutorialDelay(state);

    if (!tutorialConfig.enabled || !state.isPlaying || state.hasUserInteracted || !window.HandTutorial) {
        return;
    }

    state.tutorialDelayId = window.setTimeout(function () {
        state.tutorialDelayId = null;
        ensureTutorial(state);

        if (state.tutorial) {
            state.tutorial.play();
        }
    }, tutorialConfig.startDelayMs || 900);
}

export function dismissTutorial(state) {
    state.hasUserInteracted = true;
    destroyTutorial(state);
}
